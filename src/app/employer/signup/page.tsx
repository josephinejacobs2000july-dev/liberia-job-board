import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ActionForm } from "@/components/action-form";
import { Field, SpamTrap } from "@/components/fields";
import { SetupNotice } from "@/components/setup-notice";
import { signup } from "@/app/actions";
import { currentEmployer } from "@/lib/auth";
import { hasDatabase } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Create employer account" };

export default async function SignupPage() {
  if (!hasDatabase()) return <SetupNotice />;
  if (await currentEmployer()) redirect("/employer");
  return (
    <div className="panel" style={{ maxWidth: 560, width: "100%", marginInline: "auto" }}>
      <div>
        <h1 style={{ fontSize: 26 }}>Create an employer account</h1>
        <p className="note">Free. You will use it to post vacancies and read applications.</p>
      </div>
      <ActionForm action={signup} submitLabel="Create account" pendingLabel="Creating…">
        <SpamTrap />
        <Field label="Organisation or business name" htmlFor="company" required>
          <input id="company" name="company" maxLength={120} autoComplete="organization" />
        </Field>
        <div className="grid2">
          <Field label="Your name" htmlFor="contact_name" required>
            <input id="contact_name" name="contact_name" maxLength={120} autoComplete="name" />
          </Field>
          <Field label="Phone" htmlFor="phone">
            <input id="phone" name="phone" type="tel" maxLength={40} autoComplete="tel" placeholder="+231 …" />
          </Field>
        </div>
        <Field label="Email" htmlFor="email" required hint="You sign in with this email.">
          <input id="email" name="email" type="email" maxLength={120} autoComplete="email" />
        </Field>
        <div className="grid2">
          <Field label="Password" htmlFor="password" required hint="At least 8 characters.">
            <input id="password" name="password" type="password" autoComplete="new-password" />
          </Field>
          <Field label="Type the password again" htmlFor="confirm" required>
            <input id="confirm" name="confirm" type="password" autoComplete="new-password" />
          </Field>
        </div>
      </ActionForm>
      <p className="note">
        Already have an account? <Link href="/employer/login">Sign in</Link>
      </p>
    </div>
  );
}
