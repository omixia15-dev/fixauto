import { expect, test } from "@playwright/test";

const cues = [2.70, 3.91, 5.11, 6.31, 7.50];
const sequence = "[data-warning-sequence]";
const shown = '[data-warning-icon][data-revealed="true"]';

test("header lights accumulate left to right at the measured cue times", async ({ page }) => {
  await page.clock.install();
  await page.goto("/");
  await expect(page.locator('[data-enhanced="true"]')).toBeVisible();
  await expect(page.locator(shown)).toHaveCount(0);
  await page.mouse.move(300, 600);
  let elapsed = 0;
  for (let index = 0; index < cues.length; index++) {
    const target = (cues[index] + .06) * 1000;
    await page.clock.runFor(target - elapsed);
    elapsed = target;
    await expect(page.locator(shown)).toHaveCount(index + 1);
  }
  await page.clock.runFor(6000);
  await expect(page.locator(shown)).toHaveCount(5);
  expect(await page.locator(shown).evaluateAll(nodes => nodes.map(node => node.getAttribute("data-warning-icon"))))
    .toEqual(["engine", "battery", "brake", "oil", "coolant"]);
  const boxes = await page.locator(shown).evaluateAll(nodes => nodes.map(node => node.getBoundingClientRect().left));
  expect(boxes.every((left, index) => index === 0 || left > boxes[index - 1])).toBe(true);
  await expect(page.locator('[data-warning-icon="engine"]')).toHaveCSS("background-color", "rgb(229, 27, 35)");
  await expect(page.locator(sequence)).toHaveCSS("pointer-events", "none");
});

test("recording clock drives reveals, mute preserves progress, and the clip ends at ten seconds", async ({ page }) => {
  await page.addInitScript(() => {
    const originalPlay = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
      (window as typeof window & { ignitionAudio?: HTMLMediaElement }).ignitionAudio = this;
      return originalPlay.call(this);
    };
  });
  await page.goto("/");
  await expect(page.locator('[data-enhanced="true"]')).toBeVisible();
  await page.getByRole("button", { name: "Enable warning sounds" }).click();
  await expect(page.getByRole("button", { name: "Mute warning sounds" })).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => page.evaluate(() => (window as typeof window & { ignitionAudio: HTMLMediaElement }).ignitionAudio.duration)).toBe(10);
  expect(await page.evaluate(() => (window as typeof window & { ignitionAudio: HTMLMediaElement }).ignitionAudio.currentSrc)).toContain("ignition-first-10s.wav");
  // Observe the real recording clock; every reveal must follow its measured beep.
  for (let index = 0; index < cues.length; index++) {
    await expect.poll(() => page.evaluate(() => (window as typeof window & { ignitionAudio: HTMLMediaElement }).ignitionAudio.currentTime)).toBeGreaterThan(cues[index] + .06);
    await expect(page.locator(shown)).toHaveCount(index + 1);
    if (index === 0) {
      const beforeMute = await page.evaluate(() => (window as typeof window & { ignitionAudio: HTMLMediaElement }).ignitionAudio.currentTime);
      await page.getByRole("button", { name: "Mute warning sounds" }).click();
      expect(await page.evaluate(() => (window as typeof window & { ignitionAudio: HTMLMediaElement }).ignitionAudio.muted)).toBe(true);
      await page.getByRole("button", { name: "Enable warning sounds" }).click();
      expect(await page.evaluate(() => (window as typeof window & { ignitionAudio: HTMLMediaElement }).ignitionAudio.muted)).toBe(false);
      expect(await page.evaluate(() => (window as typeof window & { ignitionAudio: HTMLMediaElement }).ignitionAudio.currentTime)).toBeGreaterThanOrEqual(beforeMute);
    }
  }
  await expect.poll(() => page.evaluate(() => (window as typeof window & { ignitionAudio: HTMLMediaElement }).ignitionAudio.ended)).toBe(true);
  await expect(page.locator(shown)).toHaveCount(5);
});

test("return chapter stops audio and leaving the landing unloads the recording", async ({ page }) => {
  await page.addInitScript(() => {
    const originalPlay = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
      (window as typeof window & { ignitionAudio?: HTMLMediaElement }).ignitionAudio = this;
      return originalPlay.call(this);
    };
  });
  await page.goto("/");
  await expect(page.locator('[data-enhanced="true"]')).toBeVisible();
  await page.getByRole("button", { name: "Enable warning sounds" }).click();
  await expect.poll(() => page.evaluate(() => (window as typeof window & { ignitionAudio: HTMLMediaElement }).ignitionAudio.paused)).toBe(false);
  await page.locator("#return").evaluate(el => el.scrollIntoView({ block: "start", behavior: "instant" }));
  await expect.poll(() => page.evaluate(() => (window as typeof window & { ignitionAudio: HTMLMediaElement }).ignitionAudio.paused)).toBe(true);
  await page.clock.install();
  await page.clock.runFor(11000);
  await expect(page.locator(shown)).toHaveCount(5);
  await expect(page.getByRole("button", { name: "Sound off for the quiet ending" })).toBeDisabled();
  expect(await page.evaluate(() => (window as typeof window & { ignitionAudio: HTMLMediaElement }).ignitionAudio.paused)).toBe(true);
  await page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Request a visit", exact: true }).click();
  await expect(page).toHaveURL(/\/case\/new$/);
  expect(await page.evaluate(() => (window as typeof window & { ignitionAudio: HTMLMediaElement }).ignitionAudio.getAttribute("src"))).toBeNull();
});

test("mobile touch sequence fits the header and reduced motion stays steady", async ({ page }) => {
  await page.clock.install();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/");
  await expect(page.locator('[data-enhanced="true"]')).toBeVisible();
  await page.locator(sequence).dispatchEvent("pointerdown", { pointerType: "touch" });
  await page.clock.runFor(7800);
  await expect(page.locator(shown)).toHaveCount(5);
  const header = await page.locator(sequence).evaluate(el => {
    const rect = el.getBoundingClientRect();
    return rect.left >= 0 && rect.right <= document.documentElement.clientWidth;
  });
  expect(header).toBe(true);
  await expect(page.locator(shown).first()).toHaveCSS("animation-name", "none");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test("failed audio loading keeps the silent visual sequence working", async ({ page }) => {
  await page.route("**/audio/ignition-first-10s.wav", route => route.abort());
  await page.clock.install();
  await page.goto("/");
  await expect(page.locator('[data-enhanced="true"]')).toBeVisible();
  await page.getByRole("button", { name: "Enable warning sounds" }).click();
  await expect(page.getByRole("button", { name: "Enable warning sounds" })).toBeDisabled();
  await page.clock.runFor(8000);
  await expect(page.locator(shown)).toHaveCount(5);
});

test("desktop retains the reference wrench cursor", async ({ page }) => {
  await page.goto("/");
  const cursor = await page.getByRole("heading", { level: 1 }).evaluate(el => getComputedStyle(el).cursor);
  expect(cursor).toContain("wrench-cursor.svg");
  expect((await page.request.get("/images/wrench-cursor.svg")).ok()).toBe(true);
});
