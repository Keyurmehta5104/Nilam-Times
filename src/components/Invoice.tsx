import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { InvoiceData, InvoiceItem } from "@/types/invoice";
import { useClients } from "@/hooks/useClients";
import { useInvoices } from "@/hooks/useInvoices";
import InvoiceSheet from "./InvoiceSheet";
import Layout from "./Layout";
import PageHeader, { HeaderButton } from "./PageHeader";
import { FilePlus2, Printer, RotateCcw, Save } from "lucide-react";
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
        roundOff,
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
        round_off: roundOff,
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
      <div className="py-4 sm:py-6 px-2 sm:px-6 print-page-wrap">
        <PageHeader
          title="New Invoice"
          subtitle="Fill in the bill below, then save or print"
          icon={FilePlus2}
          actions={
            <>
              <HeaderButton onClick={handleReset}>
                <RotateCcw className="h-4 w-4" /> Reset
              </HeaderButton>
              <HeaderButton onClick={handlePrint} disabled={isPrinting}>
                <Printer className="h-4 w-4" /> {isPrinting ? "Printing..." : "Print"}
              </HeaderButton>
              <HeaderButton variant="solid" onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4" /> {saving ? "Saving..." : <><span className="sm:hidden">Save</span><span className="hidden sm:inline">Save Invoice</span></>}
              </HeaderButton>
            </>
          }
        />

        <div className="screen-only bill-screen-wrap max-w-6xl mx-auto overflow-x-auto pb-2">
          {renderInvoiceSheet()}
        </div>

        <div className="print-only">
          {printCopies.map((copyType) => (
            <div key={copyType} className="print-copy">
              {renderInvoiceSheet(copyType, "min-w-0", true)}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Invoice;
