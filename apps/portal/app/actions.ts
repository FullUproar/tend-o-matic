"use server";

// Landing-page demo-request intake. Public-write, no auth gate. We
// validate cheaply and persist to the global demo_request table.
// Anti-abuse beyond shape checks lives in a follow-up — for now the
// table has source_ip and the row count is small enough to eyeball.

import { headers } from "next/headers";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_LEN = {
  name: 200,
  email: 320,
  company: 200,
  role: 100,
  state: 100,
  message: 4000,
};

export type DemoRequestInput = {
  name: string;
  email: string;
  company: string;
  role?: string;
  state?: string;
  message?: string;
};

export type DemoRequestResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export async function submitDemoRequestAction(
  input: DemoRequestInput,
): Promise<DemoRequestResult> {
  const name = String(input.name ?? "").trim();
  const email = String(input.email ?? "").trim().toLowerCase();
  const company = String(input.company ?? "").trim();
  const role = String(input.role ?? "").trim() || null;
  const state = String(input.state ?? "").trim() || null;
  const message = String(input.message ?? "").trim() || null;

  if (!name) return { ok: false, error: "Name is required." };
  if (!email || !EMAIL_RE.test(email)) {
    return { ok: false, error: "Please provide a valid email address." };
  }
  if (!company) return { ok: false, error: "Company / dispensary is required." };

  if (
    name.length > MAX_LEN.name ||
    email.length > MAX_LEN.email ||
    company.length > MAX_LEN.company ||
    (role && role.length > MAX_LEN.role) ||
    (state && state.length > MAX_LEN.state) ||
    (message && message.length > MAX_LEN.message)
  ) {
    return { ok: false, error: "One or more fields exceeds maximum length." };
  }

  const h = headers();
  const sourceIp =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? null;

  try {
    const row = await prisma.demoRequest.create({
      data: {
        name,
        email,
        company,
        role,
        state,
        message,
        sourceIp,
      },
      select: { id: true },
    });
    return { ok: true, id: row.id };
  } catch (err) {
    console.error("submitDemoRequestAction failed:", err);
    return { ok: false, error: "Could not save your request. Please email hello@tend-o-matic.com." };
  }
}
