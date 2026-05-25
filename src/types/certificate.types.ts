export interface CertificateInfo {
  title: string;
  description: string;
  area: string;
  issueDate: Date;
}

export interface CertificateModerationResponse {
  valid: boolean;
  extractedText?: string;
  reason?: string;
}