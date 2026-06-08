import { Request, Response } from "express";
import { getEducationAction } from "../helpers/education.helper";
import * as TokenTypes from "../types/token.types";
import * as EducationValidation from "../validators/education.validator";
import * as ArrayValidations from "../validators/shared/array.validator";
import * as EducationService from "../services/education.service";

/**
 * La función `manageEducation` maneja el registro y modificación de la información de educacion del usuario, con
 * manejo de errores y mensajes de respuesta.
 * @param {Solicitud} req -El parámetro `req` en la función `manageEducation` es de tipo `Request`,
 * que normalmente se usa en aplicaciones Node.js con Express para representar la solicitud HTTP.
 * Contiene información sobre la solicitud entrante, como encabezados, cuerpo, parámetros y más.
 * El parámetro se utiliza para extraer datos de entrada.
 * @param {Response} res -El parámetro `res` en la función `manageEducation` es el objeto de respuesta
 * que se utilizará para enviar respuestas al cliente que realiza la solicitud. Normalmente se utiliza para
 * enviar respuestas HTTP con códigos de estado y datos en formato JSON.
 * @param {"register" | "modify"} action: el parámetro `action` en la función `manageEducation`
 * determina si se debe registrar o modificar la información educativa. Puede tener dos valores posibles:
 * "register" o "modify". Dependiendo del valor de `action`, la función llamará al la función
 * `registerEducation` o `modifyEducation`.
 * @param {any} [idInfo] -El parámetro `idInfo` en la función `manageEducation` es opcional, y es un
 * parámetro que representa información adicional necesaria para modificar la informacion educativa. es solo
 * requerido cuando `action` está configurada con "modify", indicando que desea actualizar una existente
 * informacion educativa con información de identificación específica.
 * @returns La función `manageEducation` devuelve una respuesta basada en el resultado de la educación
 * basado en la operación de gestión (registrar o modificar). Si la validación falla, devuelve un estado 400
 * con un mensaje indicando el error de validación. Si la operación es exitosa, devuelve un estado 200.
 * con un mensaje de éxito. Si se produce un error interno del servidor durante el proceso, devuelve un 500
 * estado con un mensaje de error.
 */
async function manageEducation(
  req: Request,
  res: Response,
  action: "register" | "modify",
  idInfo?: any) {
  try {
    const validations = EducationValidation.manageEducationValidation(
      req.user as TokenTypes.TokenPayload, req.body);
    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }

    let ans;
    if (action === "register") {
      ans = await EducationService.registerEducation(req.user as TokenTypes.TokenPayload, req.body);
    } else {
      ans = await EducationService.modifyEducation(
        req.user as TokenTypes.TokenPayload, req.body, idInfo!);
    }

    const response = ans;
    if (!response.result) {
      return res.status(400).json({ success: false, message: response.messageState });
    }
    return res.status(200).json({
      success: true,
      message: `Experiencia laboral ${getEducationAction(action).singleWord} exitosamente`
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error interno del servidor: ${(err as Error).message}`
    });
  }
}

/**
 * La función `registerEducation` llama asincrónicamente a `manageEducation` con la acción "register"
 * al gestionar una solicitud.
 * @param {Solicitud} req -El parámetro `req` en la función `registerEducation` es de tipo `Request`,
 * que normalmente representa la solicitud HTTP en Express.js, contiene
 * información sobre la solicitud entrante como encabezados, parámetros, cuerpo, etc.
 * @param {Response} res -El parámetro `res` en la función `registerEducation` es una instancia de
 * el objeto `Request`. Se utiliza para enviar la respuesta HTTP al cliente con los datos o
 * código de estado.
 * @returns La función `registerEducation` devuelve el resultado de llamar a `manageEducation`
 * función con los parámetros `req`, `res` y la cadena `"register"`.
 */
export async function registerEducation(req: Request, res: Response) {
  return await manageEducation(req, res, "register");
}

/**
 * La función `modifyEducation` en TypeScript maneja las solicitudes de modificación de informacion de educacion
 * del usuario validando la entrada, devolviendo una respuesta de error si la validación falla y llamando a 
 * `manageEducation` con parámetros apropiados.
 * @param {Request} req -El parámetro `req` en la función `modifyEducation` es un objeto
 * que representa la solicitud HTTP. Contiene información sobre la solicitud realizada al servidor, como
 * los encabezados de solicitud, el cuerpo, los parámetros, las cadenas de consulta, etc. En este contexto,
 * se utiliza para extraer los parámetros de consulta.
 * @param {Response} res -El parámetro `res` en la función `modifyEducation` es una instancia del
 * Objeto de respuesta en Express.js. Se utiliza para enviar una respuesta al cliente que realiza la solicitud.
 * En este caso, se está utilizando para enviar una respuesta JSON con un código de estado.
 * @returns La función `modifyEducation` devuelve el resultado de llamar a `manageEducation`
 * función con los parámetros `req`, `res`, "modify" y `req.query`.
 */
export async function modifyEducation(req: Request, res: Response) {
  const validations = EducationValidation.modifyEducationValidation(req.query);
  if (!validations.result) {
    return res.status(400).json({ success: false, message: validations.messageState });
  }
  return await manageEducation(req, res, "modify", req.query);
}

/**
 * La función `handleEducation` maneja la eliminación de un registro de educacion del usuario con manejo de
 * validaciones y devolucion de errores.
 * @param {Request} req -El parámetro `req` en la función `handleEducation` representa la solicitud
 * objeto, que contiene información sobre la solicitud HTTP realizada al servidor. Este objeto incluye
 * propiedades como los encabezados de la solicitud, el cuerpo, los parámetros, las cadenas de consulta y más,
 * es típicamente proporcionado por Express.js al manejar solicitudes desde el cliente.
 * @param {Response} res -El parámetro `res` en la función `handleEducation` es un objeto
 * que representa la respuesta HTTP que envía un controlador de ruta Express.js cuando recibe una solicitud HTTP
 * Permite enviar una respuesta al cliente que realiza la solicitud, incluyendo el código de estado, encabezados
 * y datos de envío.
 * @param {any} [idInfo] -El parámetro `idInfo` en la función `handleEducation` se utiliza para especificar
 * el identificador del registro de educacion que debe eliminarse. Este identificador se utiliza normalmente
 * para localizar y eliminar el registro específico de la base de datos.
 * @returns La función `handleEducation` devuelve una respuesta JSON con un estado de éxito y un
 * mensaje basado en el resultado de la operación de eliminación de educación, siendo 200 en caso de eliminar el
 * registro exitosamente, 400 en caso de tener error en el resultado de las validaciones y 500 en caso de otros
 * errores. 
 */
async function handleEducation(
  req: Request,
  res: Response,
  idInfo?: any) {
  try {
    const validations = EducationValidation.handleEducationValidation(
      req.user as TokenTypes.TokenPayload || req.query);
    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }

    const response = await EducationService.
      deleteEducation(req.user as TokenTypes.TokenPayload, idInfo!);
    if (!response.result) {
      return res.status(400).json({ success: false, message: response.messageState });
    }
    return res.status(200).json({
      success: true,
      message: "El registro de educacion se ha eliminado correctamente.",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error interno del servidor: ${(err as Error).message}`
    });
  }
}

