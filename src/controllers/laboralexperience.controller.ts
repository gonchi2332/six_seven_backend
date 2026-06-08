import { Request, Response } from "express";
import { getLaboralExpAction } from "../helpers/laboralexperience.helper";
import * as TokenTypes from "../types/token.types";
import * as LaboralExpValidations from "../validators/laboralexperience.validator";
import * as ArrayValidations from "../validators/shared/array.validator";
import * as LaboralExpService from "../services/laboralexperience.service";

/**
 *Esta función de TypeScript gestiona la experiencia laboral del usuario registrándola o modificándola en
 *función de la acción especificada.
 *@param {Request} req: el parámetro `req` es un objeto que representa la solicitud HTTP en Node.js. eso
 *contiene información sobre la solicitud realizada por el cliente, como encabezados, cuerpo, parámetros y
 *más. En este contexto, se utiliza para extraer datos del usuario y solicitar el servicio para gestionar el
 *la experiencia laboral del usuario.
 *@param {Response} res -El parámetro `res` en la función `manageUserLaboralExperience` es el
 *objeto de respuesta que se utilizará para enviar la respuesta al cliente. Normalmente se proporciona
 *por Express.js al manejar solicitudes HTTP. El objeto de respuesta le permite enviar respuestas HTTP
 *con códigos de estado, encabezados, etc.
 *@param {"register" | "modify"} action: el parámetro `action` en la funcion `manageUserLaboralExperience`
 *determina si la experiencia laboral del usuario debe ser registrada o modificada. puede
 *tener dos valores posibles: "register" o "modify".
 *@param {any} [idInfo] -El parámetro `idInfo` en la función `manageUserLaboralExperience` es un
 *parámetro opcional que representa información adicional necesaria para modificar la experiencia laboral del
 *usuario. Sólo es necesario cuando el parámetro `action` está configurado con "modify", ya que proporciona el
 *identificador específico necesario para modificar el registro en la base de datos.
 *@returns La función `manageUserLaboralExperience` devuelve una respuesta basada en el resultado de
 *registrar o modificar la experiencia laboral de un usuario. Si las validaciones fallan, devuelve un estado 400
 *con un mensaje indicando el error de validación. Si el registro o modificación es
 *exitoso, devuelve un estado 200 con un mensaje de éxito. Si hay un error interno del servidor
 *durante el proceso, devuelve un estado 500.
 */
