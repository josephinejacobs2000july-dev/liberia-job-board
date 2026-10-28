// The vacancy form, shared by "Post a vacancy" and "Edit vacancy".
import { addDays, CATEGORIES, COUNTIES, EMPLOYER_TYPES, JOB_TYPES, today, type Job } from "@/lib/jobs";
import { Field, Options } from "./fields";

export function JobFields({ job, defaultCompany }: { job?: Job; defaultCompany?: string }) {
  const j = job;
  return (
    <>
      <Field label="Job title" htmlFor="title" required>
        <input id="title" name="title" maxLength={120} defaultValue={j?.title ?? ""} placeholder="e.g. Field Accountant" />
      </Field>
      <div className="grid2">
        <Field label="Employer name" htmlFor="company" required>
          <input id="company" name="company" maxLength={120} defaultValue={j?.company ?? defaultCompany ?? ""} />
        </Field>
        <Field label="Type of employer" htmlFor="employer_type">
          <select id="employer_type" name="employer_type" defaultValue={j?.employer_type ?? "Private company"}>
            <Options values={EMPLOYER_TYPES} />
          </select>
        </Field>
        <Field label="County" htmlFor="county" required>
          <select id="county" name="county" defaultValue={j?.county ?? ""}>
            <Options values={COUNTIES} blank="Choose a county" />
          </select>
        </Field>
        <Field label="Town or area" htmlFor="location">
          <input id="location" name="location" maxLength={80} defaultValue={j?.location ?? ""} placeholder="e.g. Sinkor, Ganta, Buchanan" />
        </Field>
        <Field label="Field" htmlFor="category" required>
          <select id="category" name="category" defaultValue={j?.category ?? ""}>
            <Options values={CATEGORIES} blank="Choose a field" />
          </select>
        </Field>
        <Field label="Job type" htmlFor="job_type">
          <select id="job_type" name="job_type" defaultValue={j?.job_type ?? "Full-time"}>
            <Options values={JOB_TYPES} />
          </select>
        </Field>
        <Field label="Salary" htmlFor="salary" hint="Leave blank if you prefer not to say. Jobs that show a salary get more applicants.">
          <input id="salary" name="salary" maxLength={80} defaultValue={j?.salary ?? ""} placeholder="e.g. US$450–600 per month" />
        </Field>
        <Field label="Applications close on" htmlFor="deadline" required>
          <input id="deadline" name="deadline" type="date" min={j ? undefined : today()} defaultValue={j?.deadline ?? addDays(today(), 21)} />
        </Field>
      </div>
      <Field label="About the job" htmlFor="description" required hint="What the person will do day to day.">
        <textarea id="description" name="description" rows={6} defaultValue={j?.description ?? ""} />
      </Field>
      <Field label="Requirements" htmlFor="requirements" hint="Education, experience, licences, languages. One per line works well.">
        <textarea id="requirements" name="requirements" rows={4} defaultValue={j?.requirements ?? ""} />
      </Field>
      <div className="grp">Contact and applying</div>
      <p className="hint">Job seekers apply on this board and you see their applications under For employers. You can also give other ways to apply.</p>
      <Field label="Other ways to apply (optional)" htmlFor="how_to_apply">
        <textarea id="how_to_apply" name="how_to_apply" rows={3} defaultValue={j?.how_to_apply ?? ""} placeholder="e.g. You can also hand in your CV at our office on Broad Street." />
      </Field>
      <div className="grid2">
        <Field label="Contact email" htmlFor="contact_email" hint="Shown on the vacancy. Leave blank to use your account email.">
          <input id="contact_email" name="contact_email" type="email" maxLength={120} defaultValue={j?.contact_email ?? ""} />
        </Field>
        <Field label="Phone or WhatsApp" htmlFor="contact_phone" hint="Shown on the vacancy.">
          <input id="contact_phone" name="contact_phone" type="tel" maxLength={40} defaultValue={j?.contact_phone ?? ""} placeholder="+231 …" />
        </Field>
      </div>
    </>
  );
}
