export const roundMoney = (value: number): number => {
  return Math.round((value + Number.EPSILON) * 100) / 100;
};

export const sumMoney = (values: number[]): number => {
  return roundMoney(values.reduce((total, value) => total + roundMoney(value), 0));
};

export const formatMoney = (value: number): string => {
  return roundMoney(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const formatQuantity = (value: number): string => {
  return Number(value.toFixed(3)).toString();
};

export const calculateInvoiceTotals = (params: {
  subtotal: number;
  cgstPercent: number;
  sgstPercent: number;
  igstPercent: number;
}) => {
  const subtotal = roundMoney(params.subtotal);
  const cgstAmount = roundMoney((subtotal * params.cgstPercent) / 100);
  const sgstAmount = roundMoney((subtotal * params.sgstPercent) / 100);
  const igstAmount = roundMoney((subtotal * params.igstPercent) / 100);
  const totalGstAmount = roundMoney(cgstAmount + sgstAmount + igstAmount);
  const grandTotal = roundMoney(subtotal + totalGstAmount);

  return {
    subtotal,
    cgstAmount,
    sgstAmount,
    igstAmount,
    totalGstAmount,
    grandTotal,
  };
};
