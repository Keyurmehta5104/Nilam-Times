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
      
      setClients(clientsData);
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
      
      setClients(filteredClients);
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
      // Try to find existing client by name
      const clientsRef = collection(db, "clients");
      const q = query(clientsRef, where("name", "==", clientData.name));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const existingDoc = querySnapshot.docs[0];
        return {
          id: existingDoc.id,
          ...existingDoc.data()
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