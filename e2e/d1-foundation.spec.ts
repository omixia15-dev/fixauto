import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/case");
});

test("the five sample cases are shared across overview, customer, and staff views", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Your repair cases" })).toBeVisible();
  await expect(page.getByText("FXA-1001", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: /FXA-/ })).toHaveCount(5);

  await page.getByRole("link", { name: "Open full case & approvals" }).click();
  await expect(page).toHaveURL(/\/cases\/case-atlas-001$/);
  await expect(page.getByText("FXA-1001", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("$45.00 USD").first()).toBeVisible();
  await page.reload();
  await expect(page.getByText("FXA-1001", { exact: true }).first()).toBeVisible();

  await page.goto("/staff?caseId=case-atlas-001");
  await expect(page.getByRole("heading", { level: 1, name: "Staff workspace" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: /FXA-1001/ })).toBeVisible();
  await expect(page.getByText("Simulated · staff role")).toBeVisible();

  await page.evaluate(() => window.localStorage.setItem("unrelated.application", "keep-me"));
  await page.goto("/case");
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Reset sample data" }).click();
  await expect(page.getByRole("button", { name: /FXA-/ })).toHaveCount(5);
  await expect.poll(() => page.evaluate(() => window.localStorage.getItem("unrelated.application"))).toBe("keep-me");
});

test("case overview supports keyboard navigation at phone width", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  await page.getByRole("link", { name: "Open full case & approvals" }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/cases\/case-atlas-001$/);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
});

test("overview, customer, and staff screens fit phone and desktop widths", async ({ page }) => {
  const routes = [
    { url: "/case", heading: "Your repair cases" },
    { url: "/cases/case-atlas-001", heading: "Request received — awaiting staff confirmation" },
    { url: "/staff?caseId=case-atlas-001", heading: "Staff workspace" },
  ];

  for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
    await page.setViewportSize(viewport);
    for (const route of routes) {
      await page.goto(route.url);
      await expect(page.getByRole("heading", { name: route.heading })).toBeVisible();
      await expect(page.getByText("FXA-1001", { exact: true }).first()).toBeVisible();
      await page.getByRole("button", { name: "Reset sample data" }).focus();
      await expect(page.getByRole("button", { name: "Reset sample data" })).toBeFocused();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
      expect(overflow).toBe(false);
    }
  }
});
