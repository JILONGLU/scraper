var cheerio = require("cheerio");

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
// Entry is valid if forecastPrice >= 200 && actualPrice >= 100
function findValidEntries(dates, forecasts, actuals) {
  var indexes = [];
  for (i = 0; i < forecasts.length; i++) {
    if (forecasts[i] >= 200 && actuals[i] >= 100) {
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

module.exports = { getDateAndPrices, findValidEntries };
