import { generateAccessToken, generateRefreshToken } from "../utils/jwt.util";
import { sendResetCodeEmail } from "../helpers/nodemailer.helper";
import { generateCode } from "../utils/generate.util";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as TokenTypes from "../types/token.types";
import * as AuthTypes from "../types/auth.types";
import * as CommonRepository from "../repositories/shared/common.repository";
import * as AuthRepository from "../repositories/auth.repository";

/**
 * La función `registerUserService` registra un nuevo usuario en el sistema. Verifica que el nombre
 * de usuario no exista, encripta la contraseña con bcrypt, crea el usuario en la base de datos
 * con el rol "Usuario" y genera un token de acceso para la sesión inicial.
 * @param {AuthTypes.RegisterUserServiceInfo} registerUserServiceInfo - Objeto con los datos del
 * nuevo usuario: username, password, names, firstSurname, secondSurname y mainRegistrationEmail.
 * @returns Objeto con `result: true`, mensaje de éxito, datos del usuario y token de acceso.
 * @throws Error con nombre "ConflictError" si el nombre de usuario ya está en uso.
 */
export async function registerUserService(registerUserServiceInfo: AuthTypes.RegisterUserServiceInfo) {
  const {
    username,
    password,
    names,
    firstSurname,
    secondSurname,
    mainRegistrationEmail
  } = registerUserServiceInfo;

  const existingUsers = await CommonRepository.findByUsername(username);
  if (existingUsers.length > 0) {
    const error = new Error("El nombre de usuario ya está en uso");
    error.name = "ConflictError";
    throw error;
  }

  const roles = await AuthRepository.findRoleByName("Usuario");
  const roleId = roles.length > 0 ? roles[0].id : 1;

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const registrationData = await AuthRepository.createUser(
    username, hashedPassword, roleId, names, firstSurname, mainRegistrationEmail, secondSurname);

  const token = generateAccessToken({
    username: registrationData.user.username,
    state: registrationData.user.state
  });
  return {
    result: true,
    messageState: "Usuario registrado exitosamente",
    user: registrationData.user,
    token
  };
}

/**
 * La función `login` autentica a un usuario verificando sus credenciales (username y contraseña).
 * Si las credenciales son válidas, genera un refresh token que se almacena en la base de datos
 * y un access token para la sesión. También procesa la foto de perfil del usuario a formato base64.
 * @param {AuthTypes.LoginUserInfo} loginUserInfo - Objeto con `username` y `password`.
 * @returns Objeto con los datos del usuario, foto de perfil en base64, access token y refresh token.
 * @throws Error con nombre "AuthError" si el usuario no existe o la contraseña no coincide.
 */
export async function login(loginUserInfo: AuthTypes.LoginUserInfo) {
  const { username, password } = loginUserInfo;

  const users = await AuthRepository.findUserValues(username);
  if (users.length === 0) {
    const error = new Error("Usuario o contraseña incorrectos");
    error.name = "AuthError";
    throw error;
  }

  const foundUser = users[0];
  const profilePicture = foundUser.profile_picture;
  const proccessedProfilePicture = profilePicture.toString("base64");
  foundUser.profile_picture = (proccessedProfilePicture)
    ? `data:image/jpeg;base64,${proccessedProfilePicture}`
    : null;

  const isMatch = await bcrypt.compare(password, foundUser.hashed_password);
  if (!isMatch) {
    const error = new Error("Usuario o contraseña incorrectos");
    error.name = "AuthError";
    throw error;
  }

  const { token: refreshToken, expiresAt } = generateRefreshToken({
    username: foundUser.username,
    state: foundUser.state
  });
  await AuthRepository.insertRefreshToken(foundUser.username, refreshToken, expiresAt);

  const accessToken = generateAccessToken({ username: foundUser.username, state: foundUser.state });
  return {
    user: foundUser,
    profilePicture: `data:image/jpeg;base64,${proccessedProfilePicture}`,
    accessToken: accessToken,
    refreshToken: refreshToken
  };
}

/**
 * La función `resetPassword` restablece la contraseña del usuario después de verificar el código
 * de recuperación. Valida que el código sea válido y no haya expirado, y que la nueva contraseña
 * sea diferente a la actual. Luego encripta la nueva contraseña y la actualiza en la base de datos.
 * @param {AuthTypes.ResetPasswordInfo} resetPasswordInfo - Objeto con `username`, `newPassword`
 * y `verificationCode`.
 * @throws Error con nombre "AuthError" si el código de verificación es inválido o expirado.
 * @throws Error con nombre "ConflictError" si la nueva contraseña es igual a la anterior.
 */
