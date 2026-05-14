// Shared NextAuth v5 (Auth.js) configuration. Each app (till,
// backoffice, portal) imports authOptions from here and wires its own
// route handler at /app/api/auth/[...nextauth]/route.ts.
//
// Auth strategy notes:
// - Credentials provider only in M4.1. Google OAuth lands as a follow-
//   up when the user has the GCP console app configured.
// - JWT sessions (no DB session table) — session callback enriches
//   the token with tenantId / role / locationId on first sign-in.
// - Token TTL: 8 hours (one budtender shift). Hardcoded; expose as a
//   per-tenant feature flag once tenants need different lengths.
// - On every sign-in the user row is looked up by (email,
//   passwordHash) using bcrypt compare. Rate-limiting + lockout live
//   one layer up (M4.3 device registration + pos_access_code_attempts).

import { compare } from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";

const prisma = new PrismaClient();

export type UserRole = "BUDTENDER" | "MANAGER" | "ADMIN";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      tenantId: string;
      role: UserRole;
      locationId: string | null;
    };
  }
  interface User {
    tenantId: string;
    role: UserRole;
    locationId: string | null;
  }
}

// (JWT module-augmentation skipped: NextAuth v5 beta doesn't always
// expose `@auth/core/jwt` or `next-auth/jwt` consistently across
// platforms. The session callback reads token fields via narrowed
// `as`-cast accessors, which is the documented escape hatch.)

export const authOptions: NextAuthConfig = {
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  pages: { signIn: "/sign-in" },
  providers: [
    Credentials({
      name: "Email + password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (raw) => {
        const email = typeof raw?.email === "string" ? raw.email : null;
        const password = typeof raw?.password === "string" ? raw.password : null;
        if (!email || !password) return null;

        const user = await prisma.user.findFirst({
          where: { email, isActive: true },
          select: {
            id: true,
            email: true,
            name: true,
            passwordHash: true,
            role: true,
            tenantId: true,
          },
        });
        if (!user) return null;

        // bcrypt compare. The pre-M4 seed wrote a sentinel string that
        // bcrypt will reject; an updated seed (run via
        // `pnpm --filter @tend-o-matic/db seed`) replaces it with a
        // real hash of the configured demo password.
        const ok = await compare(password, user.passwordHash);
        if (!ok) return null;

        // Pick a default location for this user (first available row in
        // the user's tenant). Per-device location resolution lands with
        // M4.3 device registration.
        const location = await prisma.location.findFirst({
          where: { tenantId: user.tenantId },
          orderBy: { createdAt: "asc" },
          select: { id: true },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          tenantId: user.tenantId,
          role: user.role,
          locationId: location?.id ?? null,
        };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        // First login: copy claims from the authorize() result into the
        // JWT. Subsequent requests re-use the JWT and never re-query.
        token.userId = user.id ?? "";
        token.tenantId = user.tenantId;
        token.role = user.role;
        token.locationId = user.locationId;
      }
      return token;
    },
    session: async ({ session, token }) => {
      const userId = (token.userId as string | undefined) ?? "";
      const tenantId = (token.tenantId as string | undefined) ?? "";
      const role = (token.role as UserRole | undefined) ?? "BUDTENDER";
      const locationId = (token.locationId as string | null | undefined) ?? null;
      session.user = {
        ...session.user,
        id: userId,
        email: session.user?.email ?? "",
        tenantId,
        role,
        locationId,
      };
      return session;
    },
  },
};
