"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";

import {
  signOutCurrentUser,
  startGoogleContactsImport,
} from "@/app/actions";

const menuItemClassName =
  "flex min-h-12 w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--accent-soft)] focus-visible:bg-[var(--accent-soft)] focus-visible:outline-none disabled:pointer-events-none disabled:opacity-60";

function GearIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M12 15.25A3.25 3.25 0 1 0 12 8.75a3.25 3.25 0 0 0 0 6.5Z" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.86 2.86-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .72 1.7 1.7 0 0 0-.25.88v.1h-4.1V21a1.7 1.7 0 0 0-1.06-1.57 1.7 1.7 0 0 0-1.88.34l-.06.06-2.86-2.86.06-.06A1.7 1.7 0 0 0 4.2 15a1.7 1.7 0 0 0-.72-1 1.7 1.7 0 0 0-.88-.25h-.1v-4.1h.1a1.7 1.7 0 0 0 1.57-1.06 1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.86-2.86.06.06A1.7 1.7 0 0 0 8.6 4.2a1.7 1.7 0 0 0 1-.72 1.7 1.7 0 0 0 .25-.88v-.1h4.1v.1A1.7 1.7 0 0 0 15 4.17a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.86 2.86-.06.06A1.7 1.7 0 0 0 19.4 8.6a1.7 1.7 0 0 0 .72 1 1.7 1.7 0 0 0 .88.25h.1v4.1H21A1.7 1.7 0 0 0 19.4 15Z" />
    </svg>
  );
}

function ContactsIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <path d="M8.5 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.5 19a5 5 0 0 1 10 0M16 8h5M18.5 5.5v5M16 14.5h5M18.5 12v5" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3v12M7.5 10.5 12 15l4.5-4.5M4 20h16" />
    </svg>
  );
}

function SignOutIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 5H5v14h5M14 8l4 4-4 4M8 12h10" />
    </svg>
  );
}

export function AccountMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, startSignOutTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstItemRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    firstItemRef.current?.focus();

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  function handleSignOut() {
    setIsOpen(false);
    startSignOutTransition(async () => {
      await signOutCurrentUser();
      window.location.reload();
    });
  }

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        ref={triggerRef}
        type="button"
        aria-label="Konto und Einstellungen öffnen"
        aria-expanded={isOpen}
        aria-controls="account-menu"
        onClick={() => setIsOpen((current) => !current)}
        className="inline-flex size-11 cursor-pointer items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] transition-colors hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
      >
        <GearIcon />
      </button>

      {isOpen ? (
        <div
          id="account-menu"
          className="absolute top-[calc(100%+0.75rem)] right-0 z-30 w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-[var(--border)] bg-[var(--card)] p-2 shadow-[0_18px_50px_rgba(30,41,37,0.18)]"
        >
          <nav aria-label="Konto und Daten" className="grid gap-1">
            <Link
              ref={firstItemRef}
              href="/settings"
              onClick={() => setIsOpen(false)}
              className={menuItemClassName}
            >
              <GearIcon />
              Einstellungen
            </Link>

            <div className="my-1 border-t border-[var(--border)]" />

            <form
              action={startGoogleContactsImport}
              onSubmit={() => setIsOpen(false)}
            >
              <button type="submit" className={menuItemClassName}>
                <ContactsIcon />
                Google-Kontakte importieren
              </button>
            </form>
            <Link
              href="/export/json"
              onClick={() => setIsOpen(false)}
              className={menuItemClassName}
            >
              <DownloadIcon />
              JSON exportieren
            </Link>

            <div className="my-1 border-t border-[var(--border)]" />

            <button
              type="button"
              disabled={isSigningOut}
              onClick={handleSignOut}
              className={menuItemClassName}
            >
              <SignOutIcon />
              {isSigningOut ? "Wird abgemeldet …" : "Abmelden"}
            </button>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
