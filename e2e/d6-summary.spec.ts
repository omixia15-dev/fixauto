import { expect, test } from "@playwright/test";

test("daily summaries are shared, informational, and persist across refresh", async ({ page }) => {
  await page.goto("/case");
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Reset sample data" }).click();
  await page.goto("/staff?caseId=case-atlas-001");
  await page.getByLabel("Summary situation").fill("Customer received an update about the next diagnostic step.");
  await page.getByLabel("Summary next action").fill("Coordinator will review the next approved step.");
  await page.getByLabel("Summary timing").fill("Next staffed period");
  await page.getByRole("button", { name: "Add simulated summary" }).click();
  await expect(page.getByRole("button", { name: "Confirm requested appointment" })).toBeVisible();

  await page.getByRole("link", { name: "Open customer case" }).click();
  await expect(page.locator("ol.history-list").getByText("Customer received an update about the next diagnostic step.")).toBeVisible();
  await expect(page.getByText("Blocked: staff must confirm the appointment first.")).toBeVisible();
  await page.reload();
  await expect(page.locator("ol.history-list").getByText("Customer received an update about the next diagnostic step.")).toBeVisible();

  await page.goto("/case");
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Reset sample data" }).click();
  await page.goto("/cases/case-atlas-001");
  await expect(page.locator("ol.history-list").getByText("Customer received an update about the next diagnostic step.")).toHaveCount(0);
});

test("daily summary defaults use the Tehran service date at a UTC midnight boundary", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-09-13T21:00:00.000Z") });
  await page.goto("/staff?caseId=case-atlas-001");

  await expect(page.getByLabel("Summary date")).toHaveValue("2026-09-14");
});
