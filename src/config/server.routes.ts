import { Router, Request, Response } from "express";
import authRoutes from "../routes/auth.routes";

const router = Router();

router.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "OK", message: "Servidor Backend funcionando corretamente..." });
});

//router.use("api/", xRoutes);

router.use("/api/auth", authRoutes);

router.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Ruta no encontrada..." });
});

export default router;
