
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routesRouter from "./routes/index.js";
import errorController from "./controllers/error.js";

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const PORT = process.env.PORT;

const app = express();

app.use(express.json());
app.use(cors());
app.use((_, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});
app.use(routesRouter);
app.use(...errorController);

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => console.log(`App is listening at http://localhost:${PORT}`));
}

export default app;
