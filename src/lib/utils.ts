import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string | null | undefined): string {
  const numeric = typeof amount === 'string' ? parseFloat(amount) : Number(amount || 0);
  if (isNaN(numeric)) return '৳ 0';
  return `৳ ${numeric.toLocaleString('en-BD', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function formatDate(dateString: string | Date | null | undefined): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return String(dateString);
  }
}

export function numberToWordsBDT(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return 'Zero Taka Only';
  }

  const rounded = Math.round(amount * 100) / 100;
  const integerPart = Math.floor(Math.abs(rounded));
  const decimalPart = Math.round((Math.abs(rounded) - integerPart) * 100);

  if (integerPart === 0 && decimalPart === 0) {
    return 'Zero Taka Only';
  }

  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];

  const tens = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
  ];

  function convertTwoDigits(n: number): string {
    if (n === 0) return '';
    if (n < 20) return ones[n];
    const ten = Math.floor(n / 10);
    const unit = n % 10;
    return tens[ten] + (unit > 0 ? ' ' + ones[unit] : '');
  }

  function convertThreeDigits(n: number): string {
    if (n === 0) return '';
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    let result = '';
    if (hundred > 0) {
      result += ones[hundred] + ' Hundred';
      if (rest > 0) result += ' ';
    }
    if (rest > 0) {
      result += convertTwoDigits(rest);
    }
    return result;
  }

  let words = '';
  let remaining = integerPart;

  if (remaining >= 10000000) {
    const crore = Math.floor(remaining / 10000000);
    words += numberToWordsBDT(crore).replace(' Taka Only', '') + ' Crore ';
    remaining %= 10000000;
  }

  if (remaining >= 100000) {
    const lakh = Math.floor(remaining / 100000);
    words += convertTwoDigits(lakh) + ' Lakh ';
    remaining %= 100000;
  }

  if (remaining >= 1000) {
    const thousand = Math.floor(remaining / 1000);
    words += convertTwoDigits(thousand) + ' Thousand ';
    remaining %= 1000;
  }

  if (remaining > 0) {
    words += convertThreeDigits(remaining) + ' ';
  }

  words = words.trim();
  if (words.length > 0) {
    words += ' Taka';
  }

  if (decimalPart > 0) {
    const paisaWords = convertTwoDigits(decimalPart);
    words += ` And ${paisaWords} Paisa`;
  }

  return (words + ' Only').trim();
}
