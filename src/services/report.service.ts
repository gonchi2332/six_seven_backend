import * as Selects from "../helpers/selects.helper";

async function getReports(
  username: string, period: string) {
  const validPeriods = ["day", "month", "year"];
  if (!validPeriods.includes(period)) {
    throw new Error("INVALID_PERIOD");
  }

  const rawData = await Selects.getInterfaceReports(username, period as "day" | "month" | "year");
  
  return rawData.map(row => ({
    interfaceId: row.interface_id,
    interfaceName: row.interface_name,
    ejeTiempo: row.eje_tiempo || "Sin datos",
    totalVistas: parseInt(row.total_vistas, 10)
  }));
}