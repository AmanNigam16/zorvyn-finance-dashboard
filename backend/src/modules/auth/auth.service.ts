import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { AppError } from "../../utils/app-error";
import { logger } from "../../utils/logger";
import { User, UserDocument, UserRole } from "../user/user.model";

interface RegisterPayload {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
}

interface LoginPayload {
  email?: string;
  password?: string;
}

interface SanitizedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class AuthService {
  private sanitizeUser(user: UserDocument): SanitizedUser {
    const userObject = user.toObject<{
      _id: { toString(): string };
      name: string;
      email: string;
      role: UserRole;
      isActive: boolean;
      createdAt?: Date;
      updatedAt?: Date;
      password?: string;
    }>();
    const { _id, password: _password, ...safeUser } = userObject;

    return {
      id: _id.toString(),
      ...safeUser
    };
  }

  private generateToken(user: Pick<UserDocument, "_id" | "role" | "isActive">): string {
    return jwt.sign(
      {
        id: user._id.toString(),
        role: user.role,
        isActive: user.isActive
      },
      env.jwtSecret,
      { expiresIn: env.jwtExpiresIn as jwt.SignOptions["expiresIn"] }
    );
  }

  public async register(payload: RegisterPayload) {
    const name = payload.name?.trim();
    const email = payload.email?.trim().toLowerCase();
    const password = payload.password?.trim();

    if (!name || !email || !password) {
      throw new AppError("Name, email, and password are required.", 400);
    }

    if (password.length < 6) {
      throw new AppError("Password must be at least 6 characters long.", 400);
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new AppError("An account with this email already exists.", 409);
    }

    const isFirstUser = (await User.countDocuments()) === 0;

    const user = await User.create({
      name,
      email,
      password,
      role: isFirstUser ? UserRole.ADMIN : UserRole.VIEWER
    });

    logger.info("User registered successfully.", { userId: user._id.toString() });

    return {
      message: "User registered successfully.",
      user: this.sanitizeUser(user)
    };
  }

  public async login(payload: LoginPayload) {
    const email = payload.email?.trim().toLowerCase();
    const password = payload.password?.trim();

    if (!email || !password) {
      throw new AppError("Email and password are required.", 400);
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      throw new AppError("Invalid email or password.", 401);
    }

    if (!user.isActive) {
      throw new AppError("This user account is inactive.", 403);
    }

    const passwordMatches = await user.comparePassword(password);

    if (!passwordMatches) {
      throw new AppError("Invalid email or password.", 401);
    }

    const token = this.generateToken(user);

    logger.info("User logged in successfully.", { userId: user._id.toString() });

    return {
      message: "Login successful.",
      token,
      user: this.sanitizeUser(user)
    };
  }

  public async getProfile(user: Express.UserPayload) {
    const currentUser = await User.findById(user.id);

    if (!currentUser) {
      throw new AppError("Authenticated user not found.", 404);
    }

    if (!currentUser.isActive) {
      throw new AppError("This user account is inactive.", 403);
    }

    return {
      message: "Authenticated user profile retrieved successfully.",
      user: this.sanitizeUser(currentUser)
    };
  }
}

export const authService = new AuthService();
