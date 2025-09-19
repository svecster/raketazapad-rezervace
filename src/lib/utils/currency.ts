/**
 * Czech currency formatting utilities
 * Formats numbers as Czech crowns with proper separators
 */

export const formatCurrency = (amount: number): string => {
  if (isNaN(amount)) return '0,00 Kč';
  
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount).replace('CZK', 'Kč');
};

export const formatPrice = (amount: number): string => {
  return formatCurrency(amount);
};

export const parseCurrency = (value: string): number => {
  const cleaned = value.replace(/[^\d,-]/g, '').replace(',', '.');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

export const formatCurrencyCompact = (amount: number): string => {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M Kč`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}k Kč`;
  }
  return formatCurrency(amount);
};