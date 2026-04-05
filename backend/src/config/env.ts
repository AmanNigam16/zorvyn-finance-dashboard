import dotenv from "dotenv";

dotenv.config();

type NodeEnvironment = "development" | "production" | "test";

const getRequiredEnv = (key: string): string => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

export const env = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: (process.env.NODE_ENV as NodeEnvironment) || "development",
  mongodbUri: getRequiredEnv("MONGODB_URI"),
  jwtSecret: getRequiredEnv("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  corsOrigin: process.env.CORS_ORIGIN || "*"
};
