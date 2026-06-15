import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { InvoiceData, InvoiceItem } from "@/types/invoice";
import { useClients } from "@/hooks/useClients";
import { useInvoices } from "@/hooks/useInvoices";
import InvoiceSheet from "./InvoiceSheet";
import Layout from "./Layout";
import { Button } from "./ui/button";
import { Printer, RotateCcw, Save, Menu, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { calculateInvoiceTotals, roundMoney } from "@/utils/money";
import { useIsMobile } from "@/hooks/use-mobile";

const generateId = () => Math.random().toString(36).substr(2, 9);

const createEmptyItem = (): InvoiceItem => ({
  id: generateId(),
  particular: "",
  hsnCode: "",
  perPic: "",
  qty: 0,
  rate: 0,
  amount: 0,
});

const initialData: InvoiceData = {
  bookNo: "",
  invoiceNo: "",
  invoiceDate: new Date().toISOString().split("T")[0],
  state: "Gujarat",
  code: "24",
  despatchedBy: "",
  lrNumber: "",
  dateOfSupply: "",
  placeOfSupply: "",
  customerName: "",
  customerAddress: "",
  customerGstin: "",
  customerState: "",
  customerCode: "",
  items: Array.from({ length: 9 }, () => createEmptyItem()),
  cgstPercent: 0,
  sgstPercent: 0,
  igstPercent: 0,
};

const Invoice = () => {
  const [data, setData] = useState<InvoiceData>(initialData);
  const [saving, setSaving] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const printLockRef = useRef(false);
  const printTimerRef = useRef<number | null>(null);
  const { getOrCreateClient, clients } = useClients();
  const { createInvoice } = useInvoices();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const releasePrintLock = () => {
    printLockRef.current = false;
    setIsPrinting(false);

    if (printTimerRef.current !== null) {
      window.clearTimeout(printTimerRef.current);
      printTimerRef.current = null;
    }
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        releasePrintLock();
      }
    };

    const handleFocus = () => releasePrintLock();
    const handlePageShow = () => releasePrintLock();

    window.addEventListener("focus", handleFocus);
    window.addEventListener("afterprint", releasePrintLock);
    window.addEventListener("pageshow", handlePageShow);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("afterprint", releasePrintLock);
      window.removeEventListener("pageshow", handlePageShow);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const handleFieldChange = (field: keyof InvoiceData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setData((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        if (field === "qty" || field === "rate") {
          updated.amount = roundMoney(updated.qty * updated.rate);
        }
        return updated;
      }),
    }));
  };
  const handleTaxChange = (tax: "cgstPercent" | "sgstPercent" | "igstPercent", value: number) => {
    setData((prev) => ({ ...prev, [tax]: value }));
  };

  const handlePrint = () => {
    if (printLockRef.current) return;

    printLockRef.current = true;
    setIsPrinting(true);

    window.requestAnimationFrame(() => {
      window.print();
    });

    if (printTimerRef.current !== null) {
      window.clearTimeout(printTimerRef.current);
    }

    printTimerRef.current = window.setTimeout(() => {
      releasePrintLock();
    }, 3000);
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset the invoice?")) {
      setData({ ...initialData, items: Array.from({ length: 9 }, () => createEmptyItem()) });
    }
  };

  const handleSave = async () => {
    if (!data.customerName.trim()) {
      toast({
        title: "Error",
        description: "Please enter customer name",
        variant: "destructive",
      });
      return;
    }

    if (!data.invoiceNo.trim()) {
      toast({
        title: "Error",
        description: "Please enter invoice number",
        variant: "destructive",
      });
      return;
    }

    const validItems = data.items.filter((item) => item.particular.trim() !== "");
    if (validItems.length === 0) {
      toast({
        title: "Error",
        description: "Please fill at least one particular line",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const client = await getOrCreateClient({
        name: data.customerName.toUpperCase(),
        address: data.customerAddress || null,
        gstin: data.customerGstin || null,
        state: data.customerState || null,
        code: data.customerCode || null,
        place_of_supply: data.placeOfSupply || null,
      });

      if (!client) {
        return;
      }

      const {
        subtotal: currentSubtotal,
        cgstAmount,
        sgstAmount,
        igstAmount,
        grandTotal,
      } = calculateInvoiceTotals({
        subtotal: data.items.reduce((sum, item) => sum + roundMoney(item.amount), 0),
        cgstPercent: data.cgstPercent,
        sgstPercent: data.sgstPercent,
        igstPercent: data.igstPercent,
      });

      const invoiceData = {
        client_id: client.id,
        book_no: data.bookNo || null,
        invoice_no: data.invoiceNo,
        invoice_date: data.invoiceDate,
        state: data.state || null,
        code: data.code || null,
        despatched_by: data.despatchedBy || null,
        lr_number: data.lrNumber || null,
        date_of_supply: data.dateOfSupply || null,
        place_of_supply: data.placeOfSupply || null,
        customer_address: data.customerAddress || null,
        customer_gstin: data.customerGstin || null,
        customer_state: data.customerState || null,
        customer_code: data.customerCode || null,
        subtotal: currentSubtotal,
        cgst_percent: data.cgstPercent,
        sgst_percent: data.sgstPercent,
        igst_percent: data.igstPercent,
        cgst_amount: cgstAmount,
        sgst_amount: sgstAmount,
        igst_amount: igstAmount,
        grand_total: grandTotal,
      };

      const items = validItems.map((item, index) => ({
        sr_no: index + 1,
        particular: item.particular,
        hsn_code: item.hsnCode || null,
        per_pic: item.perPic || null,
        qty: item.qty,
        rate: roundMoney(item.rate),
        amount: roundMoney(item.amount),
      }));

      const result = await createInvoice(invoiceData, items);
      if (result?.id) {
        navigate(`/invoice/${result.id}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const renderInvoiceSheet = (copyType?: string, className = "", readOnly = false) => (
    <InvoiceSheet
      data={data}
      clients={clients}
      copyType={copyType}
      className={className}
      readOnly={readOnly}
      onFieldChange={handleFieldChange}
      onItemChange={handleItemChange}
      onTaxChange={handleTaxChange}
    />
  );

  const printCopies = ["Original", "Duplicate", "Triplicate"] as const;

  return (
    <Layout>
      <div className="xl:hidden bg-white border-b shadow-sm p-4 no-print">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h1 className="text-lg font-semibold">New Invoice</h1>
          </div>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="xl:hidden bg-white border-b shadow-sm p-4 no-print">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleReset} className="w-full sm:flex-1">
              <RotateCcw className="h-4 w-4 mr-2" /> Reset
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint} disabled={isPrinting} className="w-full sm:flex-1">
              <Printer className="h-4 w-4 mr-2" /> {isPrinting ? "Printing..." : "Print"}
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/invoices")} className="w-full sm:flex-1">
              View All
            </Button>
          </div>
        </div>
      )}

      <div className="py-4 sm:py-8 px-3 sm:px-4 pb-24 lg:pb-8 print-page-wrap">
        <div className="hidden xl:flex max-w-6xl mx-auto mb-6 justify-end gap-3 no-print">
          <Button variant="outline" onClick={handleReset} className="gap-2">
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
          <Button variant="outline" onClick={handlePrint} disabled={isPrinting} className="gap-2">
            <Printer className="h-4 w-4" /> {isPrinting ? "Printing..." : "Print"}
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Invoice"}
          </Button>
        </div>

        <div className="screen-only max-w-6xl mx-auto overflow-x-auto">
          {renderInvoiceSheet()}
        </div>

        <div className="print-only">
          {printCopies.map((copyType) => (
            <div key={copyType} className="print-copy">
              {renderInvoiceSheet(copyType, "min-w-0", true)}
            </div>
          ))}
        </div>

        <div className="xl:hidden fixed bottom-20 right-4 z-30 no-print">
          <Button
            onClick={handleSave}
            disabled={saving}
            size="lg"
            className="rounded-full w-14 h-14 shadow-lg"
          >
            <Save className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Invoice;
