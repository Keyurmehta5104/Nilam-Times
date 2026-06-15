import { InvoiceData, InvoiceItem } from "@/types/invoice";
import { numberToWords } from "@/utils/numberToWords";
import {
  calculateInvoiceTotals,
  formatMoney,
  formatQuantity,
  roundMoney,
} from "@/utils/money";

import { Client } from "@/hooks/useClients";

interface InvoiceSheetProps {
  data: InvoiceData;
  clients?: Client[];
  copyType?: string;
  className?: string;
  readOnly?: boolean;
  onFieldChange?: (field: keyof InvoiceData, value: string) => void;
  onItemChange?: (
    id: string,
    field: keyof InvoiceItem,
    value: string | number
  ) => void;
  onTaxChange?: (
    tax: "cgstPercent" | "sgstPercent" | "igstPercent",
    value: number
  ) => void;
}

const noopFieldChange = () => { };
const noopItemChange = () => { };
const noopTaxChange = () => { };

const COMPANY_NAME = "NILAM TIMES";
const COMPANY_ADDRESS = "4 PATELNAGAR, 1 SADBHAVNA SOCIETY, RAJKOT - 360 002";
const COMPANY_GSTIN = "24AHGPM4756L1ZZ";
const BANK_NAME = "INDIAN OVERSEAS BANK";
const BANK_ACCOUNT = "014402000006637";
const BANK_IFSC = "IOBA0000144";

const DEFAULT_HSN_CODE = "9102";
const DEFAULT_UNIT = "PIC";
const INVOICE_PREFIX = "GT/";
const TOTAL_VISUAL_ROWS = 16;
const TOP_STRIP_LABEL = "Debit Memo";

const isFilledItem = (item?: InvoiceItem) =>
  !!item &&
  (item.particular.trim() !== "" ||
    item.hsnCode.trim() !== "" ||
    item.qty > 0 ||
    item.rate > 0 ||
    item.amount > 0);

const formatBillDate = (value: string) => {
  if (!value) return "\u00A0";
  const parts = value.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return value;
};

const normalizeInvoiceNumber = (value: string) => {
  const clean = (value || "").trim();
  if (!clean) return "";
  if (clean.toUpperCase().startsWith("GT/")) return clean;
  return `${INVOICE_PREFIX}${clean}`;
};

