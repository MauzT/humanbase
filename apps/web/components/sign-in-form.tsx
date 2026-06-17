import { signInWithGoogle } from "@/app/actions";
import { Button } from "@/components/ui/button";

export function SignInForm() {
  return (
    <form
      className="grid gap-4 rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm"
      action={signInWithGoogle}
    >
      <Button type="submit">
        Sign in with Google
      </Button>
    </form>
  );
}
