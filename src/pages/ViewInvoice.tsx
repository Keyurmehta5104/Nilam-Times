import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useInvoices, Invoice, InvoiceItem } from "@/hooks/useInvoices";
import InvoiceHeader from "@/components/InvoiceHeader";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft, Pencil } from "lucide-react";
import { numberToWords } from "@/utils/numberToWords";

const InvoiceCopy = ({ 
  invoice, 
  items, 
  copyType, 
  bgColor 
}: { 
  invoice: Invoice; 
  items: InvoiceItem[]; 
  copyType: string; 
  bgColor: string;
}) => {
  const subtotal = Number(invoice.subtotal);
  const cgst = Number(invoice.cgst_amount);
  const sgst = Number(invoice.sgst_amount);
  const igst = Number(invoice.igst_amount);
  const grandTotal = Number(invoice.grand_total);

  return (
    <div className={`invoice-container relative print-copy ${bgColor}`}>
      <InvoiceHeader copyType={copyType} />

      {/* Invoice Details */}
      <div className="grid grid-cols-2 gap-0 text-sm border-b border-primary/20">
        <div className="p-2 border-r border-primary/20">
          <div className="grid grid-cols-2 gap-1">
            <span className="font-medium">Book No:</span>
            <span>{invoice.book_no || "-"}</span>
            <span className="font-medium">Invoice No:</span>
            <span>{invoice.invoice_no}</span>
            <span className="font-medium">Invoice Date:</span>
            <span>{invoice.invoice_date}</span>
            <span className="font-medium">State:</span>
            <span>{invoice.state || "-"}</span>
            <span className="font-medium">Code:</span>
            <span>{invoice.code || "-"}</span>
          </div>
        </div>
        <div className="p-2">
          <div className="grid grid-cols-2 gap-1">
            <span className="font-medium">Despatched By:</span>
            <span>{invoice.despatched_by || "-"}</span>
            <span className="font-medium">L.R. Number:</span>
            <span>{invoice.lr_number || "-"}</span>
            <span className="font-medium">Date of Supply:</span>
            <span>{invoice.date_of_supply || "-"}</span>
            <span className="font-medium">Place of Supply:</span>
            <span>{invoice.place_of_supply || "-"}</span>
          </div>
        </div>
      </div>

      {/* Customer Details */}
      <div className="p-2 border-b border-primary/20 text-sm">
        <div className="font-medium text-primary mb-1">Bill To:</div>
        <div className="grid grid-cols-2 gap-1">
          <span className="font-medium">Name:</span>
          <span>{invoice.clients?.name || "-"}</span>
          <span className="font-medium">Address:</span>
          <span>{invoice.clients?.address || "-"}</span>
          <span className="font-medium">GSTIN:</span>
          <span>{invoice.clients?.gstin || "-"}</span>
          <span className="font-medium">State:</span>
          <span>{invoice.clients?.state || "-"}</span>
          <span className="font-medium">Code:</span>
          <span>{invoice.clients?.code || "-"}</span>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-primary/10">
            <th className="border border-primary/20 p-2 text-left w-12">Sr. No.</th>
            <th className="border border-primary/20 p-2 text-left">Particular</th>
            <th className="border border-primary/20 p-2 text-left w-24">HSN Code</th>
            <th className="border border-primary/20 p-2 text-left w-20">PER/PIC</th>
            <th className="border border-primary/20 p-2 text-right w-16">Qty</th>
            <th className="border border-primary/20 p-2 text-right w-24">Rate</th>
            <th className="border border-primary/20 p-2 text-right w-28">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={item.id}>
              <td className="border border-primary/20 p-2">{index + 1}</td>
              <td className="border border-primary/20 p-2">{item.particular}</td>
              <td className="border border-primary/20 p-2">{item.hsn_code || "-"}</td>
              <td className="border border-primary/20 p-2">{item.per_pic || "-"}</td>
              <td className="border border-primary/20 p-2 text-right">{item.qty}</td>
              <td className="border border-primary/20 p-2 text-right">{Number(item.rate).toFixed(2)}</td>
              <td className="border border-primary/20 p-2 text-right">{Number(item.amount).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-0 text-sm border-t border-primary/20">
        <div className="p-3 border-r border-primary/20">
          <div className="mb-2">
            <span className="font-medium">Rupees In Word:</span>
            <p className="text-primary font-medium">{numberToWords(grandTotal)}</p>
          </div>
          <div className="mt-4 p-2 bg-muted rounded print:bg-transparent">
            <p className="font-medium mb-1">Bank Details:</p>
            <p>Bank: STATE BANK OF INDIA</p>
            <p>A/C No: 30877752702</p>
            <p>IFSC: SBIN0004928</p>
          </div>
        </div>
        <div className="p-3">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>CGST ({invoice.cgst_percent}%):</span>
              <span>₹{cgst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>SGST ({invoice.sgst_percent}%):</span>
              <span>₹{sgst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>IGST ({invoice.igst_percent}%):</span>
              <span>₹{igst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Grand Total:</span>
              <span>₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>
          <div className="mt-8 text-right">
            <p className="font-medium">For NILAM TIMES</p>
            <div className="h-16"></div>
            <p>Authorised Signatory</p>
          </div>
        </div>
      </div>

      {/* Watermark */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03]">
        <span className="text-primary text-[120px] font-bold rotate-[-30deg] whitespace-nowrap">
          NILAM TIMES
        </span>
      </div>
    </div>
  );
};

const ViewInvoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchInvoiceWithItems } = useInvoices();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadInvoice(id);
    }
  }, [id]);

  const loadInvoice = async (invoiceId: string) => {
    const result = await fetchInvoiceWithItems(invoiceId);
    if (result) {
      setInvoice(result.invoice);
      setItems(result.items);
    }
    setLoading(false);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div>Loading invoice...</div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div>Invoice not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted py-8 px-4">
      <div className="max-w-4xl mx-auto mb-4 flex justify-between no-print">
        <Button variant="outline" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/invoice/${id}/edit`)} className="gap-2">
            <Pencil className="h-4 w-4" /> Edit
          </Button>
          <Button onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" /> Print Invoice
          </Button>
        </div>
      </div>

      {/* Screen preview - single invoice */}
      <div className="screen-only">
        <InvoiceCopy 
          invoice={invoice} 
          items={items} 
          copyType="" 
          bgColor="" 
        />
      </div>

      {/* Print copies - White (Original) and Yellow (Duplicate) */}
      <div className="print-only">
        <InvoiceCopy 
          invoice={invoice} 
          items={items} 
          copyType="Original" 
          bgColor="print-white" 
        />
        <InvoiceCopy 
          invoice={invoice} 
          items={items} 
          copyType="Duplicate" 
          bgColor="print-yellow" 
        />
      </div>
    </div>
  );
};

export default ViewInvoice;
