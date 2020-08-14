const express = require("express");
const router = express.Router();
const cheerio = require("cheerio");
const axios = require("axios");
const Shell = require("node-powershell");
const sgMail = require("@sendgrid/mail");
const webshot = require("node-webshot");
const fs = require("fs");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const { getDateAndPrices, findValidEntries } = require("../helpers.js");

const siteUrl =
  "http://ets.aeso.ca/ets_web/ip/Market/Reports/ActualForecastWMRQHReportServlet";

const fetchData = new Promise((resolve, reject) => {
  axios
    .get(siteUrl)
    .then((response) => {
      resolve(response.data);
    })
    .catch((error) => {
      reject(error);
    });
});

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Price Scraper" });
});

var validEntries;
router.post("/start_polling", function (req, res, next) {
  setInterval(function () {
    fetchData.then((pageData) => {
      var $ = cheerio.load(pageData);
      var table = $("table[border='1']");
      var rows = $(table.find("tr"));
      var dates = [];
      var forecastPrices = [];
      var actualPrices = [];

      for (var i = 1; i < rows.length; i++) {
        var data = getDateAndPrices($(rows[i]));
        dates.push(data["date"]);
        forecastPrices.push(data["forecastPrice"]);
        actualPrices.push(data["actualPrice"]);
      }
      validEntries = findValidEntries(dates, forecastPrices, actualPrices);

      if (validEntries.length !== 0) {
        webshot(siteUrl, "test.png", function (err) {
          var pathToAttachment = "test.png";
          var attachment = fs.readFileSync(pathToAttachment).toString("base64");
          const msg = {
            // to: "markzhao@alphabowenergy.com",
            to: "changbhc@gmail.com",
            from: "magicallv@alphabowenergy.com",
            subject: `Sending with Twilio SendGrid is Fun`,
            html: `These are the entries that are valid:
            ${[{ hello: "world" }].map((entry) => {
              return JSON.stringify(entry);
            })}
            `,
            attachments: [
              {
                content: attachment,
                filename: "Report.png",
                type: "image/png",
                disposition: "attachment",
              },
            ],
          };
          sgMail.send(msg);
        });
      } else {
        validEntries = [];
      }
    });
  }, 1800000);

  res.redirect("/");
});

module.exports = router;
