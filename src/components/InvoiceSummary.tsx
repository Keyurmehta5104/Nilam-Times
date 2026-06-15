import { numberToWords } from "@/utils/numberToWords";
import { calculateInvoiceTotals } from "@/utils/money";

interface InvoiceSummaryProps {
  subtotal: number;
  cgstPercent: number;
  sgstPercent: number;
  igstPercent: number;
  onTaxChange: (tax: "cgstPercent" | "sgstPercent" | "igstPercent", value: number) => void;
  readOnly?: boolean;
}

const InvoiceSummary = ({
  subtotal,
  cgstPercent,
  sgstPercent,
  igstPercent,
  onTaxChange,
  readOnly = false,
}: InvoiceSummaryProps) => {
  const {
    cgstAmount,
    sgstAmount,
    igstAmount,
    totalGstAmount,
    grandTotal,
  } = calculateInvoiceTotals({
    subtotal,
    cgstPercent,
    sgstPercent,
    igstPercent,
  });
  const displayAmount = (value: number) => (value > 0 ? value.toFixed(2) : "\u00A0");
  const displayWords = (value: number) => (value > 0 ? numberToWords(value) : "\u00A0");

  return (
    <div className="invoice-summary-wrap">
      <div className="grid grid-cols-2 gap-0">
        <div className="invoice-section invoice-summary-left-panel">
          <div className="invoice-summary-info-list">
            <p><span className="invoice-label font-bold">GSTIN No :</span> 24AHGPM4756L1ZZ</p>
            <p><span className="invoice-label font-bold">Bank Name :</span> INDIAN OVERSEAS BANK</p>
            <p><span className="invoice-label font-bold">Bank A/c No :</span> 014402000006637</p>
            <p><span className="invoice-label font-bold">IFSC Code :</span> IOBA0000144</p>
            <p><span className="invoice-label font-bold">Total GST :</span> {displayWords(totalGstAmount)}</p>
            <p><span className="invoice-label font-bold">Bill Amount :</span> {displayWords(grandTotal)}</p>
          </div>
        </div>

        <div className="invoice-section invoice-summary-right-panel">
          <div className="invoice-summary-top-box">
            <div className="tax-row">
              <span className="invoice-label font-bold">Sub Total</span>
              <span className="font-bold">{displayAmount(subtotal)}</span>
            </div>

            <div className="tax-row">
              <span className="invoice-label font-bold">Taxable Amount</span>
              <span className="font-bold">{displayAmount(subtotal)}</span>
            </div>

            <div className="tax-row">
              <div className="flex items-center gap-2">
                <span className="invoice-label font-bold">CGST</span>
                {readOnly ? (
                  <span className="invoice-readonly-tax">{cgstPercent.toFixed(2)}</span>
                ) : (
                  <input
                    type="number"
                    className="invoice-input w-12 text-center font-bold"
                    value={cgstPercent || ""}
                    onChange={(e) => onTaxChange("cgstPercent", parseFloat(e.target.value) || 0)}
                  />
                )}
                <span className="invoice-label font-bold">%</span>
              </div>
              <span className="font-bold">{displayAmount(cgstAmount)}</span>
            </div>

            <div className="tax-row">
              <div className="flex items-center gap-2">
                <span className="invoice-label font-bold">SGST</span>
                {readOnly ? (
                  <span className="invoice-readonly-tax">{sgstPercent.toFixed(2)}</span>
                ) : (
                  <input
                    type="number"
                    className="invoice-input w-12 text-center font-bold"
                    value={sgstPercent || ""}
                    onChange={(e) => onTaxChange("sgstPercent", parseFloat(e.target.value) || 0)}
                  />
                )}
                <span className="invoice-label font-bold">%</span>
              </div>
              <span className="font-bold">{displayAmount(sgstAmount)}</span>
            </div>

            <div className="tax-row">
              <div className="flex items-center gap-2">
                <span className="invoice-label font-bold">IGST</span>
                {readOnly ? (
                  <span className="invoice-readonly-tax">{igstPercent.toFixed(2)}</span>
                ) : (
                  <input
                    type="number"
                    className="invoice-input w-12 text-center font-bold"
                    value={igstPercent || ""}
                    onChange={(e) => onTaxChange("igstPercent", parseFloat(e.target.value) || 0)}
                  />
                )}
                <span className="invoice-label font-bold">%</span>
              </div>
              <span className="font-bold">{displayAmount(igstAmount)}</span>
            </div>

            <div className="tax-row grand-total-row">
              <span className="invoice-label font-bold text-lg">Grand Total</span>
              <span className="font-bold text-lg">{displayAmount(grandTotal)}</span>
            </div> 
          </div>
        </div>
      </div>

      <div className="invoice-summary-separator" />

      <div className="grid grid-cols-2 gap-0">
        <div className="invoice-section invoice-footer-left">
          <p className="invoice-label font-bold">Note :</p>
          <div className="invoice-footer-note-space">&nbsp;</div>

          <div className="invoice-terms-box">
            <p className="invoice-label font-bold">Terms & Conditions :</p>
            <p>1. Goods once sold will not be taken back.</p>
            <p>2. Interest @18% p.a. will be charged if payment is delayed.</p>
            <p>3. Our risk and responsibility ceases as soon as the goods leave our premises.</p>
            <p>4. Subject to RAJKOT Jurisdiction only. E.&amp;O.E.</p>
          </div>
        </div>

        <div className="invoice-section invoice-footer-right">
          <div className="invoice-signature-block">
            <p className="text-black font-bold text-lg">For, NILAM TIMES</p>
            <div className="signature-line mt-12 invoice-signature-line">
              <p className="text-black">Authorised Signatory</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceSummary;
