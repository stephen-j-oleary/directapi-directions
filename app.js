/**
 * @typedef {Object} GeneralError
 * @property {string} code
 * @property {string} message.required
 */

const express = require("express"),
      cors = require("cors");
require("dotenv").config();

const app = express(),
      port = process.env.PORT;

app.use(express.json()); // Parse application/json request body

app.use(cors());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

// API Endpoints
app.use("/", require("./routes"));

if (!module.parent) {
  app.listen(port, () => {
    console.log(`App is listening at http://localhost:${port}`);
  });
}

module.exports = app;