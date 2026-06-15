import { InvoiceData } from "@/types/invoice";

interface CustomerDetailsProps {
  data: InvoiceData;
  onChange: (field: keyof InvoiceData, value: string) => void;
}

const CustomerDetails = ({ data, onChange }: CustomerDetailsProps) => {
  return (
    <div className="invoice-section">
      <div className="grid grid-cols-1 gap-2">
        <div className="flex items-center gap-2">
          <span className="invoice-label w-24 shrink-0">Buyer :</span>
          <input
            type="text"
            className="invoice-input flex-1"
            value={data.customerName}
            onChange={(e) => onChange("customerName", e.target.value)}
            placeholder="Customer Name"
          />
        </div>
        <div className="flex items-start gap-2">
          <span className="invoice-label w-24 shrink-0">Address :</span>
          <textarea
            className="invoice-input flex-1 resize-none min-h-[60px]"
            value={data.customerAddress}
            onChange={(e) => onChange("customerAddress", e.target.value)}
            placeholder="Customer Address"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-black/20">
        <div className="flex items-center gap-2">
          <span className="invoice-label">GSTIN No. :</span>
          <input
            type="text"
            className="invoice-input flex-1"
            value={data.customerGstin}
            onChange={(e) => onChange("customerGstin", e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="invoice-label">State :</span>
          <input
            type="text"
            className="invoice-input flex-1"
            value={data.customerState}
            onChange={(e) => onChange("customerState", e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="invoice-label">Code :</span>
          <input
            type="text"
            className="invoice-input flex-1"
            value={data.customerCode}
            onChange={(e) => onChange("customerCode", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;
