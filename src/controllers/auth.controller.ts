import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import * as AuthValidations from "../validators/auth.validator";
import * as AuthService from "../services/auth.service";

/**
 * La función `registerUser` maneja el registro de usuarios, incluida la validación de entradas y los errores.
 * manipulación.
 * @param {Request} req -El parámetro `req` en la función `registerUser` es un objeto que representa
 * la solicitud HTTP. Contiene información sobre la solicitud entrante, como los encabezados de la solicitud,
 * cuerpo, parámetros y otros detalles. Este parámetro normalmente lo proporciona Express.js.
 * al manejar solicitudes HTTP.
 * @param {Response} res -El parámetro `res` en la función `registerUser` es un objeto que representa
 * la respuesta HTTP que el servidor envía al cliente. Le permite enviar datos de vuelta al
 * cliente, como códigos de estado, encabezados y cuerpo de respuesta. En el fragmento de código proporcionado.
 * @returns La función `registerUser` devuelve una respuesta JSON con el código de estado 400 si las validaciones
 * de la entrada fallan, una respuesta JSON con el código de estado 201 si el usuario se registró correctamente
 * y una respuesta JSON con código de estado 409 si se produce un error de conflicto. Si ocurre algún otro error,
 * devuelve una respuesta JSON con código de estado 500.
 */
export async function registerUser(req: Request, res: Response) {
  try {
    const validations = AuthValidations.registerUserValidations(req.body);
    if (!validations.result) {
      return res.status(400).json({ error: validations.messageState });
    }

    const response = await AuthService.registerUserService(req.body);
    return res.status(201).json({
      message: "Usuario registrado correctamente",
      user: response.user,
      token: response.token
    });
  } catch (error) {
    if ((error as Error).name === "ConflictError") {
      return res.status(409).json({ error: (error as Error).message });
    }
    return res.status(500).json({
      message: `Error en registerUser: ${(error as Error).message}`,
      error: "Error interno del servidor."
    });
  }
}

/**
 * La función loginUser en TypeScript maneja las solicitudes de inicio de sesión de los usuarios, realiza 
 * validaciones y devuelve respuestas apropiadas basadas en el resultado.
 * @param {Request} req -El parámetro `req` en la función `loginUser` representa la solicitud que contiene 
 * información sobre la solicitud HTTP realizada al servidor. Este objeto incluye
 * propiedades como encabezados, cuerpo, método, URL y más, que proporcionan datos enviados por el cliente al
 * servidor en este contexto.
 * @param {Response} res -El parámetro `res` en la función `loginUser` es un objeto que representa
 * la respuesta HTTP que envía un controlador de ruta Express.js cuando recibe una solicitud HTTP.
 * normalmente se utiliza para enviar una respuesta al cliente que realiza la solicitud. En el código 
 * proporcionado, se utiliza `res`.
 * @returns La función `loginUser` devuelve una respuesta JSON con el código de estado 200 si el inicio de sesión
 * es exitoso, que contiene el mensaje de éxito, información del usuario, imagen de perfil, token de acceso y
 * token de actualización. Si hay errores de validación, devuelve una respuesta JSON con el código de estado 400 y
 * el mensaje de error de validación. Si hay un error de autenticación, devuelve una respuesta JSON con
 * código de estado 401.
 */
export async function loginUser(req: Request, res: Response) {
  try {
    const validations = AuthValidations.loginUserValidation(req.body);
    if (!validations.result) {
      return res.status(400).json({ error: validations.messageState });
    }

    const response = await AuthService.login(req.body);
    return res.status(200).json({
      success: true,
      message: `Inicio de sesion exitoso del usuario ${req.body.username}`,
      user: response.user,
      profilePicture: response.profilePicture,
      accessToken: response.accessToken,
      refreshToken: response.refreshToken
    });

  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return res.status(401).json({ error: (error as Error).message });
    }
    return res.status(500).json({
      message: `Error en loginUser: ${(error as Error).message}`,
      error: "Error interno del servidor."
    });
  }
}


