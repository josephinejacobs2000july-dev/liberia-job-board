"use server";

// Everything that changes data. Each action checks who is signed in before it saves.
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { endSession, hashPassword, requireEmployer, startSession, verifyPassword } from "@/lib/auth";
import { db, hasDatabase, isoDate, isUuid } from "@/lib/db";
import { type ActionState, field, isBot, readApplication, readJob, readSignup } from "@/lib/forms";
import { isOpen } from "@/lib/jobs";

const NO_DB = "This board is not connected to a database yet, so nothing can be saved.";

export async function signup(_prev: ActionState, fd: FormData): Promise<ActionState> {
  if (!hasDatabase()) return { error: NO_DB };
  if (isBot(fd)) return { error: "Something went wrong. Try again." };
  const parsed = readSignup(fd);
  if ("error" in parsed) return { error: parsed.error };
  const s = parsed.signup;

  const sql = await db();
  const existing = await sql`select 1 from employers where email = ${s.email}`;
  if (existing.length) return { error: "An account with this email already exists. Sign in instead." };

  // The very first account becomes the board's administrator.
  const count = await sql`select count(*)::int as n from employers`;
  const isAdmin = Number(count[0]?.n ?? 0) === 0;
  const rows = await sql`
    insert into employers (company, contact_name, email, phone, password_hash, is_admin)
    values (${s.company}, ${s.contact_name}, ${s.email}, ${s.phone}, ${await hashPassword(s.password)}, ${isAdmin})
    returning id`;
  await startSession(String(rows[0].id));
  redirect("/employer?welcome=1");
}

