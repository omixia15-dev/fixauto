import { expect, test, type Page } from "@playwright/test";

async function fillRequest(page: Page, suffix = "2") {
  const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  await page.getByLabel("Contact name").fill(`Sara Ahmadi ${suffix}`);
  await page.getByLabel("Mobile number").fill(`+98 900 555 010${suffix}`);
  await page.getByLabel("Vehicle make").fill("Kia");
  await page.getByLabel("Model", { exact: true }).fill("Sportage");
  await page.getByLabel("Year").fill("2022");
  await page.getByLabel("Preferred date").fill(futureDate);
  await page.getByLabel("Preferred time").fill("10:30");
  await page.getByLabel("Describe the symptoms").fill("The steering wheel vibrates above 80 km/h.");
  await page.getByLabel("Expert-visit address").fill("Sample Boulevard, Kerman");
}

async function createRequest(page: Page, suffix = "2") {
  await page.goto("/case/new");
  await fillRequest(page, suffix);
  await page.getByRole("button", { name: "Create sample request" }).click();
  await expect(page.getByRole("link", { name: "Follow your repair case" })).toBeVisible();
  await page.getByRole("link", { name: "Follow your repair case" }).click();
  await page.getByRole("link", { name: "Open full case & approvals" }).click();
}

async function confirmAuthorizeAndPay(page: Page) {
  await page.getByRole("link", { name: "Staff workspace" }).click();
  await page.getByRole("button", { name: "Confirm requested appointment" }).click();
  await page.getByRole("link", { name: "Customer case" }).click();
  await expect(page.getByText("Expert visit to review reported symptoms and recommend the next diagnostic step.")).toBeVisible();
  await expect(page.getByText("$45.00 USD").first()).toBeVisible();
  await page.getByRole("button", { name: "Authorize as simulated customer" }).click();
  await page.getByRole("button", { name: "Simulate successful payment" }).click();
}

test.beforeEach(async ({ page }) => {
  await page.goto("/case");
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Reset sample data" }).click();
});

test("invalid request keeps values and creates no case", async ({ page }) => {
  await page.goto("/case/new");
  await page.getByLabel("Vehicle make").fill("Kia");
  await page.getByLabel("Visit type").selectOption("collection-request");
  await expect(page.getByLabel("Requested collection address")).toBeVisible();
  await page.getByRole("button", { name: "Create sample request" }).click();
  await expect(page.getByText("Enter the customer name.")).toBeVisible();
  await expect(page.getByText("Enter the requested collection address.")).toBeVisible();
  await expect(page.getByLabel("Vehicle make")).toHaveValue("Kia");
  await expect(page.getByLabel("Visit type")).toHaveValue("collection-request");
  await expect(page.getByText("FXA-1006")).toHaveCount(0);
});

test("assessment requires confirmation, consent, and successful payment before decline", async ({ page }) => {
  await createRequest(page);
  await expect(page.getByText("FXA-1006").first()).toBeVisible();
  await expect(page.getByText("Staff must confirm the appointment first.")).toBeVisible();

  await page.getByRole("link", { name: "Staff workspace" }).click();
  await expect(page.getByText("FXA-1006").first()).toBeVisible();
  await page.getByRole("button", { name: "Confirm requested appointment" }).click();
  await page.getByRole("link", { name: "Customer case" }).click();
  await page.getByRole("button", { name: "Authorize as simulated customer" }).click();
  await page.getByRole("button", { name: "Simulate failed payment" }).click();
  await expect(page.getByText("Simulated failed")).toBeVisible();
  await page.getByRole("button", { name: "Simulate canceled payment" }).click();
  await expect(page.getByText("Simulated canceled")).toBeVisible();

  await page.getByRole("link", { name: "Staff workspace" }).click();
  await expect(page.getByText("Blocked: assessment payment has not succeeded.")).toBeVisible();
  await page.getByRole("link", { name: "Customer case" }).click();
  await page.getByRole("button", { name: "Simulate successful payment" }).click();
  await page.getByRole("link", { name: "Staff workspace" }).click();
  await page.getByLabel("Deeper workshop investigation is needed").uncheck();
  await page.getByLabel("Assessment findings").fill("No deeper workshop investigation is required for this sample.");
  await page.getByRole("button", { name: "Record completed assessment" }).click();

  await page.getByRole("link", { name: "Customer case" }).click();
  await expect(page.getByText("Fee earned")).toBeVisible();
  await page.getByRole("button", { name: "Decline further service" }).click();
  await expect(page.getByText(/Further service declined/).first()).toBeVisible();
  await expect(page.getByText("Simulated failed")).toBeVisible();
  await expect(page.getByText("Simulated canceled")).toBeVisible();
  await expect(page.getByText("Simulated success")).toBeVisible();
  await page.reload();
  await expect(page.getByText(/Further service declined/).first()).toBeVisible();
  await expect(page.getByText("Fee earned")).toBeVisible();
});

test("deeper investigation has authorization and payment separate from assessment", async ({ page }) => {
  await createRequest(page, "3");
  await confirmAuthorizeAndPay(page);
  await page.getByRole("link", { name: "Staff workspace" }).click();
  await page.getByRole("button", { name: "Record completed assessment" }).click();
  await page.getByRole("link", { name: "Customer case" }).click();
  const investigation = page.getByRole("heading", { name: "Separate investigation" }).locator("xpath=ancestor::section[1]");
  await expect(investigation.getByText("$85.00 USD", { exact: true })).toBeVisible();
  await expect(investigation).toContainText("Illustrative fee · separate from the initial assessment");
  await page.getByRole("button", { name: "Authorize separate investigation" }).click();
  await expect(page.getByText("Initial assessment payment cannot fund this separate investigation.")).toBeVisible();
  await page.getByRole("button", { name: "Simulate failed payment" }).click();
  await expect(page.getByText("Simulated failed")).toBeVisible();
});