/**
 * La función `resetPassword` en TypeScript maneja el restablecimiento de la contraseña de un usuario con manejo 
 * de errores para diferentes escenarios.
 * @param {Request} req -El parámetro `req` en la función `resetPassword` suele ser un objeto que
 * representa la solicitud HTTP que se realiza al servidor. Contiene información como encabezados de solicitud,
 * cuerpo, parámetros y otros detalles enviados por el cliente que realiza la solicitud. en este caso, es de tipo
 * Request.
 * @param {Response} res -El parámetro `res` en la función `resetPassword` es un objeto
 * representa la respuesta HTTP que el servidor envía al cliente. Te permite enviar datos al cliente, como
 * códigos de estado, encabezados y el cuerpo de la respuesta. En el código proporcionado, el parametro `res` es
 * de tipo Response.
 * @returns La función `resetPassword` devuelve diferentes respuestas según el resultado de la
 * operación: 400 en caso de haber errores de validacion, 200 en caso de haber logrado cambiar la contraseña
 * correctamente, 401 en caso de haber error de autenticacion, 409 en caso de haber error de conflictos y
 * finalmente 500 para otros errores, cada respuesta tiene su respectivo mensaje devuelto.
 */
export async function resetPassword(req: Request, res: Response) {
  try {
    const validations = AuthValidations.resetPasswordValidation(req.body);
    if (!validations.result) {
      return res.status(400).json({ error: validations.messageState });
    }

    await AuthService.resetPassword(req.body);
    return res.status(200).json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return res.status(401).json({ error: (error as Error).message });
    }
    if ((error as Error).name === "ConflictError") {
      return res.status(409).json({ error: (error as Error).message });
    }
    return res.status(500).json({
      message: `Error en resetPassword: ${(error as Error).message}`,
      error: "Error interno del servidor."
    });
  }
}

/**
 * La función `forgotPassword` maneja el proceso de restablecer la contraseña de un usuario, incluyendo
 * validaciones en la entrada y manejo de errores.
 * @param {Request} req -El parámetro `req` en la función `forgotPassword` es el objeto de solicitud,
 * representa la solicitud HTTP realizada al servidor. Contiene información sobre la solicitud, como
 * encabezados, cuerpo, parámetros y otros detalles enviados por el cliente. Este parámetro suele ser
 * proporcionado por Express.js al manejar HTTP
 * @param {Response} res -El parámetro `res` en la función `forgotPassword` es un objeto
 * que representa la respuesta HTTP que envía un controlador de ruta Express.js cuando recibe una solicitud HTTP
 * Se utiliza para enviar la respuesta al cliente que realiza la solicitud.
 * @returns La función `forgotPassword` devuelve diferentes respuestas según el resultado de la
 * validación y llamadas de servicio: 400 en caso de haber errores de validacion, 200 en caso de haber logrado 
 * ejecutar la operacion correctamente, 404 en caso de no proporcionar la informacion necesaria y
 * finalmente 500 para otros errores, cada respuesta tiene su respectivo mensaje devuelto.
 */
export async function forgotPassword(req: Request, res: Response) {
  try {
    const validations = AuthValidations.forgotPasswordValidation(req.body);
    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }

    const response = await AuthService.forgotPasswordService(req.body);
    if (!response.result) {
      return res.status(400).json({ success: false, message: response.messageState });
    }
    return res.status(200).json({
      success: true,
      message: "Contraseña recuperada.",
      verificationMails: response.emails
    });

  } catch (err) {
    if ((err as Error).name === "NotFoundError") {
      return res.status(404).json({
        success: false,
        message: `Contraseña no recuperada: ${(err as Error).message}`
      });
    }
    return res.status(500).json({
      success: false,
      message: `Error en forgotPassword: ${(err as Error).message}`,
    });
  }
}

/**
 * La función `verifyResetCode` en TypeScript verifica un código de reseteo y devuelve un mensaje de éxito si
 * el código es válido.
 * @param {Request} req -El parámetro `req` en la función `verifyResetCode` es de tipo `Request`,
 * que suele ser un objeto que representa la solicitud HTTP. Contiene información sobre la
 * solicitud realizada al servidor, como la URL, encabezados, parámetros y datos del cuerpo. Este parámetro es
 * utilizado para extraer la informacion necesaria para llamar a un servicio.
 * @param {Response} res -El parámetro `res` en la función `verifyResetCode` es un objeto
 * representa la respuesta HTTP que el servidor envía al cliente. Te permite enviar datos al cliente, 
 * como códigos de estado, encabezados y cuerpo de respuesta. En esta función el parametro `res` es de tipo
 * Request.
 * @returns La función `verifyResetCode` devuelve una respuesta JSON con un estado de éxito y un
 * mensaje basado en el resultado del proceso de verificación.
 */
