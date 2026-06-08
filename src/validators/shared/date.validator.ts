export function validateDate(date: Date) {
  const formatedDate = new Date(date);
  const ans = (date && (isNaN(formatedDate.getTime())));
  return !ans;
}

export function validateFutureDate(date: Date) {
  const formatedDate = new Date(date);
  const ans = (date && ((formatedDate > new Date())));
  return !ans;
}

export function dateInRangeOver100Years(date: Date) {
  const formatedDate = new Date(date);
  const ans = (date && (formatedDate < new Date(new Date().setFullYear(new Date().getFullYear() - 100))));
  return !ans;
}