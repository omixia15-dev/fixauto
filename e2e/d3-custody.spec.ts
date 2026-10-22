import { expect, test, type Page } from "@playwright/test";

function nextMonday(): string {
  return nextWeekday(1);
}

function nextWeekday(targetDay: number): string {
  const date = new Date();
  date.setUTCHours(12, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + 1);
  while (date.getUTCDay() !== targetDay) date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

async function createCollection(page: Page, suffix = "2", preferredDate = nextMonday()) {
  await page.goto("/case/new");
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
  await page.getByRole("button", { name: "Review request" }).click();
  await page.getByRole("button", { name: "Create sample request" }).click();
  await expect(page.getByRole("heading", { name: /^Reference FXA-/ })).toBeVisible();
  const followLink = page.getByRole("link", { name: "Follow your repair case" });
  await expect(followLink).toBeVisible();
  await followLink.click();
  await expect(page).toHaveURL(/\/case\?caseId=/);
  await page.getByRole("link", { name: "Open full case & approvals" }).click();
  await expect(page).toHaveURL(/\/cases\//);
  return new URL(page.url()).pathname.split("/").at(-1)!;
}

async function prepareTransport(page: Page) {
  await page.getByRole("link", { name: "Staff workspace" }).click();
  await page.getByRole("button", { name: "Confirm requested appointment" }).click();
  await page.getByRole("link", { name: "Open customer case" }).click();
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
  await page.goto("/case");
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Reset sample data" }).click();
  await page.evaluate(() => {
    const key = "fixauto.demo.sample-cases";
    const data = JSON.parse(window.localStorage.getItem(key) ?? "null");
    if (!data?.cases) throw new Error("The sample case fixture was not saved.");
    // Existing confirmed visits would occupy the one slot before this test starts.
    for (const sampleCase of data.cases) {
      if (["case-hyundai-002", "case-kia-003", "case-nissan-004"].includes(sampleCase.id)) {
        sampleCase.request.confirmedAppointment = null;
      }
    }
    window.localStorage.setItem(key, JSON.stringify(data));
  });
  await page.reload();
});

test("collection custody uses separate payment, records handover, blocks capacity, and releases it after repair", async ({ page }) => {
  await page.goto("/staff?caseId=case-atlas-001");
  await expect(page.getByText("0 / 1")).toBeVisible();
  const firstCaseId = await createCollection(page);
  const firstCustomerUrl = page.url();
  await expect(page.getByRole("heading", { name: "Transport and custody" })).toBeVisible();
  await prepareTransport(page);

  await page.getByRole("link", { name: "Open customer case" }).click();
  await page.getByRole("button", { name: "Authorize as simulated customer" }).click();
  await page.getByRole("button", { name: "Simulate successful payment" }).click();
  await page.getByRole("link", { name: "Staff workspace" }).click();
  await page.getByLabel("Deeper workshop investigation is needed").uncheck();
  await page.getByLabel("Assessment findings").fill("No deeper workshop investigation is required for this sample.");
  await page.getByRole("button", { name: "Record completed assessment" }).click();
  await expect(page.getByText("1 / 1")).toBeVisible();

  const secondCaseId = await createCollection(page, "3");
  await page.getByRole("link", { name: "Staff workspace" }).click();
  await page.getByRole("button", { name: "Confirm requested appointment" }).click();
  await page.getByRole("link", { name: "Open customer case" }).click();
  await page.getByRole("button", { name: "Authorize transport and storage" }).click();
  await page.getByRole("button", { name: "Simulate successful payment" }).click();
  await page.getByRole("link", { name: "Staff workspace" }).click();
  await page.getByLabel("Qualified sample input name").fill("Dr. Nima Farhadi");
  await page.getByRole("button", { name: "Record transport decision" }).click();
  await page.getByRole("button", { name: "Assign receiver" }).click();
  await page.getByRole("button", { name: "Record simulated dispatch" }).click();
  await expect(page.getByText(/capacity is full/i)).toBeVisible();
  await expect(page.getByText("1 / 1")).toBeVisible();

  await expect(page.getByLabel("Select a case")).toHaveValue(secondCaseId);
  await expect(page.getByRole("button", { name: "Record vehicle return" })).toHaveCount(0);
  await page.getByLabel("Select a case").selectOption(firstCaseId);
  await expect(page.getByRole("button", { name: "Record vehicle return" })).toHaveCount(0);
  await page.getByRole("button", { name: "Publish estimate v1" }).click();
  await page.goto(firstCustomerUrl);
  await page.getByRole("button", { name: "Approve exact estimate" }).click();
  await page.getByRole("button", { name: "Simulate successful repair advance" }).click();
  await page.getByRole("link", { name: "Staff workspace" }).click();
  await page.getByLabel("Select a case").selectOption(firstCaseId);
  await page.getByRole("button", { name: "Record performed work" }).click();
  await page.getByLabel("Result").selectOption("passed");
  await page.getByRole("button", { name: "Record quality check" }).click();
  await page.getByRole("button", { name: "Record illustrative settlement" }).click();
  await page.getByRole("button", { name: "Record vehicle return" }).click();
  await expect(page.getByText("0 / 1")).toBeVisible();
});

test("new Thursday collection discloses private parking and Saturday assessment timing", async ({ page }) => {
  const thursday = nextWeekday(4);
  await createCollection(page, "4", thursday);
  await expect(page.getByRole("heading", { name: "Transport and custody" }).locator("xpath=ancestor::section[1]").getByText("Designated Fixauto private parking", { exact: true })).toBeVisible();
  await expect(page.getByText(/Private-parking exception: assessment cannot begin before/)).toBeVisible();
});
