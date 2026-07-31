export const formatBillNo = (no: number | string | undefined | null): string => {
  if (no === undefined || no === null || no === '') return '';
  const num = parseInt(String(no), 10);
  if (isNaN(num)) return String(no);
  return String(num).padStart(3, '0');
};
