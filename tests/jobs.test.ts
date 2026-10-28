import { test } from "node:test";
import assert from "node:assert/strict";
import { addDays, daysBetween, filterJobs, formatDate, isEmail, isWebLink, jobState, postedLabel, today, type Job } from "../src/lib/jobs.ts";

const job = (over: Partial<Job>): Job => ({
  id: "1", employer_id: null, title: "Field Accountant", company: "Harbour Health", employer_type: "NGO",
  county: "Montserrado", location: "Sinkor", category: "Finance and accounting", job_type: "Full-time",
  salary: null, deadline: "2026-11-10", description: "Keep the books", requirements: null, how_to_apply: null,
  contact_email: null, contact_phone: null, status: "open", example: false, created_at: "2026-10-20", ...over,
});

test("today uses Liberia time", () => {
  assert.equal(today(new Date("2026-10-28T23:30:00Z")), "2026-10-28");
});

test("date arithmetic", () => {
  assert.equal(addDays("2026-10-28", 5), "2026-11-02");
  assert.equal(addDays("2026-03-01", -1), "2026-02-28");
  assert.equal(daysBetween("2026-10-28", "2026-11-07"), 10);
});

test("job state: open, closing soon, deadline passed, filled", () => {
  const now = "2026-10-28";
  assert.equal(jobState(job({ deadline: "2026-11-20" }), now).key, "open");
  assert.equal(jobState(job({ deadline: "2026-11-01" }), now).label, "Closes in 4 days");
  assert.equal(jobState(job({ deadline: "2026-10-28" }), now).label, "Closes today");
  assert.equal(jobState(job({ deadline: "2026-10-27" }), now).label, "Deadline passed");
  assert.equal(jobState(job({ status: "closed" }), now).label, "Position filled");
});

test("dates read naturally", () => {
  assert.equal(formatDate("2026-11-07", "2026-10-28"), "7 Nov");
  assert.equal(formatDate("2027-01-05", "2026-10-28"), "5 Jan 2027");
  assert.equal(postedLabel("2026-10-28", "2026-10-28"), "Posted today");
  assert.equal(postedLabel("2026-10-27", "2026-10-28"), "Posted yesterday");
  assert.equal(postedLabel("2026-10-25", "2026-10-28"), "Posted 3 days ago");
});

test("filterJobs searches, filters and hides closed jobs", () => {
  const now = "2026-10-28";
  const jobs = [
    job({ id: "a", title: "Nurse", category: "Health", county: "Nimba", created_at: "2026-10-27" }),
    job({ id: "b", title: "Driver", category: "Driving and logistics", county: "Grand Bassa", created_at: "2026-10-26" }),
    job({ id: "c", title: "Old job", deadline: "2026-10-01" }),
  ];
  assert.deepEqual(filterJobs(jobs, {}, now).map((j) => j.id), ["a", "b"]);
  assert.deepEqual(filterJobs(jobs, { closed: true }, now).map((j) => j.id), ["a", "b", "c"]);
  assert.deepEqual(filterJobs(jobs, { county: "Nimba" }, now).map((j) => j.id), ["a"]);
  assert.deepEqual(filterJobs(jobs, { q: "driv" }, now).map((j) => j.id), ["b"]);
});

test("email and link checks", () => {
  assert.ok(isEmail("hr@example.org"));
  assert.equal(isEmail("hr@"), false);
  assert.ok(isWebLink("https://drive.google.com/file/d/abc"));
  assert.equal(isWebLink("javascript:alert(1)"), false);
  assert.equal(isWebLink("not a link"), false);
});
