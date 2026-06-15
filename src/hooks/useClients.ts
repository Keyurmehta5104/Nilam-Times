import { useState, useEffect, useCallback } from "react";
import { 
  collection, 
  doc, 
  getDoc,
  getDocs, 
  addDoc, 
  updateDoc,
  query,
  where,
  orderBy
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { useToast } from "@/hooks/use-toast";

export interface Client {
  id: string;
  name: string;
  address: string | null;
  gstin: string | null;
  state: string | null;
  code: string | null;
  place_of_supply: string | null;
  created_at: string;
  updated_at: string;
}

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchClients = useCallback(async () => {
    try {
      const clientsRef = collection(db, "clients");
      const q = query(clientsRef, orderBy("name"));
      const querySnapshot = await getDocs(q);
      
      const clientsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Client[];
      
      // Only show clients that have at least one invoice
      const invoicesRef = collection(db, "invoices");
      const invoicesSnapshot = await getDocs(invoicesRef);
      const clientIdsWithInvoices = new Set(
        invoicesSnapshot.docs.map(d => d.data().client_id)
      );
      
      const clientsWithInvoices = clientsData.filter(client =>
        clientIdsWithInvoices.has(client.id)
      );

      // Deduplicate by name (case-insensitive)
      const uniqueClients: Client[] = [];
      const seenNames = new Set<string>();
      
      clientsWithInvoices.forEach(client => {
        const nameKey = client.name.trim().toUpperCase();
        if (!seenNames.has(nameKey)) {
          seenNames.add(nameKey);
          uniqueClients.push(client);
        }
      });
      
      setClients(uniqueClients);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch clients",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const searchClients = async (searchTerm: string) => {
    try {
      setLoading(true);
      const clientsRef = collection(db, "clients");
      
      // Firebase doesn't have direct ilike search, so we fetch all and filter
      const q = query(clientsRef, orderBy("name"));
      const querySnapshot = await getDocs(q);
      
      const allClients = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Client[];
      
      // Filter clients by name (case-insensitive)
      const filteredClients = allClients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      // Only show clients that have at least one invoice
      const invoicesRef = collection(db, "invoices");
      const invoicesSnapshot = await getDocs(invoicesRef);
      const clientIdsWithInvoices = new Set(
        invoicesSnapshot.docs.map(d => d.data().client_id)
      );
      
      const clientsWithInvoices = filteredClients.filter(client =>
        clientIdsWithInvoices.has(client.id)
      );

      // Deduplicate by name (case-insensitive)
      const uniqueClients: Client[] = [];
      const seenNames = new Set<string>();
      
      clientsWithInvoices.forEach(client => {
        const nameKey = client.name.trim().toUpperCase();
        if (!seenNames.has(nameKey)) {
          seenNames.add(nameKey);
          uniqueClients.push(client);
        }
      });
      
      setClients(uniqueClients);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to search clients",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createClient = async (client: Omit<Client, "id" | "created_at" | "updated_at">) => {
    try {
      const now = new Date().toISOString();
      const clientData = {
        ...client,
        created_at: now,
        updated_at: now
      };
      
      const docRef = await addDoc(collection(db, "clients"), clientData);
      
      const newClient: Client = {
        id: docRef.id,
        ...clientData
      };
      
      setClients(prev => [...prev, newClient].sort((a, b) => a.name.localeCompare(b.name)));
      
      toast({
        title: "Success",
        description: "Client created successfully",
      });
      
      return newClient;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create client",
        variant: "destructive",
      });
      return null;
    }
  };

  const getOrCreateClient = async (clientData: Omit<Client, "id" | "created_at" | "updated_at">) => {
    try {
      // Try to find existing client by name (case-insensitive)
      const clientsRef = collection(db, "clients");
      const querySnapshot = await getDocs(clientsRef);
      
      const searchName = (clientData.name || "").trim().toUpperCase();
      const existingDoc = querySnapshot.docs.find(d => {
        const name = (d.data().name || "").trim().toUpperCase();
        return name === searchName;
      });
      
      if (existingDoc) {
        // Update the existing client with the latest data
        const updates: Record<string, any> = {};
        updates.name = clientData.name;
        if (clientData.address !== undefined) updates.address = clientData.address;
        if (clientData.gstin !== undefined) updates.gstin = clientData.gstin;
        if (clientData.state !== undefined) updates.state = clientData.state;
        if (clientData.code !== undefined) updates.code = clientData.code;
        if (clientData.place_of_supply !== undefined) updates.place_of_supply = clientData.place_of_supply;
        updates.updated_at = new Date().toISOString();
        
        const clientRef = doc(db, "clients", existingDoc.id);
        await updateDoc(clientRef, updates);
        
        return {
          id: existingDoc.id,
          ...existingDoc.data(),
          ...updates
        } as Client;
      }
      
      // Create new client if not found
      return await createClient(clientData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to get or create client",
        variant: "destructive",
      });
      return null;
    }
  };

  const getClientById = async (clientId: string) => {
    try {
      const clientDoc = await getDoc(doc(db, "clients", clientId));
      if (clientDoc.exists()) {
        return {
          id: clientDoc.id,
          ...clientDoc.data()
        } as Client;
      }
      return null;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch client",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateClient = async (clientId: string, updates: Partial<Omit<Client, "id" | "created_at" | "updated_at">>) => {
    try {
      const clientRef = doc(db, "clients", clientId);
      await updateDoc(clientRef, {
        ...updates,
        updated_at: new Date().toISOString()
      });
      
      // Update local state
      setClients(prev => prev.map(client => 
        client.id === clientId 
          ? { ...client, ...updates, updated_at: new Date().toISOString() }
          : client
      ));
      
      toast({
        title: "Success",
        description: "Client updated successfully",
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update client",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  return {
    clients,
    loading,
    fetchClients,
    searchClients,
    createClient,
    getOrCreateClient,
    getClientById,
    updateClient,
  };
};