
import { Router } from "express";
import authenticationController from "../controllers/authentication.js";
import search from "../controllers/search.js";
import directions from "../controllers/directions.js";

const router = Router();

router.use(authenticationController);

router.get("/search", search.validator, search.controller);
router.get("/directions", directions.validator, directions.controller);

export default router;
