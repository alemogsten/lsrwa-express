export const formatNumber = (value) => {
  value = Number(value);
  return Number.isInteger(value) ? value : Number(value.toFixed(6));
}