async function manageUserLaboralExperience(
  req: Request,
  res: Response,
  action: "register" | "modify",
  idInfo?: any) {
  try {
    const validations = LaboralExpValidations.manageUserLaboralExperienceValidation(
      req.user as TokenTypes.TokenPayload, req.body);
    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }

    let ans;
    if (action === "register") {
      ans = await LaboralExpService.registerUserLaboralExperience(
        req.user as TokenTypes.TokenPayload, req.body);
    } else {
      ans = await LaboralExpService.modifyUserLaboralExperience(
        req.user as TokenTypes.TokenPayload, req.body, idInfo!);
    }

    const response = ans;
    const laboralExperienceAction = getLaboralExpAction(action);
    if (!response.result) {
      return res.status(400).json({ success: false, message: response.messageState });
    }
    return res.status(200).json({
      success: true,
      message: `Experiencia laboral ${laboralExperienceAction.singleWord} exitosamente`
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error interno del servidor: ${(err as Error).message}`
    });
  }
}

/**
 *La función `registerUserLaboralExperience` gestiona de forma asincrónica el registro de un usuario
 *experiencia laboral.
 *@param {Request} req -El parámetro `req` en la función `registerUserLaboralExperience` es un
 *objeto que representa la solicitud HTTP. Contiene información sobre la solicitud entrante, como
 *encabezados, cuerpo, parámetros y otros detalles enviados por el cliente al servidor. Este parámetro es
 *normalmente proporcionado por el marco Express.js cuando
 *@param {Response} res -El parámetro `res` en la función `registerUserLaboralExperience` es un
 *objeto que representa la respuesta HTTP que la función enviará al cliente. Se utiliza para
 *enviar datos, códigos de estado y otra información al cliente que realiza la solicitud.
 *@returns La función `registerUserLaboralExperience` devuelve el resultado de llamar a la
 *función `manageUserLaboralExperience` con los argumentos `req`, `res` y "register".
 *Se espera la función `manageUserLaboralExperience`, por lo que el valor de retorno de
 *`registerUserLaboralExperience` será el resultado de la función `manageUserLaboralExperience`.
 */
export async function registerUserLaboralExperience(req: Request, res: Response) {
  return await manageUserLaboralExperience(req, res, "register");
}

/**
 *La funcion `modifyUserLaboralExperience` valida la solicitud y luego gestiona la experiencia
 *laboral del usuario llamando a otra funcion.
 *@param {Request} req - El parametro `req` en la funcion `modifyUserLaboralExperience` es un
 *objeto que representa la solicitud HTTP. Contiene informacion sobre la solicitud realizada al servidor,
 *como los encabezados, el cuerpo, los parametros y las cadenas de consulta. En este contexto, se utiliza
 *para extraer los parametros de la consulta.
 *@param {Response} res - El parametro `res` en la funcion `modifyUserLaboralExperience` es un
 *objeto que representa la respuesta HTTP que la funcion enviara de vuelta al cliente. Se utiliza
 *para enviar datos al cliente, como codigos de estado, encabezados y el cuerpo de la respuesta. En este caso,
 *se utiliza para enviar la respuesta procesada por `manageUserLaboralExperience`.
 *@returns La funcion `modifyUserLaboralExperience` devuelve el resultado de llamar a la
 *funcion `manageUserLaboralExperience` con los parametros `req`, `res`, "modify" y `req.query`.
 */
export async function modifyUserLaboralExperience(req: Request, res: Response) {
  const validations = LaboralExpValidations.modifyUserLaboralExperienceValidation(req.query);
  if (!validations.result) {
    return res.status(400).json({ success: false, message: validations.messageState });
  }
  return await manageUserLaboralExperience(req, res, "modify", req.query);
}

/**
 *Esta funcion TypeScript recupera y valida experiencias laborales publicas para un usuario y devuelve
 *los resultados en una respuesta.
 *@param {Request} req - El parametro `req` en la funcion `viewPublicLaboralExperience` es el
 *objeto de solicitud que representa la peticion HTTP realizada al servidor. Contiene informacion sobre
 *la solicitud, como la URL, encabezados, parametros, contenido del cuerpo, etc. Este parametro se utiliza
 *para extraer datos de la solicitud, validarlos y procesarlos adecuadamente.
 *@param {Response} res - El parametro `res` en la funcion `viewPublicLaboralExperience` es el
 *objeto de respuesta que se utilizara para enviar de vuelta la respuesta al cliente que realiza la solicitud.
 *Es una instancia de la clase `Response` del framework Express.js. Este objeto permite enviar respuestas HTTP
 *con codigos de estado, encabezados y cuerpo de respuesta.
 *@returns La funcion `viewPublicLaboralExperience` devuelve una respuesta basada en el resultado de las
 *validaciones y llamadas a servicios dentro de un bloque try-catch. A continuacion se detallan los posibles
 *escenarios de retorno:
 */
export async function viewPublicLaboralExperience(req: Request, res: Response) {
  try {
    const validations = LaboralExpValidations.viewPublicLaboralExperienceValidation(req.params);
    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }

    const response = await LaboralExpService.viewPublicLaboralExperience(req.params as any);
    if (!response.result) return res.status(400).json({ success: false, message: response.messageState });
    
    const arrayValidation = ArrayValidations.validateEmptyArray(response.laboralExperiences);
    if (!arrayValidation) {
      return res.status(200).json({
        success: true,
        message: "El usuario no tiene experiencias laborales publicas",
        laboralExperiences: []
      });
    }
    return res.status(200).json({
      success: true,
      message: "Las experiencias laborales se han obtenido correctamente",
      laboralExperiences: response.laboralExperiences
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error interno del servidor: ${(err as Error).message}`
    });
  }
}

/**
 *Esta funcion TypeScript recupera y devuelve experiencias laborales privadas basadas en la autenticacion
 *del usuario y maneja varios escenarios de validacion.
 *@param {Request} req - El parametro `req` en el fragmento de codigo se refiere al objeto de solicitud, que
 *contiene informacion sobre la peticion HTTP realizada al servidor. Este objeto tipicamente incluye
 *detalles como los encabezados de la solicitud, parametros, cuerpo y otra informacion relevante enviada por el
 *cliente al servidor. En esta funcion especifica `viewPrivateLaboralExperience`, se utiliza para extraer
 *los datos del usuario autenticado y los parametros de la consulta.
 *@param {Response} res - El parametro `res` en la funcion `viewPrivateLaboralExperience` es un
 *objeto que representa la respuesta HTTP que un manejador de ruta de Express.js envia cuando recibe una
 *peticion HTTP. Permite enviar una respuesta al cliente que realiza la solicitud, incluyendo
 *establecer el codigo de estado, encabezados y el cuerpo de la respuesta.
 *@returns La funcion `viewPrivateLaboralExperience` devuelve una respuesta basada en el resultado de
 *varias validaciones y llamadas a servicios. A continuacion se presenta un resumen de los posibles escenarios
 *de retorno:
 */