export async function verifyResetCode(req: Request, res: Response) {
  try {
    const validations = AuthValidations.verifyResetCodeValidation(req.body);
    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }

    const isValid = await AuthService.verifyCodeService(req.body);
    if (!isValid) {
      return res.status(400).json({ success: false, message: "Código inválido o expirado." });
    }
    return res.status(200).json({ success: true, message: "Código verificado correctamente." });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `Error interno del servidor: ${(err as Error).message}`
    });
  }
}

/**
 * La función refrescoToken maneja la actualización de tokens de sesión de usuario con manejo de errores para 
 * caducados o tokens no válidos.
 * @param {Request} req -El parámetro `req` en la función `refreshToken` representa la entrada de
 * solicitud en Node.js. Contiene información sobre la solicitud HTTP realizada al servidor, como
 * como encabezados, cuerpo, parámetros y otros detalles. En este contexto, se utiliza específicamente para
 * acceder al cuerpo de la solicitud emitida.
 * @param {Response} res -El parámetro `res` en la función `refreshToken` es un objeto que representa
 * la respuesta HTTP que el servidor envía al cliente. Le permite enviar datos, establecer encabezados,
 * y controlar el estado de la respuesta.
 * @returns La función `refreshToken` devuelve una respuesta basada en el resultado de la actualización del token
 * Si la actualización del token es exitosa, devuelve un estado 200 con una respuesta JSON que contiene
 * el nuevo token de acceso. Si hay errores de validación en el cuerpo de la solicitud, devuelve un estado 400
 * con un mensaje de error. Si el token de actualización no es válido o ha caducado, devuelve un estado 403 con
 * un mensaje de expiracion y finalmente 500 para otros errores, cada respuesta tiene su respectivo mensaje 
 * devuelto.
 */
export async function refreshToken(req: Request, res: Response) {
  try {
    const validations = AuthValidations.refreshTokenValidation(req.body);
    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }

    const result = await AuthService.refreshSession(req.body);
    return res.status(200).json({ success: true, accessToken: result.accessToken });

  } catch (err) {
    if (err instanceof jwt.TokenExpiredError || (err as Error).message === "INVALID_REFRESH_TOKEN") {
      return res.status(403).json({
        success: false,
        message: "Refresh token inválido o expirado. Debe iniciar sesión de nuevo"
      });
    }
    return res.status(500).json({
      success: false,
      message: `Error interno del servidor: ${(err as Error).message}`
    });
  }
}

/**
 * La función `logout` maneja el cierre de sesión del usuario validando la entrada, cerrando la sesión y
 * devolver respuestas apropiadas según el resultado.
 * @param {Request} req -El parámetro `req` en la función `logout` representa el objeto de solicitud,
 * que contiene información sobre la solicitud HTTP realizada al servidor. Este objeto normalmente incluye
 * detalles como los encabezados de la solicitud, el cuerpo, los parámetros, la URL y más. En este contexto,
 * se está utilizado para acceder a la solicitud.
 * @param {Response} res -El parámetro `res` en la función `logout` es un objeto que representa el
 * Respuesta HTTP que el servidor devuelve al cliente. Le permite enviar datos, establecer encabezados y
 * controlar el estado de la respuesta. En el fragmento de código proporcionado, "res" se utiliza para enviar
 * respuestas JSON con diferentes mensajes y codigos de estado.
 * @returns La función `logout` devuelve una respuesta JSON con un estado de éxito y un mensaje basado en
 * el resultado de la operación de cierre de sesión.
 */
export async function logout(req: Request, res: Response) {
  try {
    const validations = AuthValidations.logoutValidation(req.body);
    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }

    await AuthService.logoutSession(req.body);
    return res.status(200).json({
      success: true,
      message: "Sesión cerrada exitosamente en el servidor."
    });

  } catch (err) {
    if ((err as Error).message === "TOKEN_NOT_FOUND") {
      return res.status(404).json({ success: false, message: "El token no existe o ya fue eliminado" });
    }
    return res.status(500).json({
      success: false,
      message: `Error interno del servidor: ${(err as Error).message}`
    });
  }
}
