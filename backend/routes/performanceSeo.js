const express = require("express");

const router = express.Router();

const {
  analyzePerformanceSEO,
} = require("../controllers/performanceSeoController");

router.post("/analyze", analyzePerformanceSEO);

module.exports = router;