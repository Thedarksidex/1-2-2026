const express = require("express");
const app = express();
const pool = require("./config/db");

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server + PostgreSQL connected");
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
