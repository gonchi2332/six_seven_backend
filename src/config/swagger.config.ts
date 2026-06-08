import { OpenAPIObject } from "openapi3-ts/oas30";
import * as yaml from "js-yaml";
import * as path from "path";
import * as fs from "fs";

const swagerFile = fs.readFileSync(path.join(process.cwd(), "src/documentation/swagger.yaml"), "utf-8");

export const swagger: OpenAPIObject = yaml.load(swagerFile) as OpenAPIObject;