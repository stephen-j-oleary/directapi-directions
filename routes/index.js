
import express from "express";
const router = express.Router();
import auth from "./middleware/auth.js";
import directions from "./directions.js";

router.use(auth); // Authentication

router.use("/directions", directions);

export default router;
