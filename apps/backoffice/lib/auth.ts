import "server-only";
import NextAuth from "next-auth";
import { authOptions } from "@tend-o-matic/auth-runtime";

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
