
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes/index.js";

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
app.use(routes);

if (NODE_ENV !== "test") {
  app.listen(PORT, () => console.log(`App is listening at http://localhost:${PORT}`));
}

export default app;
