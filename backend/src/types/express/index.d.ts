import { UserRole } from "../../modules/user/user.model";

declare global {
  namespace Express {
    interface UserPayload {
      id: string;
      role: UserRole;
      isActive: boolean;
    }

    interface Request {
      user?: UserPayload;
    }
  }
}

export {};
