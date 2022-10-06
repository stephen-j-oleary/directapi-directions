
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routesRouter from "./routes/index.js";
import errorRouter from "./routes/error.js";

dotenv.config();
const PORT = process.env.PORT;
const NODE_ENV = process.env.NODE_ENV;

const app = express();

app.use(express.json());
app.use(cors());
app.use((_, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});
app.use(routesRouter);
app.use(errorRouter);

if (NODE_ENV !== "test") {
  app.listen(PORT, () => console.log(`App is listening at http://localhost:${PORT}`));
}

export default app;
