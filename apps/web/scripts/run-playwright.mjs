import { spawn } from "node:child_process";
import { once } from "node:events";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const nextCli = require.resolve("next/dist/bin/next");
const playwrightCli = require.resolve("@playwright/test/cli");
const port = 3100;
const baseURL = `http://127.0.0.1:${port}`;

function startProcess(command, args, options = {}) {
  return spawn(command, args, {
    cwd: process.cwd(),
    env: process.env,
    stdio: "inherit",
    windowsHide: true,
    ...options,
  });
}

async function waitForServer(process, timeoutMs = 30_000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    if (process.exitCode !== null) {
      throw new Error(`Next.js exited with code ${process.exitCode}.`);
    }

    try {
      const response = await fetch(`${baseURL}/manifest.webmanifest`);

      if (response.ok) {
        return;
      }
    } catch {
      // The server is still starting.
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error(`Next.js did not become ready at ${baseURL}.`);
}

async function stopProcessTree(process) {
  if (process.exitCode !== null) {
    return;
  }

  if (process.platform === "win32") {
    const taskkill = spawn(
      "taskkill",
      ["/pid", String(process.pid), "/t", "/f"],
      {
        stdio: "ignore",
        windowsHide: true,
      },
    );
    await once(taskkill, "exit");
    return;
  }

  process.kill("SIGTERM");
  await Promise.race([
    once(process, "exit"),
    new Promise((resolve) => setTimeout(resolve, 5_000)),
  ]);

  if (process.exitCode === null) {
    process.kill("SIGKILL");
  }
}

const server = startProcess(process.execPath, [
  nextCli,
  "start",
  "--hostname",
  "127.0.0.1",
  "--port",
  String(port),
]);

let exitCode = 1;

try {
  await waitForServer(server);

  const playwright = startProcess(
    process.execPath,
    [playwrightCli, "test", ...process.argv.slice(2)],
    {
      env: {
        ...process.env,
        PLAYWRIGHT_EXTERNAL_SERVER: "1",
      },
    },
  );

  const [code] = await once(playwright, "exit");
  exitCode = typeof code === "number" ? code : 1;
} finally {
  await stopProcessTree(server);
}

process.exitCode = exitCode;
