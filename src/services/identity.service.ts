import { processReturnQuery } from "../utils/query";
import { generateToken } from "../utils/jwt";
import * as TokenTypes from "../types/token.types";

export async function getUserRoles(username: string): Promise<TokenTypes.UserRole[]> {
  const query = `
    SELECT r.id, r.name, ur.active
    FROM "user_role" ur
    JOIN "role" r ON ur.role_id = r.id
    WHERE ur.username = $1 AND ur.active = true
  `;
  return await processReturnQuery(query, [username]) as TokenTypes.UserRole[];
}

export async function selectRole(
  currentUser: TokenTypes.TokenPayload,
  selectedRoleId: number
) {
  const roles = await getUserRoles(currentUser.username);

  if (roles.length === 0) {
    const error = new Error("El usuario no tiene roles activos o no existe.");
    error.name = "NotFoundError";
    throw error;
  }

  const selectedRole = roles.find(role => role.id === selectedRoleId);
  if (!selectedRole) {
    const error = new Error("El rol seleccionado no pertenece al usuario o no está activo.");
    error.name = "AuthError";
    throw error;
  }

  const token = generateToken({
    username: currentUser.username,
    state: currentUser.state,
    roles,
    current_role_id: selectedRoleId
  });

  return {
    token,
    roles,
    currentRoleId: selectedRoleId
  };
}

export async function getRoleResources(currentRoleId: number) {
  const query = `
    SELECT 
      f.id AS function_id,
      f.name AS function_name,
      i.id AS interface_id,
      i.name AS interface_name
    FROM "role_function" rf
    JOIN "function" f ON rf.function_id = f.id
    LEFT JOIN "function_interface" fi ON f.id = fi.function_id AND fi.active = true
    LEFT JOIN "interface" i ON fi.interface_id = i.id
    WHERE rf.role_id = $1 AND rf.active = true
    ORDER BY f.id, i.id
  `;

  const rows = await processReturnQuery(query, [currentRoleId]);

  const functions: Array<{
    id: number;
    name: string;
    interfaces: Array<{ id: number; name: string }>;
  }> = [];
  const interfaceMap = new Map<number, string>();

  for (const row of rows as Array<Record<string, unknown>>) {
    const functionId = row.function_id as number;
    const functionName = row.function_name as string;
    const interfaceId = row.interface_id as number | null;
    const interfaceName = row.interface_name as string | null;

    let functionEntry = functions.find(fn => fn.id === functionId);
    if (!functionEntry) {
      functionEntry = {
        id: functionId,
        name: functionName,
        interfaces: []
      };
      functions.push(functionEntry);
    }

    if (interfaceId && interfaceName) {
      functionEntry.interfaces.push({ id: interfaceId, name: interfaceName });
      interfaceMap.set(interfaceId, interfaceName);
    }
  }

  return {
    functions,
    interfaces: Array.from(interfaceMap.entries()).map(([id, name]) => ({ id, name }))
  };
}
