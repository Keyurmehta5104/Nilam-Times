import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useClients, Client } from "@/hooks/useClients";
import { useInvoices, Invoice } from "@/hooks/useInvoices";
import { Eye, Search as SearchIcon, User, FileText, IndianRupee, MapPin, Hash, ArrowLeft, Calendar } from "lucide-react";
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
    setTotalAmount(invoices.reduce((sum, inv) => sum + Number(inv.grand_total), 0));
  };

  return (
    <Layout>
      <div className="py-6 px-4 sm:px-6 mb-20 lg:mb-0">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Search Client</h1>
          <p className="text-slate-500 text-sm mt-0.5">Find clients and view their invoices</p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Enter client name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 text-sm placeholder-slate-400 outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:bg-white"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
            >
              <SearchIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Search</span>
            </button>
          </div>
        </div>

        {/* Search Results */}
        {clients.length > 0 && !selectedClient && (
          <div className="mb-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              {clients.length} result{clients.length !== 1 ? "s" : ""} found
            </p>
            {clientsLoading ? (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center py-12">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-2">
                {clients.map((client) => (
                  <div
                    key={client.id}
                    onClick={() => handleClientSelect(client)}
                    className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex items-center justify-between gap-4 cursor-pointer hover:border-blue-200 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                        <span className="text-blue-700 font-bold text-base">
                          {(client.name || "?")[0].toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{client.name}</p>
                        <p className="text-slate-400 text-xs mt-0.5">{client.address || "No address"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-blue-600 text-xs font-medium bg-blue-50 px-3 py-1.5 rounded-lg flex-shrink-0">
                      <FileText className="h-3.5 w-3.5" />
                      View Bills
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Client Detail */}
        {selectedClient && (
          <>
            {/* Back button + client header */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-4">
              <button
                onClick={() => setSelectedClient(null)}
                className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 text-sm mb-4 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Back to results
              </button>

              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-black text-xl">
                    {(selectedClient.name || "?")[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">{selectedClient.name}</h2>
                  <p className="text-slate-500 text-sm">Client Details</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-start gap-2.5 p-3 bg-slate-50 rounded-xl">
                  <MapPin className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Address</p>
                    <p className="text-sm font-medium text-slate-700">{selectedClient.address || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-3 bg-slate-50 rounded-xl">
                  <Hash className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">GSTIN</p>
                    <p className="text-sm font-medium text-slate-700">{selectedClient.gstin || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-3 bg-slate-50 rounded-xl">
                  <User className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">State / Code</p>
                    <p className="text-sm font-medium text-slate-700">{selectedClient.state || "N/A"} / {selectedClient.code || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Total Bills</p>
                  <p className="text-2xl font-bold text-slate-800">{clientInvoices.length}</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                  <IndianRupee className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Total Amount</p>
                  <p className="text-lg font-bold text-slate-800">
                    ₹{totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 0 })}
                  </p>
                </div>
              </div>
            </div>

            {/* Invoices */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-800">Invoices</h3>
              </div>

              {invoicesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : clientInvoices.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-3">
                    <FileText className="h-6 w-6 text-slate-400" />
                  </div>
                  <p className="text-slate-500 text-sm">No invoices found for this client.</p>
                </div>
              ) : (
                <>
                  {/* Desktop */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                          <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Invoice No</th>
                          <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                          <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                          <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {clientInvoices.map((invoice) => (
                          <tr key={invoice.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="px-5 py-3.5">
                              <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 font-semibold text-sm px-2.5 py-1 rounded-lg">
                                #{invoice.invoice_no}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-slate-600 text-sm flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-slate-400" />
                              {format(new Date(invoice.invoice_date), "dd MMM yyyy")}
                            </td>
                            <td className="px-5 py-3.5 text-right font-bold text-green-700 text-sm">
                              ₹{Number(invoice.grand_total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <button
                                onClick={() => navigate(`/invoice/${invoice.id}`)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100 transition-colors"
                              >
                                <Eye className="h-3.5 w-3.5" /> View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile */}
                  <div className="sm:hidden divide-y divide-slate-100">
                    {clientInvoices.map((invoice) => (
                      <div key={invoice.id} className="p-4 flex items-center justify-between">
                        <div>
                          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 font-semibold text-sm px-2 py-0.5 rounded-lg mb-1">
                            #{invoice.invoice_no}
                          </span>
                          <p className="text-xs text-slate-400 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(invoice.invoice_date), "dd MMM yyyy")}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-green-700 font-bold text-sm">
                            ₹{Number(invoice.grand_total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </span>
                          <button
                            onClick={() => navigate(`/invoice/${invoice.id}`)}
                            className="p-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Search;
