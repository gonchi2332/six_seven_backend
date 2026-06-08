export function validateObjectKeys(parameters: any) {
  const ans = (!parameters || Object.keys(parameters).length === 0);
  return !ans;
}