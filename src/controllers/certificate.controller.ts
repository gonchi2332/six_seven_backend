import { Request, Response } from "express";
import { getCertificateAction } from "../helpers/certificate.helper";
import * as TokenTypes from "../types/token.types";
import * as CertificateValidations from "../validators/certificate.validator";
import * as ArrayValidations from "../validators/shared/array.validator";
import * as CertificateService from "../services/certificate.service";

/**
 *La función `manageUserCertificate` maneja el registro y modificación de certificados de usuario,
 *realiza validaciones y devuelve respuestas apropiadas.
 *@param {Request} req: el parámetro `req` es el objeto de solicitud que representa la solicitud HTTP realizada
 *por el cliente al servidor. Contiene información sobre la solicitud, como encabezados, cuerpo,
 *parámetros y más. En esta función, se utiliza para acceder a los datos del usuario, el cuerpo y el archivo.
 *de la solicitud.
*@param {Response} res -El parámetro `res` en la función `manageUserCertificate` es la respuesta
 *objeto que se utilizará para enviar la respuesta al cliente que realiza la solicitud. es un
 *instancia de la clase `Response` de Express.js. Este objeto le permite enviar respuestas HTTP con códigos
 *de estado.
 *@param {"register" | "modify"} action: el parámetro `action` en la function`manageUserCertificate`
 *puede tener dos valores posibles: "register" o "modify". Este parámetro determina si la función registrará
 *un nuevo certificado de usuario o modificará un certificado de usuario existente según el
 *valor proporcionado.
 *@param {any} [idInfo] -El parámetro `idInfo` en la función `manageUserCertificate` es un
 *parámetro opcional que se utiliza cuando `action` se establece en "modify". Contiene información
 *relacionada con el certificado que necesita ser modificado, como el ID del certificado o cualquier otro
 *detalle relevante requerido.
 *@returns La función `manageUserCertificate` devuelve una respuesta JSON con un estado de éxito y un
 *mensaje basado en el resultado de la acción de gestión del certificado.
 */
