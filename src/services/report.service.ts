import { DIAS_ES, MESES_ES } from "../utils/constants/array.constants";
import * as TokenTypes from "../types/token.types";
import * as ReportRepository from "../repositories/report.repository";

/**
 * La función `getReports` recupera datos analíticos de las vistas de interfaz para un usuario específico en un periodo determinado.
 * Traduce los nombres de los días y meses al español y formatea los resultados para su visualización en gráficos o reportes.
 * @param {TokenTypes.TokenPayload} tokenInfo - Información del token del usuario autenticado.
 * @param {any} getReportsInfo - Objeto que contiene el `period` ("day", "month" o "year").
 * @returns Objeto con `result`, `messageState` y `reports` (lista de datos analíticos formateados).
 * @throws Error "INVALID_PERIOD" si el periodo proporcionado no es válido.
 */
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