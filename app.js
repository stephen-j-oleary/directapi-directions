
import express from "express";
import cors from "cors";
import ensureCtype from "express-ensure-ctype";
import mongoose from "mongoose";
import config from "../config.js";
import routes from "./pages/index.js";
import errorHandling from "./middleware/errorHandling.js";

async function prepareExpressApp(app) {
  // Connect mongoose to database
  await mongoose.connect(config.db.url);

  // Body parsers
  app.use(express.json({ type: [ "json", "+json" ] })); // application/json and application/...+json

  // Setup cors
  app.use(cors({
    "origin": "*",
    "methods": "GET,POST,PATCH,DELETE"
  }));

  app.post("*", ensureCtype("application/json"));
  app.patch("*", ensureCtype([ "application/json-patch+json", "application/merge-patch+json" ]));

  // Api routes
  app.use("/api", routes);

  // Error handling
  app.use(errorHandling);
}

export default async (nextApp) => {
  const PORT = (process.env.NODE_ENV !== 'test') ? config.app.port : null;

  const app = express();

  await prepareExpressApp(app);

  // Setup the next.js request handler
  app.use((req, res) => nextApp.getRequestHandler()(req, res));

  // Listen on the specified port
  const server = app
    .listen(PORT, () => console.log(`> Running at http://localhost:${server.address().port}`))
    .on("error", e => { throw e });

  return server;
}
