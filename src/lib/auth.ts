import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import argon2 from "argon2";
import { demoAccounts } from "@/lib/demo-data";
import type { DemoAccount } from "@/types/domain";

const COOKIE_NAME = "luxkey_demo_session";
const DEMO_PASSWORD = "Demo1234!";
let passwordHashPromise: Promise<string> | undefined;

function secret() {
  return process.env.SESSION_SECRET ?? "luxkey-local-development-secret-32-chars";
}

function base64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function signature(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export async function verifyDemoCredentials(username: string, password: string) {
  const account = demoAccounts.find((candidate) => candidate.username === username.toLowerCase());
  if (!account) return null;
  passwordHashPromise ??= argon2.hash(DEMO_PASSWORD, { type: argon2.argon2id });
  const valid = await argon2.verify(await passwordHashPromise, password);
  return valid ? account : null;
}

export function createSessionToken(account: DemoAccount) {
  const payload = base64Url(
    JSON.stringify({
      username: account.username,
      role: account.role,
      issuedAt: Date.now(),
      expiresAt: Date.now() + 1000 * 60 * 60 * 8,
    }),
  );
  return `${payload}.${signature(payload)}`;
}

export function parseSessionToken(token?: string): DemoAccount | null {
  if (!token) return null;
  const [payload, suppliedSignature] = token.split(".");
  if (!payload || !suppliedSignature) return null;
  const expected = Buffer.from(signature(payload));
  const supplied = Buffer.from(suppliedSignature);
  if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      username: string;
      expiresAt: number;
    };
    if (parsed.expiresAt < Date.now()) return null;
    return demoAccounts.find((account) => account.username === parsed.username) ?? null;
  } catch {
    return null;
  }
}

export async function getDemoSession() {
  const store = await cookies();
  return parseSessionToken(store.get(COOKIE_NAME)?.value);
}

export const sessionCookie = {
  name: COOKIE_NAME,
  options: {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  },
};
