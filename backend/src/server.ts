import mongoose from "mongoose";
import { app } from "./app";
import { connectDatabase } from "./config/database";
import { env } from "./config/env";
import { logger } from "./utils/logger";

const startServer = async (): Promise<void> => {
  await connectDatabase();

  app.listen(env.port, () => {
    logger.info(`Server listening on port ${env.port}.`);
  });
};

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  logger.warn("MongoDB connection closed. Server shutting down.");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await mongoose.connection.close();
  logger.warn("MongoDB connection closed. Server shutting down.");
  process.exit(0);
});

startServer().catch((error) => {
  logger.error("Server failed to start.", error);
  process.exit(1);
});
