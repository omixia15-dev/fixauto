import { expect, test } from "@playwright/test";

for (const width of [1440, 390]) {
  test(`landing page and demo form at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Car repairs in Kerman.");
    await expect(page.getByRole("heading", { name: "Planned service journey" })).toBeVisible();
    await expect(page.locator('img[src*="session-13"]').first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const problem = await page.locator("#problem").innerText();
    expect(problem).toContain("Fixauto brings those steps together through one contact.");
    await page.locator('header a[href="#coming-soon"]').last().click();
    await expect(page).toHaveURL(/#coming-soon$/);
    const contact = page.getByLabel("Email or mobile number");
    await contact.fill("   ");
    expect(await contact.evaluate((input: HTMLInputElement) => input.checkValidity())).toBe(false);
    await page.getByRole("button", { name: "Get launch updates" }).click();
    await expect(page.getByText("Thanks for trying the preview.")).toHaveCount(0);
    await contact.fill("driver@example.com");
    const submissions: string[] = [];
    page.on("request", request => {
      if (request.method() === "POST") submissions.push(request.url());
    });
    await page.getByRole("button", { name: "Get launch updates" }).click();
    await expect(page.getByText("Your details were not saved or sent.", { exact: false })).toBeVisible();
    expect(submissions).toEqual([]);
  });
}
for (const width of [320, 390, 1440]) {
  test(`home Customer navigation opens the dossier at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const customer = page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Customer", exact: true });
    await expect(customer).toBeVisible();
    await expect(customer).toHaveAttribute("href", "/cases/case-kia-003");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await customer.focus();
    await expect(customer).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/cases\/case-kia-003$/);
    await expect(page.getByRole("heading", { name: "FXA-1003", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Repair estimate", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Approve exact estimate", exact: true })).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}