import { OpenAPIObject } from "openapi3-ts/oas30";
import * as yaml from "js-yaml";
import * as path from "path";
import * as fs from "fs";

/*Este fragmento de código crea una constante `swaggerFile` que almacenara todo el contenido del archivo 
`swagger.yaml` que incluye todo el contenido completo de la documentacion de la API de la aplicacion */
const swagerFile = fs.readFileSync(path.join(process.cwd(), "src/documentation/swagger.yaml"), "utf-8");

/*Este fragmento de código crea un objeto `swagger` usando la biblioteca js-yaml en TypeScript
El objeto `swagger` está configurado para procesar todo el contenido necesario almacenado en la contsnta
`swaggerFile` de tal forma que pueda ser usado posteriormente para la creacion de la interfaz grafica de
la ruta de documentacion respectiva. 
Aquí hay un desglose de la configuración: */
export const swagger: OpenAPIObject = yaml.load(swagerFile) as OpenAPIObject;