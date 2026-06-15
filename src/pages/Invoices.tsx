import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useInvoices } from "@/hooks/useInvoices";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Eye, FileText, Pencil, Trash2, Plus, IndianRupee, Calendar } from "lucide-react";
import { format } from "date-fns";

const Invoices = () => {
  const { invoices, loading, deleteInvoice, fetchInvoices } = useInvoices();
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const success = await deleteInvoice(id);
    if (success) fetchInvoices();
    setDeletingId(null);
  };

  const totalAmount = invoices.reduce((sum, inv) => sum + Number(inv.grand_total), 0);

  return (
    <Layout>
      <div className="py-6 px-4 sm:px-6 mb-20 lg:mb-0">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">All Invoices</h1>
            <p className="text-slate-500 text-sm mt-0.5">{invoices.length} invoices found</p>
          </div>
          <Button
            onClick={() => navigate("/")}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </Button>
        </div>

        {/* Summary Cards */}
        {!loading && invoices.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Total Bills</p>
                  <p className="text-2xl font-bold text-slate-800">{invoices.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                  <IndianRupee className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Total Value</p>
                  <p className="text-lg font-bold text-slate-800">
                    ₹{totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 0 })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-slate-500 text-sm">Loading invoices...</p>
            </div>
          </div>
        ) : invoices.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-slate-700 font-semibold text-lg mb-1">No invoices yet</h3>
            <p className="text-slate-400 text-sm mb-6">Create your first invoice to get started</p>
            <Button onClick={() => navigate("/")} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" /> Create Invoice
            </Button>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Invoice No</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Client</th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-slate-50/70 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 font-semibold text-sm px-2.5 py-1 rounded-lg">
                          <FileText className="h-3 w-3" />
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
                        <span className="text-slate-800 font-medium text-sm">{invoice.clients?.name || "N/A"}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-green-700 font-bold text-sm">
                          ₹{Number(invoice.grand_total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => navigate(`/invoice/${invoice.id}`)}
                            className="p-2 rounded-lg bg-slate-100 hover:bg-blue-100 hover:text-blue-700 text-slate-600 transition-all"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/invoice/${invoice.id}/edit`)}
                            className="p-2 rounded-lg bg-slate-100 hover:bg-amber-100 hover:text-amber-700 text-slate-600 transition-all"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button
                                disabled={deletingId === invoice.id}
                                className="p-2 rounded-lg bg-slate-100 hover:bg-red-100 hover:text-red-600 text-slate-600 transition-all disabled:opacity-50"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-2xl">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Invoice?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete invoice #{invoice.invoice_no}. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(invoice.id)}
                                  className="bg-red-600 hover:bg-red-700 rounded-xl"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 font-semibold text-sm px-2.5 py-1 rounded-lg mb-1">
                          <FileText className="h-3 w-3" />
                          #{invoice.invoice_no}
                        </span>
                        <p className="text-slate-500 text-xs mt-1 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(invoice.invoice_date), "dd MMM yyyy")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-700 font-bold text-lg">
                          ₹{Number(invoice.grand_total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-4 p-2.5 bg-slate-50 rounded-xl">
                      <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-700 text-xs font-bold">
                          {(invoice.clients?.name || "?")[0].toUpperCase()}
                        </span>
                      </div>
                      <span className="text-slate-700 font-medium text-sm">{invoice.clients?.name || "N/A"}</span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/invoice/${invoice.id}`)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100 transition-colors"
                      >
                        <Eye className="h-4 w-4" /> View
                      </button>
                      <button
                        onClick={() => navigate(`/invoice/${invoice.id}/edit`)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-amber-50 text-amber-700 text-sm font-medium hover:bg-amber-100 transition-colors"
                      >
                        <Pencil className="h-4 w-4" /> Edit
                      </button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            disabled={deletingId === invoice.id}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4" /> Delete
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-2xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Invoice?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete invoice #{invoice.invoice_no}. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(invoice.id)}
                              className="bg-red-600 hover:bg-red-700 rounded-xl"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