async function manageUserCertificate(
  req: Request,
  res: Response,
  action: "register" | "modify",
  idInfo?: any) {
  try {
    const validation = await CertificateValidations.manageUserCertificateValidation(
      req.user as TokenTypes.TokenPayload, req.body, req.file as Express.Multer.File);
    if (!validation.result) {
      return res.status(400).json({ success: false, message: validation.messageState });
    }

    let ans;
    if (action === "register") {
      ans = await CertificateService.registerUserCertificate(
        req.user as TokenTypes.TokenPayload, req.body, req.file as Express.Multer.File);
    } else {
      ans = await CertificateService.modifyUserCertificate(
        req.user as TokenTypes.TokenPayload, req.body, req.file as Express.Multer.File, idInfo!);
    }

    const response = ans;
    const certificateAction = getCertificateAction(action);
    if (!response.result) {
      return res.status(400).json({ success: false, message: response.messageState });
    }
    return res.status(201).json({
      success: true,
      message: `Certificado ${certificateAction.singleWord} exitosamente.`
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error interno del servidor: ${(err as Error).message}`
    });
  }
}

/**
 *La función `registerUserCertificate` gestiona de forma asincrónica los certificados de usuario para el
 *registro.
 *@param {Request} req: el parámetro `req` generalmente representa el objeto de solicitud en Node.js
 *Contiene información sobre la solicitud HTTP que se realizó, como encabezados, cuerpo, parámetros y más.
 *En este contexto, `req` se pasa a la función `registerUserCertificate` como argumento.
 *@param {Response} res -El parámetro `res` en la función `registerUserCertificate` es un objeto que
 *representa la respuesta HTTP que el servidor envía al cliente. Te permite enviar datos,
 *establecer cookies, y controlar otros aspectos de la respuesta que recibirá el cliente.
 *@returns La función `registerUserCertificate` devuelve el resultado de llamar a la función
 *`manageUserCertificate` con los argumentos `req`, `res` y "register".
 */
export async function registerUserCertificate(req: Request, res: Response) {
  return await manageUserCertificate(req, res, "register");
}

/**
 *La función `modifyUserCertificate` realiza comprobaciones de validación de los parámetros de consulta de la
 *solicitud y luego llama a `manageUserCertificate` con la acción "modify".
 *@param {Request} req -El parámetro `req` en la función `modifyUserCertificate` es un objeto
 *que representa la solicitud HTTP. Contiene información sobre la solicitud realizada al servidor, como
 *los encabezados de solicitud, los parámetros de consulta, el contenido del cuerpo y más. Este parámetro
 *normalmente se proporciona por Express.js al manejar HTTP.
 *@param {Response} res -El parámetro `res` en la función `modifyUserCertificate` es un objeto
 *que representa la respuesta HTTP que la función enviará al cliente. Se utiliza para enviar
 *la respuesta al cliente con el código de estado y los datos apropiados.
 *@returns La función `modifyUserCertificate` devuelve el resultado de llamar a la función
 *`manageUserCertificate` con los parámetros `req`, `res`, "modify" y `req.query`.
 */
export async function modifyUserCertificate(req: Request, res: Response) {
  const validations = CertificateValidations.modifyUserCertificateValidation(req.query);
  if (!validations.result) {
    return res.status(400).json({ success: false, message: validations.messageState });
  }
  return await manageUserCertificate(req, res, "modify", req.query);
}

/**
 *Esta función de TypeScript recupera y valida certificados públicos y devuelve un mensaje de éxito.
 *junto con los certificados si tiene éxito.
 *@param {Request} req -El parámetro `req` en la función `viewPublicCertificates` es de tipo
 *`Request`, que representa la solicitud HTTP entrante en una aplicación Express.js.
 *El parámetro contiene información sobre la solicitud realizada al servidor, como los encabezados de la
 *solicitud, cuerpo, parámetros y otros datos relevantes.
 *@param {Response} res -El parámetro `res` en la función `viewPublicCertificates` es la respuesta
 *objeto que se utilizará para enviar la respuesta HTTP al cliente. Generalmente es proporcionado por
 *Express en Node.js y contiene métodos para enviar varios tipos de respuestas.
 *@returns La función `viewPublicCertificates` devuelve una respuesta basada en el resultado de varios
 *validaciones y llamadas de servicio. A continuación se muestra un resumen de los posibles escenarios
 *de devolución: 400 en caso de haber errores de validacion, 200 en caso de haber obtenido los certificados
 *publicos con exito y 500 para otros errores.
 */
export async function viewPublicCertificates(req: Request, res: Response) {
  try {
    const validations = CertificateValidations.viewPublicCertificatesValidation(req.params);
    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }

    const response = await CertificateService.viewPublicCertificates(req.params);
    if (!response.result) {
      return res.status(400).json({
        success: false,
        message: response.messageState
      });
    }
    const arrayValidation = ArrayValidations.validateEmptyArray(response.certificates);
    if (!arrayValidation) {
      return res.status(200).json({
        success: true,
        message: "El usuario no tiene certificados publicos",
        certificates: []
      });
    }
    return res.status(200).json({
      success: true,
      message: "Certificados obtenidos exitosamente",
      certificates: response.certificates
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error interno del servidor: ${(err as Error).message}`
    });
  }
}

