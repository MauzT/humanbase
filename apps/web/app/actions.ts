"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAllowedHumanbaseUser } from "@/lib/auth/supabase-user";
import {
  createNoteForUser,
  deleteNoteForUser,
  updateNoteForUser,
  type CreateNoteResult,
  type DeleteNoteResult,
  type UpdateNoteResult,
} from "@/lib/note-service";
import {
  createNoteTemplateForUser,
  deleteNoteTemplateForUser,
  updateNoteTemplateForUser,
  type DeleteNoteTemplateResult,
  type SaveNoteTemplateResult,
} from "@/lib/note-template-service";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  createTagForUser,
  deleteTagForUser,
  type CreateTagResult,
  type DeleteTagResult,
} from "@/lib/tag-service";
import type { Note } from "@/types/humanbase";

type CreateNoteInput = Pick<
  Note,
  "title" | "content" | "date" | "contactIds" | "tagIds"
>;

type UpdateNoteInput = CreateNoteInput & Pick<Note, "id">;

export async function signInWithGoogle() {
  const requestHeaders = await headers();
  const origin =
    process.env.NEXT_PUBLIC_APP_URL ?? requestHeaders.get("origin");

  if (!origin) {
    redirect("/?auth_error=missing_origin");
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error || !data.url) {
    redirect("/?auth_error=oauth_start_failed");
  }

  redirect(data.url);
}

export async function startGoogleContactsImport() {
  try {
    await requireAllowedHumanbaseUser();
  } catch {
    redirect("/settings?contacts_error=authentication_required");
  }

  const requestHeaders = await headers();
  const origin =
    process.env.NEXT_PUBLIC_APP_URL ?? requestHeaders.get("origin");

  if (!origin) {
    redirect("/settings?contacts_error=missing_origin");
  }

  const importPath = "/contacts/import";
  const callbackUrl = new URL("/auth/callback", origin);
  callbackUrl.searchParams.set("next", importPath);

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl.toString(),
      scopes: "https://www.googleapis.com/auth/contacts.readonly",
      queryParams: {
        prompt: "consent",
        include_granted_scopes: "true",
      },
    },
  });

  if (error || !data.url) {
    redirect("/settings?contacts_error=oauth_start_failed");
  }

  redirect(data.url);
}

export async function signOutCurrentUser() {
  const supabase = await createSupabaseServerClient();

  await supabase.auth.signOut();
  revalidatePath("/");
}

export async function createNoteForCurrentUser(input: CreateNoteInput) {
  let user;

  try {
    user = await requireAllowedHumanbaseUser();
  } catch {
    return {
      ok: false,
      error: "Bitte melde dich erneut an.",
    } satisfies CreateNoteResult;
  }

  const result = await createNoteForUser(user.id, input);

  revalidatePath("/");

  return result;
}

export async function updateNoteForCurrentUser(input: UpdateNoteInput) {
  let user;

  try {
    user = await requireAllowedHumanbaseUser();
  } catch {
    return {
      ok: false,
      error: "Bitte melde dich erneut an.",
    } satisfies UpdateNoteResult;
  }

  const result = await updateNoteForUser(user.id, input);

  revalidatePath("/");

  return result;
}

export async function deleteNoteForCurrentUser(noteId: string) {
  let user;

  try {
    user = await requireAllowedHumanbaseUser();
  } catch {
    return {
      ok: false,
      error: "Bitte melde dich erneut an.",
    } satisfies DeleteNoteResult;
  }

  const result = await deleteNoteForUser(user.id, noteId);

  revalidatePath("/");

  return result;
}

export async function createNoteTemplateForCurrentUser(input: {
  name: string;
  questions: string[];
}) {
  let user;

  try {
    user = await requireAllowedHumanbaseUser();
  } catch {
    return {
      ok: false,
      error: "Bitte melde dich erneut an.",
    } satisfies SaveNoteTemplateResult;
  }

  const result = await createNoteTemplateForUser(user.id, input);
  revalidatePath("/");

  return result;
}

export async function updateNoteTemplateForCurrentUser(input: {
  id: string;
  name: string;
  questions: string[];
}) {
  let user;

  try {
    user = await requireAllowedHumanbaseUser();
  } catch {
    return {
      ok: false,
      error: "Bitte melde dich erneut an.",
    } satisfies SaveNoteTemplateResult;
  }

  const result = await updateNoteTemplateForUser(user.id, input);
  revalidatePath("/");

  return result;
}

export async function deleteNoteTemplateForCurrentUser(templateId: string) {
  let user;

  try {
    user = await requireAllowedHumanbaseUser();
  } catch {
    return {
      ok: false,
      error: "Bitte melde dich erneut an.",
    } satisfies DeleteNoteTemplateResult;
  }

  const result = await deleteNoteTemplateForUser(user.id, templateId);
  revalidatePath("/");

  return result;
}

export async function createTagForCurrentUser(input: {
  name: string;
  color?: string;
}) {
  let user;

  try {
    user = await requireAllowedHumanbaseUser();
  } catch {
    return {
      ok: false,
      error: "Bitte melde dich erneut an.",
    } satisfies CreateTagResult;
  }

  const result = await createTagForUser(user.id, input);

  revalidatePath("/");

  return result;
}

export async function deleteTagForCurrentUser(tagId: string) {
  let user;

  try {
    user = await requireAllowedHumanbaseUser();
  } catch {
    return {
      ok: false,
      error: "Bitte melde dich erneut an.",
    } satisfies DeleteTagResult;
  }

  const result = await deleteTagForUser(user.id, tagId);

  revalidatePath("/");

  return result;
}
