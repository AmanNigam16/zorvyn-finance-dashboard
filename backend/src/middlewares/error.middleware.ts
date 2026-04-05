import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { env } from "../config/env";
import { AppError } from "../utils/app-error";
import { errorResponse } from "../utils/api-response";
import { logger } from "../utils/logger";

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = "Internal server error.";
  let details: unknown;

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    details = error.details;
  } else if (error instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = "Validation failed.";
    details = Object.values(error.errors).map((item) => item.message);
  } else if (error instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = "Invalid resource identifier.";
  }

  logger.error(message, {
    statusCode,
    stack: env.nodeEnv === "development" ? error.stack : undefined
  });

  res.status(statusCode).json(errorResponse(message, details));
};
