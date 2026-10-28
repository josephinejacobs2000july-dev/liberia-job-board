// Job board vocabulary and rules. Pure functions with no imports, so they can be unit-tested.

export const COUNTIES = [
  "Bomi", "Bong", "Gbarpolu", "Grand Bassa", "Grand Cape Mount", "Grand Gedeh", "Grand Kru", "Lofa",
  "Margibi", "Maryland", "Montserrado", "Nimba", "River Cess", "River Gee", "Sinoe",
];

export const CATEGORIES = [
  "Administration", "Agriculture", "Construction and engineering", "Driving and logistics", "Education",
  "Finance and accounting", "Health", "Hotels and hospitality", "IT and telecoms", "Mining and energy",
  "NGO and development", "Sales and marketing", "Security", "Skilled trades", "Other",
];

export const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Internship", "Volunteer"];

export const EMPLOYER_TYPES = ["NGO", "Government", "Private company", "Other"];

export const APPLICATION_STATUS: Record<string, string> = {
  new: "New",
  shortlisted: "Shortlisted",
  rejected: "Not suitable",
};

export type Job = {
  id: string;
  employer_id: string | null;
  title: string;
  company: string;
  employer_type: string;
  county: string;
  location: string | null;
  category: string;
  job_type: string;
  salary: string | null;
  deadline: string; // YYYY-MM-DD
  description: string;
  requirements: string | null;
  how_to_apply: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  status: "open" | "closed";
  example: boolean;
  created_at: string; // YYYY-MM-DD
  applications?: number;
};

const DAY = 86_400_000;

/** Today's date in Liberia (Africa/Monrovia), as YYYY-MM-DD. */
export function today(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Monrovia",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function toUTC(iso: string): number {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

/** Whole days from `from` to `to`, both YYYY-MM-DD. */
export function daysBetween(from: string, to: string): number {
  return Math.round((toUTC(to) - toUTC(from)) / DAY);
}

export function addDays(iso: string, days: number): string {
  return new Date(toUTC(iso) + days * DAY).toISOString().slice(0, 10);
}

/** "7 Nov" this year, "7 Nov 2027" otherwise. */
export function formatDate(iso: string | null | undefined, now: string = today()): string {
  if (!iso) return "—";
  const d = new Date(toUTC(iso));
  const sameYear = iso.slice(0, 4) === now.slice(0, 4);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    ...(sameYear ? {} : { year: "numeric" }),
    timeZone: "UTC",
  });
}

export function postedLabel(createdOn: string, now: string = today()): string {
  const n = daysBetween(createdOn, now);
  if (n <= 0) return "Posted today";
  if (n === 1) return "Posted yesterday";
  if (n < 7) return `Posted ${n} days ago`;
  return `Posted ${formatDate(createdOn, now)}`;
}

export type JobState = { key: "open" | "soon" | "closed"; label: string };

/** Open, closing soon (7 days or less) or closed (filled, or deadline passed). */
export function jobState(job: Pick<Job, "status" | "deadline">, now: string = today()): JobState {
  if (job.status === "closed") return { key: "closed", label: "Position filled" };
  const d = daysBetween(now, job.deadline);
  if (d < 0) return { key: "closed", label: "Deadline passed" };
  if (d === 0) return { key: "soon", label: "Closes today" };
  if (d <= 7) return { key: "soon", label: `Closes in ${d} ${d === 1 ? "day" : "days"}` };
  return { key: "open", label: `Open until ${formatDate(job.deadline, now)}` };
}

export function isOpen(job: Pick<Job, "status" | "deadline">, now: string = today()): boolean {
  return jobState(job, now).key !== "closed";
}

export type JobFilters = { q?: string; county?: string; category?: string; type?: string; closed?: boolean };

/** Filter and sort jobs in memory (used for the built-in examples before a database is connected). */
export function filterJobs(jobs: Job[], f: JobFilters, now: string = today()): Job[] {
  const term = (f.q ?? "").trim().toLowerCase();
  return jobs
    .filter((j) => (f.closed ? true : isOpen(j, now)))
    .filter((j) => !f.county || j.county === f.county)
    .filter((j) => !f.category || j.category === f.category)
    .filter((j) => !f.type || j.job_type === f.type)
    .filter(
      (j) =>
        !term ||
        [j.title, j.company, j.location, j.county, j.category, j.description, j.requirements]
          .join(" ")
          .toLowerCase()
          .includes(term),
    )
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function isEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

/** Accept only http(s) links for CVs. */
export function isWebLink(v: string): boolean {
  try {
    const u = new URL(v);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}
