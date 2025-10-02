import Link from "next/link";

export default async function Home() {
  return (
    <main className="hero-bg flex min-h-screen items-center justify-center px-6 text-white">
      <div className="mx-auto max-w-5xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
          <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
          Now crawling remote-friendly roles
        </div>
        <h1 className="mt-6 text-balance text-5xl font-extrabold tracking-tight sm:text-6xl">
          Find your next job. Fast.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-balance text-white/80 sm:text-lg">
          Job Hunter aggregates fresh listings from a public source into a local database.
          Search by keywords, filter by company, location, remote, and more—then apply on the original posting.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/jobs"
            className="rounded-full bg-white px-6 py-3 font-semibold text-black transition hover:bg-white/90"
          >
            Browse Jobs
          </Link>
          <a
            href="https://remotive.com/remote-jobs"
            target="_blank"
            className="rounded-full border border-white/20 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
            rel="noreferrer"
          >
            Data Source
          </a>
        </div>
      </div>
    </main>
  );
}