/**
 * La función `viewPublicEducation` recupera y valida registros de informacion de educación pública para un
 * usuario, Manejando errores y devolviendo respuestas apropiadas.
 * @param {Request} req -El parámetro `req` en la función `viewPublicEducation` es de tipo
 * `Request`, que normalmente es un objeto que representa la solicitud HTTP. Contiene propiedades y
 * métodos para acceder a información sobre la solicitud entrante, como encabezados, parámetros, cuerpo, etc.
 * Este parámetro se utiliza para extraer datos de la solicitud.
 * @param {Response} res -El parámetro `res` en la función `viewPublicEducation` es la respuesta
 * objeto que se utilizará para enviar la respuesta HTTP al cliente. Es una instancia de la
 * clase `Response` del framework Express.js. Este objeto le permite enviar varios HTTP y
 * respuestas como códigos de estado
 * @returns La función `viewPublicEducation` devuelve una respuesta basada en el resultado de varias
 * validaciones y llamadas de servicio. Si las validaciones fallan, devuelve un estado 400 con un error y su
 * mensaje. Si la llamada de servicio es exitosa pero la informacion obtenida está vacía, devuelve un mensaje de
 * éxito especificando que esta vacía. Si la informacion no está vacía, devuelve un mensaje de éxito con estado
 * 200.
 */
