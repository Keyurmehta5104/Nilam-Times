import { InvoiceItem } from "@/types/invoice";
import type { CSSProperties } from "react";

interface ItemsTableProps {
  items: InvoiceItem[];
  onItemChange: (id: string, field: keyof InvoiceItem, value: string | number) => void;
  onAddItem?: () => void;
  onRemoveItem?: (itemId: string) => void;
  readOnly?: boolean;
}

const ItemsTable = ({ items, onItemChange, readOnly = false }: ItemsTableProps) => {
  const gstPercent = 18;
  const totalRows = Math.max(items.length, 20);
  const targetVisualRows = 20;
  const filledItems = items.filter((item) =>
    item.particular.trim() !== "" ||
    item.hsnCode.trim() !== "" ||
    item.qty > 0 ||
    item.rate > 0 ||
    item.amount > 0
  );
  const readOnlyItems = readOnly ? filledItems : items;
  const remainingVisualRows = Math.max(targetVisualRows - Math.max(readOnlyItems.length, 1), 1);

  const isFilledRow = (item?: InvoiceItem) =>
    !!item &&
    (
      item.particular.trim() !== "" ||
      item.hsnCode.trim() !== "" ||
      item.qty > 0 ||
      item.rate > 0 ||
      item.amount > 0
    );

  return (
    <div className="invoice-section p-0">
      <div className="overflow-x-auto">
        <table className="invoice-table invoice-items-table w-full">
          <thead>
            <tr>
              <th className="w-16 whitespace-nowrap">Sr No</th>
              <th>Product Name</th>
              <th className="w-24">HSN/SAC</th>
              <th className="w-20">Qty</th>
              <th className="w-24">Rate</th>
              <th className="w-16">GST %</th>
              <th className="w-28">Amount</th>
            </tr>
          </thead>
          <tbody>
            {readOnly ? (
              <>
                {(readOnlyItems.length > 0 ? readOnlyItems : [undefined]).map((item, index) => {
                  const filledRow = isFilledRow(item);

                  return (
                    <tr key={item?.id || `readonly-row-${index}`} className="invoice-item-row">
                      <td className="p-2 text-center">{filledRow ? index + 1 : "\u00A0"}</td>
                      <td className="p-2">
                        <div className="invoice-readonly-cell text-left">{item?.particular || "\u00A0"}</div>
                      </td>
                      <td className="p-2">
                        <div className="invoice-readonly-cell text-center">{item?.hsnCode || "\u00A0"}</div>
                      </td>
                      <td className="p-2">
                        <div className="invoice-readonly-cell text-right">
                          {filledRow && item?.qty ? Number(item.qty.toFixed(3)).toString() : "\u00A0"}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="invoice-readonly-cell text-right">
                          {filledRow && item?.rate ? item.rate.toFixed(2) : "\u00A0"}
                        </div>
                      </td>
                      <td className="p-2 text-center">{filledRow ? gstPercent.toFixed(2) : "\u00A0"}</td>
                      <td className="p-2 text-right font-semibold">{filledRow && item ? item.amount.toFixed(2) : "\u00A0"}</td>
                    </tr>
                  );
                })}
                <tr
                  className="invoice-empty-fill-row"
                  style={{ "--empty-row-count": remainingVisualRows } as CSSProperties}
                >
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
              </>
            ) : (
              Array.from({ length: totalRows }).map((_, index) => {
              const item = items[index];
              const filledRow = isFilledRow(item);

              return (
                <tr key={item?.id || `empty-row-${index}`} className="invoice-item-row">
                  <td className="p-2 text-center">{index + 1}</td>
                  <td className="p-2">
                    {item ? (
                      readOnly ? (
                        <div className="invoice-readonly-cell text-left">{item.particular || "\u00A0"}</div>
                      ) : (
                        <input
                          type="text"
                          className="w-full px-1 py-1 bg-transparent outline-none text-left"
                          value={item.particular}
                          onChange={(e) => onItemChange(item.id, "particular", e.target.value)}
                        />
                      )
                    ) : (
                      <div className="invoice-readonly-cell text-left">&nbsp;</div>
                    )}
                  </td>
                  <td className="p-2">
                    {item ? (
                      readOnly ? (
                        <div className="invoice-readonly-cell text-center">{item.hsnCode || "\u00A0"}</div>
                      ) : (
                        <input
                          type="text"
                          className="w-full px-1 py-1 bg-transparent outline-none text-center"
                          value={item.hsnCode}
                          onChange={(e) => onItemChange(item.id, "hsnCode", e.target.value)}
                        />
                      )
                    ) : (
                      <div className="invoice-readonly-cell text-center">&nbsp;</div>
                    )}
                  </td>
                  <td className="p-2">
                    {item ? (
                      readOnly ? (
                        <div className="invoice-readonly-cell text-right">
                          {filledRow && item.qty ? Number(item.qty.toFixed(3)).toString() : "\u00A0"}
                        </div>
                      ) : (
                        <input
                          type="number"
                          className="w-full px-1 py-1 bg-transparent outline-none text-right"
                          value={item.qty || ""}
                          onChange={(e) => onItemChange(item.id, "qty", parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                        />
                      )
                    ) : (
                      <div className="invoice-readonly-cell text-right">&nbsp;</div>
                    )}
                  </td>
                  <td className="p-2">
                    {item ? (
                      readOnly ? (
                        <div className="invoice-readonly-cell text-right">
                          {filledRow && item.rate ? item.rate.toFixed(2) : "\u00A0"}
                        </div>
                      ) : (
                        <input
                          type="number"
                          className="w-full px-1 py-1 bg-transparent outline-none text-right"
                          value={item.rate || ""}
                          onChange={(e) => onItemChange(item.id, "rate", parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                        />
                      )
                    ) : (
                      <div className="invoice-readonly-cell text-right">&nbsp;</div>
                    )}
                  </td>
                  <td className="p-2 text-center">{filledRow ? gstPercent.toFixed(2) : "\u00A0"}</td>
                  <td className="p-2 text-right font-semibold">{filledRow ? item?.amount.toFixed(2) : "\u00A0"}</td>
                </tr>
              );
            }))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ItemsTable;
