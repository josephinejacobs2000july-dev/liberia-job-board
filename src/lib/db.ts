// Database access (PostgreSQL through the `postgres` driver).
// No setup step is needed: the first request creates the tables, a session secret and the example vacancies.
import postgres from "postgres";
import { randomBytes } from "node:crypto";
import { EXAMPLE_SEEDS } from "./examples";
import { addDays, today, type Job } from "./jobs";

type Sql = ReturnType<typeof postgres>;

/** Vercel's Neon integration sets DATABASE_URL; older Vercel Postgres projects set POSTGRES_URL. */
export function databaseUrl(): string | null {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL || null;
}

export function hasDatabase(): boolean {
  return databaseUrl() !== null;
}

const SCHEMA = [
  `create table if not exists app_settings (
     key text primary key,
     value text not null
   )`,
  `create table if not exists employers (
     id uuid primary key default gen_random_uuid(),
     company text not null,
     contact_name text not null,
     email text not null unique,
     phone text,
     password_hash text not null,
     is_admin boolean not null default false,
     created_at timestamptz not null default now()
   )`,
  `create table if not exists jobs (
     id uuid primary key default gen_random_uuid(),
     employer_id uuid references employers(id) on delete cascade,
     title text not null,
     company text not null,
     employer_type text not null,
     county text not null,
     location text,
     category text not null,
     job_type text not null,
     salary text,
     deadline date not null,
     description text not null,
     requirements text,
     how_to_apply text,
     contact_email text,
     contact_phone text,
     status text not null default 'open',
     example boolean not null default false,
     created_at timestamptz not null default now(),
     updated_at timestamptz not null default now()
   )`,
  `create index if not exists jobs_created_idx on jobs (created_at desc)`,
  `create index if not exists jobs_employer_idx on jobs (employer_id)`,
  `create table if not exists applications (
     id uuid primary key default gen_random_uuid(),
     job_id uuid not null references jobs(id) on delete cascade,
     name text not null,
     phone text not null,
     email text,
     county text,
     message text not null,
     cv_link text,
     status text not null default 'new',
     created_at timestamptz not null default now()
   )`,
  `create index if not exists applications_job_idx on applications (job_id)`,
];

const g = globalThis as unknown as { __jbSql?: Sql; __jbReady?: Promise<void> };

function client(): Sql {
  if (!g.__jbSql) {
    const url = databaseUrl();
    if (!url) throw new Error("No database is connected.");
    g.__jbSql = postgres(url, { prepare: false, max: 5, idle_timeout: 20, connect_timeout: 15 });
  }
  return g.__jbSql;
}

async function setup(sql: Sql): Promise<void> {
  await sql.begin(async (tx) => {
    // One request at a time sets things up, even when several arrive together.
    await tx`select pg_advisory_xact_lock(727274)`;
    for (const statement of SCHEMA) await tx.unsafe(statement);

    await tx`
      insert into app_settings (key, value)
      values ('session_secret', ${randomBytes(32).toString("hex")})
      on conflict (key) do nothing`;

    const seeded = await tx`select 1 from app_settings where key = 'examples_added'`;
    if (seeded.length === 0) {
      const now = today();
      for (const e of EXAMPLE_SEEDS) {
        await tx`
          insert into jobs (title, company, employer_type, county, location, category, job_type, salary,
                            deadline, description, requirements, how_to_apply, contact_email, contact_phone,
                            example, created_at)
          values (${e.title}, ${e.company}, ${e.employer_type}, ${e.county}, ${e.location}, ${e.category},
                  ${e.job_type}, ${e.salary}, ${addDays(now, e.deadlineIn)}, ${e.description}, ${e.requirements},
                  ${e.how_to_apply}, ${e.contact_email}, ${e.contact_phone}, true,
                  now() - make_interval(days => ${e.postedAgo}))`;
      }
      await tx`insert into app_settings (key, value) values ('examples_added', ${now})`;
    }
  });
}

/** The database, with tables guaranteed to exist. */
export async function db(): Promise<Sql> {
  const sql = client();
  if (!g.__jbReady) {
    g.__jbReady = setup(sql).catch((e) => {
      g.__jbReady = undefined;
      throw e;
    });
  }
  await g.__jbReady;
  return sql;
}

export function isoDate(v: unknown): string {
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v ?? "").slice(0, 10);
}

/** Turn a database row into a Job. */
export function toJob(row: Record<string, unknown>): Job {
  return {
    id: String(row.id),
    employer_id: (row.employer_id as string | null) ?? null,
    title: String(row.title),
    company: String(row.company),
    employer_type: String(row.employer_type),
    county: String(row.county),
    location: (row.location as string | null) ?? null,
    category: String(row.category),
    job_type: String(row.job_type),
    salary: (row.salary as string | null) ?? null,
    deadline: isoDate(row.deadline),
    description: String(row.description),
    requirements: (row.requirements as string | null) ?? null,
    how_to_apply: (row.how_to_apply as string | null) ?? null,
    contact_email: (row.contact_email as string | null) ?? null,
    contact_phone: (row.contact_phone as string | null) ?? null,
    status: row.status === "closed" ? "closed" : "open",
    example: Boolean(row.example),
    created_at: isoDate(row.created_at),
    applications: row.applications === undefined ? undefined : Number(row.applications),
  };
}

/** A valid id, so a bad link shows "not found" instead of a database error. */
export function isUuid(v: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
}
