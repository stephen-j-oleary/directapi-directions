
import { Router } from "express";
import authentication from "../controllers/authentication.js";
import directions from "../controllers/directions.js";

const router = Router();

router.use(authentication);
router.get("/directions", directions.getValidator, directions.getController);

export default router;
