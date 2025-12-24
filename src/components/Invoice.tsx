import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { InvoiceData, InvoiceItem } from "@/types/invoice";
import { useClients } from "@/hooks/useClients";
import { useInvoices } from "@/hooks/useInvoices";
import InvoiceHeader from "./InvoiceHeader";
import InvoiceDetails from "./InvoiceDetails";
import CustomerDetails from "./CustomerDetails";
import ItemsTable from "./ItemsTable";
import InvoiceSummary from "./InvoiceSummary";
import Layout from "./Layout";
import { Button } from "./ui/button";
import { Printer, RotateCcw, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

const initialData: InvoiceData = {
  bookNo: "",
  invoiceNo: "",
  invoiceDate: new Date().toISOString().split("T")[0],
  state: "Gujarat",
  code: "24",
  despatchedBy: "",
  lrNumber: "",
  dateOfSupply: new Date().toISOString().split("T")[0],
  placeOfSupply: "",
  customerName: "",
  customerAddress: "",
  customerGstin: "",
  customerState: "",
  customerCode: "",
  items: [createEmptyItem()],
  cgstPercent: 0,
  sgstPercent: 0,
  igstPercent: 0,
};

const Invoice = () => {
  const [data, setData] = useState<InvoiceData>(initialData);
  const [saving, setSaving] = useState(false);
  const { getOrCreateClient } = useClients();
  const { createInvoice } = useInvoices();
  const { toast } = useToast();
  const navigate = useNavigate();

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
          updated.amount = updated.qty * updated.rate;
        }
        return updated;
      }),
    }));
  };

  const handleAddItem = () => {
    setData((prev) => ({
      ...prev,
      items: [...prev.items, createEmptyItem()],
    }));
  };

  const handleRemoveItem = (id: string) => {
    if (data.items.length === 1) return;
    setData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  };

  const handleTaxChange = (tax: "cgstPercent" | "sgstPercent" | "igstPercent", value: number) => {
    setData((prev) => ({ ...prev, [tax]: value }));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset the invoice?")) {
      setData({ ...initialData, items: [createEmptyItem()] });
    }
  };

  const handleSave = async () => {
    console.log("=== STARTING SAVE PROCESS ===");
    
    if (!data.customerName.trim()) {
      console.error("Validation failed: No customer name");
      toast({
        title: "Error",
        description: "Please enter customer name",
        variant: "destructive",
      });
      return;
    }

    if (!data.invoiceNo.trim()) {
      console.error("Validation failed: No invoice number");
      toast({
        title: "Error",
        description: "Please enter invoice number",
        variant: "destructive",
      });
      return;
    }

    const validItems = data.items.filter((item) => item.particular.trim() !== "");
    if (validItems.length === 0) {
      console.error("Validation failed: No items");
      toast({
        title: "Error",
        description: "Please add at least one item",
        variant: "destructive",
      });
      return;
    }

    console.log("All validations passed, starting save...");
    setSaving(true);
    
    try {
      console.log("Step 1: Getting or creating client...");
      console.log("Client data:", {
        name: data.customerName,
        address: data.customerAddress || null,
        gstin: data.customerGstin || null,
        state: data.customerState || null,
        code: data.customerCode || null,
      });
      
      const client = await getOrCreateClient({
        name: data.customerName,
        address: data.customerAddress || null,
        gstin: data.customerGstin || null,
        state: data.customerState || null,
        code: data.customerCode || null,
      });

      console.log("Client result:", client);

      if (!client) {
        console.error("Failed to get/create client");
        toast({
          title: "Error",
          description: "Failed to create or find client",
          variant: "destructive",
        });
        setSaving(false);
        return;
      }

      console.log("Step 2: Calculating totals...");
      const subtotal = data.items.reduce((sum, item) => sum + item.amount, 0);
      const cgstAmount = (subtotal * data.cgstPercent) / 100;
      const sgstAmount = (subtotal * data.sgstPercent) / 100;
      const igstAmount = (subtotal * data.igstPercent) / 100;
      const grandTotal = subtotal + cgstAmount + sgstAmount + igstAmount;

      console.log("Calculated totals:", { 
        subtotal, 
        cgstAmount, 
        sgstAmount, 
        igstAmount, 
        grandTotal 
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
        subtotal: Number(subtotal.toFixed(2)),
        cgst_percent: Number(data.cgstPercent.toFixed(2)),
        sgst_percent: Number(data.sgstPercent.toFixed(2)),
        igst_percent: Number(data.igstPercent.toFixed(2)),
        cgst_amount: Number(cgstAmount.toFixed(2)),
        sgst_amount: Number(sgstAmount.toFixed(2)),
        igst_amount: Number(igstAmount.toFixed(2)),
        grand_total: Number(grandTotal.toFixed(2)),
      };

      console.log("Step 3: Invoice data prepared:", invoiceData);

      const items = validItems.map((item, index) => ({
        sr_no: index + 1,
        particular: item.particular,
        hsn_code: item.hsnCode || null,
        per_pic: item.perPic || null,
        qty: Number(item.qty),
        rate: Number(item.rate),
        amount: Number(item.amount),
      }));

      console.log("Step 4: Items prepared:", items);

      console.log("Step 5: Calling createInvoice API...");
      const result = await createInvoice(invoiceData, items);
      console.log("Step 6: createInvoice result:", result);
      
      if (result) {
        console.log("SUCCESS: Invoice saved with ID:", result.id);
        toast({
          title: "Success",
          description: "Invoice saved successfully!",
        });
        setData({ ...initialData, items: [createEmptyItem()] });
        navigate(`/invoice/${result.id}`);
      } else {
        console.error("FAILED: createInvoice returned null");
        toast({
          title: "Error",
          description: "Failed to save invoice. Please check console for details.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("ERROR in handleSave:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      console.log("Step 7: Setting saving to false");
      setSaving(false);
      console.log("=== SAVE PROCESS COMPLETE ===");
    }
  };

  const subtotal = data.items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <Layout>
      <div className="py-8 px-4">
        <div className="max-w-4xl mx-auto mb-4 flex justify-end gap-2 no-print">
          <Button variant="outline" onClick={handleReset} className="gap-2">
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
          <Button variant="outline" onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" /> Print
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Invoice"}
          </Button>
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
          
          {/* Watermark */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03]">
            <span className="text-primary text-[120px] font-bold rotate-[-30deg] whitespace-nowrap">
              NILAM TIMES
            </span>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Invoice;