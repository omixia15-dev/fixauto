async (page) => {
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('http://127.0.0.1:3000/');
    const nav = page.getByRole('navigation', { name: 'Main navigation' });
    const cases = nav.getByRole('link', { name: 'My cases Demo' });
    await cases.waitFor({ state: 'visible' });
    if (await cases.getAttribute('href') !== '/case') throw new Error('Wrong cases destination');
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error(`Overflow at ${width}`);
    await page.screenshot({ path: `.impeccable/review/home-nav-${width}.png` });
    await cases.click();
    await page.waitForURL('**/case');
    await page.getByRole('heading', { name: 'Your repair cases' }).waitFor();
  }
  return 'Home navigation opens /case at 1440, 390 and 320px; no horizontal overflow.';
}
