import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import PageHeader, { HeaderButton } from "@/components/PageHeader";
import { useInvoices } from "@/hooks/useInvoices";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Eye, FileText, Pencil, Trash2, Plus, IndianRupee, Calendar, Search, X } from "lucide-react";
import { format } from "date-fns";

const formatAmount = (value: number, digits = 2) =>
  `₹${value.toLocaleString("en-IN", { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;

const Invoices = () => {
  const { invoices, loading, deleteInvoice, fetchInvoices } = useInvoices();
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filter, setFilter] = useState("");

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const success = await deleteInvoice(id);
    if (success) fetchInvoices();
    setDeletingId(null);
  };

  const totalAmount = invoices.reduce((sum, inv) => sum + Number(inv.grand_total), 0);

  const visibleInvoices = useMemo(() => {
    const term = filter.trim().toLowerCase();
    if (!term) return invoices;
    return invoices.filter(
      (inv) =>
        String(inv.invoice_no || "").toLowerCase().includes(term) ||
        (inv.clients?.name || "").toLowerCase().includes(term)
    );
  }, [invoices, filter]);

  const renderDeleteDialog = (invoiceId: string, invoiceNo: string, trigger: React.ReactNode) => (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent className="rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Invoice?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete invoice #{invoiceNo}. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => handleDelete(invoiceId)}
            className="bg-red-600 hover:bg-red-700 rounded-xl"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return (
    <Layout>
      <div className="py-4 sm:py-6 px-3 sm:px-6">
        <PageHeader
          title="All Invoices"
          subtitle={loading ? "Loading..." : `${invoices.length} invoice${invoices.length !== 1 ? "s" : ""} saved`}
          icon={FileText}
          actions={
            <HeaderButton variant="solid" onClick={() => navigate("/")}>
              <Plus className="h-4 w-4" /> New Invoice
            </HeaderButton>
          }
        />

        {/* Summary Cards */}
        {!loading && invoices.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-5">
            <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/70">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#1e3a5f]/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-5 w-5 text-[#1e3a5f]" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Bills</p>
                  <p className="text-2xl font-bold text-slate-800">{invoices.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/70">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <IndianRupee className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Value</p>
                  <p className="text-lg sm:text-2xl font-bold text-slate-800 truncate">{formatAmount(totalAmount, 0)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter */}
        {!loading && invoices.length > 0 && (
          <div className="relative mb-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="search"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter by invoice no. or client name..."
              className="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl bg-white text-slate-800 text-sm placeholder-slate-400 outline-none shadow-sm transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
            {filter && (
              <button
                onClick={() => setFilter("")}
                className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600"
                aria-label="Clear filter"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm">
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-[#1e3a5f] border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-slate-500 text-sm">Loading invoices...</p>
            </div>
          </div>
        ) : invoices.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="w-16 h-16 bg-[#1e3a5f]/10 rounded-2xl flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-[#1e3a5f]" />
            </div>
            <h3 className="text-slate-700 font-semibold text-lg mb-1">No invoices yet</h3>
            <p className="text-slate-400 text-sm mb-6">Create your first invoice to get started</p>
            <Button onClick={() => navigate("/")} className="rounded-xl">
              <Plus className="h-4 w-4 mr-2" /> Create Invoice
            </Button>
          </div>
        ) : visibleInvoices.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm flex flex-col items-center justify-center py-14 px-4 text-center">
            <Search className="h-8 w-8 text-slate-300 mb-3" />
            <p className="text-slate-600 text-sm font-medium">No invoices match "{filter}"</p>
            <button onClick={() => setFilter("")} className="mt-3 text-sm font-semibold text-[#1d4ed8] hover:underline">
              Clear filter
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200/70 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Invoice No</th>
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Client</th>
                    <th className="text-right px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                    <th className="text-right px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visibleInvoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      onClick={() => navigate(`/invoice/${invoice.id}`)}
                      className="hover:bg-blue-50/40 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 bg-[#1e3a5f]/10 text-[#1e3a5f] font-semibold text-sm px-2.5 py-1 rounded-lg">
                          #{invoice.invoice_no}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-slate-600 text-sm">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          {format(new Date(invoice.invoice_date), "dd MMM yyyy")}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-[#1e3a5f] text-xs font-bold">
                              {(invoice.clients?.name || "?")[0].toUpperCase()}
                            </span>
                          </div>
                          <span className="text-slate-800 font-medium text-sm">{invoice.clients?.name || "N/A"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-emerald-700 font-bold text-sm">{formatAmount(Number(invoice.grand_total))}</span>
                      </td>
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => navigate(`/invoice/${invoice.id}`)}
                            className="p-2 rounded-lg text-slate-500 hover:bg-blue-100 hover:text-[#1d4ed8] transition-all"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/invoice/${invoice.id}/edit`)}
                            className="p-2 rounded-lg text-slate-500 hover:bg-amber-100 hover:text-amber-700 transition-all"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          {renderDeleteDialog(
                            invoice.id,
                            invoice.invoice_no,
                            <button
                              disabled={deletingId === invoice.id}
                              className="p-2 rounded-lg text-slate-500 hover:bg-red-100 hover:text-red-600 transition-all disabled:opacity-50"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {visibleInvoices.map((invoice) => (
                <div key={invoice.id} className="bg-white rounded-2xl shadow-sm border border-slate-200/70 overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="inline-flex items-center gap-1 bg-[#1e3a5f]/10 text-[#1e3a5f] font-semibold text-sm px-2.5 py-1 rounded-lg">
                          #{invoice.invoice_no}
                        </span>
                        <p className="text-slate-500 text-xs mt-1.5 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(invoice.invoice_date), "dd MMM yyyy")}
                        </p>
                      </div>
                      <p className="text-emerald-700 font-bold text-lg">{formatAmount(Number(invoice.grand_total))}</p>
                    </div>

                    <div className="flex items-center gap-2 mb-4 p-2.5 bg-slate-50 rounded-xl">
                      <div className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                        <span className="text-[#1e3a5f] text-xs font-bold">
                          {(invoice.clients?.name || "?")[0].toUpperCase()}
                        </span>
                      </div>
                      <span className="text-slate-700 font-medium text-sm">{invoice.clients?.name || "N/A"}</span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/invoice/${invoice.id}`)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#1e3a5f] text-white text-sm font-medium hover:bg-[#16304f] transition-colors"
                      >
                        <Eye className="h-4 w-4" /> View
                      </button>
                      <button
                        onClick={() => navigate(`/invoice/${invoice.id}/edit`)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors"
                      >
                        <Pencil className="h-4 w-4" /> Edit
                      </button>
                      {renderDeleteDialog(
                        invoice.id,
                        invoice.invoice_no,
                        <button
                          disabled={deletingId === invoice.id}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" /> Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Invoices;
