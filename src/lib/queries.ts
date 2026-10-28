// Reading jobs and applications. Before a database is connected, the built-in examples are shown.
import { db, hasDatabase, isUuid, toJob } from "./db";
import { exampleJobs } from "./examples";
import { filterJobs, today, type Job, type JobFilters } from "./jobs";
import type { Employer } from "./auth";

export async function searchJobs(f: JobFilters): Promise<Job[]> {
  const now = today();
  if (!hasDatabase()) return filterJobs(exampleJobs(now), f, now);
  const sql = await db();
  const term = f.q?.trim() ? `%${f.q.trim().replace(/[\\%_]/g, (c) => `\\${c}`)}%` : null;
  const rows = await sql`
    select * from jobs
    where true
    ${f.closed ? sql`` : sql`and status = 'open' and deadline >= ${now}`}
    ${f.county ? sql`and county = ${f.county}` : sql``}
    ${f.category ? sql`and category = ${f.category}` : sql``}
    ${f.type ? sql`and job_type = ${f.type}` : sql``}
    ${
      term
        ? sql`and (title ilike ${term} or company ilike ${term} or coalesce(location, '') ilike ${term}
                   or category ilike ${term} or description ilike ${term} or coalesce(requirements, '') ilike ${term})`
        : sql``
    }
    order by created_at desc
    limit 200`;
  return rows.map((r) => toJob(r));
}

export async function countOpenJobs(): Promise<number> {
  if (!hasDatabase()) return exampleJobs().length;
  const sql = await db();
  const rows = await sql`select count(*)::int as n from jobs where status = 'open' and deadline >= ${today()}`;
  return Number(rows[0]?.n ?? 0);
}

export async function getJob(id: string): Promise<Job | null> {
  if (!hasDatabase()) return exampleJobs().find((j) => j.id === id) ?? null;
  if (!isUuid(id)) return null;
  const sql = await db();
  const rows = await sql`select * from jobs where id = ${id}`;
  return rows[0] ? toJob(rows[0]) : null;
}

export function canManage(me: Employer | null, job: Job): boolean {
  return !!me && (me.is_admin || job.employer_id === me.id);
}

/** The employer's own vacancies (all vacancies for the administrator), with application counts. */
export async function employerJobs(me: Employer): Promise<Job[]> {
  const sql = await db();
  const rows = await sql`
    select j.*, (select count(*)::int from applications a where a.job_id = j.id) as applications
    from jobs j
    ${me.is_admin ? sql`` : sql`where j.employer_id = ${me.id}`}
    order by j.created_at desc`;
  return rows.map((r) => toJob(r));
}

export type Application = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  county: string | null;
  message: string;
  cv_link: string | null;
  status: "new" | "shortlisted" | "rejected";
  created_at: Date;
};

export async function applicationsFor(jobId: string): Promise<Application[]> {
  const sql = await db();
  const rows = await sql`
    select id, name, phone, email, county, message, cv_link, status, created_at
    from applications where job_id = ${jobId}
    order by case status when 'shortlisted' then 0 when 'new' then 1 else 2 end, created_at desc`;
  return rows.map((r) => ({
    id: String(r.id),
    name: String(r.name),
    phone: String(r.phone),
    email: (r.email as string | null) ?? null,
    county: (r.county as string | null) ?? null,
    message: String(r.message),
    cv_link: (r.cv_link as string | null) ?? null,
    status: r.status === "shortlisted" || r.status === "rejected" ? r.status : "new",
    created_at: r.created_at instanceof Date ? r.created_at : new Date(String(r.created_at)),
  }));
}
