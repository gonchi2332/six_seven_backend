import { Router } from "express";
import * as Authorization from "../middlewares/authorization.middleware";
import * as MulterCheck from "../middlewares/multer.middleware";
import * as SharpCheck from "../middlewares/sharp.middleware";
import * as RegisterPersonalInfoController from "../controllers/register.controller";

const router = Router();

router.post(
  "/users/personal-info", 
  Authorization.onlyRegisteredUsers, 
  MulterCheck.checkMulterErrors,
  SharpCheck.verifyProfilePictureDimensions,
  RegisterPersonalInfoController.registerPersonalInfo,
);
router.put(
  "/users/personal-info", 
  Authorization.onlyRegisteredUsers, 
  MulterCheck.checkMulterErrors,
  SharpCheck.verifyProfilePictureDimensions,
  RegisterPersonalInfoController.updatePersonalInfo,
);

export default router;