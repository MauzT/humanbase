import "server-only";

import {
  isEmailAllowed,
  normalizeEmail,
  parseAllowedEmails,
} from "@/lib/auth/allowlist";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AuthenticatedHumanbaseUser = {
  id: string;
  email: string;
  supabaseAuthUserId: string;
};

export type AuthState =
  | { status: "unauthenticated" }
  | { status: "denied"; email: string | null }
  | { status: "allowed"; user: AuthenticatedHumanbaseUser };

type SupabaseAuthIdentity = {
  id: string;
  email?: string | null;
};

export async function getOrCreateHumanbaseUserForSupabaseUser(
  supabaseUser: SupabaseAuthIdentity,
  allowedEmails = parseAllowedEmails(),
): Promise<AuthState> {
  const email = supabaseUser.email ? normalizeEmail(supabaseUser.email) : null;

  if (!email || !isEmailAllowed(email, allowedEmails)) {
    return { status: "denied", email };
  }

  const userBySupabaseId = await prisma.user.findUnique({
    where: { supabaseAuthUserId: supabaseUser.id },
  });

  if (userBySupabaseId) {
    return {
      status: "allowed",
      user: {
        id: userBySupabaseId.id,
        email,
        supabaseAuthUserId: supabaseUser.id,
      },
    };
  }

  const userByEmail = await prisma.user.findUnique({
    where: { email },
  });

  if (userByEmail) {
    if (
      userByEmail.supabaseAuthUserId &&
      userByEmail.supabaseAuthUserId !== supabaseUser.id
    ) {
      return { status: "denied", email };
    }

    const linkedUser = await prisma.user.update({
      where: { id: userByEmail.id },
      data: { supabaseAuthUserId: supabaseUser.id, email },
    });

    return {
      status: "allowed",
      user: {
        id: linkedUser.id,
        email,
        supabaseAuthUserId: supabaseUser.id,
      },
    };
  }

  const createdUser = await prisma.user.create({
    data: {
      email,
      supabaseAuthUserId: supabaseUser.id,
    },
  });

  return {
    status: "allowed",
    user: {
      id: createdUser.id,
      email,
      supabaseAuthUserId: supabaseUser.id,
    },
  };
}

export async function getCurrentAuthState(): Promise<AuthState> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    return { status: "unauthenticated" };
  }

  return getOrCreateHumanbaseUserForSupabaseUser({
    id: data.claims.sub,
    email: data.claims.email,
  });
}

export async function requireAllowedHumanbaseUser() {
  const authState = await getCurrentAuthState();

  if (authState.status !== "allowed") {
    throw new Error("Allowed Supabase authentication is required.");
  }

  return authState.user;
}
