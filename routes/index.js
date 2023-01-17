
import { Router } from "express";
import authenticationController from "../controllers/authentication.js";
import search from "../controllers/search.js";
import directions from "../controllers/directions.js";
import autocompleteController from "../controllers/autocomplete.js";

const router = Router();

router.use(authenticationController);

router.get("/search", search.validator, search.controller);
router.get("/directions", directions.validator, directions.controller);
router.get("/autocomplete", ...autocompleteController);

export default router;
