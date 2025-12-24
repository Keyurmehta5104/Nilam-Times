import { InvoiceData } from "@/types/invoice";

interface InvoiceDetailsProps {
  data: InvoiceData;
  onChange: (field: keyof InvoiceData, value: string) => void;
}

const InvoiceDetails = ({ data, onChange }: InvoiceDetailsProps) => {
  return (
    <div className="grid grid-cols-3 gap-0">
      <div className="col-span-1 invoice-section bg-accent/50">
        <p className="invoice-label font-bold">GSTIN: 24AHGPM4756L1ZZ</p>
      </div>
      <div className="col-span-1 invoice-section bg-accent text-center">
        <p className="invoice-label font-bold text-lg">TAX INVOICE</p>
      </div>
      <div className="col-span-1 invoice-section bg-accent/50 text-right">
        <p className="invoice-label font-bold">CASH/DEBIT MEMO</p>
      </div>

      <div className="col-span-2 invoice-section">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <span className="invoice-label">Book no.:</span>
            <input
              type="text"
              className="invoice-input flex-1"
              value={data.bookNo}
              onChange={(e) => onChange("bookNo", e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="invoice-label">Invoice No.:</span>
            <input
              type="text"
              className="invoice-input flex-1"
              value={data.invoiceNo}
              onChange={(e) => onChange("invoiceNo", e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="invoice-label">Invoice Date:</span>
            <input
              type="date"
              className="invoice-input flex-1"
              value={data.invoiceDate}
              onChange={(e) => onChange("invoiceDate", e.target.value)}
            />
          </div>
          <div></div>
          <div className="flex items-center gap-2">
            <span className="invoice-label">State:</span>
            <input
              type="text"
              className="invoice-input flex-1"
              value={data.state}
              onChange={(e) => onChange("state", e.target.value)}
            />
          </div>
          <div></div>
          <div className="flex items-center gap-2">
            <span className="invoice-label">Code:</span>
            <input
              type="text"
              className="invoice-input flex-1"
              value={data.code}
              onChange={(e) => onChange("code", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="col-span-1 invoice-section">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="invoice-label">Despatched by:</span>
            <input
              type="text"
              className="invoice-input flex-1"
              value={data.despatchedBy}
              onChange={(e) => onChange("despatchedBy", e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="invoice-label">L.R. Number:</span>
            <input
              type="text"
              className="invoice-input flex-1"
              value={data.lrNumber}
              onChange={(e) => onChange("lrNumber", e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="invoice-label">Date Of Supply:</span>
            <input
              type="date"
              className="invoice-input flex-1"
              value={data.dateOfSupply}
              onChange={(e) => onChange("dateOfSupply", e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="invoice-label">Place Of Supply:</span>
            <input
              type="text"
              className="invoice-input flex-1"
              value={data.placeOfSupply}
              onChange={(e) => onChange("placeOfSupply", e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetails;
