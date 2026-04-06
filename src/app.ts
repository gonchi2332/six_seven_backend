import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "OK", message: "Servidor Backend funcionando corretamente..." });
});

app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Ruta Invalida." });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el Puerto: ${PORT}`);
  console.log(`Servidor funcionando en: http://localhost:${PORT}/health`);
});

export default app;