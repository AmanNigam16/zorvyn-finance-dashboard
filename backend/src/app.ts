import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";
import { authRoutes } from "./modules/auth/auth.route";
import { dashboardRoutes } from "./modules/dashboard/dashboard.route";
import { financeRoutes } from "./modules/finance/finance.route";
import { userRoutes } from "./modules/user/user.route";
import { successResponse } from "./utils/api-response";

const app = express();

app.use(
  cors({
    origin: env.corsOrigin === "*" ? true : env.corsOrigin,
    credentials: true
  })
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json(
    successResponse("Zorvyn backend is running.", {
      status: "ok"
    })
  );
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/finance", financeRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export { app };
