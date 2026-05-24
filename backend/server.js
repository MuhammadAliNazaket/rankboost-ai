const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

require("./config/db");

const authRoutes = require("./routes/auth");
const websiteRoutes = require("./routes/website");
const seoRoutes = require("./routes/seo");
const technicalSeoRoutes = require("./routes/technicalSeo");
const performanceSeoRoutes = require("./routes/performanceSeo");
const lighthouseRoutes = require("./routes/lighthouse");
const keywordSeoRoutes = require("./routes/keywordSeo");
const competitorTrafficRoutes = require("./routes/competitorTraffic");
const pdfRoutes = require("./routes/pdf");

const app = express();

app.use((req, res, next) => {
  console.log("Incoming request:", req.method, req.url);
  next();
});

const parseCsv = (value) =>
  String(value || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

const corsOrigins = parseCsv(process.env.CORS_ORIGINS || process.env.CORS_ORIGIN);
const corsOriginRegexes = parseCsv(process.env.CORS_ORIGIN_REGEX).map((pattern) => {
  try {
    return new RegExp(pattern);
  } catch {
    return null;
  }
}).filter(Boolean);

const allowAllOrigins = corsOrigins.includes("*");

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowAllOrigins) return callback(null, true);
      if (corsOrigins.includes(origin)) return callback(null, true);
      if (corsOriginRegexes.some((rx) => rx.test(origin))) return callback(null, true);
      return callback(new Error(`CORS blocked for origin: ${origin}`), false);
    },
    credentials: false,
  })
);

app.use(express.json({ limit: "1mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/websites", websiteRoutes);
app.use("/api/seo", seoRoutes);
app.use("/api/technical-seo", technicalSeoRoutes);
app.use("/api/performance-seo", performanceSeoRoutes);
app.use("/api/lighthouse", lighthouseRoutes);
app.use("/api/keyword-seo", keywordSeoRoutes);
app.use("/api/competitor-traffic", competitorTrafficRoutes);
app.use("/api/pdf", pdfRoutes);


app.get("/", (req, res) => {
  res.send("RankBoost AI Backend is running");
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Prevent hanging connections in production (keep slightly above Lighthouse timeout).
const lighthouseTimeoutMs = Number(process.env.LIGHTHOUSE_TIMEOUT_MS || 120000);
const httpRequestTimeoutMs = Number(
  process.env.HTTP_REQUEST_TIMEOUT_MS || lighthouseTimeoutMs + 15000
);
server.requestTimeout = httpRequestTimeoutMs;
server.headersTimeout = httpRequestTimeoutMs + 5000;
