import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { asyncHandler } from "../../utils/async-handler";
import { UserRole } from "./user.model";
import { userController } from "./user.controller";

const router = Router();

router.use(authenticate, authorize(UserRole.ADMIN));

router.post("/", asyncHandler(userController.createUser));
router.get("/", asyncHandler(userController.listUsers));
router.get("/:id", asyncHandler(userController.getUserById));
router.patch("/:id/status", asyncHandler(userController.updateUserStatus));
router.patch("/:id/role", asyncHandler(userController.updateUserRole));

export const userRoutes = router;
