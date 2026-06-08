import express, { Application } from "express";
import cors from "cors";
import router from "../routes/server.routes";

/*Esta línea de código exporta una constante denominada `app` de tipo `Application` que se inicializa con
el resultado de llamar a la función `express()`. En este contexto, `express()` es una función que
crea una aplicación Express. Al exportar la constante `app`, se permite que otras partes del código base accedan
y utilice esta instancia de la aplicación Express. */
export const app: Application = express();

/*La línea `app.use(cors());` está configurando el middleware CORS (Cross-Origin Resource Sharing) en la
aplicacion express por medio de la constante `app`. CORS es un mecanismo que permite solicitar recursos en una
página web de otro dominio fuera del dominio desde el cual se originó el recurso. */
app.use(cors());

/*La línea `app.use(express.json());` está configurando una función de middleware en la aplicacion express por
medio de la constante `app` para analizar solicitudes entrantes con cargas JSON. Esta función de middleware 
analiza el mensaje entrante de la solicitud (body), que está en formato JSON y lo pone a disposición en la 
propiedad `req.body` de la solicitud de objeto. Esto permite que la aplicación funcione fácilmente con datos 
JSON enviados en el cuerpo de la solicitud. */
app.use(express.json());

/*La línea `app.use(express.urlencoded({ extended: true }));` está configurando una función de middleware en
la aplicacion express por medio de la constante `app` para analizar solicitudes entrantes con cargas útiles 
codificadas en URL. */
app.use(express.urlencoded({ extended: true }));

/*La línea `app.use("/", router);` está configurando una función de middleware en la aplicacion express
`app`. */
app.use("/", router);