async (page) => {
  const browser = page.context().browser();
  const fresh = await browser.newContext({viewport:{width:1440,height:1000}});
  const clean = await fresh.newPage();
  await clean.goto("http://127.0.0.1:3000/case");
  await clean.getByRole("button",{name:/FXA-1001 Toyota Camry Request received/}).waitFor();
  await clean.getByText("Sample data · browser-local demo · no real booking or payment.",{exact:true}).waitFor();
  await clean.screenshot({path:".impeccable/review/desktop.png",fullPage:true});
  await clean.setViewportSize({width:390,height:844});
  await clean.screenshot({path:".impeccable/review/mobile.png",fullPage:true});
  await clean.addInitScript(() => { Storage.prototype.getItem = () => { throw new Error("Test denied"); }; });
  await clean.setViewportSize({width:1440,height:1000});
  await clean.reload();
  await clean.getByRole("heading",{name:"We could not open your saved cases"}).waitFor();
  await clean.getByText("Sample data · browser-local demo · no real booking or payment.",{exact:true}).waitFor();
  await clean.screenshot({path:".impeccable/review/error.png",fullPage:true});
  await fresh.close();
  return "Final footer verified in populated and error states; desktop/mobile/error captures updated.";
}
