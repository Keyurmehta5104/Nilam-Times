import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useClients, Client } from "@/hooks/useClients";
import { useInvoices, Invoice } from "@/hooks/useInvoices";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search as SearchIcon, Eye, User, FileText, IndianRupee } from "lucide-react";
import { format } from "date-fns";

const Search = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientInvoices, setClientInvoices] = useState<Invoice[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);

  const { clients, searchClients, loading: clientsLoading } = useClients();
  const { fetchInvoicesByClient, loading: invoicesLoading } = useInvoices();
  const navigate = useNavigate();

  const handleSearch = () => {
    if (searchTerm.trim()) {
      searchClients(searchTerm);
      setSelectedClient(null);
      setClientInvoices([]);
    }
  };

  const handleClientSelect = async (client: Client) => {
    setSelectedClient(client);
    const invoices = await fetchInvoicesByClient(client.id);
    setClientInvoices(invoices);
    const total = invoices.reduce((sum, inv) => sum + Number(inv.grand_total), 0);
    setTotalAmount(total);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-4 sm:py-8 px-3 sm:px-4 mb-20 lg:mb-0">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <SearchIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              Search Client
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                placeholder="Enter client name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} className="w-full sm:w-auto">
                <SearchIcon className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {clients.length > 0 && !selectedClient && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Search Results</CardTitle>
            </CardHeader>
            <CardContent>
              {clientsLoading ? (
                <div className="text-center py-4">Searching...</div>
              ) : (
                <div className="space-y-2">
                  {clients.map((client) => (
                    <div
                      key={client.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                      onClick={() => handleClientSelect(client)}
                    >
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-primary flex-shrink-0" />
                        <div>
                          <p className="font-medium">{client.name}</p>
                          <p className="text-sm text-muted-foreground break-all">
                            {client.address || "No address"} | GSTIN: {client.gstin || "N/A"}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="w-full sm:w-auto">
                        View Bills
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {selectedClient && (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 sm:h-6 sm:w-6" />
                    <span className="text-lg sm:text-xl">{selectedClient.name}</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setSelectedClient(null)} className="w-full sm:w-auto">
                    Back to Results
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">{selectedClient.address || "N/A"}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">GSTIN</p>
                    <p className="font-medium">{selectedClient.gstin || "N/A"}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">State / Code</p>
                    <p className="font-medium">{selectedClient.state || "N/A"} / {selectedClient.code || "N/A"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Invoices</p>
                      <p className="text-2xl font-bold">{clientInvoices.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-500/10 rounded-full">
                      <IndianRupee className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Amount</p>
                      <p className="text-2xl font-bold">
                        ₹{totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Invoices</CardTitle>
              </CardHeader>
              <CardContent>
                {invoicesLoading ? (
                  <div className="text-center py-8">Loading invoices...</div>
                ) : clientInvoices.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No invoices found for this client.
                  </div>
                ) : (
                  <>
                    {/* Desktop Table View */}
                    <div className="hidden sm:block overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Invoice No</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {clientInvoices.map((invoice) => (
                            <TableRow key={invoice.id}>
                              <TableCell className="font-medium">{invoice.invoice_no}</TableCell>
                              <TableCell>
                                {format(new Date(invoice.invoice_date), "dd/MM/yyyy")}
                              </TableCell>
                              <TableCell className="text-right font-semibold">
                                ₹{Number(invoice.grand_total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => navigate(`/invoice/${invoice.id}`)}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="sm:hidden space-y-3">
                      {clientInvoices.map((invoice) => (
                        <Card key={invoice.id} className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-semibold text-base">#{invoice.invoice_no}</p>
                                <p className="text-sm text-muted-foreground">
                                  {format(new Date(invoice.invoice_date), "dd/MM/yyyy")}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-base text-primary">
                                  ₹{Number(invoice.grand_total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full mt-2"
                              onClick={() => navigate(`/invoice/${invoice.id}`)}
                            >
                              <Eye className="h-4 w-4 mr-1" /> View Invoice
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Search;
