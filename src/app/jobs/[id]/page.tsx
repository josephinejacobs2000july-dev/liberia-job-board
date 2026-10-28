import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm } from "@/components/action-form";
import { Field, Options, SpamTrap } from "@/components/fields";
import { StatePill } from "@/components/job-card";
import { apply, deleteJob, setJobStatus } from "@/app/actions";
import { currentEmployer } from "@/lib/auth";
import { hasDatabase } from "@/lib/db";
import { COUNTIES, formatDate, isOpen, today } from "@/lib/jobs";
import { canManage, getJob } from "@/lib/queries";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const job = await getJob((await params).id);
  return { title: job ? `${job.title}, ${job.company}` : "Vacancy" };
}

export default async function JobPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { saved } = await searchParams;
  const job = await getJob(id);
  if (!job) notFound();

  const me = await currentEmployer();
  const manage = canManage(me, job);
  const now = today();
  const open = isOpen(job, now);

  return (
    <>
      <Link href={manage ? "/employer" : "/"} className="back">
        ← {manage ? "Your vacancies" : "All jobs"}
      </Link>

      {saved && manage && <p className="ok">Vacancy saved. This is how job seekers see it.</p>}

      <div className="layout-2">
        <article className="panel">
          <div>
            <h1 style={{ fontSize: 28, lineHeight: 1.15 }}>{job.title}</h1>
            <p className="note" style={{ fontSize: 15, marginTop: 4 }}>
              {job.company} · {job.employer_type}
            </p>
          </div>
          <div className="meta">
            {job.example && <span className="pill example">Example</span>}
            <StatePill job={job} now={now} />
          </div>
          <dl className="facts">
            <div>
              <dt>Location</dt>
              <dd>
                {job.location ? `${job.location}, ` : ""}
                {job.county} County
              </dd>
            </div>
            <div>
              <dt>Job type</dt>
              <dd>{job.job_type}</dd>
            </div>
            <div>
              <dt>Salary</dt>
              <dd>{job.salary ?? "Not stated"}</dd>
            </div>
            <div>
              <dt>Apply by</dt>
              <dd>{formatDate(job.deadline, now)}</dd>
            </div>
            <div>
              <dt>Field</dt>
              <dd>{job.category}</dd>
            </div>
            <div>
              <dt>Posted</dt>
              <dd>{formatDate(job.created_at, now)}</dd>
            </div>
          </dl>
          <div className="block">
            <h2>About the job</h2>
            <p>{job.description}</p>
          </div>
          {job.requirements && (
            <div className="block">
              <h2>Requirements</h2>
              <p>{job.requirements}</p>
            </div>
          )}
          {(job.how_to_apply || job.contact_email || job.contact_phone) && (
            <div className="block">
              <h2>Contact</h2>
              {job.how_to_apply && <p>{job.how_to_apply}</p>}
              <div className="contact" style={{ marginTop: 6 }}>
                {job.contact_email && <a href={`mailto:${job.contact_email}`}>{job.contact_email}</a>}
                {job.contact_phone && <a href={`tel:${job.contact_phone.replace(/\s/g, "")}`}>{job.contact_phone}</a>}
              </div>
            </div>
          )}
        </article>

        <aside className="panel">
          {manage ? (
            <>
              <h2 className="sec-title">Manage this vacancy</h2>
              <div className="actions">
                <Link href={`/employer/jobs/${job.id}/applications`} className="btn">
                  See applications
                </Link>
                <Link href={`/employer/jobs/${job.id}/edit`} className="btn neutral">
                  Edit
                </Link>
              </div>
              {job.status === "open" ? (
                <ActionForm action={setJobStatus.bind(null, job.id, "closed")} submitLabel="Mark as filled" tone="neutral" small />
              ) : (
                <ActionForm action={setJobStatus.bind(null, job.id, "open")} submitLabel="Reopen vacancy" tone="neutral" small />
              )}
              <ActionForm
                action={deleteJob.bind(null, job.id)}
                submitLabel="Delete vacancy"
                confirmLabel="Tap again to delete for good"
                tone="danger"
                small
              />
            </>
          ) : open ? (
            <>
              <div>
                <h2 className="sec-title">Apply for this job</h2>
                <p className="note">The employer sees your details and message. Applying is free.</p>
              </div>
              {!hasDatabase() || job.example ? (
                <p className="notice info">
                  {job.example
                    ? "This is an example vacancy, so it does not take applications."
                    : "Applications open once the board is connected to its database."}
                </p>
              ) : (
                <ActionForm action={apply.bind(null, job.id)} submitLabel="Send application" pendingLabel="Sending…" hideOnSuccess>
                  <SpamTrap />
                  <Field label="Full name" htmlFor="name" required>
                    <input id="name" name="name" autoComplete="name" maxLength={120} />
                  </Field>
                  <Field label="Phone number" htmlFor="phone" required hint="The employer will call or WhatsApp you on this number.">
                    <input id="phone" name="phone" type="tel" autoComplete="tel" maxLength={40} placeholder="+231 …" />
                  </Field>
                  <Field label="Email" htmlFor="email">
                    <input id="email" name="email" type="email" autoComplete="email" maxLength={120} />
                  </Field>
                  <Field label="County you live in" htmlFor="county">
                    <select id="county" name="county" defaultValue="">
                      <Options values={COUNTIES} blank="Choose your county" />
                    </select>
                  </Field>
                  <Field label="Why are you a good fit?" htmlFor="message" required hint="Your experience, qualifications and when you can start.">
                    <textarea id="message" name="message" rows={6} maxLength={3000} />
                  </Field>
                  <Field label="Link to your CV" htmlFor="cv_link" hint="Optional. A Google Drive or Dropbox link that anyone with the link can open.">
                    <input id="cv_link" name="cv_link" type="url" maxLength={500} placeholder="https://" />
                  </Field>
                </ActionForm>
              )}
              <p className="note">Never pay money to apply for a job. Report any employer who asks for a fee.</p>
            </>
          ) : (
            <>
              <h2 className="sec-title">This vacancy is closed</h2>
              <p className="note">It no longer takes applications.</p>
              <Link href="/" className="btn neutral">
                See open jobs
              </Link>
            </>
          )}
        </aside>
      </div>
    </>
  );
}
