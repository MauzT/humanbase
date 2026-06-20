import { expect, test, type Page } from "@playwright/test";

function failOnUnexpectedConsoleErrors(page: Page) {
  const consoleErrors: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });

  return () => {
    expect(consoleErrors, "Unexpected browser console errors").toEqual([]);
  };
}

test("renders the signed-out Humanbase entry page", async ({ page }) => {
  const assertNoConsoleErrors = failOnUnexpectedConsoleErrors(page);

  await page.goto("/");

  await expect(page).toHaveTitle("Humanbase");
  await expect(
    page.getByRole("heading", { level: 1, name: "Humanbase" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Sign in with Google" }),
  ).toBeVisible();
  await expect(
    page.getByText(/Build Error|Unhandled Runtime Error|Application error/i),
  ).toHaveCount(0);

  assertNoConsoleErrors();
});

test("redirects signed-out users away from settings", async ({ page }) => {
  await page.goto("/settings");

  await expect(page).toHaveURL("/");
  await expect(
    page.getByRole("button", { name: "Sign in with Google" }),
  ).toBeVisible();
});

test("rejects an unauthenticated JSON restore request", async ({
  request,
}) => {
  const response = await request.post("/import/json", {
    headers: {
      origin: "http://127.0.0.1:3100",
    },
  });

  expect(response.status()).toBe(401);
  await expect(response.json()).resolves.toEqual({
    error: "Bitte melde dich erneut an.",
  });
});
