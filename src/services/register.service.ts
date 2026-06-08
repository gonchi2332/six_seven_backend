import "../config/env.config";
import * as UserTypes from "../types/user.types";
import * as TokenTypes from "../types/token.types";
import * as RegisterTypes from "../types/register.types";
import * as RegisterRepository from "../repositories/register.repository";
import * as CommonRepository from "../repositories/shared/common.repository";
import * as AIService from "../services/ai.service";

async function processUserPersonalInfoAction(
  tokenInfo: TokenTypes.TokenPayload,
  userPersonalInfo: UserTypes.UserPersonalInfo,
  profilePicture: Express.Multer.File | null,
  actionLabel: "registra" | "actualiza") {
  try {
    const { username } = tokenInfo;

    const userFound = await RegisterRepository.findUser(username);
    if (!userFound) {
      return { result: false, messageState: "Usuario no encontrado." };
    }
    const isNew = userFound.is_new;
    if (isNew) {
      await RegisterRepository.updateIsNew(username);
    }
    if (profilePicture) {
      const response = await AIService.NSFWImageValidation(profilePicture.buffer);
      if (!response.valid) {
        if (response.reason) {
          return { result: false, messageState: response.reason };
        }
        return { result: false, messageState: "La foto de perfil contiene contenido obseno" };
      }
    }

    const currentUserNames = userFound.names;
    const currentUserFirstSurname = userFound.first_surname;
    await RegisterRepository.createUser(username, currentUserNames, currentUserFirstSurname, userPersonalInfo, profilePicture);
    return {
      result: true,
      messageState: `Datos de informacion personal del usuario ${actionLabel}dos exitosamente.`
    };
  } catch (err) {
    return {
      result: false,
      messageState: `Error al ${actionLabel}r la informacion personal: ${(err as Error).message}`
    };
  }
}

export async function registerUserPersonalInfo(
  tokenInfo: TokenTypes.TokenPayload,
  userPersonalInfo: UserTypes.UserPersonalInfo,
  profilePicture: Express.Multer.File | null) {
  return processUserPersonalInfoAction(tokenInfo, userPersonalInfo, profilePicture, "registra");
}

export async function updateUserPersonalInfo(
  tokenInfo: TokenTypes.TokenPayload,
  userPersonalInfo: UserTypes.UserPersonalInfo,
  profilePicture: Express.Multer.File | null) {
  return processUserPersonalInfoAction(tokenInfo, userPersonalInfo, profilePicture, "actualiza");
}

export async function viewUserPersonalInfo(tokenInfo: TokenTypes.TokenPayload) {
  try {
    const { username } = tokenInfo;

    const userFound = await CommonRepository.findByUsername(username);
    if (!userFound || userFound.length === 0) {
      return { result: false, messageState: "Usuario no encontrado." };
    }

    const usersPersonalInfo = await RegisterRepository.getUserPersonalInfo(username);
    let personalInfo = usersPersonalInfo[0];
    const profilePicture = personalInfo.profile_picture;
    personalInfo.profile_picture = (profilePicture)
      ? `data:image/jpeg;base64,${profilePicture.toString("base64")}`
      : null;

    personalInfo = Object.fromEntries(Object.entries(personalInfo).filter(([, value]) => value !== null));
    return {
      result: true,
      messageState: `Infomacion personal de ${username} correctamente obtenida.`,
      currentPersonalInfo: personalInfo,
    };
  } catch (err) {
    return { result: false, messageState: `Error al acceder a la informacion personal: ${(err as Error).message}` };
  }
}

export async function viewPublicUserPersonalInfo(viewPersonalInfo: any) {
  try {
    const { username } = viewPersonalInfo;
    const interfaceId = 1;
    
    const response = await viewUserPersonalInfo({ username } as TokenTypes.TokenPayload);
    if (!response.result) 
      return response;
    const data = response.currentPersonalInfo;
    const publicProfile = {
      username: data.username,
      profile_picture: data.profile_picture,
      names: data.show_name ? data.names : undefined,
      first_surname: data.show_name ? data.first_surname : undefined,
      second_surname: data.show_name ? data.second_surname : undefined,
      phone_number: data.show_phone ? data.phone_number : undefined,
      contact_email: data.show_contact_email ? data.contact_email : undefined,
      residence_city_name: data.show_residence ? data.residence_city_name : undefined,
      residence_country_name: data.show_residence ? data.residence_country_name : undefined,
      main_registration_email: data.main_registration_email
    };

    const cleanedProfile = Object.fromEntries(Object.entries(publicProfile).filter(([, value]) => value !== undefined));
    await CommonRepository.insertInterfaceView(username, interfaceId);
    return {
      result: true,
      messageState: `Perfil público de ${username} obtenido correctamente.`,
      currentPersonalInfo: cleanedProfile
    };
  } catch (err) {
    return { result: false, messageState: `Error: ${(err as Error).message}` };
  }
}

export async function updatePersonalInfoVisibility(
  tokenInfo: TokenTypes.TokenPayload,
  updatePersonalInfoVisibilityInfo: RegisterTypes.UpdatePersonalInfoVisibility) {
  try {
    const { username } = tokenInfo;
    const { visibilities } = updatePersonalInfoVisibilityInfo;

    const userFounded = await CommonRepository.findByUsername(username);
    if (userFounded.length === 0) 
      return { result: false, messageState: "Usuario no encontrado" };

    const allowedFields = ["show_name", "show_contact_email", "show_phone", "show_residence"];
    const fieldsToUpdate: Record<string, boolean> = {};
    for (const key of allowedFields) {
      if (typeof visibilities[key] === "boolean") {
        fieldsToUpdate[key] = visibilities[key];
      }
    }
    if (Object.keys(fieldsToUpdate).length === 0) {
      return { result: true, messageState: "No se enviaron campos válidos para actualizar" };
    }
    
    await RegisterRepository.updatePersonalInfoVisibility(username, fieldsToUpdate);
    return { result: true, messageState: "Cambios guardados exitosamente" };
  } catch (err) {
    return { result: false, messageState: `Error: ${(err as Error).message}` };
  }
}