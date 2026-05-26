const axios = require("axios");
const cheerio = require("cheerio");
const db = require("../config/db");

function isExternalLink(link, websiteHost) {
  try {
    const linkHost = new URL(link).hostname.replace("www.", "");
    return linkHost !== websiteHost;
  } catch {
    return false;
  }
}

function getAnchorText($, el) {
  return $(el).text().replace(/\s+/g, " ").trim();
}

function calculateAuthorityScore(internalLinks, externalLinks, dofollowLinks, brokenLinks) {
  let score = 50;

  score += Math.min(internalLinks / 5, 20);
  score += Math.min(externalLinks / 3, 15);
  score += Math.min(dofollowLinks / 3, 15);
  score -= Math.min(brokenLinks * 5, 30);

  return Math.max(0, Math.min(100, Math.round(score)));
}

function calculateTrustScore(httpsEnabled, brokenLinks, spamScore) {
  let score = 70;

  if (httpsEnabled) score += 15;
  score -= Math.min(brokenLinks * 5, 30);
  score -= Math.min(spamScore / 2, 20);

  return Math.max(0, Math.min(100, Math.round(score)));
}

function calculateSpamScore(externalLinks, nofollowLinks, anchorTexts) {
  let score = 0;

  if (externalLinks > 100) score += 25;
  if (nofollowLinks > externalLinks * 0.7) score += 15;

  const spamWords = ["casino", "bet", "loan", "adult", "crypto", "viagra"];
  const spamAnchors = anchorTexts.filter((text) =>
    spamWords.some((word) => text.toLowerCase().includes(word))
  );

  score += spamAnchors.length * 10;

  return Math.max(0, Math.min(100, Math.round(score)));
}

function getTopAnchors(anchorTexts) {
  const frequency = {};

  anchorTexts.forEach((text) => {
    if (!text) return;
    frequency[text] = (frequency[text] || 0) + 1;
  });

  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([anchor, count]) => ({
      anchor,
      count,
    }));
}

function generateBacklinkOpportunities(websiteUrl) {
  return [
    {
      type: "Guest Posting",
      suggestion: "Find niche blogs related to your website and request guest posting opportunities.",
    },
    {
      type: "Directory Submission",
      suggestion: "Submit your website to trusted business directories and local listing platforms.",
    },
    {
      type: "Broken Link Outreach",
      suggestion: "Find broken links on related websites and offer your content as a replacement.",
    },
    {
      type: "Competitor Backlink Gap",
      suggestion: "Analyze competitor backlinks and target similar websites for outreach.",
    },
    {
      type: "Content Promotion",
      suggestion: "Create link-worthy guides, tools, or resources to attract natural backlinks.",
    },
  ];
}

exports.analyzeBacklinks = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        message: "URL is required",
      });
    }

    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    const $ = cheerio.load(response.data);

    const websiteHost = new URL(url).hostname.replace("www.", "");
    const httpsEnabled = url.startsWith("https");

    let internalLinks = 0;
    let externalLinks = 0;
    let dofollowLinks = 0;
    let nofollowLinks = 0;
    let brokenLinks = 0;

    const anchorTexts = [];

    $("a").each((i, el) => {
      let href = $(el).attr("href");

      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
        return;
      }

      try {
        href = new URL(href, url).href;
      } catch {
        return;
      }

      const rel = ($(el).attr("rel") || "").toLowerCase();
      const anchorText = getAnchorText($, el);

      anchorTexts.push(anchorText);

      if (rel.includes("nofollow")) {
        nofollowLinks++;
      } else {
        dofollowLinks++;
      }

      if (isExternalLink(href, websiteHost)) {
        externalLinks++;
      } else {
        internalLinks++;
      }
    });

    const spamScore = calculateSpamScore(externalLinks, nofollowLinks, anchorTexts);
    const authorityScore = calculateAuthorityScore(
      internalLinks,
      externalLinks,
      dofollowLinks,
      brokenLinks
    );
    const trustScore = calculateTrustScore(httpsEnabled, brokenLinks, spamScore);

    const topAnchors = getTopAnchors(anchorTexts);
    const backlinkOpportunities = generateBacklinkOpportunities(url);

    const query = `
      INSERT INTO backlink_reports
      (
        website_url,
        internal_links,
        external_links,
        dofollow_links,
        nofollow_links,
        broken_links,
        authority_score,
        trust_score,
        spam_score,
        top_anchors,
        backlink_opportunities
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      query,
      [
        url,
        internalLinks,
        externalLinks,
        dofollowLinks,
        nofollowLinks,
        brokenLinks,
        authorityScore,
        trustScore,
        spamScore,
        JSON.stringify(topAnchors),
        JSON.stringify(backlinkOpportunities),
      ],
      (err) => {
        if (err) {
          console.log("Backlink Save Error:", err.message);
        }
      }
    );

    res.status(200).json({
      url,
      internalLinks,
      externalLinks,
      dofollowLinks,
      nofollowLinks,
      brokenLinks,
      authorityScore,
      trustScore,
      spamScore,
      topAnchors,
      backlinkOpportunities,
    });
  } catch (error) {
    console.log(error.message);

    res.status(500).json({
      message: error.message,
    });
  }
};