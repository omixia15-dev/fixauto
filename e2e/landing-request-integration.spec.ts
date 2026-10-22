import { expect, test } from "@playwright/test";

const viewports = [
  { width: 320, height: 568 }, { width: 390, height: 844 },
  { width: 768, height: 1024 }, { width: 844, height: 390 },
  { width: 1024, height: 600 }, { width: 1280, height: 720 },
  { width: 1366, height: 768 }, { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
];

for (const viewport of viewports) {
  test(`public pages reflow at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    for (const route of ["/", "/case/new"]) {
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      if (route === "/case/new") await expect(page.getByRole("button", { name: "Review request" })).toBeEnabled();
      const problems = await page.evaluate(() => {
        const width = document.documentElement.clientWidth;
        const elements = [...document.querySelectorAll<HTMLElement>("h1,h2,p,label,summary,button,input,select,textarea,nav a")];
        return elements.filter((el) => {
          const rect = el.getBoundingClientRect();
          if (!rect.width || !rect.height) return false;
          return rect.left < -1 || rect.right > width + 1 || el.scrollWidth > el.clientWidth + 2;
        }).map((el) => ({ element: el.tagName, text: el.textContent?.slice(0, 60), width: el.scrollWidth, box: el.clientWidth }));
      });
      expect(problems, route).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), route).toBe(true);
      const navigation = page.getByRole("navigation", { name: "Main navigation" });
      await expect(navigation.getByRole("link")).toHaveText(["Home page", "Request a visit"]);
      await expect(navigation.getByRole("link", { name: route === "/" ? "Home page" : "Request a visit", exact: true })).toHaveAttribute("aria-current", "page");
    }
  });
}

test("public navigation and closing request action stay in the new experience", async ({ page }) => {
  await page.goto("/");
  const requestTab = page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Request a visit", exact: true });
  await requestTab.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/case\/new$/);
  const homeTab = page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Home page" });
  await homeTab.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Handled for you.");
  const closing = page.getByRole("region", { name: "Request a visit", exact: true });
  await expect(closing.locator("p")).toHaveText("Your car has a problem");
  expect(await closing.evaluate((el) => {
    const sentence = el.querySelector("p")!.getBoundingClientRect();
    const button = el.querySelector("a")!.getBoundingClientRect();
    return sentence.bottom <= button.top;
  })).toBe(true);
  await closing.getByRole("link", { name: "Request a visit", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Request an expert visit");
});

test("reduced motion and enlarged text keep the public story usable", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 640, height: 450 });
  await page.goto("/");
  await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  const photograph = page.locator("img").first();
  const motion = await photograph.evaluate((img) => ({ transition: getComputedStyle(img).transitionDuration, transform: getComputedStyle(img).transform, scroll: getComputedStyle(document.documentElement).scrollBehavior }));
  expect(motion.transition).toBe("0s");
  expect(motion.transform).toBe("none");
  expect(motion.scroll).toBe("auto");
  await page.getByRole("region", { name: "Request a visit", exact: true }).getByRole("link", { name: "Request a visit" }).click();
  await expect(page.getByRole("button", { name: "Review request" })).toBeEnabled();
});
