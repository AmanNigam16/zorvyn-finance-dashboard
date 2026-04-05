import { Request, Response } from "express";
import { userService } from "./user.service";
import { successResponse } from "../../utils/api-response";

export class UserController {
  public createUser = async (req: Request, res: Response): Promise<void> => {
    const result = await userService.createUser(req.body);
    res.status(201).json(successResponse(result.message, { user: result.user }));
  };

  public listUsers = async (req: Request, res: Response): Promise<void> => {
    const result = await userService.listUsers(req.query as Record<string, string | undefined>);
    res.status(200).json(successResponse(result.message, { users: result.users }));
  };

  public getUserById = async (req: Request, res: Response): Promise<void> => {
    const result = await userService.getUserById(String(req.params.id));
    res.status(200).json(
      successResponse(result.message, {
        user: result.user
      })
    );
  };

  public updateUserStatus = async (req: Request, res: Response): Promise<void> => {
    const result = await userService.updateUserStatus(String(req.params.id), req.body.isActive);
    res.status(200).json(
      successResponse(result.message, {
        user: result.user
      })
    );
  };

  public updateUserRole = async (req: Request, res: Response): Promise<void> => {
    const result = await userService.updateUserRole(String(req.params.id), req.body.role);
    res.status(200).json(
      successResponse(result.message, {
        user: result.user
      })
    );
  };
}

export const userController = new UserController();
