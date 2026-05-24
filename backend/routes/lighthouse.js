const express = require("express");

const router = express.Router();

const {
  runLighthouse,
} = require("../controllers/lighthouseController");

router.post("/analyze", runLighthouse);

module.exports = router;