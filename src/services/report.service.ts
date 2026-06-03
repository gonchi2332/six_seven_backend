import * as Selects from "../helpers/selects.helper";

const DIAS_ES: Record<string, string> = {
  "Monday": "Lunes", "Tuesday": "Martes", "Wednesday": "Miércoles", "Thursday": "Jueves",
  "Friday": "Viernes", "Saturday": "Sábado", "Sunday": "Domingo"
};

const MESES_ES: Record<string, string> = {
  "January": "Enero", "February": "Febrero", "March": "Marzo", "April": "Abril",
  "May": "Mayo", "June": "Junio", "July": "Julio", "August": "Agosto",
  "September": "Septiembre", "October": "Octubre", "November": "Noviembre", "December": "Diciembre"
};

export async function getReports(
  username: string, period: string) {
  const validPeriods = ["day", "month", "year"];
  if (!validPeriods.includes(period)) {
    throw new Error("INVALID_PERIOD");
  }

  const rawReports = await Selects.getInterfaceReports(username, period as "day" | "month" | "year");

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
  };;
}