export async function login(_prev: ActionState, fd: FormData): Promise<ActionState> {
  if (!hasDatabase()) return { error: NO_DB };
  const email = field(fd, "email").toLowerCase();
  const password = String(fd.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password." };
  const sql = await db();
  const rows = await sql`select id, password_hash from employers where email = ${email}`;
  const ok = rows[0] ? await verifyPassword(password, String(rows[0].password_hash)) : false;
  if (!ok) return { error: "That email and password do not match an account." };
  await startSession(String(rows[0].id));
  redirect("/employer");
}

export async function logout(): Promise<void> {
  await endSession();
  redirect("/");
}

/** Load a job the signed-in employer may change: their own, or any job for the administrator. */
async function ownJob(jobId: string) {
  const me = await requireEmployer();
  if (!isUuid(jobId)) return { me, job: null };
  const sql = await db();
  const rows = await sql`select id, employer_id, status, deadline from jobs where id = ${jobId}`;
  const job = rows[0];
  if (!job || (!me.is_admin && job.employer_id !== me.id)) return { me, job: null };
  return { me, job };
}

export async function saveJob(jobId: string | null, _prev: ActionState, fd: FormData): Promise<ActionState> {
  if (!hasDatabase()) return { error: NO_DB };
  const me = await requireEmployer();
  const parsed = readJob(fd, jobId === null);
  if ("error" in parsed) return { error: parsed.error };
  const j = parsed.job;
  if (!j.contact_email && !j.contact_phone) {
    // Applications arrive on the board, but a contact helps applicants with questions.
    j.contact_email = me.email;
  }
  const sql = await db();
  let id = jobId;
  if (jobId) {
    const { job } = await ownJob(jobId);
    if (!job) return { error: "You can only edit vacancies you posted." };
    await sql`
      update jobs set
        title = ${j.title}, company = ${j.company}, employer_type = ${j.employer_type}, county = ${j.county},
        location = ${j.location}, category = ${j.category}, job_type = ${j.job_type}, salary = ${j.salary},
        deadline = ${j.deadline}, description = ${j.description}, requirements = ${j.requirements},
        how_to_apply = ${j.how_to_apply}, contact_email = ${j.contact_email}, contact_phone = ${j.contact_phone},
        updated_at = now()
      where id = ${jobId}`;
  } else {
    const rows = await sql`
      insert into jobs (employer_id, title, company, employer_type, county, location, category, job_type, salary,
                        deadline, description, requirements, how_to_apply, contact_email, contact_phone)
      values (${me.id}, ${j.title}, ${j.company}, ${j.employer_type}, ${j.county}, ${j.location}, ${j.category},
              ${j.job_type}, ${j.salary}, ${j.deadline}, ${j.description}, ${j.requirements}, ${j.how_to_apply},
              ${j.contact_email}, ${j.contact_phone})
      returning id`;
    id = String(rows[0].id);
  }
  revalidatePath("/", "layout");
  redirect(`/jobs/${id}?saved=1`);
}

export async function setJobStatus(jobId: string, status: "open" | "closed", _prev: ActionState, _fd: FormData): Promise<ActionState> {
  if (!hasDatabase()) return { error: NO_DB };
  const { job } = await ownJob(jobId);
  if (!job) return { error: "You can only change vacancies you posted." };
  const sql = await db();
  await sql`update jobs set status = ${status}, updated_at = now() where id = ${jobId}`;
  revalidatePath("/", "layout");
  return { message: status === "closed" ? "Marked as filled. It no longer shows as open." : "Vacancy reopened." };
}

export async function deleteJob(jobId: string, _prev: ActionState, _fd: FormData): Promise<ActionState> {
  if (!hasDatabase()) return { error: NO_DB };
  const { job } = await ownJob(jobId);
  if (!job) return { error: "You can only delete vacancies you posted." };
  const sql = await db();
  await sql`delete from jobs where id = ${jobId}`;
  revalidatePath("/", "layout");
  redirect("/employer?deleted=1");
}

export async function apply(jobId: string, _prev: ActionState, fd: FormData): Promise<ActionState> {
  if (!hasDatabase()) return { error: "This is a preview. Applications open once the board is connected to its database." };
  if (isBot(fd)) return { message: "Application sent." };
  if (!isUuid(jobId)) return { error: "This vacancy no longer exists." };
  const parsed = readApplication(fd);
  if ("error" in parsed) return { error: parsed.error };
  const a = parsed.application;

  const sql = await db();
  const rows = await sql`select status, deadline from jobs where id = ${jobId}`;
  if (!rows[0]) return { error: "This vacancy no longer exists." };
  if (!isOpen({ status: rows[0].status === "closed" ? "closed" : "open", deadline: isoDate(rows[0].deadline) })) return { error: "Sorry, this vacancy is closed and no longer takes applications." };

  const dup = await sql`
    select 1 from applications where job_id = ${jobId} and phone = ${a.phone} and created_at > now() - interval '1 day'`;
  if (dup.length) return { message: "You already applied for this job. The employer has your application." };

  await sql`
    insert into applications (job_id, name, phone, email, county, message, cv_link)
    values (${jobId}, ${a.name}, ${a.phone}, ${a.email}, ${a.county}, ${a.message}, ${a.cv_link})`;
  return { message: "Application sent. If the employer shortlists you, they will contact you by phone or email." };
}

export async function setApplicationStatus(
  applicationId: string,
  status: "new" | "shortlisted" | "rejected",
  _prev: ActionState,
  _fd: FormData,
): Promise<ActionState> {
  if (!hasDatabase()) return { error: NO_DB };
  const me = await requireEmployer();
  if (!isUuid(applicationId)) return { error: "This application no longer exists." };
  const sql = await db();
  const rows = await sql`
    select a.id, j.employer_id from applications a join jobs j on j.id = a.job_id where a.id = ${applicationId}`;
  const row = rows[0];
  if (!row || (!me.is_admin && row.employer_id !== me.id)) return { error: "You can only manage applications for your own vacancies." };
  await sql`update applications set status = ${status} where id = ${applicationId}`;
  revalidatePath("/employer", "layout");
  return undefined;
}

export async function removeExamples(_prev: ActionState, _fd: FormData): Promise<ActionState> {
  if (!hasDatabase()) return { error: NO_DB };
  const me = await requireEmployer();
  if (!me.is_admin) return { error: "Only the board administrator can do this." };
  const sql = await db();
  await sql`delete from jobs where example = true`;
  revalidatePath("/", "layout");
  return { message: "Example vacancies removed." };
}
