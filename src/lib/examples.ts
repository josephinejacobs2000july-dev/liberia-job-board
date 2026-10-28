// Made-up example vacancies. They are shown before a database is connected, and added to a new
// database once so the board is not empty. Every one is marked "Example" on screen.
import { addDays, today, type Job } from "./jobs";

type ExampleSeed = Omit<Job, "id" | "employer_id" | "deadline" | "created_at" | "status" | "example"> & {
  deadlineIn: number;
  postedAgo: number;
};

export const EXAMPLE_SEEDS: ExampleSeed[] = [
  {
    title: "Field Accountant",
    company: "Harbour Health Alliance",
    employer_type: "NGO",
    county: "Montserrado",
    location: "Sinkor",
    category: "Finance and accounting",
    job_type: "Full-time",
    salary: "US$650–800 per month",
    deadlineIn: 10,
    postedAgo: 2,
    description:
      "Keep the books for two donor-funded health projects. Record payments, reconcile bank and mobile money accounts each month, and prepare donor financial reports with the programme team.",
    requirements:
      "BSc in Accounting or Finance\nAt least 2 years' experience, NGO experience preferred\nGood with Excel and QuickBooks\nWilling to travel to Bong and Nimba occasionally",
    how_to_apply: "Apply on this page, or email your CV with \"Field Accountant\" in the subject line.",
    contact_email: "jobs@example.org",
    contact_phone: null,
  },
  {
    title: "Heavy Truck Driver",
    company: "Coastline Haulage Services",
    employer_type: "Private company",
    county: "Grand Bassa",
    location: "Buchanan",
    category: "Driving and logistics",
    job_type: "Contract",
    salary: "L$45,000 per month plus trip allowance",
    deadlineIn: 18,
    postedAgo: 6,
    description:
      "Drive 20-tonne trucks between Buchanan port, Monrovia and Gbarnga. Carry out daily vehicle checks and keep the trip log up to date.",
    requirements: "Valid Class C driver's licence\n3 years' heavy vehicle experience\nClean driving record",
    how_to_apply: "Apply on this page, or come to the yard office on Tubman Street, Buchanan, Monday to Friday, 9am to 3pm.",
    contact_email: null,
    contact_phone: "+231 77 000 0204",
  },
  {
    title: "Registered Nurse",
    company: "Hope Valley Community Clinic",
    employer_type: "NGO",
    county: "Nimba",
    location: "Ganta",
    category: "Health",
    job_type: "Full-time",
    salary: "US$400–500 per month",
    deadlineIn: 3,
    postedAgo: 14,
    description: "Provide outpatient and maternal care at a busy community clinic. Work on a rota that includes some weekend shifts.",
    requirements: "RN licence from the Liberian Board for Nursing and Midwifery\n1 year of clinical experience\nSpeaks Mano or Gio (an advantage)",
    how_to_apply: "Apply on this page and include a link to your CV and licence.",
    contact_email: "hr@example.org",
    contact_phone: null,
  },
  {
    title: "Junior IT Support Officer",
    company: "County Revenue Office",
    employer_type: "Government",
    county: "Margibi",
    location: "Kakata",
    category: "IT and telecoms",
    job_type: "Full-time",
    salary: null,
    deadlineIn: 23,
    postedAgo: 1,
    description:
      "Help staff with computers, printers and the office network. Set up new laptops, keep a list of IT equipment and back up shared files weekly.",
    requirements: "Diploma or degree in IT or Computer Science\nBasic networking knowledge\nPatient and good at explaining things",
    how_to_apply: "Apply on this page, or hand-deliver your letter and CV to the Human Resources desk.",
    contact_email: "recruitment@example.gov",
    contact_phone: null,
  },
  {
    title: "Front Desk Receptionist",
    company: "Riverbend Hotel",
    employer_type: "Private company",
    county: "Montserrado",
    location: "Mamba Point",
    category: "Hotels and hospitality",
    job_type: "Part-time",
    salary: "US$250 per month",
    deadlineIn: 13,
    postedAgo: 4,
    description:
      "Welcome guests, handle check-in and check-out, take bookings by phone and WhatsApp, and keep the lobby tidy. Evening and weekend shifts.",
    requirements: "High school diploma\nFriendly and well presented\nGood spoken English",
    how_to_apply: "Apply on this page and say which shifts you can work.",
    contact_email: null,
    contact_phone: "+231 88 000 0310",
  },
  {
    title: "Agriculture Extension Intern",
    company: "Green Fields Farmers Cooperative",
    employer_type: "NGO",
    county: "Bong",
    location: "Gbarnga",
    category: "Agriculture",
    job_type: "Internship",
    salary: "US$120 monthly stipend",
    deadlineIn: 31,
    postedAgo: 0,
    description:
      "A 6-month internship supporting cassava and rice farmer groups. Visit farms, record harvest data on a tablet and help run training days.",
    requirements: "Recent graduate or final-year student in Agriculture\nComfortable riding a motorbike to rural communities",
    how_to_apply: "Apply on this page with a short note on why you want to work with farmers.",
    contact_email: "internships@example.org",
    contact_phone: null,
  },
  {
    title: "Electrician",
    company: "Bright Spark Electrical",
    employer_type: "Private company",
    county: "Montserrado",
    location: "Paynesville",
    category: "Skilled trades",
    job_type: "Contract",
    salary: "US$25 per day",
    deadlineIn: 8,
    postedAgo: 7,
    description: "Install and repair wiring, distribution boards and solar systems in homes and offices around Monrovia.",
    requirements: "Trade certificate in Electrical Installation\nOwn basic tools\nAble to read wiring diagrams",
    how_to_apply: "Apply on this page. Shortlisted applicants will be called for a practical test.",
    contact_email: null,
    contact_phone: "+231 77 000 0519",
  },
];

/** The examples as full job records, with dates counted from today. */
export function exampleJobs(now: string = today()): Job[] {
  return EXAMPLE_SEEDS.map(({ deadlineIn, postedAgo, ...rest }, i) => ({
    ...rest,
    id: `example-${i + 1}`,
    employer_id: null,
    deadline: addDays(now, deadlineIn),
    created_at: addDays(now, -postedAgo),
    status: "open" as const,
    example: true,
  }));
}
