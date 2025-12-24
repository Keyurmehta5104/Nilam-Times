import { numberToWords } from "@/utils/numberToWords";

interface InvoiceSummaryProps {
  subtotal: number;
  cgstPercent: number;
  sgstPercent: number;
  igstPercent: number;
  onTaxChange: (tax: "cgstPercent" | "sgstPercent" | "igstPercent", value: number) => void;
}

const InvoiceSummary = ({
  subtotal,
  cgstPercent,
  sgstPercent,
  igstPercent,
  onTaxChange,
}: InvoiceSummaryProps) => {
  const cgstAmount = (subtotal * cgstPercent) / 100;
  const sgstAmount = (subtotal * sgstPercent) / 100;
  const igstAmount = (subtotal * igstPercent) / 100;
  const grandTotal = subtotal + cgstAmount + sgstAmount + igstAmount;

  return (
    <div className="grid grid-cols-2 gap-0">
      <div className="invoice-section">
        <div className="invoice-label mb-2">Rupees In Word</div>
        <p className="text-sm font-medium text-foreground min-h-[40px]">
          {grandTotal > 0 ? numberToWords(grandTotal) : "-"}
        </p>

        <div className="mt-6 pt-4 border-t border-primary/20">
          <p className="invoice-label font-bold text-center mb-2">Bank Detail</p>
          <p className="font-bold text-foreground">Indian Overseas Bank</p>
          <div className="flex items-center gap-1 mt-2">
            <span className="text-sm">A/c. No.</span>
            <div className="flex">
              {"01440200000637".split("").map((digit, i) => (
                <span
                  key={i}
                  className="w-5 h-6 border border-primary/40 text-center text-sm flex items-center justify-center"
                >
                  {digit}
                </span>
              ))}
            </div>
          </div>
          <p className="text-sm mt-1">
            <span className="font-bold">IFSC:</span> IOBA0000144
          </p>
        </div>

        <div className="mt-4 pt-2 border-t border-primary/30">
          <p className="text-xs text-primary">Subject To Rajkot Juridiction</p>
          <p className="text-xs text-primary">E.&E.O.</p>
        </div>
      </div>

      <div className="invoice-section">
        <div className="space-y-2">
          <div className="tax-row">
            <span className="invoice-label font-bold">Amount Before Tax</span>
            <span className="font-bold">₹{subtotal.toFixed(2)}</span>
          </div>
          
          <div className="tax-row">
            <div className="flex items-center gap-2">
              <span className="invoice-label">Add: CGST</span>
              <input
                type="number"
                className="invoice-input w-12 text-center"
                value={cgstPercent || ""}
                onChange={(e) => onTaxChange("cgstPercent", parseFloat(e.target.value) || 0)}
              />
              <span className="invoice-label">%</span>
            </div>
            <span>₹{cgstAmount.toFixed(2)}</span>
          </div>

          <div className="tax-row">
            <div className="flex items-center gap-2">
              <span className="invoice-label">Add: SGST</span>
              <input
                type="number"
                className="invoice-input w-12 text-center"
                value={sgstPercent || ""}
                onChange={(e) => onTaxChange("sgstPercent", parseFloat(e.target.value) || 0)}
              />
              <span className="invoice-label">%</span>
            </div>
            <span>₹{sgstAmount.toFixed(2)}</span>
          </div>

          <div className="tax-row">
            <div className="flex items-center gap-2">
              <span className="invoice-label">Add: IGST</span>
              <input
                type="number"
                className="invoice-input w-12 text-center"
                value={igstPercent || ""}
                onChange={(e) => onTaxChange("igstPercent", parseFloat(e.target.value) || 0)}
              />
              <span className="invoice-label">%</span>
            </div>
            <span>₹{igstAmount.toFixed(2)}</span>
          </div>

          <div className="tax-row bg-accent/50 -mx-3 px-3 py-2">
            <span className="invoice-label font-bold text-lg">Grand Total</span>
            <span className="font-bold text-lg">₹{grandTotal.toFixed(2)}</span>
          </div>
        </div>

        <div className="mt-8 text-right">
          <p className="text-primary font-bold italic text-lg">For, NILAM TIMES</p>
          <div className="signature-line mt-12">
            <p className="text-primary font-bold">Proprietor</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceSummary;
