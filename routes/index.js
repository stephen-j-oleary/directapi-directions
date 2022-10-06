
import { Router } from "express";
import authenticationController from "../controllers/authentication.js";
import directionsController from "../controllers/directions.js";

const router = Router();

router.use(authenticationController);
router.get("/directions", directionsController.getValidator, directionsController.getController);

export default router;
