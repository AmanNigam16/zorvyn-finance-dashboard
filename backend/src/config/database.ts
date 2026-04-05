import mongoose from "mongoose";
import { env } from "./env";
import { logger } from "../utils/logger";

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(env.mongodbUri);
    logger.info(`MongoDB connected in ${env.nodeEnv} mode.`);
  } catch (error) {
    logger.error("Failed to connect to MongoDB.", error);
    throw error;
  }
};
