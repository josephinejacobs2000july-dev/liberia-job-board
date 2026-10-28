import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ActionForm } from "@/components/action-form";
import { Field } from "@/components/fields";
import { SetupNotice } from "@/components/setup-notice";
import { login } from "@/app/actions";
import { currentEmployer } from "@/lib/auth";
import { hasDatabase } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Employer sign in" };

export default async function LoginPage() {
  if (!hasDatabase()) return <SetupNotice />;
  if (await currentEmployer()) redirect("/employer");
  return (
    <div className="panel" style={{ maxWidth: 440, width: "100%", marginInline: "auto" }}>
      <h1 style={{ fontSize: 26 }}>Employer sign in</h1>
      <ActionForm action={login} submitLabel="Sign in" pendingLabel="Signing in…">
        <Field label="Email" htmlFor="email">
          <input id="email" name="email" type="email" autoComplete="username" />
        </Field>
        <Field label="Password" htmlFor="password">
          <input id="password" name="password" type="password" autoComplete="current-password" />
        </Field>
      </ActionForm>
      <p className="note">
        New here? <Link href="/employer/signup">Create a free employer account</Link>
      </p>
    </div>
  );
}
