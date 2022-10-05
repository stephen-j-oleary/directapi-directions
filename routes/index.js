
import { Router } from "express";
import auth from "./middleware/auth.js";
import directions from "./directions.js";

const router = Router();

router.use(auth); // Authentication

router.use("/directions", directions);

export default router;
