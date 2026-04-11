import { Router } from "express";
import { upload } from "../config/multer.config";
import * as Authorization from "../middlewares/authorization.middleware";
import * as RegisterPersonalInfoController from "../controllers/register.controller";

const router = Router();

router.post(
  "/users/personal-info", 
  Authorization.onlyRegisteredUsers, 
  upload.single("profilePicture"),
  RegisterPersonalInfoController.registerPersonalInfo
);
router.put("/users/personal-info", Authorization.onlyRegisteredUsers, RegisterPersonalInfoController.updatePersonalInfo);

export default router;