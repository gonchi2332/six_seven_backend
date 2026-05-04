import { Router, Request, Response } from "express";
import RegisterRoutes from "../routes/register.routes";
import AuthRoutes from "../routes/auth.routes";
import VerificationRoutes from "../routes/verification.routes";
import UserSkillRoutes from "../routes/userskill.routes";
import SkillRoutes from "../routes/skill.routes";
import PlatformRoutes from "../routes/platform.routes";
import ProfileRoutes from "../routes/profile.routes";

const router = Router();

router.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "OK", 
    message: "Servidor Backend funcionando corretamente..." 
  });
});

router.use("/api/v2/auth", AuthRoutes);
router.use("/api/v2/register", RegisterRoutes);
router.use("/api/v2/verification", VerificationRoutes);
router.use("/api/v1/profile", ProfileRoutes);
router.use("/api/v1/skills", UserSkillRoutes);
router.use("/api/v1/skills", SkillRoutes);
router.use("/api/v1/platforms", PlatformRoutes);

router.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Ruta no encontrada..." });
});

export default router;