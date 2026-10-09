import { expect, test } from "@playwright/test";

test("marketing home links to the case demo without showing sample records", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Car repairs in Kerman/ })).toBeVisible();
  await expect(page.getByText(/FXA-\d+/)).toHaveCount(0);

  await page.getByRole("link", { name: /My cases/ }).click();
  await expect(page).toHaveURL(/\/case$/);
  await expect(page.getByRole("button", { name: /FXA-100[1-5]/ })).toHaveCount(5);
});

test("sample cases stay shared across the overview, customer dossier, staff workspace, and reset", async ({ page }) => {
  await page.goto("/case?caseId=case-kia-003");
  await expect(page.getByRole("heading", { name: "Your repair cases" })).toBeVisible();
  await expect(page.getByText("FXA-1003", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: /FXA-/ })).toHaveCount(5);

  await page.getByRole("link", { name: "Open full case & approvals" }).click();
  await expect(page).toHaveURL(/\/cases\/case-kia-003$/);
  await expect(page.getByText("FXA-1003", { exact: true }).first()).toBeVisible();
  await page.reload();
  await expect(page.getByText("FXA-1003", { exact: true }).first()).toBeVisible();

  const staffLink = page.getByRole("link", { name: "Staff workspace" });
  await expect(staffLink).toHaveAttribute("href", "/staff?caseId=case-kia-003");
  await staffLink.click();
  await expect(page).toHaveURL(/\/staff\?caseId=case-kia-003$/);
  await expect(page.getByRole("heading", { level: 1, name: "Staff workspace" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: /FXA-1003/ })).toBeVisible();
  await expect(page.getByText("Simulated · staff role")).toBeVisible();

  await page.evaluate(() => window.localStorage.setItem("unrelated.application", "keep-me"));
  await page.goto("/case");
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Reset sample data" }).click();
  await expect(page.getByRole("button", { name: /FXA-/ })).toHaveCount(5);
  await expect.poll(() => page.evaluate(() => window.localStorage.getItem("unrelated.application"))).toBe("keep-me");
});

test("case routes fit phone through desktop widths and keep keyboard navigation accessible", async ({ page }) => {
  const routes = [
    { url: "/case?caseId=case-kia-003", heading: "Your repair cases" },
    { url: "/cases/case-kia-003", heading: "FXA-1003" },
    { url: "/staff?caseId=case-kia-003", heading: "Staff workspace" },
  ];

  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes) {
      await page.goto(route.url);
      await expect(page.getByRole("heading", { name: route.heading })).toBeVisible();
      await expect(page.getByText("FXA-1003", { exact: true }).first()).toBeVisible();
      if (!route.url.startsWith("/cases/")) {
        const reset = page.getByRole("button", { name: "Reset sample data" });
        await reset.focus();
        await expect(reset).toBeFocused();
      }
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
      expect(overflow, `${route.url} overflows at ${width}px`).toBe(false);
    }
  }

  await page.goto("/case?caseId=case-kia-003");
  const skipLink = page.getByRole("link", { name: "Skip to content" });
  await page.keyboard.press("Tab");
  await expect(skipLink).toBeFocused();

  const openCase = page.getByRole("link", { name: "Open full case & approvals" });
  await openCase.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/cases\/case-kia-003$/);

  await page.goto("/case?caseId=case-kia-003");
  const myCases = page.getByRole("navigation", { name: "Cases navigation" }).getByRole("link", { name: "My cases" });
  await myCases.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/case$/);
});
