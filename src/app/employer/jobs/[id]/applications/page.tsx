import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm } from "@/components/action-form";
import { StatePill } from "@/components/job-card";
import { SetupNotice } from "@/components/setup-notice";
import { setApplicationStatus } from "@/app/actions";
import { requireEmployer } from "@/lib/auth";
import { hasDatabase } from "@/lib/db";
import { APPLICATION_STATUS, formatDate, today } from "@/lib/jobs";
import { applicationsFor, canManage, getJob } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Applications" };

export default async function ApplicationsPage({ params }: { params: Promise<{ id: string }> }) {
  if (!hasDatabase()) return <SetupNotice />;
  const me = await requireEmployer();
  const job = await getJob((await params).id);
  if (!job || !canManage(me, job)) notFound();
  const apps = await applicationsFor(job.id);
  const now = today();
  const shortlisted = apps.filter((a) => a.status === "shortlisted").length;

  return (
    <>
      <Link href="/employer" className="back">
        ← Your vacancies
      </Link>
      <div className="page-h">
        <div>
          <h1>Applications</h1>
          <p>
            <Link href={`/jobs/${job.id}`}>{job.title}</Link> · {job.company}
          </p>
        </div>
        <div className="meta">
          <StatePill job={job} now={now} />
        </div>
      </div>

      <p className="count">
        {apps.length} {apps.length === 1 ? "application" : "applications"}
        {shortlisted ? ` · ${shortlisted} shortlisted` : ""}. Shortlisted applicants are listed first.
      </p>

      {apps.length ? (
        <section className="list">
          {apps.map((a) => (
            <div className="row" key={a.id}>
              <div className="row-top">
                <div style={{ minWidth: 0 }}>
                  <h3>{a.name}</h3>
                  <p className="note">
                    Applied {formatDate(a.created_at.toISOString().slice(0, 10), now)}
                    {a.county ? ` · Lives in ${a.county}` : ""}
                  </p>
                </div>
                <span className={`pill ${a.status}`}>{APPLICATION_STATUS[a.status]}</span>
              </div>
              <div className="contact">
                <a href={`tel:${a.phone.replace(/\s/g, "")}`}>{a.phone}</a>
                {a.email && <a href={`mailto:${a.email}`}>{a.email}</a>}
                {a.cv_link && (
                  <a href={a.cv_link} target="_blank" rel="noopener noreferrer nofollow">
                    Open CV
                  </a>
                )}
              </div>
              <p className="message">{a.message}</p>
              <div className="actions">
                {a.status !== "shortlisted" && (
                  <ActionForm action={setApplicationStatus.bind(null, a.id, "shortlisted")} submitLabel="Shortlist" small className="" />
                )}
                {a.status !== "rejected" && (
                  <ActionForm action={setApplicationStatus.bind(null, a.id, "rejected")} submitLabel="Not suitable" tone="neutral" small className="" />
                )}
                {a.status !== "new" && (
                  <ActionForm action={setApplicationStatus.bind(null, a.id, "new")} submitLabel="Undo" tone="ghost" small className="" />
                )}
              </div>
            </div>
          ))}
        </section>
      ) : (
        <div className="empty">
          <strong>No applications yet</strong>
          <p>When job seekers apply, their details and messages appear here. Share the vacancy link to reach more people.</p>
        </div>
      )}
    </>
  );
}