export async function viewPrivateLaboralExperience(req: Request, res: Response) {
  try {
    const validations = LaboralExpValidations.viewPrivateLaboralExperienceValidation(
      req.user as TokenTypes.TokenPayload);
    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }

    const response = await LaboralExpService.viewPrivateLaboralExperience(req.user as TokenTypes.TokenPayload);
    if (!response.result) 
      return res.status(400).json({ success: false, message: response.messageState });

    const arrayValidation = ArrayValidations.validateEmptyArray(response.laboralExperiences);
    if (!arrayValidation) {
      return res.status(200).json({
        success: true,
        message: "No tienes experiencias laborales registradas.",
        laboralExperiences: []
      });
    }
    return res.status(200).json({
      success: true,
      message: "Tus experiencias laborales se han obtenido correctamente",
      laboralExperiences: response.laboralExperiences
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error interno del servidor: ${(err as Error).message}`
    });
  }
}

/**
 *Esta funcion modifica la visibilidad de una experiencia laboral y maneja validaciones y respuestas
 *de error.
 *@param {Request} req - El parametro `req` en la funcion `modifyLaboralExperienceVisibility` es un
 *objeto que representa la solicitud HTTP. Contiene informacion como encabezados, cuerpo, parametros y
 *otros detalles de la solicitud entrante realizada al servidor. Este parametro es tipicamente proporcionado
 *por el framework Express.js al manejar peticiones HTTP.
 *@param {Response} res - El parametro `res` en el fragmento de codigo se refiere al objeto de respuesta en una
 *funcion manejadora de rutas de Express. Se utiliza para enviar una respuesta de vuelta al cliente que realiza
 *la solicitud. El objeto de respuesta (`res`) tiene metodos como `res.status()`, `res.json()`, etc., que se utilizan
 *para enviar la respuesta adecuada al cliente.
 *@returns La funcion `modifyLaboralExperienceVisibility` devuelve una respuesta JSON con un estado
 *de exito y un mensaje basado en el resultado de las validaciones y la llamada al servicio.
 */
export async function modifyLaboralExperienceVisibility(req: Request, res: Response) {
  try {
    const validations = LaboralExpValidations.modifyLaboralExperienceVisibilityValidation(
      req.user as TokenTypes.TokenPayload, req.body);
    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }

    const response = await LaboralExpService.updateLaboralExperienceVisibility(
      req.user as TokenTypes.TokenPayload, req.body);
    if (!response.result) {
      return res.status(400).json({ success: false, message: response.messageState });
    }
    return res.status(200).json({ success: true, message: response.messageState });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error interno del servidor: ${(err as Error).message}`
    });
  }
}

/**
 *Esta funcion TypeScript maneja la eliminacion de una experiencia laboral de un usuario con manejo de
 *errores y mensajes de respuesta.
 *@param {Request} req - El parametro `req` en la funcion `deleteUserLaboralExperience` es de tipo
 *`Request`, que es tipicamente un objeto que representa la solicitud HTTP. Contiene informacion sobre
 *la solicitud realizada al servidor, como los encabezados de la solicitud, cuerpo, parametros y otros detalles.
 *Este parametro se utiliza para extraer los datos necesarios para identificar que experiencia laboral
 *debe ser eliminada.
 *@param {Response} res - El parametro `res` en la funcion `deleteUserLaboralExperience` es un
 *objeto que representa la respuesta HTTP que el servidor envia de vuelta al cliente. Se utiliza para enviar
 *el estado de la respuesta, encabezados y datos al cliente que realiza la solicitud. En esta funcion, el
 *objeto `res` se utiliza para devolver el resultado de la operacion de eliminacion.
 *@returns La funcion devuelve una respuesta JSON con un estado de exito y un mensaje basado en el resultado
 *de la operacion.
 */
export async function deleteUserLaboralExperience(req: Request, res: Response) {
  try {
    const validations = LaboralExpValidations.deleteUserLaboralExperienceValidation(
      req.user as TokenTypes.TokenPayload, req.query);
    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }

    const response = await LaboralExpService.deleteUserLaboralExperience(
      req.user as TokenTypes.TokenPayload, req.query);
    if (!response.result) {
      return res.status(400).json({ success: false, message: response.messageState });
    }
    return res.status(200).json({ success: true, message: "La experiencia laboral se ha eliminado correctamente" });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error interno del servidor: ${(err as Error).message}`
    });
  }
}