const express = require("express");
const puppeteer = require("puppeteer");
const bodyParser = require("body-parser");
const cors = require("cors");
const compression = require("compression");
const helmet = require("helmet");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use(compression());
app.use(helmet());

const PORT = parseInt(process.env.PORT) || 3200;

app.listen(PORT, async () => {
  console.log(`server is running on PORT:${PORT}`);
});

app.get("/scraper", async function (req, res) {
  const endpoint = req.query.endpoint;

  if (!endpoint) {
    return res.status(400).send("Needs an endpoint");
  }

  const data = await scrapeSite(endpoint);

  return res.status(200).send(data);
});

async function scrapeSite(endpoint) {
  console.log(`Scraping ${endpoint}...`);

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(
    `https://www.cashbackmonitor.com/cashback-store/${endpoint}`,
    { waitUntil: "domcontentloaded" }
  );

  // Set screen size
  await page.setViewport({ width: 1920, height: 1080 });

  const data = await page.evaluate(() => {
    let tables = [];

    for (let i = 0; i < 2; i++) {
      const tbody = document.querySelector(
        `body > div:nth-child(9) > table > tbody > tr:nth-child(1) > td.sp.half.tl > div:nth-child(${
          i + 1
        }) > table > tbody`
      );

      const trs = Array.from(tbody.querySelectorAll("tr"));

      const table = trs.map((tr, i) => {
        const cols = Array.from(tr.querySelectorAll("td"));
        const data = cols.map((col, j) => {
          return col.innerText.trim();
        });

        return {
          name: data[1],
          value: data[2],
        };
      });

      table.shift();

      tables.push(table);
    }

    for (let i = 0; i < 2; i++) {
      const tbody = document.querySelector(
        `body > div:nth-child(9) > table > tbody > tr:nth-child(1) >  td:nth-child(2) > div:nth-child(${
          i + 1
        }) > table > tbody`
      );

      const trs = Array.from(tbody.querySelectorAll("tr"));

      const table = trs.map((tr, i) => {
        const cols = Array.from(tr.querySelectorAll("td"));
        const data = cols.map((col, j) => {
          return col.innerText.trim();
        });

        return {
          name: data[1],
          value: data[2],
        };
      });

      table.shift();

      tables.push(table);
    }

    return tables;
  });

  await browser.close();

  console.log("Done scraping.");

  return data;
}
