import original from "../../playwright.config";
export default { ...original, testDir: "../../e2e", use: { ...original.use, baseURL: "http://127.0.0.1:3124" }, webServer: { ...original.webServer, cwd: "/home/omixia/projects/fixauto", command: "npm run start -- --hostname 127.0.0.1 --port 3124", url: "http://127.0.0.1:3124" } };
