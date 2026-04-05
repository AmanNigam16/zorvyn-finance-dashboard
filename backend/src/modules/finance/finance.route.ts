import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { asyncHandler } from "../../utils/async-handler";
import { UserRole } from "../user/user.model";
import { financeController } from "./finance.controller";

const router = Router();

router.use(authenticate);

router.post("/", authorize(UserRole.ADMIN), asyncHandler(financeController.createRecord));
router.get(
  "/",
  authorize(UserRole.ADMIN, UserRole.ANALYST),
  asyncHandler(financeController.listRecords)
);
router.get(
  "/:id",
  authorize(UserRole.ADMIN, UserRole.ANALYST),
  asyncHandler(financeController.getRecordById)
);
router.patch("/:id", authorize(UserRole.ADMIN), asyncHandler(financeController.updateRecord));
router.delete("/:id", authorize(UserRole.ADMIN), asyncHandler(financeController.deleteRecord));

export const financeRoutes = router;
