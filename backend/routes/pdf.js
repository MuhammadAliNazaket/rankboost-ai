const express = require("express");

const router = express.Router();

const {
  generateSEOReportPDF,
} = require("../controllers/pdfController");

router.get("/seo-report/:reportId", generateSEOReportPDF);

module.exports = router;