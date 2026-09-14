import { expect, test } from "@playwright/test";

test("daily summaries are shared, simulated, and non-authorizing", async ({ page }) => {
  await page.goto("/");
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Reset sample data" }).click();
  await page.getByRole("link", { name: "Staff workspace" }).click();
  await page.getByLabel("Summary situation").fill("Vehicle remains safely held on a non-working day.");
  await page.getByLabel("Summary next action").fill("Coordinator will update the customer next staffed period.");
  await page.getByLabel("Summary timing").fill("Next staffed period");
  await page.getByLabel("Non-working day while vehicle is held").check();
  await page.getByRole("button", { name: "Add simulated summary" }).click();
  await page.getByRole("link", { name: "Customer case" }).click();
  await expect(page.locator("ol.history-list").getByText("Vehicle remains safely held on a non-working day.")).toBeVisible();
  await expect(page.locator("ol.history-list li").filter({ hasText: "non-working day" })).toBeVisible();
  await page.reload();
  await expect(page.locator("ol.history-list").getByText("Vehicle remains safely held on a non-working day.")).toBeVisible();
  await page.getByRole("link", { name: "Staff workspace" }).click();
  await page.getByRole("button", { name: "Reset sample data" }).click();
  await page.goto("/");
  await page.getByRole("link", { name: "Customer case" }).click();
  await expect(page.locator("ol.history-list").getByText("Vehicle remains safely held on a non-working day.")).toHaveCount(0);
});

test("daily summary defaults use the Tehran service date at a UTC midnight boundary", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-09-13T21:00:00.000Z") });
  await page.goto("/");
  await page.getByRole("link", { name: "Staff workspace" }).click();

  await expect(page.getByLabel("Summary date")).toHaveValue("2026-09-14");
});
