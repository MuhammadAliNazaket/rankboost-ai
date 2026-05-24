const axios = require("axios");
const cheerio = require("cheerio");
const db = require("../config/db");

exports.analyzeTechnicalSEO = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        message: "URL is required",
      });
    }

    // Fetch Website HTML
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    const html = response.data;

    const $ = cheerio.load(html);

    // HTTPS Check
    const httpsEnabled = url.startsWith("https");

    // Canonical URL
    const canonicalUrl =
      $('link[rel="canonical"]').attr("href") || "Not Found";

    // Open Graph Tags
    const openGraph = {
      title: $('meta[property="og:title"]').attr("content") || "",
      description:
        $('meta[property="og:description"]').attr("content") || "",
      image: $('meta[property="og:image"]').attr("content") || "",
    };

    // Schema Markup
    const schemaMarkup = [];

    $('script[type="application/ld+json"]').each((i, el) => {
      schemaMarkup.push($(el).html());
    });

    // robots.txt Check
    let robotsTxtStatus = "Not Found";

    try {
      const robotsResponse = await axios.get(`${url}/robots.txt`);

      if (robotsResponse.status === 200) {
        robotsTxtStatus = "Found";
      }
    } catch (error) {}

    // sitemap.xml Check
    let sitemapStatus = "Not Found";

    try {
      const sitemapResponse = await axios.get(`${url}/sitemap.xml`);

      if (sitemapResponse.status === 200) {
        sitemapStatus = "Found";
      }
    } catch (error) {}

    // Security Headers
    const securityHeaders = {
      xFrameOptions:
        response.headers["x-frame-options"] || "Missing",

      contentSecurityPolicy:
        response.headers["content-security-policy"] || "Missing",

      strictTransportSecurity:
        response.headers["strict-transport-security"] || "Missing",
    };

    // Save To Database
    const query = `
      INSERT INTO technical_seo_reports
      (
        url,
        robots_txt_status,
        sitemap_status,
        canonical_url,
        https_enabled,
        open_graph,
        schema_markup,
        security_headers
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      query,
      [
        url,
        robotsTxtStatus,
        sitemapStatus,
        canonicalUrl,
        httpsEnabled,
        JSON.stringify(openGraph),
        JSON.stringify(schemaMarkup),
        JSON.stringify(securityHeaders),
      ],
      (err) => {
        if (err) {
          console.log(err.message);
        }
      }
    );

    res.status(200).json({
      url,
      httpsEnabled,
      robotsTxtStatus,
      sitemapStatus,
      canonicalUrl,
      openGraph,
      schemaMarkup,
      securityHeaders,
    });
  } catch (error) {
    console.log(error.message);

    res.status(500).json({
      message: error.message,
    });
  }
};