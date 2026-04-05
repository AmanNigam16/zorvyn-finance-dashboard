import { Request, Response } from "express";
import { authService } from "./auth.service";
import { successResponse } from "../../utils/api-response";
import { AppError } from "../../utils/app-error";

export class AuthController {
  public register = async (req: Request, res: Response): Promise<void> => {
    const result = await authService.register(req.body);
    res.status(201).json(successResponse(result.message, { user: result.user }));
  };

  public login = async (req: Request, res: Response): Promise<void> => {
    const result = await authService.login(req.body);
    res.status(200).json(successResponse(result.message, { token: result.token, user: result.user }));
  };

  public profile = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AppError("Authenticated user context is missing.", 401);
    }

    const result = await authService.getProfile(req.user);
    res.status(200).json(successResponse(result.message, { user: result.user }));
  };
}

export const authController = new AuthController();
