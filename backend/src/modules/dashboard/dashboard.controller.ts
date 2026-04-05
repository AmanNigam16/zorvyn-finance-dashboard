import { Request, Response } from "express";
import { dashboardService } from "./dashboard.service";
import { successResponse } from "../../utils/api-response";

export class DashboardController {
  public getSummary = async (req: Request, res: Response): Promise<void> => {
    const result = await dashboardService.getSummary(req.query as Record<string, string | undefined>);
    res.status(200).json(
      successResponse(result.message, result.summary)
    );
  };

  public getTrends = async (req: Request, res: Response): Promise<void> => {
    const result = await dashboardService.getTrends(req.query as Record<string, string | undefined>);
    res.status(200).json(
      successResponse(result.message, {
        trends: result.trends
      })
    );
  };

  public getCategories = async (req: Request, res: Response): Promise<void> => {
    const result = await dashboardService.getCategories(req.query as Record<string, string | undefined>);
    res.status(200).json(
      successResponse(result.message, {
        categories: result.categories
      })
    );
  };

  public getRecentTransactions = async (req: Request, res: Response): Promise<void> => {
    const result = await dashboardService.getRecentTransactions(
      req.query as Record<string, string | undefined>
    );
    res.status(200).json(
      successResponse(result.message, {
        transactions: result.recentTransactions
      })
    );
  };
}

export const dashboardController = new DashboardController();
