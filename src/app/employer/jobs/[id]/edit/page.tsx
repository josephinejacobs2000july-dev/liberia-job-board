import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm } from "@/components/action-form";
import { JobFields } from "@/components/job-fields";
import { SetupNotice } from "@/components/setup-notice";
import { saveJob } from "@/app/actions";
import { requireEmployer } from "@/lib/auth";
import { hasDatabase } from "@/lib/db";
import { canManage, getJob } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Edit vacancy" };

export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  if (!hasDatabase()) return <SetupNotice />;
  const me = await requireEmployer();
  const job = await getJob((await params).id);
  if (!job || !canManage(me, job)) notFound();
  return (
    <>
      <Link href={`/jobs/${job.id}`} className="back">
        ← Back to the vacancy
      </Link>
      <div className="page-h">
        <h1>Edit vacancy</h1>
      </div>
      <div className="panel">
        <ActionForm action={saveJob.bind(null, job.id)} submitLabel="Save changes">
          <JobFields job={job} />
        </ActionForm>
      </div>
    </>
  );
}
