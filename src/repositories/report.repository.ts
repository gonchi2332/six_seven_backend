import { processReturnQuery } from "../utils/query.util";

export async function getInterfaceReports(username: string, period: "day" | "month" | "year") {
  // eslint-disable-next-line no-useless-assignment
  let timeFormat = "";
  // eslint-disable-next-line no-useless-assignment
  let orderBy = "";

  switch (period) {
    case "day":
      timeFormat = "Day";
      orderBy = "EXTRACT(DOW FROM viewed_at)";
      break;
    case "month":
      timeFormat = "Month";
      orderBy = "EXTRACT(MONTH FROM viewed_at)";
      break;
    case "year":
      timeFormat = "YYYY";
      orderBy = "EXTRACT(YEAR FROM viewed_at)";
      break;
    default:
      throw new Error("Periodo no válido. Use: day, month o year");
  }
  const query = `
      SELECT 
        i.id AS interface_id,
        i.name AS interface_name,
        COALESCE(TRIM(TO_CHAR(v.viewed_at, '${timeFormat}')), 'Sin datos') AS time_axis,
        COUNT(v.id) AS total_views
      FROM "interface" i
      LEFT JOIN "interface_view" v 
          ON i.id = v.interface_id AND v.username = $1
      GROUP BY i.id, i.name, time_axis, ${orderBy}
      ORDER BY i.id, ${orderBy};
    `;

  const result = await processReturnQuery(query, [username]);
  return result;
}