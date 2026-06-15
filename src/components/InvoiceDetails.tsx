import { InvoiceData } from "@/types/invoice";

interface InvoiceDetailsProps {
  data: InvoiceData;
  onChange: (field: keyof InvoiceData, value: string) => void;
  readOnly?: boolean;
  copyType?: string;
}

const ReadOnlyValue = ({ value, className = "" }: { value: string; className?: string }) => (
  <div className={`invoice-readonly-value ${className}`.trim()}>{value || "\u00A0"}</div>
);

const InvoiceDetails = ({ data, onChange, readOnly = false, copyType }: InvoiceDetailsProps) => {
  return (
    <div className="grid grid-cols-12 gap-0">
      <div className="col-span-3 invoice-section invoice-strip-cell">
        <p className="invoice-label font-bold">Debit Memo</p>
      </div>
      <div className="col-span-6 invoice-section invoice-strip-cell text-center">
        <p className="invoice-doc-title">TAX INVOICE</p>
      </div>
      <div className="col-span-3 invoice-section invoice-strip-cell text-right">
        <p className="invoice-label font-bold">{copyType || "Original"}</p>
      </div>

      <div className="col-span-7 invoice-section">
        <div className="invoice-party-block space-y-2">
          <div className="flex items-center gap-2">
            <span className="invoice-label w-24 shrink-0">M/s. :</span>
            {readOnly ? (
              <ReadOnlyValue value={data.customerName} className="flex-1 font-semibold" />
            ) : (
              <input
                type="text"
                className="invoice-input flex-1 font-semibold"
                value={data.customerName}
                onChange={(e) => onChange("customerName", e.target.value)}
                placeholder="Customer Name"
              />
            )}
          </div>
          <div className="flex items-start gap-2">
            <span className="invoice-label w-24 shrink-0">Address :</span>
            {readOnly ? (
              <ReadOnlyValue value={data.customerAddress} className="flex-1 min-h-[58px] whitespace-pre-wrap" />
            ) : (
              <textarea
                className="invoice-input flex-1 resize-none min-h-[58px]"
                value={data.customerAddress}
                onChange={(e) => onChange("customerAddress", e.target.value)}
                placeholder="Customer Address"
              />
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="invoice-label w-32 shrink-0 whitespace-nowrap">Place of Supply :</span>
            {readOnly ? (
              <ReadOnlyValue value={data.placeOfSupply} className="flex-1" />
            ) : (
              <input
                type="text"
                className="invoice-input flex-1"
                value={data.placeOfSupply}
                onChange={(e) => onChange("placeOfSupply", e.target.value)}
              />
            )}
          </div>
          <div className="pt-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="invoice-label w-24 shrink-0 whitespace-nowrap">GSTIN No. :</span>
              {readOnly ? (
                <ReadOnlyValue value={data.customerGstin} className="flex-1" />
              ) : (
                <input
                  type="text"
                  className="invoice-input flex-1"
                  value={data.customerGstin}
                  onChange={(e) => onChange("customerGstin", e.target.value)}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="col-span-5 invoice-section p-0">
        <div className="invoice-side-box invoice-meta-box">
          <div className="invoice-meta-row">
            <span className="invoice-label">Invoice No.</span>
            <span className="invoice-label meta-colon">:</span>
            {readOnly ? (
              <ReadOnlyValue value={data.invoiceNo} className="flex-1" />
            ) : (
              <input
                type="text"
                className="invoice-input flex-1"
                value={data.invoiceNo}
                onChange={(e) => onChange("invoiceNo", e.target.value)}
              />
            )}
          </div>
          <div className="invoice-meta-row">
            <span className="invoice-label">Date</span>
            <span className="invoice-label meta-colon">:</span>
            {readOnly ? (
              <ReadOnlyValue value={data.invoiceDate} className="flex-1" />
            ) : (
              <input
                type="date"
                className="invoice-input flex-1"
                value={data.invoiceDate}
                onChange={(e) => onChange("invoiceDate", e.target.value)}
              />
            )}
          </div>
          <div className="invoice-meta-row">
            <span className="invoice-label">Transport</span>
            <span className="invoice-label meta-colon">:</span>
            {readOnly ? (
              <ReadOnlyValue value={data.despatchedBy} className="flex-1" />
            ) : (
              <input
                type="text"
                className="invoice-input flex-1"
                value={data.despatchedBy}
                onChange={(e) => onChange("despatchedBy", e.target.value)}
              />
            )}
          </div>
          <div className="invoice-meta-row">
            <span className="invoice-label">L.R. No.</span>
            <span className="invoice-label meta-colon">:</span>
            {readOnly ? (
              <ReadOnlyValue value={data.lrNumber} className="flex-1" />
            ) : (
              <input
                type="text"
                className="invoice-input flex-1"
                value={data.lrNumber}
                onChange={(e) => onChange("lrNumber", e.target.value)}
              />
            )}
          </div>
          <div className="invoice-meta-row">
            <span className="invoice-label">L.R. Date</span>
            <span className="invoice-label meta-colon">:</span>
            {readOnly ? (
              <ReadOnlyValue value={data.dateOfSupply} className="flex-1" />
            ) : (
              <input
                type="date"
                className="invoice-input flex-1"
                value={data.dateOfSupply}
                onChange={(e) => onChange("dateOfSupply", e.target.value)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetails;
