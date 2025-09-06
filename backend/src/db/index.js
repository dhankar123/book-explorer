const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: "ppostgresql://book_explorer_database_user:hKeROzZnOhQvUEtHU3VLdnYvzQqJfv53@dpg-d2ts4avfte5s73ahrccg-a.oregon-postgres.render.com/book_explorer_database",
  ssl: { rejectUnauthorized: false } //  required for Render PG
});
module.exports = pool;


