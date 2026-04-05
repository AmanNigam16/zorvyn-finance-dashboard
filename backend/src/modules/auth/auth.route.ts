import { Router } from "express";
import { authController } from "./auth.controller";
import { asyncHandler } from "../../utils/async-handler";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

router.post("/register", asyncHandler(authController.register));
router.post("/login", asyncHandler(authController.login));
router.get("/profile", authenticate, asyncHandler(authController.profile));

export const authRoutes = router;
