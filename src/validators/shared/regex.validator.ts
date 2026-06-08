import * as RegexConstants from "../../utils/constants/regex.constants";

export function validateEmailFormat(email: string) {
  const ans = (!RegexConstants.emailRegex.test(email));
  return !ans;
}

export function validateCertificateTitleFormat(title: string) {
  const ans = (!RegexConstants.certificateTitleRegex.test(title));
  return !ans;
}

export function validateCertificateAreaFormat(area: string) {
  const ans = (!RegexConstants.areaRegex.test(area));
  return !ans;
}

export function validateEducationTitleFormat(title: string) {
  const ans = (!RegexConstants.titleRegex.test(title));
  return !ans;
}

export function validateEducationInstitutionFormat(institution: string) {
  const ans = (!RegexConstants.institutionRegex.test(institution));
  return !ans;
}

export function validateWorkPositionFormat(position: string) {
  const ans = (!RegexConstants.positionRegex.test(position));
  return !ans;
}

export function validateWorkCompanyFormat(company: string) {
  const ans = (!RegexConstants.companyRegex.test(company));
  return !ans;
}

export function validateDomainFormat(link: string) {
  const ans = (!RegexConstants.domainRegex.test(link));
  return !ans;
}

export function validatePhoneFormat(phone: string) {
  const ans = (!RegexConstants.phoneRegex.test(phone));
  return !ans;
}

export function validateLatinAlphabetFormat(skillName: string) {
  const ans = (!RegexConstants.latinAlphabetRegex.test(skillName));
  return !ans;
}

export function isGarbageInput(text: string) {
  return (RegexConstants.repeatedLettersRegex.test(text) || RegexConstants.onlyNumbersRegex.test(text));
}