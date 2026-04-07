export interface UserTokenPayload {
  userId: number;
  username: string;
}

export interface UserPersonalInfo {
  userTokenPayload: UserTokenPayload;
  phone: string;
  names: string;
  paternalSurname: string;
  maternalSurname: string;
  address: string;
  residenceCountryId: number;
  contactEmail: string;
  profilePicture: string;
}