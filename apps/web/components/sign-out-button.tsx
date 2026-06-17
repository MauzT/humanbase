"use client";

import { signOutCurrentUser } from "@/app/actions";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  async function handleClick() {
    await signOutCurrentUser();
    window.location.reload();
  }

  return (
    <Button variant="outline" onClick={handleClick}>
      Abmelden
    </Button>
  );
}
