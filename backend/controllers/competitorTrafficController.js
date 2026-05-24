const axios = require("axios");
const cheerio = require("cheerio");
const db = require("../config/db");

function cleanWords(text) {
  const stopWords = [
    "the", "and", "for", "you", "your", "with", "this",
    "that", "are", "was", "from", "have", "has", "not",
    "but", "all", "our", "can", "will",
  ];

  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(
      (word) =>
        word.length > 2 &&
        !stopWords.includes(word)
    );
}

function getTopKeywords(words) {
  const frequency = {};

  words.forEach((word) => {
    frequency[word] = (frequency[word] || 0) + 1;
  });

  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([keyword, count]) => ({
      keyword,
      count,
    }));
}

function getSocialLinks($) {
  const socialLinks = [];

  $("a").each((i, el) => {
    const href = $(el).attr("href");

    if (!href) return;

    const lower = href.toLowerCase();

    if (
      lower.includes("facebook") ||
      lower.includes("instagram") ||
      lower.includes("linkedin") ||
      lower.includes("twitter") ||
      lower.includes("x.com") ||
      lower.includes("youtube") ||
      lower.includes("tiktok")
    ) {
      socialLinks.push(href);
    }
  });

  return [...new Set(socialLinks)];
}

function estimateTraffic(data) {
  let score = 0;

  score += Math.min(data.wordCount / 500, 20);

  score += Math.min(data.totalLinks / 20, 20);

  score += Math.min(data.totalImages / 10, 10);

  score += Math.min(data.socialLinks.length * 5, 20);

  score += Math.min(data.topKeywords.length * 2, 20);

  let monthlyVisits = "1K - 5K";
  let trafficPotential = "Low";
  let topTrafficSource = "Organic Search";

  if (score > 70) {
    monthlyVisits = "50K - 100K";
    trafficPotential = "Very High";
  } else if (score > 50) {
    monthlyVisits = "20K - 50K";
    trafficPotential = "High";
  } else if (score > 30) {
    monthlyVisits = "5K - 20K";
    trafficPotential = "Medium";
  }

  if (data.socialLinks.length > 3) {
    topTrafficSource = "Social Media";
  }

  return {
    estimatedMonthlyVisits: monthlyVisits,
    trafficPotential,
    topTrafficSource,
  };
}

async function analyzeWebsite(url) {
  const response = await axios.get(url, {
    timeout: 10000,
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
  });

  const $ = cheerio.load(response.data);

  const bodyText = $("body")
    .text()
    .replace(/\s+/g, " ")
    .trim();

  const words = cleanWords(bodyText);

  return {
    wordCount: words.length,
    totalLinks: $("a").length,
    totalImages: $("img").length,
    topKeywords: getTopKeywords(words),
    socialLinks: getSocialLinks($),
  };
}

exports.analyzeCompetitorTraffic = async (req, res) => {
  try {
    const { websiteUrl, competitorUrl } = req.body;

    if (!websiteUrl || !competitorUrl) {
      return res.status(400).json({
        message:
          "Website URL and competitor URL are required",
      });
    }

    const websiteData = await analyzeWebsite(
      websiteUrl
    );

    const competitorData = await analyzeWebsite(
      competitorUrl
    );
    const websiteTraffic = estimateTraffic(websiteData);

    const competitorTraffic = estimateTraffic(
    competitorData
    );

    let estimatedWinner = "Equal";

    let websiteScore = 0;
    let competitorScore = 0;

    if (
      websiteData.wordCount >
      competitorData.wordCount
    ) {
      websiteScore++;
    } else {
      competitorScore++;
    }

    if (
      websiteData.totalLinks >
      competitorData.totalLinks
    ) {
      websiteScore++;
    } else {
      competitorScore++;
    }

    if (
      websiteData.socialLinks.length >
      competitorData.socialLinks.length
    ) {
      websiteScore++;
    } else {
      competitorScore++;
    }

    if (websiteScore > competitorScore) {
      estimatedWinner = "Website";
    } else if (
      competitorScore > websiteScore
    ) {
      estimatedWinner = "Competitor";
    }

    const query = `
      INSERT INTO competitor_traffic_reports
      (
        website_url,
        competitor_url,

        website_word_count,
        competitor_word_count,

        website_total_links,
        competitor_total_links,

        website_total_images,
        competitor_total_images,

        website_social_links,
        competitor_social_links,

        website_top_keywords,
        competitor_top_keywords,

        websiteTraffic.estimatedMonthlyVisits,
        competitorTraffic.estimatedMonthlyVisits,

        websiteTraffic.trafficPotential,
        competitorTraffic.trafficPotential,

        websiteTraffic.topTrafficSource,
        competitorTraffic.topTrafficSource,

       website_estimated_monthly_visits,
        competitor_estimated_monthly_visits,

        website_traffic_potential,
        competitor_traffic_potential,

        website_top_traffic_source,
        competitor_top_traffic_source,

estimated_winner
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      query,
      [
        websiteUrl,
        competitorUrl,

        websiteData.wordCount,
        competitorData.wordCount,

        websiteData.totalLinks,
        competitorData.totalLinks,

        websiteData.totalImages,
        competitorData.totalImages,

        JSON.stringify(
          websiteData.socialLinks
        ),

        JSON.stringify(
          competitorData.socialLinks
        ),

        JSON.stringify(
          websiteData.topKeywords
        ),

        JSON.stringify(
          competitorData.topKeywords
        ),

        estimatedWinner,
      ],
      (err) => {
        if (err) {
          console.log(
            "Competitor Save Error:",
            err.message
          );
        }
      }
    );

            res.status(200).json({
            website: {
                ...websiteData,
                ...websiteTraffic,
            },

            competitor: {
                ...competitorData,
                ...competitorTraffic,
            },

            estimatedWinner,
            });
            } catch (error) {
          console.log(error.message);

    res.status(500).json({
      message: error.message,
    });
  }
};