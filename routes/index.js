var express = require("express");
var router = express.Router();
var cheerio = require("cheerio");

const siteUrl =
  "http://ets.aeso.ca/ets_web/ip/Market/Reports/ActualForecastWMRQHReportServlet";
const axios = require("axios");

const fetchData = new Promise((resolve, reject) => {
  axios
    .get(siteUrl)
    .then((response) => {
      var result = response.data;
      resolve(cheerio.load(result));
    })
    .catch((error) => {
      reject(error);
    });
});

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

module.exports = router;
