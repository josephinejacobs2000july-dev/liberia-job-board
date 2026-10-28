import Link from "next/link";
import { jobState, postedLabel, type Job } from "@/lib/jobs";

export function JobCard({ job, now }: { job: Job; now: string }) {
  const s = jobState(job, now);
  return (
    <Link href={`/jobs/${job.id}`} className="job">
      <h3>{job.title}</h3>
      <div className="org">
        {job.company} · {job.location ? `${job.location}, ` : ""}
        {job.county}
      </div>
      <div className="meta">
        {job.example && <span className="pill example">Example</span>}
        <span className={`pill ${s.key}`}>{s.label}</span>
        <span className="tag">{job.job_type}</span>
        <span className="tag">{job.category}</span>
      </div>
      <div className="foot">
        <span className="salary">{job.salary ?? "Salary not stated"}</span>
        <span>{postedLabel(job.created_at, now)}</span>
      </div>
    </Link>
  );
}

export function StatePill({ job, now }: { job: Pick<Job, "status" | "deadline">; now: string }) {
  const s = jobState(job, now);
  return <span className={`pill ${s.key}`}>{s.label}</span>;
}
