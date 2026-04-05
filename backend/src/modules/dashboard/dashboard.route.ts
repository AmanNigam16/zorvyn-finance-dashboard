import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { asyncHandler } from "../../utils/async-handler";
import { UserRole } from "../user/user.model";
import { dashboardController } from "./dashboard.controller";

const router = Router();

router.use(authenticate);

router.get(
  "/summary",
  authorize(UserRole.ADMIN, UserRole.ANALYST, UserRole.VIEWER),
  asyncHandler(dashboardController.getSummary)
);
router.get(
  "/categories",
  authorize(UserRole.ADMIN, UserRole.ANALYST, UserRole.VIEWER),
  asyncHandler(dashboardController.getCategories)
);
router.get(
  "/trends",
  authorize(UserRole.ADMIN, UserRole.ANALYST, UserRole.VIEWER),
  asyncHandler(dashboardController.getTrends)
);
router.get(
  "/recent",
  authorize(UserRole.ADMIN, UserRole.ANALYST, UserRole.VIEWER),
  asyncHandler(dashboardController.getRecentTransactions)
);

export const dashboardRoutes = router;
