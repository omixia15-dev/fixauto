import { expect, test } from "@playwright/test";

test("marketing home links to the case demo without showing sample records", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Car repairs in Kerman/ })).toBeVisible();
  await expect(page.getByText(/FXA-\d+/)).toHaveCount(0);

  await page.getByRole("link", { name: /My cases/ }).click();
  await expect(page).toHaveURL(/\/case$/);
  await expect(page.getByRole("button", { name: /FXA-100[1-5]/ })).toHaveCount(5);
});

test("sample cases are shared across the list, customer dossier, staff workspace, and reset", async ({ page }) => {
  await page.goto("/case?caseId=case-kia-003");
  await expect(page.getByText("FXA-1003").first()).toBeVisible();
  await page.getByRole("link", { name: "Open full case & approvals" }).click();
  await expect(page).toHaveURL(/\/cases\/case-kia-003$/);
  await expect(page.getByText("FXA-1003").first()).toBeVisible();
  await page.reload();
  await expect(page.getByText("FXA-1003").first()).toBeVisible();

  const staffLink = page.getByRole("link", { name: "Staff workspace" });
  await expect(staffLink).toHaveAttribute("href", "/staff?caseId=case-kia-003");
  await staffLink.click();
  await expect(page).toHaveURL(/\/staff\?caseId=case-kia-003$/);
  await expect(page.getByText("FXA-1003").first()).toBeVisible();

  await page.evaluate(() => window.localStorage.setItem("unrelated.application", "keep-me"));
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Reset sample data" }).click();
  await expect(page.getByText("FXA-1003").first()).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.localStorage.getItem("unrelated.application"))).toBe("keep-me");
});

test("case routes fit phone through desktop widths and keep section navigation keyboard accessible", async ({ page }) => {
  const routes = ["/case?caseId=case-kia-003", "/cases/case-kia-003", "/staff?caseId=case-kia-003"];

  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes) {
      await page.goto(route);
      if (route.startsWith("/staff")) await expect(page.getByRole("heading", { name: "Request and assessment queue" })).toBeVisible();
      else if (route.startsWith("/cases/")) await expect(page.getByRole("heading", { name: "FXA-1003" })).toBeVisible();
      else await expect(page.getByRole("heading", { name: "Your repair cases" })).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
      expect(overflow, `${route} overflows at ${width}px`).toBe(false);
    }
  }

  await page.goto("/case?caseId=case-kia-003");
  const openCase = page.getByRole("link", { name: "Open full case & approvals" });
  await openCase.focus();
  await expect(openCase).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/cases\/case-kia-003$/);

  const myCases = page.getByRole("navigation", { name: "Cases navigation" }).getByRole("link", { name: "My cases" });
  await myCases.focus();
  await expect(myCases).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/case$/);
});
