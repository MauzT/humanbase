export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function parseAllowedEmails(value = process.env.HUMANBASE_ALLOWED_EMAILS) {
  return new Set(
    (value ?? "")
      .split(",")
      .map(normalizeEmail)
      .filter(Boolean),
  );
}

export function isEmailAllowed(
  email: string | null | undefined,
  allowedEmails = parseAllowedEmails(),
) {
  return Boolean(email && allowedEmails.has(normalizeEmail(email)));
}

export function getPrimaryAllowedEmail() {
  return parseAllowedEmails().values().next().value as string | undefined;
}
