import { expect, test } from "@playwright/test";

const seedNote = "Customer prefers a morning expert visit.";
const changedNote = "Shared foundation note from the request screen.";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("one sample case is shared across screens, refresh, and isolated reset", async ({ page }) => {
  await expect(page.getByText("Interactive demo — sample data only")).toBeVisible();
  await expect(page.getByText("FXA-1001").first()).toBeVisible();
  await expect(page.getByText("$45.00 USD").first()).toBeVisible();

  const note = page.getByLabel("Sample coordination note");
  await note.fill(changedNote);
  await page.getByRole("button", { name: "Save sample note" }).click();
  await expect(page.getByRole("status")).toContainText("Sample note saved");

  await page.getByRole("link", { name: "Customer case" }).click();
  await expect(page).toHaveURL(/\/cases\/case-atlas-001$/);
  await expect(page.getByTestId("shared-note")).toHaveText(changedNote);
  await expect(page.getByText("Simulated · payment")).toBeVisible();
  await expect(page.getByText("Simulated · SMS log")).toBeVisible();

  await page.reload();
  await expect(page.getByTestId("shared-note")).toHaveText(changedNote);

  await page.getByRole("link", { name: "Staff workspace" }).click();
  await expect(page.getByTestId("shared-note")).toHaveText(changedNote);
  await expect(page.getByText("Simulated · staff role")).toBeVisible();

  await page.evaluate(() => window.localStorage.setItem("unrelated.application", "keep-me"));
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Reset sample data" }).click();
  await expect(page.getByTestId("shared-note")).toHaveText(seedNote);
  await expect.poll(() => page.evaluate(() => window.localStorage.getItem("unrelated.application"))).toBe("keep-me");
});

test("main navigation and sample update are keyboard accessible at phone width", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();

  const note = page.getByLabel("Sample coordination note");
  await note.focus();
  await note.fill("Keyboard-authored sample note.");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Save sample note" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status")).toContainText("Sample note saved");

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
});
