import type { Metadata } from "next";
import Link from "next/link";
import { ActionForm } from "@/components/action-form";
import { JobFields } from "@/components/job-fields";
import { SetupNotice } from "@/components/setup-notice";
import { saveJob } from "@/app/actions";
import { requireEmployer } from "@/lib/auth";
import { hasDatabase } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Post a vacancy" };

export default async function NewJobPage() {
  if (!hasDatabase()) return <SetupNotice />;
  const me = await requireEmployer();
  return (
    <>
      <Link href="/employer" className="back">
        ← Your vacancies
      </Link>
      <div className="page-h">
        <h1>Post a vacancy</h1>
      </div>
      <div className="panel">
        <ActionForm action={saveJob.bind(null, null)} submitLabel="Post vacancy" pendingLabel="Posting…">
          <JobFields defaultCompany={me.company} />
        </ActionForm>
      </div>
    </>
  );
}
