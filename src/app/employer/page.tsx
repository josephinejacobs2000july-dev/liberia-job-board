import type { Metadata } from "next";
import Link from "next/link";
import { ActionForm } from "@/components/action-form";
import { StatePill } from "@/components/job-card";
import { SetupNotice } from "@/components/setup-notice";
import { logout, removeExamples } from "@/app/actions";
import { currentEmployer } from "@/lib/auth";
import { hasDatabase } from "@/lib/db";
import { postedLabel, today } from "@/lib/jobs";
import { employerJobs } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "For employers" };

export default async function EmployerPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string; deleted?: string }>;
}) {
  const sp = await searchParams;
  if (!hasDatabase()) {
    return (
      <>
        <div className="page-h">
          <h1>For employers</h1>
        </div>
        <SetupNotice />
      </>
    );
  }

  const me = await currentEmployer();
  if (!me) {
    return (
      <>
        <div className="page-h">
          <div>
            <h1>Hiring? Post your vacancy for free</h1>
            <p>Reach job seekers in all 15 counties and review their applications in one place.</p>
          </div>
        </div>
        <div className="panel">
          <ol style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 4 }}>
            <li>Create a free employer account for your organisation or business.</li>
            <li>Post your vacancy: what the job is, where, what it pays and when applications close.</li>
            <li>Job seekers apply on the board. You see their details, message and CV link, and shortlist the best.</li>
          </ol>
          <div className="actions">
            <Link href="/employer/signup" className="btn">
              Create employer account
            </Link>
            <Link href="/employer/login" className="btn neutral">
              Sign in
            </Link>
          </div>
        </div>
      </>
    );
  }

  const jobs = await employerJobs(me);
  const now = today();
  const examples = jobs.filter((j) => j.example).length;

  return (
    <>
      {sp.welcome && (
        <p className="ok">
          Welcome, {me.contact_name}. Your account is ready.
          {me.is_admin ? " As the first account, you are the board administrator: you can manage every vacancy." : ""}
        </p>
      )}
      {sp.deleted && <p className="ok">Vacancy deleted.</p>}

      <div className="page-h">
        <div>
          <h1>{me.is_admin ? "All vacancies" : "Your vacancies"}</h1>
          <p>
            Signed in as {me.contact_name}, {me.company}
            {me.is_admin ? " · Administrator" : ""}
          </p>
        </div>
        <div className="actions">
          <Link href="/employer/jobs/new" className="btn">
            Post a vacancy
          </Link>
          <form action={logout}>
            <button type="submit" className="btn neutral">
              Sign out
            </button>
          </form>
        </div>
      </div>

      {me.is_admin && examples > 0 && (
        <div className="notice warn">
          <p>
            The {examples} vacancies marked <b>Example</b> are made up so the board is not empty. Remove them once real
            employers start posting.
          </p>
          <ActionForm action={removeExamples} submitLabel="Remove example vacancies" confirmLabel="Tap again to remove them" tone="neutral" small />
        </div>
      )}

      {jobs.length ? (
        <section className="list" aria-label="Vacancies">
          {jobs.map((j) => (
            <div className="row" key={j.id}>
              <div className="row-top">
                <div style={{ minWidth: 0 }}>
                  <h3>
                    <Link href={`/jobs/${j.id}`}>{j.title}</Link>
                  </h3>
                  <p className="note">
                    {j.company} · {j.county} · {postedLabel(j.created_at, now)}
                  </p>
                </div>
                <div className="meta">
                  {j.example && <span className="pill example">Example</span>}
                  <StatePill job={j} now={now} />
                </div>
              </div>
              <div className="actions">
                <Link href={`/employer/jobs/${j.id}/applications`} className="btn sm">
                  {j.applications ?? 0} {j.applications === 1 ? "application" : "applications"}
                </Link>
                <Link href={`/employer/jobs/${j.id}/edit`} className="btn sm neutral">
                  Edit
                </Link>
                <Link href={`/jobs/${j.id}`} className="btn sm ghost">
                  View
                </Link>
              </div>
            </div>
          ))}
        </section>
      ) : (
        <div className="empty">
          <strong>You have not posted a vacancy yet</strong>
          <p>Your vacancies and their applications appear here.</p>
          <Link href="/employer/jobs/new" className="btn">
            Post your first vacancy
          </Link>
        </div>
      )}
    </>
  );
}
