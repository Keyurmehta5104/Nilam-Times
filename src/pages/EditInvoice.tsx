import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { InvoiceData, InvoiceItem } from "@/types/invoice";
import { useClients } from "@/hooks/useClients";
import { useInvoices } from "@/hooks/useInvoices";
import InvoiceHeader from "@/components/InvoiceHeader";
import InvoiceDetails from "@/components/InvoiceDetails";
import CustomerDetails from "@/components/CustomerDetails";
import ItemsTable from "@/components/ItemsTable";
import InvoiceSummary from "@/components/InvoiceSummary";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const generateId = () => Math.random().toString(36).substr(2, 9);

const createEmptyItem = (): InvoiceItem => ({
  id: generateId(),
  particular: "",
  hsnCode: "9102",
  perPic: "PIC",
  qty: 0,
  rate: 0,
  amount: 0,
});

const EditInvoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getOrCreateClient } = useClients();
  const { fetchInvoiceWithItems, updateInvoice, deleteInvoice } = useInvoices();
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<InvoiceData | null>(null);

  useEffect(() => {
    if (id) loadInvoice(id);
  }, [id]);

  const loadInvoice = async (invoiceId: string) => {
    const result = await fetchInvoiceWithItems(invoiceId);
    if (result) {
      const { invoice, items } = result;
      setData({
        bookNo: invoice.book_no || "",
        invoiceNo: invoice.invoice_no,
        invoiceDate: invoice.invoice_date,
        state: invoice.state || "",
        code: invoice.code || "",
        despatchedBy: invoice.despatched_by || "",
        lrNumber: invoice.lr_number || "",
        dateOfSupply: invoice.date_of_supply || "",
        placeOfSupply: invoice.place_of_supply || "",
        customerName: invoice.clients?.name || "",
        customerAddress: invoice.clients?.address || "",
        customerGstin: invoice.clients?.gstin || "",
        customerState: invoice.clients?.state || "",
        customerCode: invoice.clients?.code || "",
        items: items.length > 0 ? items.map((item) => ({
          id: item.id,
          particular: item.particular,
          hsnCode: item.hsn_code || "",
          perPic: item.per_pic || "",
          qty: Number(item.qty),
          rate: Number(item.rate),
          amount: Number(item.amount),
        })) : [createEmptyItem()],
        cgstPercent: Number(invoice.cgst_percent),
        sgstPercent: Number(invoice.sgst_percent),
        igstPercent: Number(invoice.igst_percent),
      });
    }
    setLoading(false);
  };

  const handleFieldChange = (field: keyof InvoiceData, value: string) => {
    setData((prev) => prev ? { ...prev, [field]: value } : prev);
  };

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setData((prev) => prev ? {
      ...prev,
      items: prev.items.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        if (field === "qty" || field === "rate") {
          updated.amount = updated.qty * updated.rate;
        }
        return updated;
      }),
    } : prev);
  };

  const handleAddItem = () => {
    setData((prev) => prev ? {
      ...prev,
      items: [...prev.items, createEmptyItem()],
    } : prev);
  };

  const handleRemoveItem = (itemId: string) => {
    if (!data || data.items.length === 1) return;
    setData((prev) => prev ? {
      ...prev,
      items: prev.items.filter((item) => item.id !== itemId),
    } : prev);
  };

  const handleTaxChange = (tax: "cgstPercent" | "sgstPercent" | "igstPercent", value: number) => {
    setData((prev) => prev ? { ...prev, [tax]: value } : prev);
  };

  const handleSave = async () => {
    if (!data || !id) return;

    if (!data.customerName.trim()) {
      toast({ title: "Error", description: "Please enter customer name", variant: "destructive" });
      return;
    }

    if (!data.invoiceNo.trim()) {
      toast({ title: "Error", description: "Please enter invoice number", variant: "destructive" });
      return;
    }

    const validItems = data.items.filter((item) => item.particular.trim() !== "");
    if (validItems.length === 0) {
      toast({ title: "Error", description: "Please add at least one item", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const client = await getOrCreateClient({
        name: data.customerName,
        address: data.customerAddress || null,
        gstin: data.customerGstin || null,
        state: data.customerState || null,
        code: data.customerCode || null,
      });

      if (!client) {
        setSaving(false);
        return;
      }

      const subtotal = data.items.reduce((sum, item) => sum + item.amount, 0);
      const cgstAmount = (subtotal * data.cgstPercent) / 100;
      const sgstAmount = (subtotal * data.sgstPercent) / 100;
      const igstAmount = (subtotal * data.igstPercent) / 100;
      const grandTotal = subtotal + cgstAmount + sgstAmount + igstAmount;

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
        subtotal,
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
        rate: item.rate,
        amount: item.amount,
      }));

      const result = await updateInvoice(id, invoiceData, items);
      if (result) {
        navigate(`/invoice/${id}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      const success = await deleteInvoice(id);
      if (success) {
        navigate('/invoices');
      }
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">Loading...</div>
      </Layout>
    );
  }

  if (!data) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">Invoice not found</div>
      </Layout>
    );
  }

  const subtotal = data.items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <Layout>
      <div className="py-8 px-4">
        <div className="max-w-4xl mx-auto mb-4 flex justify-between no-print">
          <Button variant="outline" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <div className="flex gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={deleting} className="gap-2">
                  <Trash2 className="h-4 w-4" /> {deleting ? "Deleting..." : "Delete"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this invoice? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              <Save className="h-4 w-4" /> {saving ? "Saving..." : "Update Invoice"}
            </Button>
          </div>
        </div>

        <div className="invoice-container relative">
          <InvoiceHeader />
          <InvoiceDetails data={data} onChange={handleFieldChange} />
          <CustomerDetails data={data} onChange={handleFieldChange} />
          <ItemsTable
            items={data.items}
            onItemChange={handleItemChange}
            onAddItem={handleAddItem}
            onRemoveItem={handleRemoveItem}
          />
          <InvoiceSummary
            subtotal={subtotal}
            cgstPercent={data.cgstPercent}
            sgstPercent={data.sgstPercent}
            igstPercent={data.igstPercent}
            onTaxChange={handleTaxChange}
          />
        </div>
      </div>
    </Layout>
  );
};

export default EditInvoice;
