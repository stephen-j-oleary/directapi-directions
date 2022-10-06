
import { Router } from "express";
import errorController from "../controllers/error.js";

const router = Router();

router.use(errorController.jsonValidationError);
router.use(errorController.authError);
router.use(errorController.apiError);
router.use(errorController.generalError);

export default router;
