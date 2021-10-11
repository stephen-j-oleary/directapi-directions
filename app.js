/**
 * @typedef {Object} GeneralError
 * @property {string} code - enum:invalid_request, invalid_client, invalid_grant, unauthorized_client, unsupported_grant_type, invalid_scope
 * @property {string} message.required
 */

const express = require("express"),
      cors = require("cors"),
      bodyParser = require("body-parser");
require("dotenv").config();

const app = express(),
      port = process.env.PORT;

app.use("/docs", require("./routes/docs")); // Automatically generated documentation

app.use(bodyParser.json()); // Parse application/json request body

app.use(cors());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.use("/", require("./routes/authentication")); // Run authentiaction middleware

app.use("/search", require("./routes/search"));

app.use("/directions", require("./routes/directions"));

app.use("/", (req, res) => {
  res.json({
    description: "This is the main API route",
    locals: res.locals
  });
});

if (!module.parent) {
  app.listen(port, () => {
    console.log(`App is listening at http://localhost:${port}`);
  });
}

module.exports = app;