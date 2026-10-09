import { expect, test } from "@playwright/test";

const demoStorageKey = "fixauto.demo.sample-cases";

test("seeded Kia dossier shows its exact estimate and preserves approval and payment history", async ({ page }) => {
  await page.goto("/cases/case-kia-003");

  const estimate = page.getByRole("heading", { name: "Estimate v1" }).locator("xpath=ancestor::article[1]");
  const estimateTable = estimate.getByRole("table");
  await expect(estimateTable).toContainText("$200.00");
  await expect(estimateTable).toContainText("$150.00");
  await expect(estimateTable).toContainText("$25.00");
  await expect(estimateTable).toContainText("$375.00");
  await expect(estimateTable).toContainText("Front brake pad set");
  await expect(estimateTable).toContainText("Illustrative sample brand");
  await expect(estimateTable).toContainText("new");
  await expect(estimateTable).toContainText("Illustrative sample term");
  await expect(estimate.getByRole("button", { name: "Approve exact estimate" })).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Record 24-hour call reminder" })).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => {
    const data = JSON.parse(window.localStorage.getItem("fixauto.demo.sample-cases") ?? "null");
    return data?.cases.find((item: { id: string }) => item.id === "case-kia-003")?.estimates[0]?.totalCents;
  })).toBe(37500);

  await estimate.getByRole("button", { name: "Approve exact estimate" }).click();
  await page.getByRole("button", { name: "Simulate failed advance" }).click();
  await expect(page.getByText("Simulated failed").first()).toBeVisible();
  await page.getByRole("button", { name: "Simulate canceled advance" }).click();
  await expect(page.getByText("Simulated canceled").first()).toBeVisible();
  await page.getByRole("button", { name: "Simulate successful repair advance" }).click();
  await expect(page.getByText("Current estimate is approved and fully funded.")).toBeVisible();

  await page.reload();
  await expect(page.getByText("Simulated failed").first()).toBeVisible();
  await expect(page.getByText("Simulated canceled").first()).toBeVisible();
  await expect(page.getByText("Simulated success").first()).toBeVisible();
  await expect(page.getByText("Current estimate is approved and fully funded.")).toBeVisible();
});

test("missing customer case offers a route back to the case list", async ({ page }) => {
  await page.goto("/cases/missing-sample-case");

  await expect(page.getByRole("heading", { name: "Case not found" })).toBeVisible();
  await page.getByRole("link", { name: "Return to your cases" }).click();
  await expect(page).toHaveURL(/\/case$/);
  await expect(page.getByRole("heading", { name: "Your repair cases" })).toBeVisible();
});

test("declining a sample estimate keeps repair paused after refresh", async ({ page }) => {
  await page.goto("/cases/case-kia-003");

  const estimate = page.getByRole("heading", { name: "Estimate v1" }).locator("xpath=ancestor::article[1]");
  await estimate.getByRole("button", { name: "Decline estimate" }).click();
  await expect(estimate).toContainText("Decision: declined by Simulated customer");
  await expect(estimate).toContainText("Declined estimate cannot authorize repair");
  await expect(estimate.getByRole("button", { name: "Approve exact estimate" })).toHaveCount(0);

  await page.reload();
  const savedEstimate = page.getByRole("heading", { name: "Estimate v1" }).locator("xpath=ancestor::article[1]");
  await expect(savedEstimate).toContainText("Decision: declined by Simulated customer");
  await expect(savedEstimate).toContainText("Declined estimate cannot authorize repair");
  await expect(savedEstimate.getByRole("button", { name: "Approve exact estimate" })).toHaveCount(0);
});

test("a temporary browser storage failure can recover from the retry control", async ({ page }) => {
  await page.addInitScript((key) => {
    const getItem = Storage.prototype.getItem;
    let failOnce = true;
    Storage.prototype.getItem = function (name) {
      if (name === key && failOnce) {
        failOnce = false;
        throw new DOMException("Storage is temporarily blocked", "SecurityError");
      }
      return getItem.call(this, name);
    };
  }, demoStorageKey);

  await page.goto("/cases/case-kia-003");
  await expect(page.getByRole("alert", { name: "Saved cases are unavailable" })).toContainText("Browser storage is unavailable");
  const navigation = page.getByRole("navigation", { name: "Main navigation" });
  await expect(navigation).toBeVisible();
  await expect(navigation.getByRole("link", { name: "Users", exact: true })).toHaveAttribute("href", "/cases/case-kia-003");
  await expect(navigation.getByRole("link", { name: "Staffs", exact: true })).toHaveAttribute("href", "/staff?caseId=case-kia-003");
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.getByText("FXA-1003").first()).toBeVisible();
});

test("corrupt saved demo data is replaced with the seeded cases", async ({ page }) => {
  await page.addInitScript((key) => window.localStorage.setItem(key, "{broken json"), demoStorageKey);
  await page.goto("/case");

  await expect(page.getByText("FXA-1001").first()).toBeVisible();
  await expect.poll(() => page.evaluate((key) => {
    const data = JSON.parse(window.localStorage.getItem(key) ?? "null");
    return data?.cases.some((item: { id: string }) => item.id === "case-kia-003") ?? false;
  }, demoStorageKey)).toBe(true);
});