export async function viewPublicEducation(req: Request, res: Response) {
  try {
    const validations = EducationValidation.viewPublicEducationValidation(req.params);
    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }

    const response = await EducationService.viewPublicEducation(req.params as any);
    if (!response.result) {
      return res.status(400).json({ success: false, message: response.messageState });
    }
    const arrayValidation = ArrayValidations.validateEmptyArray(response.education);
    if (!arrayValidation) {
      return res.status(200).json({
        success: true,
        message: "El usuario no tiene registros de educacion publicos",
        education: []
      });
    }
    return res.status(200).json({
      success: true,
      message: "Los registros de educacion del usuario se han obtenido correctamente",
      education: response.education
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error interno del servidor: ${(err as Error).message}`
    });
  }
}

/**
 * Esta función de TypeScript maneja la visualización de informacion de la educacion privada del usuario
 * incluye control de autenticación y devuelve respuestas apropiadas.
 * @param {Request} req -El parámetro `req` en la función `viewPrivateEducation` es de tipo
 * `Request`, que normalmente es un objeto que representa la solicitud HTTP. Contiene información sobre
 * la solicitud realizada al servidor, como encabezados, cuerpo, parámetros y cadenas de consulta. Este parámetro
 * se utiliza para extraer información del usuario.
 * @param {Response} res -El parámetro `res` en la función `viewPrivateEducation` es un objeto
 * que representa la respuesta HTTP que la función enviará al cliente. es de tipo
 * `Response`, que normalmente la proporciona Express en Node.js.
 * @returns La función `viewPrivateEducation` devuelve una respuesta basada en el resultado de varios
 * validaciones y llamadas de servicio. A continuación se muestra un desglose de los posibles escenarios de
 * devolución: 200 en caso de obtener la informacion de educacion privada del usuario exitosamente,
 * 400 en caso de tener error en el resultado de las validaciones y 500 en caso de otros errores. 
 */
export async function viewPrivateEducation(req: Request, res: Response) {
  try {
    const validations = EducationValidation.viewPrivateEducationValidation(
      req.user as TokenTypes.TokenPayload);
    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }

    const response = await EducationService.viewPrivateEducation(req.user as TokenTypes.TokenPayload);
    if (!response.result) {
      return res.status(400).json({ success: false, message: response.messageState });
    }
    const arrayValidation = ArrayValidations.validateEmptyArray(response.education);
    if (!arrayValidation) {
      return res.status(200).json({
        success: true,
        message: "No tienes registros de educacion",
        education: []
      });
    }
    return res.status(200).json({
      success: true,
      message: "Tus registros de educacion se han obtenido correctamente",
      education: response.education
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error interno del servidor: ${(err as Error).message}`
    });
  }
}

/**
 * La función `deleteEducation` realiza comprobaciones de validación en los parámetros de consulta de la 
 * solicitud y luego llama a otra función `handleEducation` para procesar la eliminación de datos de educacion
 * del usuario.
 * @param {Request} req -El parámetro `req` en la función `deleteEducation` es un objeto
 * que representa la solicitud HTTP. Contiene información sobre la solicitud realizada al servidor, como
 * los encabezados de solicitud, el cuerpo, los parámetros, las cadenas de consulta, etc. En este contexto,
 * se utiliza para extraer los parámetros de consulta.
 * @param {Response} res -El parámetro `res` en la función `deleteEducation` es una instancia del
 * objeto de `Response`. Se utiliza para enviar una respuesta al cliente que realiza la solicitud. en
 * este caso, se está utilizando para enviar una respuesta JSON con un código de estado.
 * @returns La función `deleteEducation` devuelve el resultado de llamar a `handleEducation`
 * funciona con los parámetros `req` y `res`, junto con `req.query`. Esta función también es
 * realizar algunas validaciones usando `EducationValidation.deleteEducationValidation(req.query)` y
 * devuelve una respuesta con un estado de 400 y un objeto JSON si las validaciones fallan.
 */
export async function deleteEducation(req: Request, res: Response) {
  const validations = EducationValidation.deleteEducationValidation(req.query);
  if (!validations.result) {
    return res.status(400).json({ success: false, message: validations.messageState });
  }
  return await handleEducation(req, res, req.query);
}

export async function viewEducationGrade(req: Request, res: Response) {
  try {
    const response = await EducationService.viewAcademicGrade();
    if (!response.result) {
      return res.status(400).json({ success: false, message: response.messageState });
    }
    const arrayValidation = ArrayValidations.validateEmptyArray(response.educationGrade);
    if (!arrayValidation) {
      return res.status(404).json({ success: false, message: "No se encontraron grados academicos." });
    }
    return res.status(200).json({
      success: true,
      message: "Los grados academicos se han obtenido correctamente.",
      educationGrade: response.educationGrade
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error interno del servidor: ${(err as Error).message}`
    });
  }
}

/**
 * Esta función de TypeScript modifica la visibilidad de la información educativa según la entrada del usuario y
 * devuelve mensajes de éxito o error en consecuencia.
 * @param {Request} req -El parámetro `req` en la función `modifyEducationVisibility` es un objeto
 * que representa la solicitud HTTP. Contiene información sobre la solicitud realizada al servidor, como
 * encabezados, cuerpo, parámetros y más. Este parámetro normalmente lo proporciona Express.js.
 * marco al manejar solicitudes HTTP.
 * @param {Response} res -El parámetro `res` en la función `modifyEducationVisibility` es un objeto
 * que representa la respuesta HTTP que la función enviará al cliente. es de tipo
 * `Response`, que normalmente la proporciona Express.js en aplicaciones Node.js.
 * @returns La función `modifyEducationVisibility` devuelve una respuesta JSON con un estado de éxito
 * y un mensaje basado en el resultado de las validaciones y llamada de servicio, siendo 200 en caso de 
 * modificar la visibilidad exitosamente, 400 en caso de tener error en el resultado de las validaciones y
 * 500 en caso de otros errores.
 */
export async function modifyEducationVisibility(req: Request, res: Response) {
  try {
    const validations = EducationValidation.modifyEducationVisibilityValidation(
      req.user as TokenTypes.TokenPayload, req.body);
    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }

    const response = await EducationService.updateEducationVisibility(
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