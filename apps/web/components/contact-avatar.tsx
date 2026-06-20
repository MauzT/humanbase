"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import type { Contact } from "@/types/humanbase";

type ContactAvatarProps = {
  contact: Pick<Contact, "displayName" | "avatarUrl">;
  className?: string;
};

export function ContactAvatar({
  contact,
  className,
}: ContactAvatarProps) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  const initial =
    contact.displayName.trim().slice(0, 1).toLocaleUpperCase("de") || "?";

  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--accent-soft)] text-xs font-bold text-[var(--accent)] ring-1 ring-[var(--border)]",
        className,
      )}
      aria-hidden="true"
    >
      {contact.avatarUrl && contact.avatarUrl !== failedUrl ? (
        // Google People photo URLs are remote and already sized by this wrapper.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={contact.avatarUrl}
          alt=""
          className="size-full object-cover"
          referrerPolicy="no-referrer"
          onError={() => setFailedUrl(contact.avatarUrl ?? null)}
        />
      ) : (
        initial
      )}
    </span>
  );
}
