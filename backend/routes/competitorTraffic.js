const express = require("express");

const router = express.Router();

const {
  analyzeCompetitorTraffic,
} = require("../controllers/competitorTrafficController");

router.post("/analyze", analyzeCompetitorTraffic);

module.exports = router;