import { defineConfig } from "@playwright/test";
import base from "../../playwright.config";
export default defineConfig({
  ...base, testDir: "../../e2e",
  use: { ...base.use, baseURL: "http://127.0.0.1:3143" },
  webServer: undefined,
});
