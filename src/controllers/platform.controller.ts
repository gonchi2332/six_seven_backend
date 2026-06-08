import { Request, Response } from "express";
import * as TokenTypes from "../types/token.types";
import * as PlatformValidator from "../validators/platform.validator";
import * as PlatformService from "../services/platform.service";

/**
 *La funcion `saveLinkedinProfile` en TypeScript maneja el guardado del perfil de LinkedIn de un usuario con
 *validacion y manejo de errores.
 *@param {Request} req - El parametro `req` en la funcion `saveLinkedinProfile` es un objeto
 *que representa la solicitud HTTP. Contiene informacion sobre la solicitud realizada al servidor, como
 *los encabezados de la solicitud, cuerpo, parametros y otros detalles. En este contexto, se utiliza para
 *acceder a la informacion del usuario y a los datos del perfil de LinkedIn enviados en la solicitud.
 *@param {Response} res - El parametro `res` en la funcion `saveLinkedinProfile` es un objeto
 *que representa la respuesta HTTP que la funcion enviara de vuelta al cliente. Es de tipo
 *`Response`, que es tipicamente proporcionado por frameworks web como Express en Node.js. El objeto `res`
 *se utiliza para enviar la respuesta al cliente, incluyendo codigos de estado y datos en formato JSON.
 *@returns La funcion `saveLinkedinProfile` devuelve una respuesta basada en el resultado de la
 *validacion y las funciones de servicio llamadas dentro del bloque try. A continuacion se detalla:
 */
export async function saveLinkedinProfile(req: Request, res: Response) {
  try {
    const validations = PlatformValidator.saveLinkedinProfileValidation(
      req.user as TokenTypes.TokenPayload, req.body);
    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }

    const response = await PlatformService.saveUserLinkedin(
      req.user as TokenTypes.TokenPayload, req.body);
    if (!response.result) {
      return res.status(400).json({ success: false, message: response.messageState });
    }
    return res.status(200).json({ success: true, message: response.messageState });
  } catch (err) {
    return res.status(500).json({ 
      success: false,
      message: `Error en el servidor: ${(err as Error).message}` 
    });
  }
}

/**
 *Esta funcion TypeScript guarda el perfil de GitHub de un usuario despues de realizar validaciones y manejar
 *errores potenciales.
 *@param {Request} req - El parametro `req` en la funcion `saveGithubProfile` es un objeto
 *que representa la solicitud HTTP. Contiene informacion sobre la solicitud realizada al servidor, como
 *encabezados, cuerpo, parametros y mas. En esta funcion, se utiliza para acceder a la informacion del
 *usuario y a los datos del cuerpo de la solicitud.
 *@param {Response} res - El parametro `res` en la funcion `saveGithubProfile` es un objeto
 *que representa la respuesta HTTP que el servidor envia de vuelta al cliente. Se utiliza para enviar
 *la respuesta al cliente con el codigo de estado y los datos apropiados.
 *@returns La funcion `saveGithubProfile` devuelve una respuesta basada en el resultado de las
 *validaciones y las funciones de servicio llamadas dentro de un bloque try-catch.
 */
export async function saveGithubProfile(req: Request, res: Response) {
  try {
    const validations = PlatformValidator.saveGithubProfileValidation(
      req.user as TokenTypes.TokenPayload, req.body);
    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }
    const response = await PlatformService.saveUserGithub(
      req.user as TokenTypes.TokenPayload, req.body);
    if (!response.result) {
      return res.status(400).json({ success: false, message: response.messageState });
    }
    return res.status(200).json({ success: true, message: response.messageState });
  } catch (err) {
    return res.status(500).json({ 
      success: false,
      message: `Error en el servidor: ${(err as Error).message}` 
    });
  }
}

/**
 *Esta funcion TypeScript maneja una solicitud para obtener el perfil de LinkedIn de un usuario, incluyendo
 *validacion y manejo de errores.
 *@param {Request} req - El parametro `req` en la funcion `getLinkedinProfile` es un objeto
 *que representa la solicitud HTTP. Contiene informacion sobre la solicitud realizada por el cliente, como
 *los encabezados de la solicitud, parametros, cuerpo y otros detalles. Este parametro es tipicamente proporcionado
 *por el framework Express.js al manejar peticiones HTTP.
 *@param {Response} res - El parametro `res` en la funcion `getLinkedinProfile` es un objeto
 *que representa la respuesta HTTP que la funcion enviara de vuelta al cliente. Permite establecer
 *el codigo de estado, encabezados y el cuerpo de la respuesta que se devolvera al cliente que realiza la
 *solicitud.
 *@returns La funcion `getLinkedinProfile` devuelve una respuesta JSON con codigo de estado 200 si la
 *operacion es exitosa. La respuesta incluye el estado de exito, un mensaje y el
 *`linkedinUsername` extraido de la respuesta. Si hay errores de validacion o errores al procesar
 *la solicitud, se devuelven respuestas de error apropiadas con codigos de estado 400 o 500.
 */
export async function getLinkedinProfile(req: Request, res: Response) {
  try {
    const validations = PlatformValidator.getLinkedinProfileValidation(req.params);
    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }

    const response = await PlatformService.getUserLinkedin(req.params);    
    if (!response.result) {
      return res.status(400).json({ success: false, message: response.messageState });
    }
    return res.status(200).json({
      success: true,
      message: response.messageState,
      linkedinUsername: response.linkedinUsername
    });
  } catch (err) {
    return res.status(500).json({ 
      success: false, message: `Error en el servidor: ${(err as Error).message}` 
    });
  }
}

export async function getGithubProfile(req: Request, res: Response) {
  try {
    const validations = PlatformValidator.getGithubProfileValidation(req.params);
    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }

    const response = await PlatformService.getUserGithub(req.params);
    if (!response.result) {
      return res.status(400).json({ success: false, message: response.messageState });
    }
    return res.status(200).json({
      success: true,
      message: response.messageState,
      githubUsername: response.githubUsername 
    });
  } catch (err) {
    return res.status(500).json({ 
      success: false, message: `Error en el servidor: ${(err as Error).message}` 
    });
  }
}