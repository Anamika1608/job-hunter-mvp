import { db } from "~/server/db";

type JobRecord = {
  title: string;
  company: string;
  location?: string | null;
  employmentType?: string | null;
  isRemote: boolean;
  postedAt?: Date | null;
  url: string;
  source: string;
  description?: string | null;
};

const API_URL = "https://remotive.com/api/remote-jobs";

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRetries<T>(fn: () => Promise<T>, maxRetries = 3, baseDelayMs = 1000): Promise<T> {
  let attempt = 0;
  let lastErr: unknown;
  while (attempt <= maxRetries) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const backoff = baseDelayMs * Math.pow(2, attempt);
      await delay(backoff + Math.floor(Math.random() * 250));
      attempt += 1;
    }
  }
  throw lastErr;
}

async function fetchRemotivePage(page: number): Promise<JobRecord[]> {
  const url = `${API_URL}?limit=100&page=${page}`;
  const res = await withRetries(() => fetch(url));
  if (!res.ok) throw new Error(`Remotive API ${res.status}`);
  const data = (await res.json()) as any;
  const jobs = (data.jobs ?? []) as any[];
  return jobs.map((j) => {
    const postedAt = j.publication_date ? new Date(j.publication_date) : null;
    const description = typeof j.description === "string" ? j.description : null;
    return {
      title: j.title ?? "",
      company: j.company_name ?? "",
      location: j.candidate_required_location ?? null,
      employmentType: j.job_type ?? null,
      isRemote: true,
      postedAt,
      url: j.url ?? "",
      source: "remotive",
      description,
    } satisfies JobRecord;
  }).filter((r) => r.title && r.company && r.url);
}

async function crawlRemotive(maxPages = 3) {
  try {
    let saved = 0;
    const client = db as any;
    for (let page = 1; page <= maxPages; page++) {
      const pageJobs = await fetchRemotivePage(page);
      for (const job of pageJobs) {
        try {
          await withRetries(() =>
            client.job.upsert({
              where: { url: job.url },
              create: job,
              update: {
                title: job.title,
                company: job.company,
                location: job.location ?? undefined,
                employmentType: job.employmentType ?? undefined,
                isRemote: job.isRemote,
                postedAt: job.postedAt ?? undefined,
                source: job.source,
                description: job.description ?? undefined,
              },
            }),
          );
          saved += 1;
        } catch (err) {
          console.error("Failed to upsert job", job.url, err);
        }
        await delay(50);
      }
      await delay(500);
    }
    console.log(`Saved ${saved} jobs.`);
  } finally {
    await db.$disconnect();
  }
}

const pagesEnv = process.env.CRAWL_PAGES ? Number(process.env.CRAWL_PAGES) : 3;
crawlRemotive(Number.isFinite(pagesEnv) && pagesEnv > 0 ? pagesEnv : 3).catch((err) => {
  console.error(err);
  process.exit(1);
});


