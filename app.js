
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes/index.js";

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(express.json()); // Parse application/json request body

app.use(cors());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

// API Endpoints
app.use("/", routes);

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`App is listening at http://localhost:${port}`);
  });
}

export default app;
