
import { Router } from "express";
import authenticationController from "../controllers/authentication.js";
import directions from "../controllers/directions.js";

const router = Router();

router.use(authenticationController);

router.get("/directions", directions.validator, directions.controller);

export default router;
