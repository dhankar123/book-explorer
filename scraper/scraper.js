if (typeof File === "undefined") {
  global.File = class File extends Blob {
    constructor(parts, name, options = {}) {
      super(parts, options);
      this.name = name;
      this.lastModified = options.lastModified || Date.now();
    }
  };
}

const axios = require("axios");
const cheerio = require("cheerio");
const { Pool } = require("pg");
const cron = require("node-cron");

// PostgreSQL connection
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "book_explorer_db",
  password: "yash123",
  port: 5432,
});

const BASE_URL = "https://books.toscrape.com/";

// Main scraping function
const scrapeBooks = async () => {
  console.log("Starting scraping process...");
  try {
    let page = 1;
    let hasNext = true;

    while (hasNext) {
      const url = `${BASE_URL}catalogue/page-${page}.html`;
      console.log(`Scraping: ${url}`);

      const { data } = await axios.get(url);
      const $ = cheerio.load(data);

      const books = $(".product_pod");
      if (books.length === 0) {
        hasNext = false;
        break;
      }

      for (let i = 0; i < books.length; i++) {
        const book = books[i];
        const title = $(book).find("h3 a").attr("title").trim();
        const detailPath = $(book).find("h3 a").attr("href").replace("../", "catalogue/");
        const detail_url = `${BASE_URL}${detailPath}`;
        const price = parseFloat($(book).find(".price_color").text().replace("£", ""));
        const stock = $(book).find(".availability").text().trim();
        // Extract rating text like "One", "Two", etc.
        const ratingText = $(book).find(".star-rating").attr("class").replace("star-rating", "").trim();

        // Convert text rating to number 1–5
        const ratingMap = {
          "One": 1,
          "Two": 2,
          "Three": 3,
          "Four": 4,
          "Five": 5
        };

        const rating = ratingMap[ratingText] || null;

        const thumbnail_url = $(book).find(".image_container img").attr("src").replace("../../", `${BASE_URL}`);

        const stockText = $(book).find(".availability").text().trim();
        const in_stock = /In stock/i.test(stockText);
        const available_match = stockText.match(/\((\d+)\s+available\)/i);
        const available_count = available_match ? parseInt(available_match[1]) : null;

        await pool.query(
          `INSERT INTO books (title, price, stock_availability, rating, book_detail_url, thumbnail_image_url, updated_at)
   VALUES ($1,$2,$3,$4,$5,$6,NOW())
   ON CONFLICT (book_detail_url)
   DO UPDATE SET title=EXCLUDED.title, price=EXCLUDED.price, 
                 stock_availability=EXCLUDED.stock_availability,
                 rating=EXCLUDED.rating,
                 thumbnail_image_url=EXCLUDED.thumbnail_image_url,
                 updated_at=NOW()`,
          [title, price, in_stock, rating, detail_url, thumbnail_url]
        );

      }

      page++;
    }

    console.log("Scraping completed successfully!");
  } catch (error) {
    console.error("Error scraping books:", error);
  } finally {
    // Do not close pool if cron will run continuously
    if (!process.env.CRON_MODE) {
      await pool.end();
    }
  }
};

// Decide mode based on environment variable
if (process.env.CRON_MODE === "true") {
  console.log("Running in CRON mode. Scraper will run according to schedule.");

  // Run immediately once
  scrapeBooks();

  // Schedule cron job (every day at 2 AM)
  cron.schedule("0 2 * * *", () => {
    console.log("Running scheduled scrape...");
    scrapeBooks();
  });
} else {
  // Manual run: scrape once and exit
  scrapeBooks();
}
