const express = require("express");

const router = express.Router();

const {
  analyzeKeywordSEO,
} = require("../controllers/keywordSeoController");

router.post("/analyze", analyzeKeywordSEO);

module.exports = router;