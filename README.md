# Liberia Job Board

A free job board for Liberia. **Job seekers** search vacancies by title, county, field and job type, and apply online. **Employers** create a free account, post vacancies, and review, shortlist or turn down applicants.

## Put it online (Vercel)

1. On [vercel.com](https://vercel.com), click **Add New → Project**, import this repository, choose your **Hobby** (free) account and click **Deploy**. Nothing needs to be filled in.
2. The site opens in **preview mode** with example jobs.
3. To make it real, add a free database. In the Vercel project, open **Storage → Create Database → Neon**, and connect it to this project. Then open **Deployments**, click **⋯** on the latest deployment, and choose **Redeploy**.

After connecting the database, any new deploy picks it up. On the first visit, the board creates its own tables, a secret key for logins and a few example vacancies.

**Who is the administrator?** The first employer account created on the board becomes the administrator. The administrator can edit or remove any vacancy and remove the example vacancies. So create your own account first.

## Features (version 1)

- Job search with county, field and job type filters; closed jobs hidden by default
- Vacancy pages with salary, closing date, requirements and contact details
- Online application: name, phone, email, county, message and a CV link
- Employer accounts: post, edit, mark as filled, reopen and delete vacancies
- Applications inbox per vacancy, with shortlisting
- A hidden spam trap on public forms, and a fraud warning on every page
- Works well on phones, with a dark mode that follows the phone's setting

## Run it on your computer

You need Node.js 20 or newer.

```bash
npm install
cp .env.example .env    # optional: add a PostgreSQL DATABASE_URL
npm run dev             # http://localhost:3000
```

Without `DATABASE_URL`, the board runs in preview mode with example jobs.

## How the code is organised

```
src/app/page.tsx                         Job search (home page)
src/app/jobs/[id]/page.tsx               Vacancy page and application form
src/app/employer/...                     Sign up, sign in, dashboard, post/edit vacancy, applications
src/app/actions.ts                       Everything that saves data (checks who is signed in)
src/lib/db.ts                            Database connection and automatic table setup
src/lib/auth.ts                          Employer passwords and sign-in sessions
src/lib/jobs.ts                          Counties, fields, job types, closing-date rules (unit tested)
src/lib/forms.ts                         Form checks
src/lib/examples.ts                      Example vacancies
tests/                                   Unit tests: npm test
```

## What could come next

- **Job alerts:** job seekers get an SMS or email when a matching job is posted
- **CV upload:** upload a PDF instead of sharing a link (needs file storage)
- **Featured listings:** employers pay to pin vacancies to the top (Orange Money or MTN MoMo)
- **Job seeker accounts:** saved jobs and an application history
- **Admin moderation:** approve new employers before their vacancies go live
