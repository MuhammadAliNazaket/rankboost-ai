const db = require("../config/db");
const axios = require("axios");
const cheerio = require("cheerio");

exports.analyzeSEO = async (req, res) => {
  try {
    const { url, website_id } = req.body;

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

    const html = response.data;
    const $ = cheerio.load(html);

    const title = $("title").text().trim();

    const metaDescription =
      $('meta[name="description"]').attr("content") || "";

    const h1Tags = [];
    $("h1").each((i, el) => {
      const text = $(el).text().trim();
      if (text) h1Tags.push(text);
    });

    const h2Tags = [];
    $("h2").each((i, el) => {
      const text = $(el).text().trim();
      if (text) h2Tags.push(text);
    });

    const totalImages = $("img").length;
    let imagesWithoutAlt = 0;

    $("img").each((i, el) => {
      const alt = $(el).attr("alt");
      if (!alt || alt.trim() === "") {
        imagesWithoutAlt++;
      }
    });

    const totalLinks = $("a").length;

    const bodyText = $("body").text().replace(/\s+/g, " ").trim();
    const wordCount = bodyText ? bodyText.split(" ").length : 0;

    let seoScore = 100;
    const suggestions = [];

    if (!title) {
      seoScore -= 15;
      suggestions.push("Add a proper page title.");
    } else if (title.length < 30 || title.length > 60) {
      seoScore -= 8;
      suggestions.push("Keep title length between 30 and 60 characters.");
    }

    if (!metaDescription) {
      seoScore -= 15;
      suggestions.push("Add a meta description.");
    } else if (metaDescription.length < 120 || metaDescription.length > 160) {
      seoScore -= 8;
      suggestions.push("Keep meta description between 120 and 160 characters.");
    }

    if (h1Tags.length === 0) {
      seoScore -= 15;
      suggestions.push("Add one clear H1 heading.");
    } else if (h1Tags.length > 1) {
      seoScore -= 8;
      suggestions.push("Use only one main H1 heading.");
    }

    if (imagesWithoutAlt > 0) {
      seoScore -= 10;
      suggestions.push("Add alt text to all important images.");
    }

    if (wordCount < 300) {
      seoScore -= 10;
      suggestions.push("Add more useful page content. Aim for at least 300 words.");
    }

    if (totalLinks < 5) {
      seoScore -= 5;
      suggestions.push("Add more useful internal or external links.");
    }

    if (seoScore < 0) seoScore = 0;

    const aiSuggestions = "AI suggestions will be added later.";

    const insertQuery = `
      INSERT INTO seo_reports 
      (website_id, url, seo_score, title, title_length, meta_description, meta_description_length, h1_tags, h2_tags, total_images, images_without_alt, total_links, word_count, suggestions)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      insertQuery,
      [
        website_id || null,
        url,
        seoScore,
        title,
        title.length,
        metaDescription,
        metaDescription.length,
        JSON.stringify(h1Tags),
        JSON.stringify(h2Tags),
        totalImages,
        imagesWithoutAlt,
        totalLinks,
        wordCount,
        JSON.stringify(suggestions),
      ],
      (err) => {
        if (err) {
          console.log("Report Save Error:", err.message);
        }
      }
    );

    res.status(200).json({
      url,
      seoScore,
      title,
      titleLength: title.length,
      metaDescription,
      metaDescriptionLength: metaDescription.length,
      h1Tags,
      h2Tags,
      totalImages,
      imagesWithoutAlt,
      totalLinks,
      wordCount,
      suggestions,
      aiSuggestions,
    });
  } catch (error) {
    console.log(error.message);

    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getReports = (req, res) => {
  try {
    const query = "SELECT * FROM seo_reports ORDER BY created_at DESC";

    db.query(query, (err, results) => {
      if (err) {
        return res.status(500).json({
          message: err.message,
        });
      }

      res.status(200).json(results);
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};