const { Pool } = require("pg");

const pool = new Pool({
  host: "localhost",
  user: "postgres",
  password: "2912",
  database: "postgres",
  port: 5432
});

pool.connect()
  .then(() => console.log("PostgreSQL connected"))
  .catch(err => console.error("DB connection error", err));

module.exports = pool;
