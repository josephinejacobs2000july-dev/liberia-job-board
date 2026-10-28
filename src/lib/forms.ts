// Small helpers for reading and checking submitted forms.
import { CATEGORIES, COUNTIES, EMPLOYER_TYPES, isEmail, isWebLink, JOB_TYPES, today } from "./jobs";

/** What a form's server action returns: an error to show, or a success message. */
export type ActionState = { error?: string; message?: string } | undefined;

export function field(fd: FormData, name: string): string {
  const v = fd.get(name);
  return typeof v === "string" ? v.trim() : "";
}

/** A hidden field people never see. Bots that fill every box fill it in. */
export function isBot(fd: FormData): boolean {
  return field(fd, "website") !== "";
}

type Check = [ok: boolean, message: string];

function firstProblem(checks: Check[]): string | null {
  for (const [ok, message] of checks) if (!ok) return message;
  return null;
}

const within = (v: string, max: number) => v.length <= max;

export type JobInput = {
  title: string;
  company: string;
  employer_type: string;
  county: string;
  location: string | null;
  category: string;
  job_type: string;
  salary: string | null;
  deadline: string;
  description: string;
  requirements: string | null;
  how_to_apply: string | null;
  contact_email: string | null;
  contact_phone: string | null;
};

export function readJob(fd: FormData, isNew: boolean): { job: JobInput } | { error: string } {
  const v = {
    title: field(fd, "title"),
    company: field(fd, "company"),
    employer_type: field(fd, "employer_type"),
    county: field(fd, "county"),
    location: field(fd, "location"),
    category: field(fd, "category"),
    job_type: field(fd, "job_type"),
    salary: field(fd, "salary"),
    deadline: field(fd, "deadline"),
    description: field(fd, "description"),
    requirements: field(fd, "requirements"),
    how_to_apply: field(fd, "how_to_apply"),
    contact_email: field(fd, "contact_email"),
    contact_phone: field(fd, "contact_phone"),
  };
  const problem = firstProblem([
    [v.title !== "", "Enter the job title."],
    [within(v.title, 120), "The job title is too long (120 characters at most)."],
    [v.company !== "", "Enter the employer name."],
    [within(v.company, 120), "The employer name is too long."],
    [EMPLOYER_TYPES.includes(v.employer_type), "Choose the type of employer."],
    [COUNTIES.includes(v.county), "Choose the county where the job is."],
    [within(v.location, 80), "The town or area is too long."],
    [CATEGORIES.includes(v.category), "Choose the field the job is in."],
    [JOB_TYPES.includes(v.job_type), "Choose the job type."],
    [within(v.salary, 80), "The salary text is too long."],
    [/^\d{4}-\d{2}-\d{2}$/.test(v.deadline), "Choose the date applications close."],
    [!isNew || v.deadline >= today(), "The closing date has already passed. Choose a later date."],
    [v.description !== "", "Describe the job."],
    [within(v.description, 6000), "The job description is too long (6,000 characters at most)."],
    [within(v.requirements, 4000), "The requirements are too long (4,000 characters at most)."],
    [within(v.how_to_apply, 2000), "The application instructions are too long."],
    [v.contact_email === "" || isEmail(v.contact_email), "That email address does not look right."],
    [within(v.contact_phone, 40), "The phone number is too long."],
  ]);
  if (problem) return { error: problem };
  const orNull = (s: string) => (s === "" ? null : s);
  return {
    job: {
      ...v,
      location: orNull(v.location),
      salary: orNull(v.salary),
      requirements: orNull(v.requirements),
      how_to_apply: orNull(v.how_to_apply),
      contact_email: orNull(v.contact_email),
      contact_phone: orNull(v.contact_phone),
    },
  };
}

export type ApplicationInput = {
  name: string;
  phone: string;
  email: string | null;
  county: string | null;
  message: string;
  cv_link: string | null;
};

export function readApplication(fd: FormData): { application: ApplicationInput } | { error: string } {
  const v = {
    name: field(fd, "name"),
    phone: field(fd, "phone"),
    email: field(fd, "email"),
    county: field(fd, "county"),
    message: field(fd, "message"),
    cv_link: field(fd, "cv_link"),
  };
  const problem = firstProblem([
    [v.name !== "", "Enter your full name."],
    [within(v.name, 120), "Your name is too long."],
    [v.phone.replace(/\D/g, "").length >= 7, "Enter a phone number the employer can reach you on."],
    [within(v.phone, 40), "The phone number is too long."],
    [v.email === "" || isEmail(v.email), "That email address does not look right."],
    [v.county === "" || COUNTIES.includes(v.county), "Choose your county from the list."],
    [v.message.length >= 20, "Tell the employer a little about yourself (at least a sentence or two)."],
    [within(v.message, 3000), "Your message is too long (3,000 characters at most)."],
    [v.cv_link === "" || isWebLink(v.cv_link), "The CV link must start with https://"],
    [within(v.cv_link, 500), "The CV link is too long."],
  ]);
  if (problem) return { error: problem };
  return {
    application: {
      name: v.name,
      phone: v.phone,
      email: v.email || null,
      county: v.county || null,
      message: v.message,
      cv_link: v.cv_link || null,
    },
  };
}

export type SignupInput = { company: string; contact_name: string; email: string; phone: string | null; password: string };

export function readSignup(fd: FormData): { signup: SignupInput } | { error: string } {
  const v = {
    company: field(fd, "company"),
    contact_name: field(fd, "contact_name"),
    email: field(fd, "email").toLowerCase(),
    phone: field(fd, "phone"),
    password: String(fd.get("password") ?? ""),
    confirm: String(fd.get("confirm") ?? ""),
  };
  const problem = firstProblem([
    [v.company !== "", "Enter your organisation or business name."],
    [within(v.company, 120), "The organisation name is too long."],
    [v.contact_name !== "", "Enter your name."],
    [within(v.contact_name, 120), "Your name is too long."],
    [isEmail(v.email), "Enter a valid email address. You will use it to sign in."],
    [within(v.phone, 40), "The phone number is too long."],
    [v.password.length >= 8, "Choose a password of at least 8 characters."],
    [v.password.length <= 200, "That password is too long."],
    [v.password === v.confirm, "The two passwords do not match."],
  ]);
  if (problem) return { error: problem };
  return { signup: { company: v.company, contact_name: v.contact_name, email: v.email, phone: v.phone || null, password: v.password } };
}
