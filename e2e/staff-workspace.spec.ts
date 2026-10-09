import { expect, test } from "@playwright/test";

test("staff can deep-link to a case, change selection, and open its customer view", async ({ page }) => {
  await page.goto("/staff?caseId=case-hyundai-002");
  await expect(page.getByRole("heading", { level: 1, name: "Staff workspace" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: /FXA-1002/ })).toBeVisible();
  await expect(page.getByLabel("Select a case")).toHaveValue("case-hyundai-002");

  await page.getByLabel("Select a case").selectOption("case-atlas-001");
  await expect(page.getByRole("heading", { level: 2, name: /FXA-1001/ })).toBeVisible();
  await expect(page.getByRole("link", { name: "Open customer case" })).toHaveAttribute("href", "/cases/case-atlas-001");
  await page.reload();
  await expect(page.getByLabel("Select a case")).toHaveValue("case-atlas-001");
});

test("appointment confirmation is shared and assessment stays blocked without successful consent and payment", async ({ page }) => {
  await page.goto("/cases/case-atlas-001");
  await expect(page.getByText("Blocked: staff must confirm the appointment first.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Authorize as simulated customer" })).toHaveCount(0);

  await page.goto("/staff?caseId=case-atlas-001");
  await page.getByRole("button", { name: "Confirm requested appointment" }).click();
  await page.getByRole("link", { name: "Open customer case" }).click();
  await expect(page).toHaveURL(/\/cases\/case-atlas-001$/);
  await expect(page).toHaveURL(/\/cases\/case-atlas-001$/);
  await expect(page.getByText("Appointment confirmed", { exact: true }).first()).toBeVisible();
  await page.reload();
  await expect(page.getByText("Appointment confirmed", { exact: true }).first()).toBeVisible();

  await page.getByRole("button", { name: "Authorize as simulated customer" }).click();
  await page.getByRole("button", { name: "Simulate failed payment" }).click();
  await page.goto("/staff?caseId=case-atlas-001");
  await expect(page.getByText("Blocked: assessment payment has not succeeded.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Record completed assessment" })).toHaveCount(0);
});

test("a staff daily summary appears in the customer case and survives refresh", async ({ page }) => {
  await page.goto("/staff?caseId=case-atlas-001");
  await page.getByLabel("Summary situation").fill("The coordinator is reviewing the requested expert visit.");
  await page.getByLabel("Summary next action").fill("Coordinator will update the customer next staffed period.");
  await page.getByLabel("Summary timing").fill("Next staffed period");

  await page.getByRole("button", { name: "Add simulated summary" }).click();

  await page.getByRole("link", { name: "Open customer case" }).click();
  await expect(page).toHaveURL(/\/cases\/case-atlas-001$/);
  await expect(page.locator("ol.history-list").getByText("The coordinator is reviewing the requested expert visit.")).toBeVisible();
  await page.reload();
  await expect(page.locator("ol.history-list").getByText("The coordinator is reviewing the requested expert visit.")).toBeVisible();
});

test("staff sections fit target widths and support keyboard navigation", async ({ page }) => {
  await page.goto("/staff?caseId=case-atlas-001");
  const sections = page.getByRole("navigation", { name: "Staff case sections" });
  await expect(sections.getByRole("link", { name: "Overview" })).toHaveAttribute("href", "#staff-overview");
  await expect(sections.getByRole("link", { name: "Workflow" })).toHaveAttribute("href", "#staff-workflow");
  await expect(sections.getByRole("link", { name: "Updates" })).toHaveAttribute("href", "#staff-updates");
  await expect(sections.getByRole("link", { name: "Records" })).toHaveAttribute("href", "#staff-records");

  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(hasHorizontalOverflow, `horizontal overflow at ${width}px`).toBe(false);

    if (width <= 390) {
      const sectionOrder = await page.evaluate(() => ({
        overview: document.querySelector("#staff-overview")?.getBoundingClientRect().top,
        workflow: document.querySelector("#staff-workflow")?.getBoundingClientRect().top,
      }));
      expect(sectionOrder.workflow).toBeLessThan(sectionOrder.overview!);
    }
  }

  const overviewLink = sections.getByRole("link", { name: "Overview" });
  const workflowLink = sections.getByRole("link", { name: "Workflow" });
  await overviewLink.focus();
  await page.keyboard.press("Tab");
  await expect(workflowLink).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#staff-workflow$/);
  await expect(page.locator("#staff-workflow")).toBeInViewport();
});

test("temporary browser storage failure can be retried", async ({ page }) => {
  await page.addInitScript(() => {
    const getItem = Storage.prototype.getItem;
    let failFirstDemoRead = true;
    Storage.prototype.getItem = function (key) {
      if (key === "fixauto.demo.sample-cases" && failFirstDemoRead) {
        failFirstDemoRead = false;
        throw new DOMException("Storage temporarily unavailable", "SecurityError");
      }
      return getItem.call(this, key);
    };
  });

  await page.goto("/staff?caseId=case-atlas-001");
  await expect(page.getByRole("alert").filter({ hasText: "Saved cases are unavailable" })).toContainText("Browser storage is unavailable");
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Staff workspace" })).toBeVisible();
});





test("missing staff case recovers to a saved case without losing data", async ({ page }) => {
  await page.goto("/staff?caseId=missing-case");
  await expect(page.getByRole("heading", { name: "Case not found" })).toBeVisible();
  await page.getByRole("button", { name: "Return to staff queue" }).click();
  await expect(page).toHaveURL(/caseId=case-atlas-001$/);
  await expect(page.getByRole("heading", { level: 2, name: "FXA-1001" })).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Select a case")).toHaveValue("case-atlas-001");
});
