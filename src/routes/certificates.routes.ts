import { Router } from "express";
import * as Authorization from "../middlewares/authorization.middleware";
import * as MulterCheck from "../middlewares/multer.middleware";
import * as CertificatesController from "../controllers/certificate.controller";

const router = Router();

router.post(
  "/users/certificates",
  Authorization.tokenAuthorization,
  Authorization.onlyVerifiedUsers,
  MulterCheck.checkCertificateCoverImageErrors,
  CertificatesController.registerUserCertificate
);

export default router;