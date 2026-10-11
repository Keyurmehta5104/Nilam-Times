import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useInvoices } from "@/hooks/useInvoices";
import { InvoiceData } from "@/types/invoice";
import { Pencil, Printer } from "lucide-react";
import { format } from "date-fns";
import InvoiceSheet from "@/components/InvoiceSheet";
import Layout from "@/components/Layout";
import PageHeader, { HeaderButton } from "@/components/PageHeader";
import PageStatus from "@/components/PageStatus";
import { useIsMobile } from "@/hooks/use-mobile";

const formatInvoiceDate = (value: string) => {
  const date = new Date(value);
  return value && !isNaN(date.getTime()) ? format(date, "dd MMM yyyy") : "";
};

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
      <Layout>
        <PageStatus loading message="Loading invoice..." />
      </Layout>
    );
  }

  if (!invoiceData) {
    return (
      <Layout>
        <PageStatus message="Invoice not found" onBack={() => navigate("/invoices")} />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-4 sm:py-6 px-2 sm:px-6 print-page-wrap">
        <PageHeader
          title={`Invoice ${invoiceData.invoiceNo ? `#${invoiceData.invoiceNo}` : ""}`.trim()}
          subtitle={[invoiceData.customerName, formatInvoiceDate(invoiceData.invoiceDate)].filter(Boolean).join(" · ")}
          onBack={() => navigate(-1)}
          actions={
            <>
              <HeaderButton onClick={() => navigate(`/invoice/${id}/edit`)}>
                <Pencil className="h-4 w-4" /> Edit
              </HeaderButton>
              <HeaderButton variant="solid" onClick={handlePrint} disabled={isPrinting}>
                <Printer className="h-4 w-4" /> {isPrinting ? "Printing..." : <><span className="sm:hidden">Print</span><span className="hidden sm:inline">Print Invoice</span></>}
              </HeaderButton>
            </>
          }
        />

        <div className="screen-only bill-screen-wrap w-full max-w-6xl mx-auto overflow-x-auto pb-2">
          <InvoiceSheet data={invoiceData} readOnly />
        </div>

        <div className="print-only">
          {printCopies.map((copyType) => (
            <div key={copyType} className="print-copy">
              <InvoiceSheet data={invoiceData} copyType={copyType} className="min-w-0" readOnly />
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default ViewInvoice;
