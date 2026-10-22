import { expect, test, type Page } from "@playwright/test";

const storageKey = "fixauto.demo.sample-cases";

async function caseCount(page: Page) {
  return page.evaluate((key) => JSON.parse(localStorage.getItem(key)!).cases.length, storageKey);
}

async function fillVisit(page: Page) {
  const date = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
  await page.getByLabel("Vehicle make").fill("Kia");
  await page.getByLabel("Model", { exact: true }).fill("Sportage");
  await page.getByLabel("Year", { exact: true }).fill("2022");
  await page.getByLabel("Describe the symptoms").fill("The steering wheel vibrates when I brake.");
  await page.getByLabel("Preferred date").fill(date);
  await page.getByLabel("Preferred time").fill("10:30");
  await page.getByLabel("Expert-visit address").fill("Sample Office, Kerman");
  await page.getByLabel("Contact name").fill("Sara Sample");
  await page.getByLabel("Mobile number").fill("+98 900 555 0123");
}

test.beforeEach(async ({ page }) => {
  await page.goto("/case/new");
  await expect(page.getByRole("button", { name: "Review request" })).toBeEnabled();
});

test("invalid request preserves input and creates no case", async ({ page }) => {
  const before = await caseCount(page);
  await page.getByLabel("Vehicle make").fill("Kia");
  await page.getByRole("button", { name: "Review request" }).click();
  await expect(page.getByRole("heading", { name: "There is a problem" })).toBeVisible();
  await expect(page.getByLabel("Vehicle make")).toHaveValue("Kia");
  await expect(page.getByLabel("Model", { exact: true })).toBeFocused();
  await expect(page.getByLabel("Contact name")).toHaveAttribute("aria-invalid", "true");
  expect(await caseCount(page)).toBe(before);
});

test("review is editable and only final action creates a pending persisted case", async ({ page }) => {
  const before = await caseCount(page);
  await fillVisit(page);
  await page.getByRole("button", { name: "Review request" }).click();
  await expect(page.getByRole("heading", { name: "Review your request" })).toBeFocused();
  expect(await caseCount(page)).toBe(before);
  await page.getByRole("button", { name: "Edit Your car" }).click();
  await expect(page.getByLabel("Vehicle make")).toBeFocused();
  await expect(page.getByLabel("Contact name")).toHaveValue("Sara Sample");
  await page.getByLabel("Model", { exact: true }).fill("Sportage Hybrid");
  await page.getByRole("button", { name: "Review request" }).click();
  await expect(page.getByRole("region", { name: "Your car" })).toContainText("Sportage Hybrid");
  await page.getByRole("button", { name: "Create sample request" }).click();
  await expect(page.getByRole("heading", { name: /^Reference FXA-/ })).toBeVisible();
  expect(await caseCount(page)).toBe(before + 1);
  const saved = await page.evaluate((key) => {
    const last = JSON.parse(localStorage.getItem(key)!).cases.at(-1);
    return { confirmed: last.request.confirmedAppointment, assessment: last.assessment.authorizedAt, transport: last.transport.authorizedAt, payments: last.payments.length, messages: last.smsLog.length, model: last.vehicle.model };
  }, storageKey);
  expect(saved).toEqual({ confirmed: null, assessment: null, transport: null, payments: 0, messages: 0, model: "Sportage Hybrid" });
  await page.getByRole("link", { name: "Follow your repair case" }).click();
  await expect(page).toHaveURL(/\/case\?caseId=/);
  await page.reload();
  await expect(page.getByText("Sportage Hybrid").first()).toBeVisible();
});

test("storage write failure preserves review and supports a retry", async ({ page }) => {
  const before = await caseCount(page);
  await fillVisit(page);
  await page.getByRole("button", { name: "Review request" }).click();
  await page.evaluate((key) => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (name, value) {
      if (name === key) throw new Error("Storage blocked for test");
      return original.call(this, name, value);
    };
    Object.defineProperty(window, "restoreRequestStorage", { value: () => { Storage.prototype.setItem = original; } });
  }, storageKey);
  await page.getByRole("button", { name: "Create sample request" }).click();
  await expect(page.getByText(/This sample request could not be saved/)).toBeVisible();
  expect(await caseCount(page)).toBe(before);
  await expect(page.getByRole("region", { name: "Your details" })).toContainText("Sara Sample");
  await page.evaluate(() => Reflect.get(window, "restoreRequestStorage")());
  await page.getByRole("button", { name: "Retry browser storage" }).click();
  await expect(page.getByRole("button", { name: "Create sample request" })).toBeEnabled();
  await page.getByRole("button", { name: "Create sample request" }).click();
  await expect(page.getByRole("heading", { name: /^Reference FXA-/ })).toBeVisible();
  expect(await caseCount(page)).toBe(before + 1);
});

test("request page fits phone and desktop widths and uses the scoped dark theme", async ({ page }) => {
  for (const width of [320, 390, 768, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), String(width)).toBe(true);
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  const duration = await page.getByRole("button", { name: "Review request" }).evaluate((el) => getComputedStyle(el).transitionDuration);
  expect(duration.split(",").every((value) => parseFloat(value) <= 0.01)).toBe(true);
  await expect(page.getByRole("navigation", { name: "Main navigation" })).toBeVisible();
  await expect(page.locator("#main-content")).toHaveCount(1);
});
