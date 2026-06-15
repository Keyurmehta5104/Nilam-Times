import { roundMoney } from "@/utils/money";

const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
  'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function convertLessThanThousand(num: number): string {
  if (num === 0) return '';
  
  if (num < 20) {
    return ones[num];
  }
  
  if (num < 100) {
    return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + ones[num % 10] : '');
  }
  
  return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 !== 0 ? ' ' + convertLessThanThousand(num % 100) : '');
}

export function numberToWords(num: number): string {
  const normalized = roundMoney(num);

  if (normalized === 0) return 'Zero Rupees Only';

  const rupees = Math.floor(normalized);
  const paise = Math.round((normalized - rupees) * 100);
  
  let result = '';
  let remainder = rupees;
  
  if (remainder >= 10000000) {
    result += convertLessThanThousand(Math.floor(remainder / 10000000)) + ' Crore ';
    remainder = remainder % 10000000;
  }
  
  if (remainder >= 100000) {
    result += convertLessThanThousand(Math.floor(remainder / 100000)) + ' Lakh ';
    remainder = remainder % 100000;
  }
  
  if (remainder >= 1000) {
    result += convertLessThanThousand(Math.floor(remainder / 1000)) + ' Thousand ';
    remainder = remainder % 1000;
  }
  
  if (remainder > 0) {
    result += convertLessThanThousand(remainder);
  }
  
  result = result.trim() + ' Rupees';
  
  if (paise > 0) {
    result += ' and ' + convertLessThanThousand(paise) + ' Paise';
  }
  
  return result + ' Only';
}
