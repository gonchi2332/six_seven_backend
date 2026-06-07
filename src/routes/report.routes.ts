import { Router } from "express";
import * as Authorization from "../middlewares/authorization.middleware";
import * as ReportController from "../controllers/report.controller";

const router = Router();

router.get(
  "/user",
  Authorization.tokenAuthorization, 
  ReportController.getReports,
);

export default router;