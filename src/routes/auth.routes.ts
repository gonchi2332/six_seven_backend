import { Router } from "express";
import * as AuthController from "../controllers/auth.controller";

const router = Router();

router.post("/users/credentials-info", AuthController.registerUser);

export default router;
