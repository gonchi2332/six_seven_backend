import "./config/env.config";
import app from "./config/server.config";   
import { env } from "./config/env.config";
import { getConectionString } from "./config/database.config";

app.listen(env.PORT, () => {
  console.log(`Servidor escuchando en el Puerto: ${env.PORT}`);
  console.log(`Servidor funcionando en: http://localhost:${env.PORT}/health`);
  console.log(`Servidor conectado a la base de datos: ${getConectionString()}`);
});