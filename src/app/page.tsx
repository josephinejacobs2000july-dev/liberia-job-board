import Link from "next/link";
import { Options } from "@/components/fields";
import { JobCard } from "@/components/job-card";
import { SetupNotice } from "@/components/setup-notice";
import { hasDatabase } from "@/lib/db";
import { CATEGORIES, COUNTIES, JOB_TYPES, today } from "@/lib/jobs";
import { searchJobs } from "@/lib/queries";

export const dynamic = "force-dynamic";

type Search = { q?: string; county?: string; category?: string; type?: string; closed?: string };

export default async function JobsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const f = {
    q: (sp.q ?? "").slice(0, 100),
    county: COUNTIES.includes(sp.county ?? "") ? sp.county : "",
    category: CATEGORIES.includes(sp.category ?? "") ? sp.category : "",
    type: JOB_TYPES.includes(sp.type ?? "") ? sp.type : "",
    closed: sp.closed === "1",
  };
  const jobs = await searchJobs(f);
  const now = today();
  const filtered = Boolean(f.q || f.county || f.category || f.type);

  const link = (closed: boolean) => {
    const p = new URLSearchParams();
    if (f.q) p.set("q", f.q);
    if (f.county) p.set("county", f.county);
    if (f.category) p.set("category", f.category);
    if (f.type) p.set("type", f.type);
    if (closed) p.set("closed", "1");
    const s = p.toString();
    return s ? `/?${s}` : "/";
  };

  return (
    <>
      {!hasDatabase() && <SetupNotice />}

      <div className="page-h">
        <div>
          <h1>Find a job</h1>
          <p>Search vacancies by job title, county, field or job type.</p>
        </div>
      </div>

      <form className="search" action="/" role="search">
        <input name="q" type="search" defaultValue={f.q} placeholder="Job title, skill or employer" aria-label="Search jobs" />
        <div className="filters">
          <select name="county" defaultValue={f.county} aria-label="County">
            <Options values={COUNTIES} blank="All counties" />
          </select>
          <select name="category" defaultValue={f.category} aria-label="Field">
            <Options values={CATEGORIES} blank="All fields" />
          </select>
          <select name="type" defaultValue={f.type} aria-label="Job type">
            <Options values={JOB_TYPES} blank="Any job type" />
          </select>
          {f.closed && <input type="hidden" name="closed" value="1" />}
          <button type="submit" className="btn wide">
            Search
          </button>
        </div>
        <div className="chips">
          <Link className="chip" href={link(false)} aria-current={!f.closed ? "true" : undefined}>
            Open jobs only
          </Link>
          <Link className="chip" href={link(true)} aria-current={f.closed ? "true" : undefined}>
            Include closed jobs
          </Link>
          {filtered && (
            <Link className="chip" href={f.closed ? "/?closed=1" : "/"}>
              Clear search
            </Link>
          )}
        </div>
      </form>

      {jobs.length ? (
        <section className="list" aria-label="Vacancies">
          <p className="count">
            {jobs.length} {jobs.length === 1 ? "job" : "jobs"}
            {jobs.length === 200 ? " (showing the newest 200)" : ""}
          </p>
          {jobs.map((j) => (
            <JobCard key={j.id} job={j} now={now} />
          ))}
        </section>
      ) : (
        <div className="empty">
          <strong>{filtered ? "No jobs match your search" : "No open vacancies right now"}</strong>
          <p>{filtered ? "Try fewer filters or other words." : "New jobs are posted regularly. Check again soon."}</p>
          {filtered && (
            <Link href="/" className="btn neutral">
              Clear search
            </Link>
          )}
        </div>
      )}
    </>
  );
}
