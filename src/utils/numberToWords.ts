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
  if (num === 0) return 'Zero Rupees Only';
  
  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);
  
  let result = '';
  
  if (rupees >= 10000000) {
    result += convertLessThanThousand(Math.floor(rupees / 10000000)) + ' Crore ';
    num = rupees % 10000000;
  } else {
    num = rupees;
  }
  
  if (num >= 100000) {
    result += convertLessThanThousand(Math.floor(num / 100000)) + ' Lakh ';
    num = num % 100000;
  }
  
  if (num >= 1000) {
    result += convertLessThanThousand(Math.floor(num / 1000)) + ' Thousand ';
    num = num % 1000;
  }
  
  if (num > 0) {
    result += convertLessThanThousand(num);
  }
  
  result = result.trim() + ' Rupees';
  
  if (paise > 0) {
    result += ' and ' + convertLessThanThousand(paise) + ' Paise';
  }
  
  return result + ' Only';
}