const InvoiceSheet = ({
  data,
  clients = [],
  copyType = "Original",
  className = "",
  readOnly = false,
  onFieldChange = noopFieldChange,
  onItemChange = noopItemChange,
  onTaxChange = noopTaxChange,
}: InvoiceSheetProps) => {
  const subtotalBase = data.items.reduce(
    (sum, item) => sum + roundMoney(item.amount),
    0
  );

  const {
    subtotal,
    cgstAmount,
    sgstAmount,
    igstAmount,
    totalGstAmount,
    grandTotal,
  } = calculateInvoiceTotals({
    subtotal: subtotalBase,
    cgstPercent: data.cgstPercent,
    sgstPercent: data.sgstPercent,
    igstPercent: data.igstPercent,
  });

  const visibleItems = readOnly ? data.items.filter(isFilledItem) : data.items;
  const displayItems =
    readOnly && visibleItems.length === 0 ? [undefined] : visibleItems;

  const rowCount = Math.max(displayItems.length, TOTAL_VISUAL_ROWS);
  const blankRows = Math.max(rowCount - displayItems.length, 1);
  const copyTypeClass = `bill-copy-${copyType.toLowerCase()}`;

  const totalGstWords =
    totalGstAmount > 0
      ? numberToWords(totalGstAmount)
        .replace(/ Rupees Only$/, "")
        .replace(/ Only$/, " Only")
      : "\u00A0";

  const billAmountWords =
    grandTotal > 0
      ? numberToWords(grandTotal).replace(/ Rupees Only$/, " Only")
      : "\u00A0";

  const renderField = (
    field: keyof InvoiceData,
    value: string,
    options?: {
      multiline?: boolean;
      type?: "text" | "date";
      className?: string;
      placeholder?: string;
      displayValue?: string;
    }
  ) => {
    const {
      multiline = false,
      type = "text",
      className: extraClass = "",
      placeholder = "",
      displayValue,
    } = options || {};

    if (readOnly) {
      const finalValue =
        displayValue !== undefined
          ? displayValue
          : type === "date"
            ? formatBillDate(value)
            : value;

      return (
        <div
          className={`bill-field-value ${multiline ? "multiline" : ""
            } ${extraClass}`.trim()}
        >
          {finalValue || "\u00A0"}
        </div>
      );
    }

    if (field === "invoiceNo") {
      const rawValue = (value || "").replace(/^GT\//i, "");

      return (
        <div className={`bill-prefix-input-wrap ${extraClass}`.trim()}>
          <span className="bill-prefix-static">GT/</span>
          <input
            type="text"
            className="bill-field-input bill-prefix-input"
            value={rawValue}
            onChange={(e) =>
              onFieldChange("invoiceNo", e.target.value.replace(/^GT\//i, ""))
            }
            placeholder={placeholder || "626"}
          />
        </div>
      );
    }

    if (multiline) {
      return (
        <textarea
          className={`bill-field-input multiline ${extraClass}`.trim()}
          value={value}
          onChange={(e) => onFieldChange(field, e.target.value)}
          placeholder={placeholder}
        />
      );
    }

    const handleTaxesByState = (stateName: string) => {
      const isGujarat = (stateName || "").toLowerCase().trim() === "gujarat";
      if (isGujarat) {
        onTaxChange?.("cgstPercent", 9);
        onTaxChange?.("sgstPercent", 9);
        onTaxChange?.("igstPercent", 0);
      } else if (stateName && stateName.trim() !== "") {
        onTaxChange?.("cgstPercent", 0);
        onTaxChange?.("sgstPercent", 0);
        onTaxChange?.("igstPercent", 18);
      }
    };

    const handleCustomerNameChange = (name: string) => {
      onFieldChange("customerName", name);

      // Auto-fill logic
      if (name && clients.length > 0) {
        const matchedClient = clients.find(
          (c) => c.name.toUpperCase() === name.toUpperCase()
        );

        if (matchedClient) {
          if (matchedClient.address) onFieldChange("customerAddress", matchedClient.address);
          if (matchedClient.gstin) onFieldChange("customerGstin", matchedClient.gstin);
          if (matchedClient.code) onFieldChange("customerCode", matchedClient.code);
          
          // State and Place of Supply should be the same
          const location = matchedClient.place_of_supply || matchedClient.state;
          if (location) {
            onFieldChange("customerState", location);
            onFieldChange("placeOfSupply", location);
            handleTaxesByState(location);
          } else if (matchedClient.address) {
            const addrLines = matchedClient.address.split("\n").map(l => l.trim()).filter(l => l);
            if (addrLines.length > 0) {
              const lastLine = addrLines[addrLines.length - 1];
              onFieldChange("customerState", lastLine);
              onFieldChange("placeOfSupply", lastLine);
              handleTaxesByState(lastLine);
            }
          }
        }
      }
    };

    if (field === "customerName") {
      return (
        <>
          <input
            type="text"
            list="customer-suggestions"
            className={`bill-field-input ${extraClass}`.trim()}
            value={value}
            onChange={(e) => handleCustomerNameChange(e.target.value)}
            placeholder={placeholder}
          />
          <datalist id="customer-suggestions">
            {clients.map((client) => (
              <option key={client.id} value={client.name} />
            ))}
          </datalist>
        </>
      );
    }

    if (field === "customerState" || field === "placeOfSupply") {
      return (
        <input
          type={type}
          className={`bill-field-input${type === "date" ? " bill-date-mobile" : ""} ${extraClass}`.trim()}
          value={value}
          onChange={(e) => {
            const newValue = e.target.value;
            onFieldChange("customerState", newValue);
            onFieldChange("placeOfSupply", newValue);
            handleTaxesByState(newValue);
          }}
          placeholder={placeholder}
        />
      );
    }

    return (
      <input
        type={type}
        className={`bill-field-input${type === "date" ? " bill-date-mobile" : ""} ${extraClass}`.trim()}
        value={value}
        onChange={(e) => onFieldChange(field, e.target.value)}
        placeholder={placeholder}
      />
    );
  };



  const renderItemField = (
    item: InvoiceItem,
    field: keyof InvoiceItem,
    value: string | number,
    inputType: "text" | "number",
    className = ""
  ) => {
    if (readOnly) {
      return (
        <div className={`bill-cell-value ${className}`.trim()}>
          {String(value || "") || "\u00A0"}
        </div>
      );
    }

    return (
      <input
        type={inputType}
        className={`bill-cell-input ${className}`.trim()}
        value={value as string | number}
        onChange={(e) =>
          onItemChange(
            item.id,
            field,
            inputType === "number"
              ? parseFloat(e.target.value) || 0
              : e.target.value
          )
        }
        min={inputType === "number" ? "0" : undefined}
        step={inputType === "number" ? "0.01" : undefined}
      />
    );
  };

  const renderTaxPercent = (
    field: "cgstPercent" | "sgstPercent" | "igstPercent",
    value: number
  ) => {
    if (readOnly) return <span>{value.toFixed(1)}%</span>;

    return (
      <span className="bill-tax-inline">
        <input
          type="number"
          className="bill-tax-input"
          value={value || ""}
          onChange={(e) => onTaxChange(field, parseFloat(e.target.value) || 0)}
        />
        <span>%</span>
      </span>
    );
  };

  return (
    <div
      className={`bill-page ${copyTypeClass} ${className}`.trim()}
      style={{ ["--bill-row-count" as string]: String(rowCount) }}
    >
      <div className="bill-page-inner">
        <div className="bill-header">
          <div className="bill-company-name">{COMPANY_NAME}</div>
          <div className="bill-company-address">{COMPANY_ADDRESS}</div>

          <table className="bill-title-strip-table">
            <tbody>
              <tr>
                <td className="bill-title-strip-left">{TOP_STRIP_LABEL}</td>
                <td className="bill-title-strip-center">TAX INVOICE</td>
                <td className="bill-title-strip-right">{copyType}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bill-details">
          <table className="bill-details-table">
            <colgroup>
              <col style={{ width: "58.2%" }} />
              <col style={{ width: "41.8%" }} />
            </colgroup>
            <tbody>
              <tr>
                <td className="bill-details-cell">
                  <table className="bill-inner-table bill-party-table">
                    <tbody>
                      <tr>
                        <td className="bill-label strong">M/s.</td>
                        <td className="bill-colon strong">:</td>
                        <td>
                          {renderField("customerName", data.customerName, {
                            className: "bold uppercase",
                          })}
                        </td>
                      </tr>
                      <tr>
                        <td className="bill-label top">&nbsp;</td>
                        <td className="bill-colon top">&nbsp;</td>
                        <td>
                          {renderField("customerAddress", data.customerAddress, {
                            multiline: true,
                            className: "uppercase",
                          })}
                        </td>
                      </tr>
                      <tr>
                        <td className="bill-label">Place of Supply</td>
                        <td className="bill-colon">:</td>
                        <td>{renderField("placeOfSupply", data.placeOfSupply)}</td>
                      </tr>
                      <tr>
                        <td className="bill-label">GSTIN No.</td>
                        <td className="bill-colon">:</td>
                        <td>{renderField("customerGstin", data.customerGstin, { className: "uppercase" })}</td>
                      </tr>
                      <tr>
                        <td className="bill-label">State</td>
                        <td className="bill-colon">:</td>
                        <td>
                          <div className="bill-inline-pair">
                            <div className="bill-inline-pair-group state-group">
                              {renderField("customerState", data.customerState, { className: "text-[10px]" })}
                            </div>
                            <div className="bill-inline-pair-group code-group">
                              <span className="bill-inline-label">Code</span>
                              <span className="bill-inline-colon">:</span>
                              <div className="bill-inline-pair-field">
                                {renderField("customerCode", data.customerCode, { className: "text-[10px]" })}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>

                <td className="bill-details-cell">
                  <table className="bill-inner-table bill-meta-table">
                    <tbody>
                      <tr className="bg-grey">
                        <td className="bill-label">Invoice No.</td>
                        <td className="bill-colon">:</td>
                        <td>
                          {renderField("invoiceNo", data.invoiceNo, {
                            placeholder: "626",
                            displayValue: normalizeInvoiceNumber(data.invoiceNo),
                          })}
                        </td>
                      </tr>
                      <tr className="bg-grey border-b-thin">
                        <td className="bill-label">Date</td>
                        <td className="bill-colon">:</td>
                        <td>
                          {renderField("invoiceDate", data.invoiceDate, {
                            type: "date",
                          })}
                        </td>
                      </tr>
                      <tr className="">
                        <td className="bill-label">Transport</td>
                        <td className="bill-colon">:</td>
                        <td>{renderField("despatchedBy", data.despatchedBy)}</td>
                      </tr>
                      <tr>
                        <td className="bill-label">L.R. No.</td>
                        <td className="bill-colon">:</td>
                        <td>{renderField("lrNumber", data.lrNumber)}</td>
                      </tr>
                      <tr>
                        <td className="bill-label">L.R. Date</td>
                        <td className="bill-colon">:</td>
                        <td>
                          {renderField("dateOfSupply", data.dateOfSupply, {
                            type: "date",
                            displayValue: data.dateOfSupply
                              ? formatBillDate(data.dateOfSupply)
                              : "\u00A0",
                          })}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bill-items-section">
          <table className="bill-items-table">
            <colgroup>
              <col style={{ width: "5%" }} />
              <col style={{ width: "38%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "9%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "9%" }} />
              <col style={{ width: "6%" }} />
              <col style={{ width: "11%" }} />
            </colgroup>
            <thead>
              <tr>
                <th>Sr No</th>
                <th className="left">Product Name</th>
                <th>HSN/SAC</th>
                <th>UNIT</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>GST%</th>
                <th className="right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {displayItems.map((item, index) => {
                const filled = isFilledItem(item);

                return (
                  <tr
                    key={item?.id || `bill-row-${index}`}
                    className="bill-item-row"
                  >
                    <td className="center">{filled ? index + 1 : "\u00A0"}</td>

                    <td className="left">
                      {item
                        ? readOnly
                          ? item.particular || "\u00A0"
                          : renderItemField(
                            item,
                            "particular",
                            item.particular,
                            "text",
                            "left"
                          )
                        : "\u00A0"}
                    </td>

                    <td className="center">
                      {item
                        ? readOnly
                          ? filled
                            ? item.hsnCode || DEFAULT_HSN_CODE
                            : "\u00A0"
                          : renderItemField(
                            item,
                            "hsnCode",
                            item.hsnCode || DEFAULT_HSN_CODE,
                            "text",
                            "center"
                          )
                        : "\u00A0"}
                    </td>

                    <td className="center">
                      {item
                        ? readOnly
                          ? filled
                            ? item.perPic || DEFAULT_UNIT
                            : "\u00A0"
                          : renderItemField(
                            item,
                            "perPic",
                            item.perPic || DEFAULT_UNIT,
                            "text",
                            "center"
                          )
                        : "\u00A0"}
                    </td>

                    <td className="center">
                      {item
                        ? readOnly
                          ? filled
                            ? formatQuantity(item.qty)
                            : "\u00A0"
                          : renderItemField(
                            item,
                            "qty",
                            item.qty || "",
                            "number",
                            "center"
                          )
                        : "\u00A0"}
                    </td>

                    <td className="right">
                      {item
                        ? readOnly
                          ? filled
                            ? formatMoney(item.rate)
                            : "\u00A0"
                          : renderItemField(
                            item,
                            "rate",
                            item.rate || "",
                            "number",
                            "right"
                          )
                        : "\u00A0"}
                    </td>

                    <td className="center">
                      {filled
                        ? (
                          (data.cgstPercent + data.sgstPercent) ||
                            data.igstPercent
                            ? ((data.cgstPercent + data.sgstPercent) || data.igstPercent).toFixed(1) + "%"
                            : "\u00A0"
                        )
                        : "\u00A0"}
                    </td>

                    <td className="right">
                      {filled && item ? formatMoney(item.amount) : "\u00A0"}
                    </td>
                  </tr>
                );
              })}

              {readOnly ? (
                <tr className="bill-item-filler">
                  <td className="border-right" /><td className="border-right" /><td className="border-right" /><td className="border-right" /><td className="border-right" /><td className="border-right" /><td className="border-right" /><td />
                </tr>
              ) : (
                Array.from({ length: blankRows }).map((_, index) => (
                  <tr key={`edit-blank-row-${index}`} className="bill-item-row">
                    <td className="center">&nbsp;</td>
                    <td className="left">&nbsp;</td>
                    <td className="center">&nbsp;</td>
                    <td className="center">&nbsp;</td>
                    <td className="center">&nbsp;</td>
                    <td className="right">&nbsp;</td>
                    <td className="center">&nbsp;</td>
                    <td className="right">&nbsp;</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="bill-bottom-section-v2">
          {/* Row 1 */}
          <div className="bill-row-split border-b-black bg-grey">
            <div className="bill-col-left border-r-black strong font-size-9">
              GSTIN No. : {COMPANY_GSTIN}
            </div>
            <div className="bill-col-right flex-between strong font-size-9">
              <span>Sub Total</span>
              <span>{subtotal > 0 ? formatMoney(subtotal) : "\u00A0"}</span>
            </div>
          </div>

          {/* Row 2 */}
          <div className="bill-row-split border-b-black">
            <div className="bill-col-left border-r-black space-y-0.5">
              <div><span className="strong">Bank Name :</span> {BANK_NAME}</div>
              <div><span className="strong">A/c. No. :</span> {BANK_ACCOUNT}</div>
              <div><span className="strong">RTGS/IFSC Code :</span> {BANK_IFSC}</div>
            </div>
            <div className="bill-col-right"></div>
          </div>

          {/* Row 3 */}
          <div className="bill-row-split border-b-black">
            {/* Left: Words */}
            <div className="bill-col-left border-r-black flex flex-col justify-around py-2">
              <div className="leading-tight">
                <span className="strong">Total GST :</span>
                <span className="italic ml-2">{totalGstWords}</span>
              </div>
              <div className="leading-tight mt-2">
                <span className="strong">Bill Amount :</span>
                <span className="italic ml-2">{billAmountWords}</span>
              </div>
            </div>

            {/* Right: Taxes */}
            <div className="bill-col-right space-y-1 py-1">
              <div className="flex-between strong font-size-10">
                <span>Taxable Amount</span>
                <span>{subtotal > 0 ? formatMoney(subtotal) : "\u00A0"}</span>
              </div>
              <div className="bill-tax-row-new">
                <span className="label">CGST</span>
                <span className="percent">{renderTaxPercent("cgstPercent", data.cgstPercent)}</span>
                <span className="amount">{cgstAmount > 0 ? formatMoney(cgstAmount) : "\u00A0"}</span>
              </div>
              <div className="bill-tax-row-new">
                <span className="label">SGST</span>
                <span className="percent">{renderTaxPercent("sgstPercent", data.sgstPercent)}</span>
                <span className="amount">{sgstAmount > 0 ? formatMoney(sgstAmount) : "\u00A0"}</span>
              </div>
              <div className="bill-tax-row-new">
                <span className="label">IGST</span>
                <span className="percent">{renderTaxPercent("igstPercent", data.igstPercent)}</span>
                <span className="amount">{igstAmount > 0 ? formatMoney(igstAmount) : "\u00A0"}</span>
              </div>
            </div>
          </div>

          {/* Row 4 */}
          <div className="bill-row-split border-b-black">
            <div className="bill-col-left border-r-black strong py-1 flex items-start">
              <span className="mr-1">Note :</span>
              <div className="flex-1">
                {renderField("note", data.note || "", { multiline: true, className: "text-[8px] leading-tight" })}
              </div>
            </div>
            <div className="bill-col-right flex-between strong font-size-11 bg-grey">
              <span>Grand Total</span>
              <span>{grandTotal > 0 ? formatMoney(grandTotal) : "\u00A0"}</span>
            </div>
          </div>

          {/* Terms Row */}
          <div className="bill-footer-combined p-2 flex justify-between items-start">
            <div className="bill-terms-area">
              <div className="strong mb-1">Terms & Condition :</div>
              <ol className="bill-terms-ol-v2 italic">
                <li>Goods once sold will not be taken back.</li>
                <li>"Subject to 'RAJKOT' Jurisdiction only. E.&O.E"</li>
                <li>Interest @18% p.a. will be charged if payment is not made within due date.</li>
                <li>Our risk and responsibility ceases as soon as the goods leave our premises.</li>
              </ol>
            </div>
            <div className="bill-sign-area text-right">
              <div className="strong text-[9px]">For, {COMPANY_NAME}</div>
              <div className="bill-sign-space-v2"></div>
              <div className="italic text-[10px]">Proprietor</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceSheet;
