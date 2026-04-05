import { NextFunction, Request, Response } from "express";
import { UserRole } from "../modules/user/user.model";
import { AppError } from "../utils/app-error";

export const authorize =
  (...allowedRoles: UserRole[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError("User context not found for authorization.", 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError("You do not have permission to perform this action.", 403));
    }

    return next();
  };
