import { defineConfig, devices } from "@playwright/test";

const localAddresses = "127.0.0.1,localhost";
process.env.NO_PROXY = [process.env.NO_PROXY, localAddresses].filter(Boolean).join(",");
process.env.no_proxy = [process.env.no_proxy, localAddresses].filter(Boolean).join(",");

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3123",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: "npm run start -- --hostname 127.0.0.1 --port 3123",
    url: "http://127.0.0.1:3123",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
