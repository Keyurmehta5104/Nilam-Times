import { useState, useEffect, useCallback } from "react";
import { 
  collection, 
  doc, 
  getDoc,
  getDocs, 
  addDoc, 
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { useToast } from "@/hooks/use-toast";
import { Client } from "./useClients";

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  sr_no: number;
  particular: string;
  hsn_code: string | null;
  per_pic: string | null;
  qty: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  id: string;
  client_id: string;
  book_no: string | null;
  invoice_no: string;
  invoice_date: string;
  state: string | null;
  code: string | null;
  despatched_by: string | null;
  lr_number: string | null;
  date_of_supply: string | null;
  place_of_supply: string | null;
  subtotal: number;
  cgst_percent: number;
  sgst_percent: number;
  igst_percent: number;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  grand_total: number;
  created_at: string;
  updated_at: string;
  clients?: Client;
}

export const useInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      const invoicesRef = collection(db, "invoices");
      const q = query(invoicesRef, orderBy("created_at", "desc"));
      const querySnapshot = await getDocs(q);
      
      const invoicesData: Invoice[] = [];
      
      // Fetch client data for each invoice
      for (const docSnap of querySnapshot.docs) {
        const invoiceData = docSnap.data();
        let clientData = null;
        
        if (invoiceData.client_id) {
          const clientDoc = await getDoc(doc(db, "clients", invoiceData.client_id));
          if (clientDoc.exists()) {
            clientData = clientDoc.data() as Client;
          }
        }
        
        invoicesData.push({
          id: docSnap.id,
          book_no: invoiceData.book_no || null,
          invoice_no: invoiceData.invoice_no || "",
          invoice_date: invoiceData.invoice_date || "",
          state: invoiceData.state || null,
          code: invoiceData.code || null,
          despatched_by: invoiceData.despatched_by || null,
          lr_number: invoiceData.lr_number || null,
          date_of_supply: invoiceData.date_of_supply || null,
          place_of_supply: invoiceData.place_of_supply || null,
          client_id: invoiceData.client_id || "",
          subtotal: Number(invoiceData.subtotal) || 0,
          cgst_percent: Number(invoiceData.cgst_percent) || 0,
          sgst_percent: Number(invoiceData.sgst_percent) || 0,
          igst_percent: Number(invoiceData.igst_percent) || 0,
          cgst_amount: Number(invoiceData.cgst_amount) || 0,
          sgst_amount: Number(invoiceData.sgst_amount) || 0,
          igst_amount: Number(invoiceData.igst_amount) || 0,
          grand_total: Number(invoiceData.grand_total) || 0,
          created_at: invoiceData.created_at || new Date().toISOString(),
          updated_at: invoiceData.updated_at || new Date().toISOString(),
          clients: clientData
        });
      }
      
      setInvoices(invoicesData);
    } catch (error: any) {
      console.error("Error fetching invoices:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch invoices",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchInvoicesByClient = async (clientId: string) => {
    try {
      setLoading(true);
      const invoicesRef = collection(db, "invoices");
      const q = query(invoicesRef, orderBy("created_at", "desc"));
      
      const querySnapshot = await getDocs(q);
      const invoicesData: Invoice[] = [];
      
      for (const docSnap of querySnapshot.docs) {
        const invoiceData = docSnap.data();
        
        // Filter by client
        if (invoiceData.client_id !== clientId) {
          continue;
        }
        
        let clientData = null;
        if (invoiceData.client_id) {
          const clientDoc = await getDoc(doc(db, "clients", invoiceData.client_id));
          if (clientDoc.exists()) {
            clientData = clientDoc.data() as Client;
          }
        }
        
        invoicesData.push({
          id: docSnap.id,
          book_no: invoiceData.book_no || null,
          invoice_no: invoiceData.invoice_no || "",
          invoice_date: invoiceData.invoice_date || "",
          state: invoiceData.state || null,
          code: invoiceData.code || null,
          despatched_by: invoiceData.despatched_by || null,
          lr_number: invoiceData.lr_number || null,
          date_of_supply: invoiceData.date_of_supply || null,
          place_of_supply: invoiceData.place_of_supply || null,
          client_id: invoiceData.client_id || "",
          subtotal: Number(invoiceData.subtotal) || 0,
          cgst_percent: Number(invoiceData.cgst_percent) || 0,
          sgst_percent: Number(invoiceData.sgst_percent) || 0,
          igst_percent: Number(invoiceData.igst_percent) || 0,
          cgst_amount: Number(invoiceData.cgst_amount) || 0,
          sgst_amount: Number(invoiceData.sgst_amount) || 0,
          igst_amount: Number(invoiceData.igst_amount) || 0,
          grand_total: Number(invoiceData.grand_total) || 0,
          created_at: invoiceData.created_at || new Date().toISOString(),
          updated_at: invoiceData.updated_at || new Date().toISOString(),
          clients: clientData
        });
      }
      
      return invoicesData;
    } catch (error: any) {
      console.error("Error fetching client invoices:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch client invoices",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoiceWithItems = async (invoiceId: string) => {
    try {
      // Fetch invoice
      const invoiceDoc = await getDoc(doc(db, "invoices", invoiceId));
      if (!invoiceDoc.exists()) {
        throw new Error("Invoice not found");
      }
      
      const invoiceData = invoiceDoc.data();
      
      // Fetch client
      let clientData = null;
      if (invoiceData.client_id) {
        const clientDoc = await getDoc(doc(db, "clients", invoiceData.client_id));
        if (clientDoc.exists()) {
          clientData = clientDoc.data() as Client;
        }
      }
      
      // Fetch items
      const itemsRef = collection(db, "invoice_items");
      const q = query(
        itemsRef, 
        where("invoice_id", "==", invoiceId),
        orderBy("sr_no")
      );
      
      const itemsSnapshot = await getDocs(q);
      const items = itemsSnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        invoice_id: docSnap.data().invoice_id || "",
        sr_no: Number(docSnap.data().sr_no) || 0,
        particular: docSnap.data().particular || "",
        hsn_code: docSnap.data().hsn_code || null,
        per_pic: docSnap.data().per_pic || null,
        qty: Number(docSnap.data().qty) || 0,
        rate: Number(docSnap.data().rate) || 0,
        amount: Number(docSnap.data().amount) || 0,
      })) as InvoiceItem[];
      
      const invoice: Invoice = {
        id: invoiceDoc.id,
        book_no: invoiceData.book_no || null,
        invoice_no: invoiceData.invoice_no || "",
        invoice_date: invoiceData.invoice_date || "",
        state: invoiceData.state || null,
        code: invoiceData.code || null,
        despatched_by: invoiceData.despatched_by || null,
        lr_number: invoiceData.lr_number || null,
        date_of_supply: invoiceData.date_of_supply || null,
        place_of_supply: invoiceData.place_of_supply || null,
        client_id: invoiceData.client_id || "",
        subtotal: Number(invoiceData.subtotal) || 0,
        cgst_percent: Number(invoiceData.cgst_percent) || 0,
        sgst_percent: Number(invoiceData.sgst_percent) || 0,
        igst_percent: Number(invoiceData.igst_percent) || 0,
        cgst_amount: Number(invoiceData.cgst_amount) || 0,
        sgst_amount: Number(invoiceData.sgst_amount) || 0,
        igst_amount: Number(invoiceData.igst_amount) || 0,
        grand_total: Number(invoiceData.grand_total) || 0,
        created_at: invoiceData.created_at || new Date().toISOString(),
        updated_at: invoiceData.updated_at || new Date().toISOString(),
        clients: clientData
      };
      
      return {
        invoice,
        items
      };
    } catch (error: any) {
      console.error("Error fetching invoice with items:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch invoice",
        variant: "destructive",
      });
      return null;
    }
  };

  const createInvoice = async (
    invoiceData: Omit<Invoice, "id" | "created_at" | "updated_at" | "clients">,
    items: Omit<InvoiceItem, "id" | "invoice_id">[]
  ) => {
    try {
      const now = new Date().toISOString();
      
      // Ensure all numbers are properly converted
      const invoiceToCreate = {
        book_no: invoiceData.book_no || null,
        invoice_no: invoiceData.invoice_no,
        invoice_date: invoiceData.invoice_date,
        state: invoiceData.state || null,
        code: invoiceData.code || null,
        despatched_by: invoiceData.despatched_by || null,
        lr_number: invoiceData.lr_number || null,
        date_of_supply: invoiceData.date_of_supply || null,
        place_of_supply: invoiceData.place_of_supply || null,
        client_id: invoiceData.client_id,
        subtotal: Number(invoiceData.subtotal) || 0,
        cgst_percent: Number(invoiceData.cgst_percent) || 0,
        sgst_percent: Number(invoiceData.sgst_percent) || 0,
        igst_percent: Number(invoiceData.igst_percent) || 0,
        cgst_amount: Number(invoiceData.cgst_amount) || 0,
        sgst_amount: Number(invoiceData.sgst_amount) || 0,
        igst_amount: Number(invoiceData.igst_amount) || 0,
        grand_total: Number(invoiceData.grand_total) || 0,
        created_at: now,
        updated_at: now
      };
      
      console.log("Creating invoice:", invoiceToCreate);
      
      const invoiceRef = await addDoc(collection(db, "invoices"), invoiceToCreate);
      
      // Create items with proper number types
      const itemsPromises = items.map((item, index) => {
        const itemToCreate = {
          invoice_id: invoiceRef.id,
          sr_no: index + 1,
          particular: item.particular,
          hsn_code: item.hsn_code || null,
          per_pic: item.per_pic || null,
          qty: Number(item.qty) || 0,
          rate: Number(item.rate) || 0,
          amount: Number(item.amount) || 0,
          created_at: now
        };
        return addDoc(collection(db, "invoice_items"), itemToCreate);
      });
      
      await Promise.all(itemsPromises);
      
      const newInvoice: Invoice = {
        id: invoiceRef.id,
        ...invoiceToCreate,
        clients: undefined
      };
      
      // Update local state
      setInvoices(prev => [newInvoice, ...prev]);
      
      toast({
        title: "Success",
        description: "Invoice saved successfully",
      });
      
      return newInvoice;
    } catch (error: any) {
      console.error("Error creating invoice:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create invoice",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateInvoice = async (
    invoiceId: string,
    invoiceData: Partial<Omit<Invoice, "id" | "created_at" | "updated_at" | "clients">>,
    items?: Omit<InvoiceItem, "id" | "invoice_id">[]
  ) => {
    try {
      const now = new Date().toISOString();
      
      // Prepare update data
      const updateData: any = {
        updated_at: now
      };
      
      // Add only the fields that are provided
      if (invoiceData.book_no !== undefined) updateData.book_no = invoiceData.book_no;
      if (invoiceData.invoice_no !== undefined) updateData.invoice_no = invoiceData.invoice_no;
      if (invoiceData.invoice_date !== undefined) updateData.invoice_date = invoiceData.invoice_date;
      if (invoiceData.state !== undefined) updateData.state = invoiceData.state;
      if (invoiceData.code !== undefined) updateData.code = invoiceData.code;
      if (invoiceData.despatched_by !== undefined) updateData.despatched_by = invoiceData.despatched_by;
      if (invoiceData.lr_number !== undefined) updateData.lr_number = invoiceData.lr_number;
      if (invoiceData.date_of_supply !== undefined) updateData.date_of_supply = invoiceData.date_of_supply;
      if (invoiceData.place_of_supply !== undefined) updateData.place_of_supply = invoiceData.place_of_supply;
      if (invoiceData.client_id !== undefined) updateData.client_id = invoiceData.client_id;
      if (invoiceData.subtotal !== undefined) updateData.subtotal = Number(invoiceData.subtotal);
      if (invoiceData.cgst_percent !== undefined) updateData.cgst_percent = Number(invoiceData.cgst_percent);
      if (invoiceData.sgst_percent !== undefined) updateData.sgst_percent = Number(invoiceData.sgst_percent);
      if (invoiceData.igst_percent !== undefined) updateData.igst_percent = Number(invoiceData.igst_percent);
      if (invoiceData.cgst_amount !== undefined) updateData.cgst_amount = Number(invoiceData.cgst_amount);
      if (invoiceData.sgst_amount !== undefined) updateData.sgst_amount = Number(invoiceData.sgst_amount);
      if (invoiceData.igst_amount !== undefined) updateData.igst_amount = Number(invoiceData.igst_amount);
      if (invoiceData.grand_total !== undefined) updateData.grand_total = Number(invoiceData.grand_total);
      
      // Update invoice
      const invoiceRef = doc(db, "invoices", invoiceId);
      await updateDoc(invoiceRef, updateData);
      
      if (items) {
        // Delete existing items
        const itemsRef = collection(db, "invoice_items");
        const q = query(itemsRef, where("invoice_id", "==", invoiceId));
        const existingItems = await getDocs(q);
        
        const deletePromises = existingItems.docs.map(itemDoc => 
          deleteDoc(doc(db, "invoice_items", itemDoc.id))
        );
        await Promise.all(deletePromises);
        
        // Create new items
        const createPromises = items.map((item, index) => {
          const itemToCreate = {
            invoice_id: invoiceId,
            sr_no: index + 1,
            particular: item.particular,
            hsn_code: item.hsn_code || null,
            per_pic: item.per_pic || null,
            qty: Number(item.qty) || 0,
            rate: Number(item.rate) || 0,
            amount: Number(item.amount) || 0,
            created_at: now
          };
          return addDoc(collection(db, "invoice_items"), itemToCreate);
        });
        
        await Promise.all(createPromises);
      }
      
      // Update local state
      setInvoices(prev => prev.map(inv => 
        inv.id === invoiceId 
          ? { ...inv, ...updateData, updated_at: now }
          : inv
      ));
      
      toast({
        title: "Success",
        description: "Invoice updated successfully",
      });
      
      return true;
    } catch (error: any) {
      console.error("Error updating invoice:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update invoice",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteInvoice = async (invoiceId: string) => {
    try {
      // Delete items first
      const itemsRef = collection(db, "invoice_items");
      const q = query(itemsRef, where("invoice_id", "==", invoiceId));
      const itemsSnapshot = await getDocs(q);
      
      const deleteItemsPromises = itemsSnapshot.docs.map(itemDoc => 
        deleteDoc(doc(db, "invoice_items", itemDoc.id))
      );
      await Promise.all(deleteItemsPromises);
      
      // Delete invoice
      await deleteDoc(doc(db, "invoices", invoiceId));
      
      // Update local state
      setInvoices(prev => prev.filter(inv => inv.id !== invoiceId));
      
      toast({
        title: "Success",
        description: "Invoice deleted successfully",
      });
      
      return true;
    } catch (error: any) {
      console.error("Error deleting invoice:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete invoice",
        variant: "destructive",
      });
      return false;
    }
  };

  const getInvoiceStats = async (clientId?: string) => {
  try {
    console.log("Getting invoice stats...");
    
    const invoicesRef = collection(db, "invoices");
    const snapshot = await getDocs(invoicesRef);
    
    // Convert to array safely
    const docs = snapshot.docs || [];
    console.log("Number of invoices:", docs.length);
    
    let totalAmount = 0;
    let count = 0;
    
    for (let i = 0; i < docs.length; i++) {
      const doc = docs[i];
      try {
        const data = doc.data();
        
        // Check if data exists
        if (!data) {
          console.log(`Document ${i} has no data`);
          continue;
        }
        
        // Filter by client
        if (clientId && data.client_id !== clientId) {
          continue;
        }
        
        // Get grand total
        const gt = data.grand_total;
        if (gt !== undefined && gt !== null) {
          const num = parseFloat(gt);
          if (!isNaN(num)) {
            totalAmount += num;
            count++;
          }
        }
      } catch (err) {
        console.error(`Error processing document ${i}:`, err);
      }
    }
    
    return {
      totalAmount,
      totalInvoices: count
    };
    
  } catch (error: any) {
    console.error("Stats error:", error);
    return { totalAmount: 0, totalInvoices: 0 };
  }
};

  const getInvoicesByDateRange = async (startDate: string, endDate: string) => {
    try {
      // Fetch all and filter by date
      const invoicesRef = collection(db, "invoices");
      const querySnapshot = await getDocs(invoicesRef);
      
      const invoicesData: Invoice[] = [];
      
      for (const docSnap of querySnapshot.docs) {
        const invoiceData = docSnap.data();
        
        // Check if invoice date is within range
        const invoiceDate = invoiceData.invoice_date;
        if (invoiceDate < startDate || invoiceDate > endDate) {
          continue;
        }
        
        let clientData = null;
        if (invoiceData.client_id) {
          const clientDoc = await getDoc(doc(db, "clients", invoiceData.client_id));
          if (clientDoc.exists()) {
            clientData = clientDoc.data() as Client;
          }
        }
        
        invoicesData.push({
          id: docSnap.id,
          book_no: invoiceData.book_no || null,
          invoice_no: invoiceData.invoice_no || "",
          invoice_date: invoiceData.invoice_date || "",
          state: invoiceData.state || null,
          code: invoiceData.code || null,
          despatched_by: invoiceData.despatched_by || null,
          lr_number: invoiceData.lr_number || null,
          date_of_supply: invoiceData.date_of_supply || null,
          place_of_supply: invoiceData.place_of_supply || null,
          client_id: invoiceData.client_id || "",
          subtotal: Number(invoiceData.subtotal) || 0,
          cgst_percent: Number(invoiceData.cgst_percent) || 0,
          sgst_percent: Number(invoiceData.sgst_percent) || 0,
          igst_percent: Number(invoiceData.igst_percent) || 0,
          cgst_amount: Number(invoiceData.cgst_amount) || 0,
          sgst_amount: Number(invoiceData.sgst_amount) || 0,
          igst_amount: Number(invoiceData.igst_amount) || 0,
          grand_total: Number(invoiceData.grand_total) || 0,
          created_at: invoiceData.created_at || new Date().toISOString(),
          updated_at: invoiceData.updated_at || new Date().toISOString(),
          clients: clientData
        });
      }
      
      // Sort by date descending
      invoicesData.sort((a, b) => b.invoice_date.localeCompare(a.invoice_date));
      
      return invoicesData;
    } catch (error: any) {
      console.error("Error fetching invoices by date range:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch invoices by date range",
        variant: "destructive",
      });
      return [];
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  return {
    invoices,
    loading,
    fetchInvoices,
    fetchInvoicesByClient,
    fetchInvoiceWithItems,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    getInvoiceStats,
    getInvoicesByDateRange,
  };
};