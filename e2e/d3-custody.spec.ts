import { expect, test, type Page } from "@playwright/test";

function nextMonday(): string {
  return nextWeekday(1);
}

function nextWeekday(targetDay: number): string {
  const date = new Date();
  const daysAhead = (targetDay - date.getDay() + 7) % 7 || 7;
  date.setDate(date.getDate() + daysAhead);
  return date.toISOString().slice(0, 10);
}

async function createCollection(page: Page, suffix = "2", preferredDate = nextMonday()) {
  await page.goto("/");
  await page.getByLabel("Contact name").fill(`Niloofar Karimi ${suffix}`);
  await page.getByLabel("Mobile number").fill(`+98 900 777 010${suffix}`);
  await page.getByLabel("Vehicle make").fill("Kia");
  await page.getByLabel("Model", { exact: true }).fill("Sportage");
  await page.getByLabel("Year").fill("2022");
  await page.getByLabel("Preferred date").fill(preferredDate);
  await page.getByLabel("Preferred time").fill("10:30");
  await page.getByLabel("Visit type").selectOption("collection-request");
  await page.getByLabel("Requested collection address").fill("Sample Boulevard, Kerman");
  await page.getByLabel("Describe the symptoms").fill("The steering wheel vibrates above 80 km/h.");
  await page.getByRole("button", { name: "Create sample request" }).click();
  await expect(page.getByText("Sample request received")).toBeVisible();
  await page.getByRole("link", { name: "Open customer case" }).click();
}

async function prepareTransport(page: Page) {
  await page.getByRole("link", { name: "Staff workspace" }).click();
  await page.getByRole("button", { name: "Confirm requested appointment" }).click();
  await page.getByRole("link", { name: "Customer case" }).click();
  await page.getByRole("button", { name: "Authorize transport and storage" }).click();
  await page.getByRole("button", { name: "Simulate failed payment" }).click();
  await page.getByRole("button", { name: "Simulate canceled payment" }).click();
  await expect(page.getByText("Simulated canceled")).toBeVisible();
  await page.getByRole("button", { name: "Simulate successful payment" }).click();
  await page.getByRole("link", { name: "Staff workspace" }).click();
  await page.getByLabel("Qualified sample input name").fill("Dr. Nima Farhadi");
  await page.getByLabel("Suitability").selectOption("uncertain");
  await page.getByRole("button", { name: "Record transport decision" }).click();
  await page.getByLabel("Receiver name").fill("Niloofar Karimi");
  await page.getByRole("button", { name: "Assign receiver" }).click();
  await page.getByRole("button", { name: "Record simulated dispatch" }).click();
  await page.getByLabel("Vehicle condition").fill("No new visible damage in this simulated handover.");
  await page.getByRole("button", { name: "Record custody handover" }).click();
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Reset sample data" }).click();
});

test("collection custody uses separate payment, records handover, blocks capacity, and releases it", async ({ page }) => {
  await createCollection(page);
  await expect(page.getByRole("heading", { name: "Transport and storage" })).toBeVisible();
  await prepareTransport(page);

  await page.getByRole("link", { name: "Customer case" }).click();
  await page.getByRole("button", { name: "Authorize as simulated customer" }).click();
  await page.getByRole("button", { name: "Simulate successful payment" }).click();
  await page.getByRole("link", { name: "Staff workspace" }).click();
  await page.getByLabel("Deeper workshop investigation is needed").uncheck();
  await page.getByLabel("Assessment findings").fill("No deeper workshop investigation is required for this sample.");
  await page.getByRole("button", { name: "Record completed assessment" }).click();
  await expect(page.getByText("1 / 1")).toBeVisible();

  await createCollection(page, "3");
  await page.getByRole("link", { name: "Staff workspace" }).click();
  await page.getByRole("button", { name: "Confirm requested appointment" }).click();
  await page.getByRole("link", { name: "Customer case" }).click();
  await page.getByRole("button", { name: "Authorize transport and storage" }).click();
  await page.getByRole("button", { name: "Simulate successful payment" }).click();
  await page.getByRole("link", { name: "Staff workspace" }).click();
  await page.getByLabel("Qualified sample input name").fill("Dr. Nima Farhadi");
  await page.getByRole("button", { name: "Record transport decision" }).click();
  await page.getByRole("button", { name: "Assign receiver" }).click();
  await page.getByRole("button", { name: "Record simulated dispatch" }).click();
  await expect(page.getByText(/capacity is full/i)).toBeVisible();

  await page.getByRole("button", { name: /FXA-1002/ }).click();
  await expect(page.getByRole("button", { name: "Record simulated vehicle return" })).toBeVisible();
  await page.getByRole("button", { name: "Record simulated vehicle return" }).click();
  await expect(page.getByText("0 / 1")).toBeVisible();
});

test("new Thursday collection discloses private parking and Saturday assessment timing", async ({ page }) => {
  const thursday = nextWeekday(4);
  await createCollection(page, "4", thursday);
  await expect(page.getByText("Destination: Designated Fixauto private parking", { exact: true })).toBeVisible();
  await expect(page.getByText(/Private-parking exception: assessment cannot begin before/)).toBeVisible();
});
