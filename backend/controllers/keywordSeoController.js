const axios = require("axios");
const cheerio = require("cheerio");
const db = require("../config/db");

function getCountryFromTimezone(timezone) {
  if (!timezone) return "Global";

  const map = {
    "Asia/Karachi": "Pakistan",
    "Asia/Dubai": "United Arab Emirates",
    "Asia/Riyadh": "Saudi Arabia",
    "Asia/Kolkata": "India",
    "Europe/London": "United Kingdom",
    "America/New_York": "United States",
  };

  return map[timezone] || "Global";
}

function cleanWords(text) {
  const stopWords = [
    "the", "and", "for", "you", "your", "with", "this", "that",
    "are", "was", "from", "have", "has", "not", "but", "all",
    "our", "can", "will", "www", "com", "http", "https"
  ];

  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.includes(word));
}

function calculateKeywordDensity(words) {
  const totalWords = words.length;
  const frequency = {};

  words.forEach((word) => {
    frequency[word] = (frequency[word] || 0) + 1;
  });

  const density = Object.entries(frequency)
    .map(([keyword, count]) => ({
      keyword,
      count,
      density: Number(((count / totalWords) * 100).toFixed(2)),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  return density;
}

function generateKeywordGroups(mainKeyword, country) {
  const base = mainKeyword.toLowerCase();

  return {
    highKeywords: [
      {
        keyword: `${base}`,
        searchLevel: "High",
        country,
      },
      {
        keyword: `${base} services`,
        searchLevel: "High",
        country,
      },
    ],
    mediumKeywords: [
      {
        keyword: `best ${base}`,
        searchLevel: "Medium",
        country,
      },
      {
        keyword: `${base} near me`,
        searchLevel: "Medium",
        country,
      },
    ],
    lowKeywords: [
      {
        keyword: `affordable ${base}`,
        searchLevel: "Low",
        country,
      },
      {
        keyword: `${base} for small business`,
        searchLevel: "Low",
        country,
      },
    ],
  };
}

exports.analyzeKeywordSEO = async (req, res) => {
  try {
    const { url, mainKeyword, timezone } = req.body;

    if (!url || !mainKeyword) {
      return res.status(400).json({
        message: "URL and main keyword are required",
      });
    }

    const country = getCountryFromTimezone(timezone);

    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    const $ = cheerio.load(response.data);
    const bodyText = $("body").text().replace(/\s+/g, " ").trim();

    const words = cleanWords(bodyText);
    const keywordDensity = calculateKeywordDensity(words);

    const stuffing = keywordDensity.some((item) => item.density > 5);

    const {
      highKeywords,
      mediumKeywords,
      lowKeywords,
    } = generateKeywordGroups(mainKeyword, country);

    const query = `
      INSERT INTO keyword_seo_reports
      (
        url,
        country,
        main_keyword,
        high_keywords,
        medium_keywords,
        low_keywords,
        keyword_density,
        keyword_stuffing
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      query,
      [
        url,
        country,
        mainKeyword,
        JSON.stringify(highKeywords),
        JSON.stringify(mediumKeywords),
        JSON.stringify(lowKeywords),
        JSON.stringify(keywordDensity),
        stuffing,
      ],
      (err) => {
        if (err) {
          console.log("Keyword SEO Save Error:", err.message);
        }
      }
    );

    res.status(200).json({
      url,
      country,
      mainKeyword,
      highKeywords,
      mediumKeywords,
      lowKeywords,
      keywordDensity,
      keywordStuffing: stuffing,
      note:
        "Keyword groups are generated locally for now. WordStream/API integration can be added later when official access is available.",
    });
  } catch (error) {
    console.log(error.message);

    res.status(500).json({
      message: error.message,
    });
  }
};