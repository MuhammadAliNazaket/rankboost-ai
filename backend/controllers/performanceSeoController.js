const db = require("../config/db");
const { runLighthouse, TimeoutError } = require("../utils/lighthouseRunner");

exports.analyzePerformanceSEO = async (req, res) => {
  const timeoutMs = Number(process.env.LIGHTHOUSE_TIMEOUT_MS || 120000);
  res.setTimeout(timeoutMs + 10000);

  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        message: "URL is required",
      });
    }

    const { lhr, requestId, finalUrl } = await runLighthouse({
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

    const performanceScore = Math.round((categories.performance?.score ?? 0) * 100);
    const accessibilityScore = Math.round((categories.accessibility?.score ?? 0) * 100);
    const bestPracticesScore = Math.round((categories["best-practices"]?.score ?? 0) * 100);
    const seoScore = Math.round((categories.seo?.score ?? 0) * 100);

    const firstContentfulPaint = audits["first-contentful-paint"]?.displayValue || "N/A";
    const speedIndex = audits["speed-index"]?.displayValue || "N/A";
    const largestContentfulPaint = audits["largest-contentful-paint"]?.displayValue || "N/A";
    const totalBlockingTime = audits["total-blocking-time"]?.displayValue || "N/A";
    const cumulativeLayoutShift = audits["cumulative-layout-shift"]?.displayValue || "N/A";

    const query = `
      INSERT INTO performance_seo_reports
      (
        url,
        performance_score,
        accessibility_score,
        best_practices_score,
        seo_score,
        first_contentful_paint,
        speed_index,
        largest_contentful_paint,
        total_blocking_time,
        cumulative_layout_shift
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      query,
      [
        finalUrl,
        performanceScore,
        accessibilityScore,
        bestPracticesScore,
        seoScore,
        firstContentfulPaint,
        speedIndex,
        largestContentfulPaint,
        totalBlockingTime,
        cumulativeLayoutShift,
      ],
      (err) => {
        if (err) {
          console.log("Performance Report Save Error:", err.message);
        }
      }
    );

    res.status(200).json({
      requestId,
      url: finalUrl,
      performanceScore,
      accessibilityScore,
      bestPracticesScore,
      seoScore,
      firstContentfulPaint,
      speedIndex,
      largestContentfulPaint,
      totalBlockingTime,
      cumulativeLayoutShift,
    });
  } catch (error) {
    const msg = String(error?.message || "").toLowerCase();
    const isBadRequest =
      msg.includes("invalid url") ||
      msg.includes("only http/https") ||
      msg.includes("url ") ||
      msg.includes("refusing to analyze");

    const status = error instanceof TimeoutError ? 504 : isBadRequest ? 400 : 500;

    console.error("[performance-seo] controller error", {
      message: error?.message,
      name: error?.name,
      stack: error?.stack,
      code: error?.code,
    });

    return res.status(status).json({
      message: error?.message || "Performance SEO analysis failed",
    });
  }
};
