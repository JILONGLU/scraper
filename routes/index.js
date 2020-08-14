const express = require("express");
const router = express.Router();

const {
  getDateAndPrices,
  findValidEntries,
  parseDataAndSend,
} = require("../helpers.js");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Price Scraper", polling: false });
});

var sender;

router.post("/start_polling", function (req, res, next) {
  var validEntries;
  sender = setInterval(parseDataAndSend, 1800000);

  res.render("index", { title: "Price Scraper", polling: true });
});

router.post("/stop_polling", function (req, res, next) {
  clearInterval(sender);

  res.render("index", { title: "Price Scraper", polling: false });
});

module.exports = router;
