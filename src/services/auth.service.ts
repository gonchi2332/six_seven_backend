import { generateAccessToken, generateRefreshToken } from "../utils/jwt.util";
import { sendResetCodeEmail } from "../helpers/nodemailer.helper";
import { generateCode } from "../utils/generate.util";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as TokenTypes from "../types/token.types";
import * as AuthTypes from "../types/auth.types";
import * as CommonRepository from "../repositories/shared/common.repository";
import * as AuthRepository from "../repositories/auth.repository";

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

export async function verifyCodeService(verifyResetCodeInfo: AuthTypes.VerifyResetCodeInfo) {
  const { username, code } = verifyResetCodeInfo;
  
  const users = await CommonRepository.findByUsername(username);
  if (users.length === 0) return false;

  const result = await AuthRepository.findResetCode(username, code);
  return result.length > 0;
}

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

export async function logoutSession(refreshTokenInfo: AuthTypes.RefreshTokenInfo) {
  const { refreshToken } = refreshTokenInfo;

  const deleted = await AuthRepository.deleteRefreshToken(refreshToken);
  if (!deleted || deleted.length === 0) {
    throw new Error("TOKEN_NOT_FOUND");
  }
  return { success: true };
}