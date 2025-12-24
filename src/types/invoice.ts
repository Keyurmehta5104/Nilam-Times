export interface InvoiceItem {
  id: string;
  particular: string;
  hsnCode: string;
  perPic: string;
  qty: number;
  rate: number;
  amount: number;
}

export interface InvoiceData {
  bookNo: string;
  invoiceNo: string;
  invoiceDate: string;
  state: string;
  code: string;
  despatchedBy: string;
  lrNumber: string;
  dateOfSupply: string;
  placeOfSupply: string;
  customerName: string;
  customerAddress: string;
  customerGstin: string;
  customerState: string;
  customerCode: string;
  items: InvoiceItem[];
  cgstPercent: number;
  sgstPercent: number;
  igstPercent: number;
}
