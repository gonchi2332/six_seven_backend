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

router.patch(
  "/users/certificates",
  Authorization.tokenAuthorization,
  Authorization.onlyVerifiedUsers,
  MulterCheck.checkCertificateCoverImageErrors,
  CertificatesController.modifyUserCertificate
);

router.get(
  "/users/:username/certificates",
  CertificatesController.viewPublicCertificates
);

router.get(
  "/users/certificates",
  Authorization.tokenAuthorization,
  Authorization.onlyVerifiedUsers,
  CertificatesController.viewPrivateCertificates
);

router.delete(
  "/users/certificates",
  Authorization.tokenAuthorization,
  Authorization.onlyVerifiedUsers,
  CertificatesController.deleteUserCertificate
);

router.patch(
  "/users/certificates/visibility",
  Authorization.tokenAuthorization,
  Authorization.onlyVerifiedUsers,
  CertificatesController.modifyCertificatesVisibility
);

export default router;
