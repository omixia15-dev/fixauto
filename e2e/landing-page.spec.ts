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
const appRoutes = ["/", "/case", "/case/new", "/cases/case-kia-003", "/staff"];
const navigationLinks = [
  { name: "Home page", href: "/" },
  { name: "Cases", href: "/case" },
  { name: "Users", href: "/cases/case-kia-003", title: "Sample customer case demo" },
  { name: "Staffs", href: "/staff" },
  { name: "Coming Soon", href: "/#coming-soon" },
];

for (const width of [320, 390, 768, 1440]) {
  test(`shared navigation is available and keyboard-accessible across routes at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const route of appRoutes) {
      await page.goto(route);
      const navigation = page.getByRole("navigation", { name: "Main navigation" });
      await expect(navigation.getByRole("link")).toHaveText(navigationLinks.map(link => link.name));
      for (const link of navigationLinks) {
        const item = navigation.getByRole("link", { name: link.name, exact: true });
        const caseId = route.startsWith("/cases/") ? route.slice("/cases/".length) : null;
        const href = route === "/" && link.name === "Coming Soon" ? "#coming-soon"
          : link.name === "Users" && caseId ? route
          : link.name === "Staffs" && caseId ? `/staff?caseId=${caseId}`
          : link.href;
        await expect(item).toHaveAttribute("href", href);
        if (link.title) await expect(item).toHaveAttribute("title", link.title);
      }
      const active = route === "/" ? "Home page" : route.startsWith("/cases/") ? "Users" : route === "/staff" ? "Staffs" : "Cases";
      await expect(navigation.locator('[aria-current]')).toHaveText(active);
      await expect(navigation.getByRole("link", { name: active, exact: true })).toHaveAttribute("aria-current", route === "/case/new" ? "location" : "page");
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${route} fits at ${width}px`).toBe(true);
      const home = navigation.getByRole("link", { name: "Home page", exact: true });
      await home.focus();
      await expect(home).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(page).toHaveURL(/\/$/);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  });

  test(`main navigation destinations work by keyboard at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const link of navigationLinks.slice(1, 4)) {
      await page.goto("/");
      const item = page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: link.name, exact: true });
      await item.focus();
      await expect(item).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(page).toHaveURL(new RegExp(`${link.href}$`));
    }
    await page.goto("/case/new");
    const comingSoon = page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Coming Soon", exact: true });
    await comingSoon.focus();
    await expect(comingSoon).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/#coming-soon$/);
    await expect(page.getByRole("heading", { name: "Coming soon in Kerman." })).toBeVisible();
  });
}

test("navigation keeps the selected customer case in its customer and staff destinations", async ({ page }) => {
  await page.goto("/cases/case-atlas-001");
  const navigation = page.getByRole("navigation", { name: "Main navigation" });
  await expect(navigation.getByRole("link", { name: "Users", exact: true })).toHaveAttribute("href", "/cases/case-atlas-001");
  const staff = navigation.getByRole("link", { name: "Staffs", exact: true });
  await expect(staff).toHaveAttribute("href", "/staff?caseId=case-atlas-001");
  await staff.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/staff\?caseId=case-atlas-001$/);
  await expect(page.getByRole("heading", { level: 2, name: /FXA-1001/ })).toBeVisible();
});

test("navigation remains available for empty searches and missing cases", async ({ page }) => {
  await page.goto("/case");
  await page.getByRole("searchbox", { name: "Find a case" }).fill("no matching case");
  await expect(page.getByRole("heading", { name: "No cases match your search" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Main navigation" })).toBeVisible();

  await page.goto("/cases/missing-sample-case");
  await expect(page.getByRole("heading", { name: "Case not found" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Main navigation" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Users", exact: true }))
    .toHaveAttribute("href", "/cases/missing-sample-case");
});

test("unknown routes do not show the legacy navigation or green shell", async ({ page }) => {
  const response = await page.goto("/missing-application-route");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Main navigation" })).toBeVisible();
  await page.getByRole("link", { name: "Back to home", exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("navigation", { name: "Demo screens" })).toHaveCount(0);
  await expect(page.locator("header.site-header")).toHaveCount(0);
  const brand = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--brand").trim().toLowerCase());
  expect(brand).not.toBe("#176b4d");
});
