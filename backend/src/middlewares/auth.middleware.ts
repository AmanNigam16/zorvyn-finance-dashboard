import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { User, UserRole } from "../modules/user/user.model";
import { AppError } from "../utils/app-error";

interface JwtPayload {
  id: string;
  role: UserRole;
  isActive: boolean;
  iat?: number;
  exp?: number;
}

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    return next(new AppError("Authentication token is missing or malformed.", 401));
  }

  const token = authorizationHeader.split(" ")[1];
  let decoded: JwtPayload;

  try {
    decoded = jwt.verify(token, env.jwtSecret) as JwtPayload;
  } catch (_error) {
    return next(new AppError("Invalid or expired authentication token.", 401));
  }

  if (!decoded.isActive) {
    return next(new AppError("This user account is inactive.", 403));
  }

  try {
    const currentUser = await User.findById(decoded.id).select("_id role isActive");

    if (!currentUser) {
      return next(new AppError("Authenticated user no longer exists.", 401));
    }

    if (!currentUser.isActive) {
      return next(new AppError("This user account is inactive.", 403));
    }

    req.user = {
      id: currentUser._id.toString(),
      role: currentUser.role,
      isActive: currentUser.isActive
    };

    return next();
  } catch (error) {
    return next(error);
  }
};
