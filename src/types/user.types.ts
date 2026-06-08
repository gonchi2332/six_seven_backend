/** Información personal detallada de un usuario. */
export interface UserPersonalInfo {
  /** Número de teléfono de contacto. */
  phone: string;
  /** Nombres del usuario. */
  names: string;
  /** Primer apellido. */
  firstSurname: string;
  /** Segundo apellido. */
  secondSurname: string;
  /** Ciudad de residencia. */
  residenceCity: string;
  /** País de residencia. */
  residenceCountry: string;
  /** Correo electrónico de contacto público. */
  contactEmail: string;
  /** Correo electrónico secundario de registro. */
  secondaryRegistrationEmail: string;
}