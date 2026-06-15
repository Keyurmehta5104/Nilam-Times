import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useInvoices } from "@/hooks/useInvoices";
import { InvoiceData } from "@/types/invoice";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil, Printer } from "lucide-react";
import InvoiceSheet from "@/components/InvoiceSheet";
import { useIsMobile } from "@/hooks/use-mobile";

const ViewInvoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchInvoiceWithItems } = useInvoices();
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPrinting, setIsPrinting] = useState(false);
  const printLockRef = useRef(false);
  const printTimerRef = useRef<number | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (id) {
      loadInvoice(id);
    }
  }, [id]);

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

  const loadInvoice = async (invoiceId: string) => {
    const result = await fetchInvoiceWithItems(invoiceId);

    if (result) {
      const { invoice, items } = result;
      setInvoiceData({
        bookNo: invoice.book_no || "",
        invoiceNo: invoice.invoice_no || "",
        invoiceDate: invoice.invoice_date || "",
        state: invoice.state || "",
        code: invoice.code || "",
        despatchedBy: invoice.despatched_by || "",
        lrNumber: invoice.lr_number || "",
        dateOfSupply: invoice.date_of_supply || "",
        placeOfSupply: invoice.place_of_supply || "",
        customerName: invoice.clients?.name || "",
        customerAddress: invoice.customer_address || invoice.clients?.address || "",
        customerGstin: invoice.customer_gstin || invoice.clients?.gstin || "",
        customerState: invoice.customer_state || invoice.clients?.state || "",
        customerCode: invoice.customer_code || invoice.clients?.code || "",
        items: items.map((item) => ({
          id: item.id,
          particular: item.particular || "",
          hsnCode: item.hsn_code || "",
          perPic: item.per_pic || "",
          qty: Number(item.qty) || 0,
          rate: Number(item.rate) || 0,
          amount: Number(item.amount) || 0,
        })),
        cgstPercent: Number(invoice.cgst_percent || 0),
        sgstPercent: Number(invoice.sgst_percent || 0),
        igstPercent: Number(invoice.igst_percent || 0),
      });
    }

    setLoading(false);
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

  const printCopies = ["Original", "Duplicate", "Triplicate"] as const;

  if (loading) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div>Loading invoice...</div>
      </div>
    );
  }

  if (!invoiceData) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div>Invoice not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted py-4 sm:py-8 px-3 sm:px-4 pb-20 lg:pb-8 print-page-wrap">
      <div className="max-w-6xl mx-auto mb-4 flex flex-col sm:flex-row sm:justify-between gap-3 no-print">
        <Button variant="outline" onClick={() => navigate(-1)} className="gap-2 w-full sm:w-auto">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => navigate(`/invoice/${id}/edit`)} className="gap-2 w-full sm:w-auto">
            <Pencil className="h-4 w-4" /> Edit
          </Button>
          <Button onClick={handlePrint} disabled={isPrinting} className="gap-2 w-full sm:w-auto">
            <Printer className="h-4 w-4" /> {isPrinting ? "Printing..." : "Print Invoice"}
          </Button>
        </div>
      </div>

      <div className="screen-only w-full max-w-6xl mx-auto overflow-x-auto pb-6">
        <div style={{ minWidth: "210mm", margin: "0 auto" }}>
          <InvoiceSheet data={invoiceData} readOnly />
        </div>
      </div>

      <div className="print-only">
        {printCopies.map((copyType) => (
          <div key={copyType} className="print-copy">
            <InvoiceSheet data={invoiceData} copyType={copyType} className="min-w-0" readOnly />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViewInvoice;
