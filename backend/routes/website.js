const express = require("express");

const router = express.Router();

const {
  addWebsite,
} = require("../controllers/websiteController");

router.post("/add", addWebsite);

module.exports = router;