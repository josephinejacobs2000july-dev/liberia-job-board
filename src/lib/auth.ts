// Employer accounts: password hashing and the signed-in session cookie.
// Uses Node's built-in crypto, so no extra services or settings are needed.
import { createHmac, randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db, hasDatabase, isUuid } from "./db";

const COOKIE = "jb_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function scrypt(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) =>
    scryptCb(password, salt, 64, (err, key) => (err ? reject(err) : resolve(key))),
  );
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const key = await scrypt(password, salt);
  return `scrypt$${salt}$${key.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [kind, salt, hex] = stored.split("$");
  if (kind !== "scrypt" || !salt || !hex) return false;
  const expected = Buffer.from(hex, "hex");
  const actual = await scrypt(password, salt);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

async function secret(): Promise<string> {
  const fromEnv = process.env.AUTH_SECRET;
  if (fromEnv && fromEnv.length >= 32) return fromEnv;
  const sql = await db();
  const rows = await sql`select value from app_settings where key = 'session_secret'`;
  return String(rows[0]?.value ?? "");
}

function sign(payload: string, key: string): string {
  return createHmac("sha256", key).update(payload).digest("hex");
}

export async function startSession(employerId: string): Promise<void> {
  const expires = Date.now() + MAX_AGE * 1000;
  const payload = `${employerId}.${expires}`;
  const token = `${payload}.${sign(payload, await secret())}`;
  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function endSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}

export type Employer = {
  id: string;
  company: string;
  contact_name: string;
  email: string;
  phone: string | null;
  is_admin: boolean;
};

/** The signed-in employer for this request, or null. */
export const currentEmployer = cache(async (): Promise<Employer | null> => {
  if (!hasDatabase()) return null;
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  const [id, expires, sig] = token.split(".");
  if (!id || !expires || !sig || !isUuid(id) || Number(expires) < Date.now()) return null;
  const expected = Buffer.from(sign(`${id}.${expires}`, await secret()), "hex");
  const given = Buffer.from(sig, "hex");
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;

  const sql = await db();
  const rows = await sql`
    select id, company, contact_name, email, phone, is_admin from employers where id = ${id}`;
  const r = rows[0];
  if (!r) return null;
  return {
    id: String(r.id),
    company: String(r.company),
    contact_name: String(r.contact_name),
    email: String(r.email),
    phone: (r.phone as string | null) ?? null,
    is_admin: Boolean(r.is_admin),
  };
});

export async function requireEmployer(): Promise<Employer> {
  const e = await currentEmployer();
  if (!e) redirect("/employer/login");
  return e;
}
