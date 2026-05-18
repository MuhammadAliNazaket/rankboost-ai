const express = require("express");

const router = express.Router();

const {
  analyzeSEO,
  getReports,
} = require("../controllers/seoController");

router.post("/analyze", analyzeSEO);
router.get("/reports", getReports);

module.exports = router;