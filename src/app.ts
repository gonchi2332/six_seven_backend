import "./config/env.config";
import app from "./config/server.config";   
import { env } from "./config/env.config";

app.listen(env.PORT, () => {
  console.log(`Servidor escuchando en el Puerto: ${env.PORT}`);
  console.log(`Servidor funcionando en: http://localhost:${env.PORT}/health`);
});