import { Request, Response } from "express";
import { financeService } from "./finance.service";
import { AppError } from "../../utils/app-error";
import { successResponse } from "../../utils/api-response";

export class FinanceController {
  public createRecord = async (req: Request, res: Response): Promise<void> => {
    const createdBy = req.user?.id;

    if (!createdBy) {
      throw new AppError("Authenticated user context is missing.", 401);
    }

    const result = await financeService.createRecord(req.body, createdBy);
    res.status(201).json(successResponse(result.message, { record: result.record }));
  };

  public listRecords = async (req: Request, res: Response): Promise<void> => {
    const result = await financeService.listRecords(req.query as Record<string, string | undefined>);
    res.status(200).json(
      successResponse(result.message, {
        records: result.records,
        pagination: result.pagination
      })
    );
  };

  public getRecordById = async (req: Request, res: Response): Promise<void> => {
    const result = await financeService.getRecordById(String(req.params.id));
    res.status(200).json(successResponse(result.message, { record: result.record }));
  };

  public updateRecord = async (req: Request, res: Response): Promise<void> => {
    const result = await financeService.updateRecord(String(req.params.id), req.body);
    res.status(200).json(successResponse(result.message, { record: result.record }));
  };

  public deleteRecord = async (req: Request, res: Response): Promise<void> => {
    const result = await financeService.deleteRecord(String(req.params.id));
    res.status(200).json(successResponse(result.message, { record: result.record }));
  };
}

export const financeController = new FinanceController();
