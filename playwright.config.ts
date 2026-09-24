import { defineConfig, devices } from "@playwright/test";
import path from "node:path";

const frontendRoot = import.meta.dirname;
const runtimeProcess = (globalThis as typeof globalThis & {
  process?: { env?: Record<string, string | undefined>; platform?: string };
}).process;
const configuredApiRoot = runtimeProcess?.env?.NOVEL_AGENT_API_ROOT;
const apiRoot = configuredApiRoot ? path.resolve(configuredApiRoot) : undefined;
const apiUrl = runtimeProcess?.env?.E2E_API_URL ?? "http://127.0.0.1:8765";
const webUrl = "http://127.0.0.1:4173";
const python = runtimeProcess?.platform === "win32"
  ? path.join(apiRoot ?? "", ".venv", "Scripts", "python.exe")
  : path.join(apiRoot ?? "", ".venv", "bin", "python");

const webServers = [];
if (apiRoot) {
  webServers.push({
    command: `"${python}" -m scripts.e2e_server --root .tmp/e2e-runtime --port 8765`,
    cwd: apiRoot,
    url: `${apiUrl}/healthz`,
    reuseExistingServer: !runtimeProcess?.env?.CI,
    timeout: 120_000,
  });
}
webServers.push({
  command: "node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 4173",
  cwd: frontendRoot,
  env: { VITE_API_PROXY_TARGET: apiUrl },
  url: webUrl,
  reuseExistingServer: !runtimeProcess?.env?.CI,
  timeout: 120_000,
});

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(runtimeProcess?.env?.CI),
  retries: runtimeProcess?.env?.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  outputDir: "test-results",
  use: {
    baseURL: webUrl,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-chromium", use: { ...devices["Pixel 7"] } },
  ],
  webServer: webServers,
});
