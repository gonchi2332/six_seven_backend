import { Router, Request, Response } from "express";
import RegisterRoutes from "./register.routes";
import AuthRoutes from "./auth.routes";
import VerificationRoutes from "./verification.routes";
import UserSkillRoutes from "./userskill.routes";
import SkillRoutes from "./skill.routes";
import PlatformRoutes from "./platform.routes";
import ProfileRoutes from "./profile.routes";
import LaboralExpRoutes from "./laboralexperience.routes";
import ProjectRoutes from "./project.routes";
import EducationRoutes from "./education.routes";
import CertificateRoutes from "./certificates.routes";
import ReportRoutes from "./report.routes";

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
router.use("/api/v1/portfolio", LaboralExpRoutes);
router.use("/api/v1/portfolio", ProjectRoutes);
router.use("/api/v1/portfolio", EducationRoutes);
router.use("/api/v1/portfolio", CertificateRoutes);
router.use("/api/v1/reports", ReportRoutes);

router.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Ruta no encontrada..." });
});

export default router;
