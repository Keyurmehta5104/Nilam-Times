import { InvoiceItem } from "@/types/invoice";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "./ui/button";

interface ItemsTableProps {
  items: InvoiceItem[];
  onItemChange: (id: string, field: keyof InvoiceItem, value: string | number) => void;
  onAddItem: () => void;
  onRemoveItem: (id: string) => void;
}

const ItemsTable = ({ items, onItemChange, onAddItem, onRemoveItem }: ItemsTableProps) => {
  return (
    <div className="invoice-section p-0">
      <table className="invoice-table">
        <thead>
          <tr>
            <th className="w-12">Sr. No.</th>
            <th className="min-w-[200px]">Particular</th>
            <th className="w-24">HSN Code</th>
            <th className="w-20">PER/PIC</th>
            <th className="w-20">Qty.</th>
            <th className="w-24">Rate</th>
            <th className="w-28">Amount</th>
            <th className="w-12 no-print"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={item.id}>
              <td className="text-center">{index + 1}</td>
              <td>
                <input
                  type="text"
                  className="text-left"
                  value={item.particular}
                  onChange={(e) => onItemChange(item.id, "particular", e.target.value)}
                  placeholder="Item description"
                />
              </td>
              <td>
                <input
                  type="text"
                  value={item.hsnCode}
                  onChange={(e) => onItemChange(item.id, "hsnCode", e.target.value)}
                />
              </td>
              <td>
                <input
                  type="text"
                  value={item.perPic}
                  onChange={(e) => onItemChange(item.id, "perPic", e.target.value)}
                />
              </td>
              <td>
                <input
                  type="number"
                  value={item.qty || ""}
                  onChange={(e) => onItemChange(item.id, "qty", parseFloat(e.target.value) || 0)}
                />
              </td>
              <td>
                <input
                  type="number"
                  value={item.rate || ""}
                  onChange={(e) => onItemChange(item.id, "rate", parseFloat(e.target.value) || 0)}
                />
              </td>
              <td className="text-right font-medium pr-4">
                ₹{item.amount.toFixed(2)}
              </td>
              <td className="no-print">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveItem(item.id)}
                  className="text-destructive hover:text-destructive/80 p-1"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
          {/* Empty rows for padding */}
          {Array.from({ length: Math.max(0, 8 - items.length) }).map((_, i) => (
            <tr key={`empty-${i}`}>
              <td className="h-8">&nbsp;</td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td className="no-print"></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="p-2 border-t border-primary/30 no-print">
        <Button
          variant="outline"
          size="sm"
          onClick={onAddItem}
          className="text-primary border-primary/30 hover:bg-accent"
        >
          <Plus className="h-4 w-4 mr-1" /> Add Item
        </Button>
      </div>
    </div>
  );
};

export default ItemsTable;
