import { FilterQuery, Types } from "mongoose";
import { AppError } from "../../utils/app-error";
import { logger } from "../../utils/logger";
import { User, UserDocument, UserRole } from "./user.model";

interface CreateUserPayload {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  isActive?: boolean;
}

interface ListUsersQuery {
  search?: string;
  role?: string;
  isActive?: string;
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

export class UserService {
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

  private ensureValidObjectId(id: string, fieldName: string): void {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError(`Invalid ${fieldName}.`, 400);
    }
  }

  private parseBoolean(value: unknown, fieldName: string): boolean {
    if (typeof value === "boolean") {
      return value;
    }

    if (typeof value === "string") {
      const normalizedValue = value.trim().toLowerCase();

      if (normalizedValue === "true") {
        return true;
      }

      if (normalizedValue === "false") {
        return false;
      }
    }

    throw new AppError(`Invalid ${fieldName}.`, 400);
  }

  private validateRole(role: unknown): UserRole {
    if (!role || !Object.values(UserRole).includes(role as UserRole)) {
      throw new AppError("Invalid user role provided.", 400);
    }

    return role as UserRole;
  }

  public async createUser(payload: CreateUserPayload) {
    const name = payload.name?.trim();
    const email = payload.email?.trim().toLowerCase();
    const password = payload.password?.trim();
    const role = payload.role ? this.validateRole(payload.role) : UserRole.VIEWER;
    const isActive = payload.isActive === undefined ? true : this.parseBoolean(payload.isActive, "isActive");

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

    const user = await User.create({
      name,
      email,
      password,
      role,
      isActive
    });

    logger.info("Admin created user successfully.", { userId: user._id.toString() });

    return {
      message: "User created successfully.",
      user: this.sanitizeUser(user)
    };
  }

  public async listUsers(query: ListUsersQuery) {
    const filters: FilterQuery<UserDocument> = {};
    const search = query.search?.trim();

    if (query.role) {
      filters.role = this.validateRole(query.role);
    }

    if (query.isActive !== undefined) {
      filters.isActive = this.parseBoolean(query.isActive, "isActive");
    }

    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    const users = await User.find(filters).sort({ createdAt: -1 });

    return {
      message: "Users retrieved successfully.",
      users: users.map((user) => this.sanitizeUser(user))
    };
  }

  public async getUserById(id: string) {
    this.ensureValidObjectId(id, "user id");

    const user = await User.findById(id);

    if (!user) {
      throw new AppError("User not found.", 404);
    }

    return {
      message: "User retrieved successfully.",
      user: this.sanitizeUser(user)
    };
  }

  public async updateUserStatus(id: string, isActiveValue: unknown) {
    this.ensureValidObjectId(id, "user id");

    const user = await User.findById(id);

    if (!user) {
      throw new AppError("User not found.", 404);
    }

    user.isActive = this.parseBoolean(isActiveValue, "isActive");
    await user.save();

    logger.info("User status updated successfully.", {
      userId: user._id.toString(),
      isActive: user.isActive
    });

    return {
      message: "User status updated successfully.",
      user: this.sanitizeUser(user)
    };
  }

  public async updateUserRole(id: string, roleValue: unknown) {
    this.ensureValidObjectId(id, "user id");

    const user = await User.findById(id);

    if (!user) {
      throw new AppError("User not found.", 404);
    }

    user.role = this.validateRole(roleValue);
    await user.save();

    logger.info("User role updated successfully.", {
      userId: user._id.toString(),
      role: user.role
    });

    return {
      message: "User role updated successfully.",
      user: this.sanitizeUser(user)
    };
  }
}

export const userService = new UserService();
