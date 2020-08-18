const cheerio = require("cheerio");
const sgMail = require("@sendgrid/mail");
const axios = require("axios");
const webshot = require("node-webshot");
const fs = require("fs");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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

function parseDataAndSend() {
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
      console.log("found valid entries: ", validEntries);
      webshot(siteUrl, "attachment.png", function (err) {
        var pathToAttachment = "attachment.png";
        var attachment = fs.readFileSync(pathToAttachment).toString("base64");
        let emails = [
          "marymoyer@alphabowenergy.com",
          "kevinklimuk@alphabowenergy.com",
          "markzhao@alphabowenergy.com",
        ];
        emails.forEach((email) => {
          const msg = {
            to: email,
            from: "magicallv@alphabowenergy.com",
            subject: "Forecast/Actual Report",
            html: `Valid Entries:
            ${validEntries.map((entry) => {
              return JSON.stringify(entry.date);
            })}`,
            attachments: [
              {
                content: attachment,
                filename: "attachment.png",
                type: "image/png",
                disposition: "attachment",
              },
            ],
          };
          sgMail.send(msg);
          console.log(`email sent to ${email}`);
        });
      });
    } else {
      validEntries = [];
      console.log("found no valid entries");
    }
  });
}

// Parses DOM into objects we want (dates, forecastPrices, actualPrices)
function getDateAndPrices(row) {
  var date;
  var forecastPrice;
  var actualPrice;

  var cells = row.find("td");

  date = cheerio.load(cells[0]).text();
  forecastPrice = cheerio.load(cells[1]).text();
  actualPrice = cheerio.load(cells[2]).text();

  return { date, forecastPrice, actualPrice };
}

// Returns an array of objects containing the entries that are valid.
// Entry is valid if forecastPrice >= 200 || actualPrice >= 100
function findValidEntries(dates, forecasts, actuals) {
  var indexes = [];
  for (i = 0; i < forecasts.length; i++) {
    if (forecasts[i] >= 50 || actuals[i] >= 40) {
      indexes.push(i);
    }
  }

  return indexes.map((index) => {
    return {
      date: dates[index],
      forecastPrice: forecasts[index],
      actualPrice: actuals[index],
    };
  });
}

module.exports = { getDateAndPrices, findValidEntries, parseDataAndSend };
