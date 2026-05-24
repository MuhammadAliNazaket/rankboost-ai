const express = require("express");

const router = express.Router();

const {
  analyzeTechnicalSEO,
} = require("../controllers/technicalSeoController");

router.post("/analyze", analyzeTechnicalSEO);

module.exports = router;