const { runLighthouse, TimeoutError } = require("../utils/lighthouseRunner");

exports.runLighthouse = async (req, res) => {
  const timeoutMs = Number(process.env.LIGHTHOUSE_TIMEOUT_MS || 120000);
  res.setTimeout(timeoutMs + 10000);

  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        message: "URL is required",
      });
    }

    const { lhr, requestId, timingMs, finalUrl } = await runLighthouse({
      url,
      timeoutMs,
      log: console,
    });

    if (!lhr) {
      return res.status(502).json({
        message: "Lighthouse did not return a report",
        requestId,
      });
    }

    const categories = lhr.categories || {};
    const audits = lhr.audits || {};

    const pickAudit = (id) => {
      const audit = audits[id];
      if (!audit) return { displayValue: "N/A", numericValue: null };
      return {
        displayValue: audit.displayValue ?? "N/A",
        numericValue: Number.isFinite(audit.numericValue) ? audit.numericValue : null,
      };
    };

    const fcp = pickAudit("first-contentful-paint");
    const lcp = pickAudit("largest-contentful-paint");
    const si = pickAudit("speed-index");
    const tbt = pickAudit("total-blocking-time");
    const cls = pickAudit("cumulative-layout-shift");

    return res.status(200).json({
      requestId,
      url: finalUrl,
      timingMs,

      performance: Math.round((categories.performance?.score ?? 0) * 100),
      accessibility: Math.round((categories.accessibility?.score ?? 0) * 100),
      bestPractices: Math.round((categories["best-practices"]?.score ?? 0) * 100),
      seo: Math.round((categories.seo?.score ?? 0) * 100),

      firstContentfulPaint: fcp.displayValue,
      firstContentfulPaintMs: fcp.numericValue,

      largestContentfulPaint: lcp.displayValue,
      largestContentfulPaintMs: lcp.numericValue,

      speedIndex: si.displayValue,
      speedIndexMs: si.numericValue,

      totalBlockingTime: tbt.displayValue,
      totalBlockingTimeMs: tbt.numericValue,

      cumulativeLayoutShift: cls.displayValue,
      cumulativeLayoutShiftScore: cls.numericValue,
    });
  } catch (error) {
    const msg = String(error?.message || "").toLowerCase();
    const isBadRequest =
      msg.includes("invalid url") ||
      msg.includes("only http/https") ||
      msg.includes("url ") ||
      msg.includes("refusing to analyze");

    const status = error instanceof TimeoutError ? 504 : isBadRequest ? 400 : 500;

    console.error("[lighthouse] controller error", {
      message: error?.message,
      name: error?.name,
      stack: error?.stack,
      code: error?.code,
    });

    return res.status(status).json({
      message: error?.message || "Lighthouse analysis failed",
    });
  } 
};
