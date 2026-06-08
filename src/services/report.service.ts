import { DIAS_ES, MESES_ES } from "../utils/constants/array.constants";
import * as TokenTypes from "../types/token.types";
import * as ReportRepository from "../repositories/report.repository";

export async function getReports(
  tokenInfo: TokenTypes.TokenPayload, 
  getReportsInfo: any) {
  const { username } = tokenInfo;
  const { period } = getReportsInfo;

  const validPeriods = ["day", "month", "year"];
  if (!validPeriods.includes(period)) {
    throw new Error("INVALID_PERIOD");
  }

  const rawReports = await ReportRepository.getInterfaceReports(username, period as "day" | "month" | "year");
  const reportArray = Array.isArray(rawReports)
    ? rawReports
    : (rawReports ? [rawReports] : []);

  const analitcs = reportArray.map(row => {
    let timeAxisFormatted = row.time_axis;

    if (DIAS_ES[timeAxisFormatted]) timeAxisFormatted = DIAS_ES[timeAxisFormatted];
    if (MESES_ES[timeAxisFormatted]) timeAxisFormatted = MESES_ES[timeAxisFormatted];

    return {
      interfaceId: row.interface_id,
      interfaceName: row.interface_name,
      timeAxis: timeAxisFormatted || "Sin datos",
      totalViews: parseInt(row.total_views || "0", 10)
    };
  });
  return {
    result: true,
    messageState: `Informacion analitica de ${username} correctamente obtenida.`,
    reports: analitcs
  };
}