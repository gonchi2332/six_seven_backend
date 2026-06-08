export function amountOutOfRange(amount: number, min: number, max: number) {
  const ans = (amount < min || amount > max);
  return !ans;
}