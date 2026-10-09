import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/case");
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Reset sample data" }).click();
});

test("estimate approval is exact-version bound and a revision resets approval", async ({ page }) => {
  await page.goto("/case/new");
  await page.getByLabel("Contact name").fill("D4 Customer");
  await page.getByLabel("Mobile number").fill("+98 900 555 0198");
  await page.getByLabel("Vehicle make").fill("Kia");
  await page.getByLabel("Model", { exact: true }).fill("Sportage");
  await page.getByLabel("Year").fill("2022");
  await page.getByLabel("Preferred date").fill(new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10));
  await page.getByLabel("Preferred time").fill("10:30");
  await page.getByLabel("Expert-visit address").fill("Sample Boulevard, Kerman");
  await page.getByLabel("Describe the symptoms").fill("The steering wheel vibrates above 80 km/h.");
  await page.getByRole("button", { name: "Create sample request" }).click();
  await page.getByRole("link", { name: "Follow your repair case" }).click();
  await page.getByRole("link", { name: "Open full case & approvals" }).click();
  await page.getByRole("link", { name: "Staff workspace" }).click();
  await page.getByRole("button", { name: "Confirm requested appointment" }).click();
  await page.getByRole("link", { name: "Customer case" }).click();
  await page.getByRole("button", { name: "Authorize as simulated customer" }).click();
  await page.getByRole("button", { name: "Simulate successful payment" }).click();
  await page.getByRole("link", { name: "Staff workspace" }).click();
  await page.getByLabel("Deeper workshop investigation is needed").uncheck();
  await page.getByLabel("Assessment findings").fill("No deeper workshop investigation is required for this sample.");
  await page.getByRole("button", { name: "Record completed assessment" }).click();
  await page.getByRole("button", { name: "Publish estimate v1" }).click();
  await page.getByRole("link", { name: "Customer case" }).click();
  await expect(page.getByRole("heading", { name: "Estimate v1" })).toBeVisible();
  await page.getByRole("button", { name: "Approve exact estimate" }).click();
  await page.getByRole("button", { name: "Simulate successful repair advance" }).click();
  await expect(page.getByText("Current estimate is approved and fully funded.")).toBeVisible();
  await page.getByRole("link", { name: "Staff workspace" }).click();
  await page.getByRole("button", { name: "Publish estimate v2" }).click();
  await page.getByRole("link", { name: "Customer case" }).click();
  await expect(page.getByRole("heading", { name: "Estimate v2" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Approve exact estimate" })).toBeVisible();
  await expect(page.getByText("Current estimate is approved and fully funded.")).toHaveCount(0);
});
