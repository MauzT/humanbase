"use client";

import { signOutCurrentUser } from "@/app/actions";
import { Button } from "@/components/ui/button";

type SignOutButtonProps = {
  className?: string;
};

export function SignOutButton({ className }: SignOutButtonProps = {}) {
  async function handleClick() {
    await signOutCurrentUser();
    window.location.reload();
  }

  return (
    <Button className={className} variant="outline" onClick={handleClick}>
      Abmelden
    </Button>
  );
}
