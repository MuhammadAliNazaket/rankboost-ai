const express = require("express");

const router = express.Router();

const {
  analyzeBacklinks,
} = require("../controllers/backlinkController");

router.post("/analyze", analyzeBacklinks);

module.exports = router;