/**
 *La función `viewPrivateCertificates` recupera certificados privados para un usuario y maneja
 *validaciones y casos de error.
 *@param {Request} req -El parámetro `req` en la función `viewPrivateCertificates` es de tipo
 *`Request`, que normalmente se usa en aplicaciones Express.js para representar la solicitud HTTP. eso
 *contiene información sobre la solicitud entrante, como los encabezados de la solicitud, el cuerpo,
 *parámetros y detalles de autenticación de usuario.
 *@param {Response} res -El parámetro `res` en la función `viewPrivateCertificates` es el
 *objeto de respuesta que se utilizará para enviar la respuesta HTTP al cliente. Se utiliza normalmente
 *para configurar el código de estado, los encabezados y enviar datos en el cuerpo de la respuesta.
 *En esta función, el objeto `res` es de tipo `Request`.
 *@returns La función `viewPrivateCertificates` devuelve una respuesta basada en el resultado de varios
 *validaciones y llamadas de servicio. A continuación se muestra un resumen de los posibles escenarios de
 *devolución: 400 en caso de haber errores de validacion, 200 en caso de haber obtenido los certificados
 *privados con exito y 500 para otros errores.
*/
export async function viewPrivateCertificates(req: Request, res: Response) {
  try {
    const validations = CertificateValidations.viewPrivateCertificatesValidation(req.user as TokenTypes.TokenPayload);
    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }

    const response = await CertificateService.viewPrivateCertificates(req.user as TokenTypes.TokenPayload);
    if (!response.result) {
      return res.status(400).json({ success: false, message: response.messageState });
    }
    const arrayValidation = ArrayValidations.validateEmptyArray(response.certificates);
    if (!arrayValidation) {
      return res.status(200).json({
        success: true,
        message: "No tienes certificados registrados",
        certificates: []
      });
    }
    return res.status(200).json({
      success: true,
      message: "Tus certificados se han obtenido exitosamente",
      certificates: response.certificates
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error interno del servidor: ${(err as Error).message}`
    });
  }
}

/**
 *Esta función de TypeScript maneja la eliminación del certificado de un usuario con manejo de errores y
 *controles de validación.
 *@param {Request} req -El parámetro `req` en la función `deleteUserCertificate` es un objeto
 *que representa la solicitud HTTP. Contiene información sobre la solicitud realizada al servidor, como
 *encabezados, cuerpo, parámetros, cadenas de consulta y más. Este parámetro normalmente lo proporciona
 *Express.js al manejar solicitudes HTTP.
 *@param {Response} res -El parámetro `res` en la función `deleteUserCertificate` es un objeto
 *representa la respuesta HTTP que el servidor envía al cliente. Te permite enviar datos
 *como códigos de estado, encabezados y cuerpo de respuesta. En el fragmento de código proporcionado,
 *el parametro `res` es de tipo `Request`.
 *@returns La función `deleteUserCertificate` devuelve una respuesta con un código de estado y un objeto JSON
 *que contiene el estado de éxito y un mensaje. Los posibles valores de retorno son:
 *1. Si la validación falla, devuelve un estado 400 con un objeto JSON.
 *2. Si la operación de eliminación es exitosa, devuelve un estado 200 con un objeto JSON.
 */
export async function deleteUserCertificate(req: Request, res: Response) {
  try {
    const validations = CertificateValidations.deleteUserCertificateValidation(
      req.user as TokenTypes.TokenPayload, req.query);
    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }

    const response = await CertificateService.deleteUserCertificate(
      req.user as TokenTypes.TokenPayload, req.query);
    if (!response.result) {
      return res.status(400).json({ success: false, message: response.messageState });
    }
    return res.status(200).json({ success: true, message: "Certificado eliminado exitosamente" });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error interno del servidor: ${(err as Error).message}`
    });
  }
}

/**
 *Esta función de TypeScript modifica la visibilidad de los certificados según la entrada del usuario y devuelve
 *respuestas apropiadas.
 *@param {Request} req -El parámetro `req` en la función `modifyCertificatesVisibility` es un
 *objeto que representa la solicitud HTTP. Contiene información sobre la solicitud entrante, como
 *encabezados, cuerpo, parámetros y detalles de autenticación del usuario. Este parámetro es de tipo `Request`,
 *que normalmente lo proporciona Express.js.
*@param {Response} res -El parámetro `res` en la función `modifyCertificatesVisibility` es un
 *instancia del objeto `Request`. Se utiliza para enviar la respuesta HTTP al cliente con el código de estado
 *correspondiente y los datos de respuesta.
 *@returns La función `modifyCertificatesVisibility` devuelve una respuesta con código de estado y un JSON
 *objeto que contiene el estado de éxito y un mensaje basado en el resultado de las validaciones y
 *llamada de servicio. Si las validaciones fallan, devuelve un estado 400 con un mensaje de las validaciones.
 *Si la llamada de servicio falla, devuelve un estado 400 con un mensaje de la respuesta del servicio. si
 *hay un error interno del servidor devuelve un estado 500 y si se modifico la visibilidad exitosamente,
 *devuelve un estado 200.
 */
export async function modifyCertificatesVisibility(req: Request, res: Response) {
  try {
    const validations = CertificateValidations.modifyCertificatesVisibility(
      req.user as TokenTypes.TokenPayload, req.body);
    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }

    const response = await CertificateService.updateCertificatesVisibility(
      req.user as TokenTypes.TokenPayload, req.body);
    if (!response.result) {
      return res.status(400).json({
        success: false,
        message: response.messageState
      });
    }
    return res.status(200).json({
      success: true,
      message: response.messageState
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error interno del servidor: ${(err as Error).message}`
    });
  }
}