export async function resetPassword(resetPasswordInfo: AuthTypes.ResetPasswordInfo) {
  const { username, newPassword, verificationCode } = resetPasswordInfo;

  const codeRes = await AuthRepository.findValidResetCode(username, verificationCode);
  if (codeRes.length === 0) {
    const error = new Error("Código de verificación inválido o expirado");
    error.name = "AuthError";
    throw error;
  }

  const { hashed_password: hashedPassword } = codeRes[0];
  const isSame = await bcrypt.compare(newPassword, hashedPassword);
  if (isSame) {
    const error = new Error("La nueva contraseña no puede ser igual a la anterior");
    error.name = "ConflictError";
    throw error;
  }

  const salt = await bcrypt.genSalt(10);
  const newHashedPassword = await bcrypt.hash(newPassword, salt);
  await AuthRepository.updatePasswordAndDeleteCode(username, newHashedPassword);
}

/**
 * La función `forgotPasswordService` genera y envía un código de recuperación de contraseña
 * al correo electrónico registrado del usuario (principal y secundario si existe).
 * @param {AuthTypes.ForgotPasswordInfo} forgotPasswordInfo - Objeto con `username`.
 * @returns Objeto con `result: true`, mensaje de éxito y los correos a los que se envió el código.
 * @throws Error con nombre "NotFoundError" si el nombre de usuario no existe en el sistema.
 */
export async function forgotPasswordService(forgotPasswordInfo: AuthTypes.ForgotPasswordInfo) {
  try {
    const { username } = forgotPasswordInfo;
    const users = await CommonRepository.findByUsername(username);
    if (users.length === 0) {
      const error = new Error("El nombre de usuario no existe.");
      error.name = "NotFoundError";
      throw error;
    }
    const resetCode = generateCode();
    await AuthRepository.insertOrUpdateResetCode(username, resetCode);

    const emailRes = await AuthRepository.findRegistrationEmail(username);
    const mainRegistrationEmail = emailRes[0].main_registration_email;
    await sendResetCodeEmail(mainRegistrationEmail, username, resetCode);

    const secondaryRegistrationEmail = await AuthRepository.findSecondaryEmail(username);
    if (secondaryRegistrationEmail.length === 1) {
      const secondaryEmailRes = secondaryRegistrationEmail[0].registration_email;
      await sendResetCodeEmail(secondaryEmailRes, username, resetCode);
    }
    return {
      result: true,
      messageState: "Código de recuperación enviado exitosamente.",
      emails: [mainRegistrationEmail, secondaryRegistrationEmail]
    };
  } catch (err) {
    if ((err as Error).name === "NotFoundError") throw err;
    return {
      result: false,
      messageState: `Error al procesar la solicitud: ${(err as Error).message}`
    };
  }
}

/**
 * La función `verifyCodeService` verifica que un código de recuperación de contraseña sea válido
 * para el usuario indicado, consultando los códigos almacenados en la base de datos.
 * @param {AuthTypes.VerifyResetCodeInfo} verifyResetCodeInfo - Objeto con `username` y `code`.
 * @returns `true` si el código es válido y corresponde al usuario, `false` en caso contrario.
 */
export async function verifyCodeService(verifyResetCodeInfo: AuthTypes.VerifyResetCodeInfo) {
  const { username, code } = verifyResetCodeInfo;

  const users = await CommonRepository.findByUsername(username);
  if (users.length === 0) return false;

  const result = await AuthRepository.findResetCode(username, code);
  return result.length > 0;
}

/**
 * La función `refreshSession` renueva el access token de un usuario utilizando su refresh token.
 * Decodifica el refresh token, verifica que exista en la base de datos y que pertenezca al usuario
 * correcto, y genera un nuevo access token.
 * @param {AuthTypes.RefreshTokenInfo} refreshTokenInfo - Objeto con `refreshToken`.
 * @returns Objeto con el nuevo `accessToken`.
 * @throws Error si el refresh token es inválido o no coincide con el registro en la base de datos.
 */
export async function refreshSession(refreshTokenInfo: AuthTypes.RefreshTokenInfo) {
  const { refreshToken } = refreshTokenInfo;

  const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as TokenTypes.TokenPayload;
  const record = await AuthRepository.findRefreshToken(refreshToken);
  const tokenRecord = record[0];
  if (!tokenRecord || tokenRecord.username !== decoded.username) {
    throw new Error("INVALID_REFRESH_TOKEN");
  }

  const users = await AuthRepository.findUserStateByUserame(tokenRecord.username);
  const foundUser = users[0];
  const newAccessToken = generateAccessToken({
    username: tokenRecord.username,
    state: foundUser.state
  });
  return { accessToken: newAccessToken };
}

/**
 * La función `logoutSession` cierra la sesión del usuario eliminando su refresh token
 * de la base de datos, invalidando así la posibilidad de renovar el access token.
 * @param {AuthTypes.RefreshTokenInfo} refreshTokenInfo - Objeto con `refreshToken`.
 * @returns Objeto con `success: true` si el token fue eliminado correctamente.
 * @throws Error si el refresh token no se encuentra en la base de datos.
 */
export async function logoutSession(refreshTokenInfo: AuthTypes.RefreshTokenInfo) {
  const { refreshToken } = refreshTokenInfo;

  const deleted = await AuthRepository.deleteRefreshToken(refreshToken);
  if (!deleted || deleted.length === 0) {
    throw new Error("TOKEN_NOT_FOUND");
  }
  return { success: true };
}