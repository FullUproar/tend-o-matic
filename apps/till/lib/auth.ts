// Per-app NextAuth instance. Imports the shared authOptions from
// @tend-o-matic/auth-runtime and re-exports the auth-helper, handlers,
// and signIn/signOut bindings.
import "server-only";
import NextAuth from "next-auth";
import { authOptions } from "@tend-o-matic/auth-runtime";

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
