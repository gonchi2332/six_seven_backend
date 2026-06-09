import { Router, Request, Response } from "express";
import { swagger } from "../config/swagger.config";
import swaggerUi from "swagger-ui-express";
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

/**
 * Endpoint de salud del servidor para verificar disponibilidad.
 * GET /health
 */
router.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "OK",
    message: "Servidor Backend funcionando corretamente..."
  });
});

/**
 * Endpoint de documentacion de la api del servidor para tener acceso a todos los endpoints existentes.
 * GET /health
 */
router.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swagger));

/**
 * Definición de prefijos de rutas para los diferentes módulos del sistema.
 */
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

/**
 * Manejador de rutas no encontradas (404).
 */
router.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Ruta no encontrada..." });
});

export default router;
