import { Router } from "express";
import * as Authorization from "../middlewares/authorization.middleware";
import * as MulterCheck from "../middlewares/multer.middleware";
import * as SharpCheck from "../middlewares/sharp.middleware";
import * as RegisterPersonalInfoController from "../controllers/register.controller";

const router = Router();

router.post(
  "/users/personal-info", 
  Authorization.tokenAuthorization, 
  Authorization.onlyVerifiedUsers,
  MulterCheck.checkMulterErrors,
  SharpCheck.verifyProfilePictureDimensions,
  RegisterPersonalInfoController.registerPersonalInfo,
);

router.put(
  "/users/personal-info", 
  Authorization.tokenAuthorization,
  Authorization.onlyVerifiedUsers,
  MulterCheck.checkMulterErrors,
  SharpCheck.verifyProfilePictureDimensions,
  RegisterPersonalInfoController.updatePersonalInfo,
);

router.get(
  "/users/:username/personal-info", 
  RegisterPersonalInfoController.viewPublicPersonalInfo
);

router.get(
  "/users/personal-info", 
  Authorization.tokenAuthorization,
  Authorization.onlyVerifiedUsers,
  RegisterPersonalInfoController.viewPrivatePersonalInfo
);

router.patch(
  "/users/personal-info/visibility",
  Authorization.tokenAuthorization,
  Authorization.onlyVerifiedUsers,
  RegisterPersonalInfoController.modifyPersonalInfoVisibility
);

export default router;
