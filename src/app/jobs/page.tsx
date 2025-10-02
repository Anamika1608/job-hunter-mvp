"use client";

import { useMemo, useState } from "react";

import { api } from "~/trpc/react";

const PAGE_SIZE = 10;

export default function JobsPage() {
  const [q, setQ] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [isRemote, setIsRemote] = useState<string>("");
  const [sort, setSort] = useState("postedAtDesc");
  const [page, setPage] = useState(1);

  const filters = useMemo(
    () => ({
      q: q || undefined,
      company: company || undefined,
      location: location || undefined,
      employmentType: employmentType || undefined,
      isRemote: isRemote === "true" ? true : isRemote === "false" ? false : undefined,
      sort: sort as any,
      page,
      pageSize: PAGE_SIZE,
    }),
    [q, company, location, employmentType, isRemote, sort, page],
  );

  const [data, query] = api.job.list.useSuspenseQuery(filters);

  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE));

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="mb-4 text-3xl font-bold">Jobs</h1>

      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-6">
        <input
          className="rounded border border-gray-300 bg-white px-3 py-2 text-black"
          placeholder="Search keywords"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
        />
        <input
          className="rounded border border-gray-300 bg-white px-3 py-2 text-black"
          placeholder="Company"
          value={company}
          onChange={(e) => {
            setCompany(e.target.value);
            setPage(1);
          }}
        />
        <input
          className="rounded border border-gray-300 bg-white px-3 py-2 text-black"
          placeholder="Location"
          value={location}
          onChange={(e) => {
            setLocation(e.target.value);
            setPage(1);
          }}
        />
        <input
          className="rounded border border-gray-300 bg-white px-3 py-2 text-black"
          placeholder="Employment type"
          value={employmentType}
          onChange={(e) => {
            setEmploymentType(e.target.value);
            setPage(1);
          }}
        />
        <select
          className="rounded border border-gray-300 bg-white px-3 py-2 text-black"
          value={isRemote}
          onChange={(e) => {
            setIsRemote(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Remote?</option>
          <option value="true">Remote</option>
          <option value="false">On-site/Hybrid</option>
        </select>
        <select
          className="rounded border border-gray-300 bg-white px-3 py-2 text-black"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="postedAtDesc">Newest</option>
          <option value="postedAtAsc">Oldest</option>
          <option value="titleAsc">Title A-Z</option>
          <option value="titleDesc">Title Z-A</option>
        </select>
      </div>

      <div className="divide-y divide-white/10 rounded border border-white/10">
        {data.items.map((job) => (
          <div key={job.id} className="flex flex-col gap-2 p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-lg font-semibold">{job.title}</div>
              <div className="text-sm text-white/80">
                {job.company}
                {job.location ? ` · ${job.location}` : ""}
                {job.employmentType ? ` · ${job.employmentType}` : ""}
                {job.isRemote ? " · Remote" : ""}
              </div>
              {job.postedAt ? (
                <div className="text-xs text-white/60">
                  Posted {new Date(job.postedAt).toLocaleDateString()}
                </div>
              ) : null}
            </div>
            <div className="flex gap-2">
              <a
                className="rounded bg-white/10 px-4 py-2 text-black "
                href={job.url}
                target="_blank"
                rel="noreferrer"
              >
                Apply
              </a>
            </div>
          </div>
        ))}
        {data.items.length === 0 && (
          <div className="p-6 text-center text-white/70">No jobs found.</div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button
          className="rounded bg-white/10 px-4 py-2 text-white hover:bg-white/20 disabled:opacity-50"
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Previous
        </button>
        <div className="text-sm text-white/80">
          Page {page} of {totalPages}
        </div>
        <button
          className="rounded bg-white/10 px-4 py-2 text-white hover:bg-white/20 disabled:opacity-50"
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}


