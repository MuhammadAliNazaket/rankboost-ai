const lighthouse = require("lighthouse");
const chromeLauncher = require("chrome-launcher");
const crypto = require("crypto");
const fs = require("fs/promises");
const os = require("os");
const path = require("path");

const lighthouseRunner = lighthouse.default || lighthouse;

class TimeoutError extends Error {
  constructor(message) {
    super(message);
    this.name = "TimeoutError";
  }
}

function normalizeUrl(inputUrl) {
  const trimmed = String(inputUrl || "").trim();

  if (!trimmed) {
    throw new Error("URL is required");
  }

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const parsed = new URL(withProtocol);

    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new Error("Only HTTP and HTTPS URLs are supported");
    }

    parsed.hash = "";
    return parsed.toString();
  } catch {
    throw new Error("Invalid URL");
  }
}

function withTimeout(promise, timeoutMs, onTimeout) {
  let timer;

  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(async () => {
      if (onTimeout) await onTimeout();
      reject(new TimeoutError(`Lighthouse timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() =>
    clearTimeout(timer)
  );
}

async function safeRemove(folderPath) {
  try {
    await fs.rm(folderPath, {
      recursive: true,
      force: true,
    });
  } catch {
    // ignore cleanup errors
  }
}

async function runLighthouse({
  url,
  onlyCategories = ["performance", "accessibility", "best-practices", "seo"],
  timeoutMs = Number(process.env.LIGHTHOUSE_TIMEOUT_MS || 120000),
  log = console,
} = {}) {
  const requestId = crypto.randomUUID();
  const normalizedUrl = normalizeUrl(url);

  const userDataDir = await fs.mkdtemp(
    path.join(os.tmpdir(), "rankboost-chrome-")
  );

  let chrome;
  const start = Date.now();

  try {
    chrome = await chromeLauncher.launch({
            env: {
           ...process.env,
           TEMP: os.tmpdir(),
          TMP: os.tmpdir(),
          LOCALAPPDATA: os.tmpdir(),
          USERPROFILE: os.tmpdir(),
        },
      chromePath: process.env.CHROME_PATH || undefined,
      logLevel: "silent",
      chromeFlags: [
        "--headless=new",
        "--no-sandbox",
        "--disable-gpu",
        "--disable-dev-shm-usage",
        "--no-first-run",
        "--no-default-browser-check",
        "--disable-extensions",
        "--disable-background-networking",
        "--disable-sync",
        "--disable-popup-blocking",
        "--disable-prompt-on-repost",
        "--disable-translate",
        "--mute-audio",
        "--window-size=1365,1024",
        `--user-data-dir=${userDataDir}`,
      ],
    });

    const options = {
      port: chrome.port,
      logLevel: "error",
      output: "json",
      onlyCategories,
      maxWaitForLoad: 60000,
    };

    const runnerResult = await withTimeout(
      lighthouseRunner(normalizedUrl, options),
      timeoutMs,
      async () => {
        if (chrome) await chrome.kill();
      }
    );

    return {
      requestId,
      lhr: runnerResult.lhr,
      report: runnerResult.report,
      finalUrl: normalizedUrl,
      timingMs: Date.now() - start,
    };
  } catch (error) {
    log.error("[lighthouse] failed", {
      requestId,
      url: normalizedUrl,
      message: error.message,
    });

    throw error;
  } finally {
    if (chrome) {
      try {
        await chrome.kill();
      } catch {}
    }

    await safeRemove(userDataDir);
  }
}

module.exports = {
  TimeoutError,
  normalizeUrl,
  runLighthouse,
};