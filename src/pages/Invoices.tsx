import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useInvoices } from "@/hooks/useInvoices";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Eye, FileText, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";

const Invoices = () => {
  const { invoices, loading, deleteInvoice, fetchInvoices } = useInvoices();
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const success = await deleteInvoice(id);
    if (success) {
      fetchInvoices();
    }
    setDeletingId(null);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-4 sm:py-8 px-3 sm:px-4 mb-20 lg:mb-0">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
              All Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : invoices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No invoices found. Create your first invoice!
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice No</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">{invoice.invoice_no}</TableCell>
                          <TableCell>
                            {format(new Date(invoice.invoice_date), "dd/MM/yyyy")}
                          </TableCell>
                          <TableCell>{invoice.clients?.name || "N/A"}</TableCell>
                          <TableCell className="text-right font-semibold">
                            ₹{Number(invoice.grand_total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/invoice/${invoice.id}`)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/invoice/${invoice.id}/edit`)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm" disabled={deletingId === invoice.id}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Invoice?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will permanently delete invoice #{invoice.invoice_no}. This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(invoice.id)}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
                  {invoices.map((invoice) => (
                    <Card key={invoice.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-semibold text-lg">#{invoice.invoice_no}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(invoice.invoice_date), "dd/MM/yyyy")}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg text-primary">
                              ₹{Number(invoice.grand_total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                        </div>
                        <div className="mb-3">
                          <p className="text-sm text-muted-foreground">Client</p>
                          <p className="font-medium">{invoice.clients?.name || "N/A"}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => navigate(`/invoice/${invoice.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-1" /> View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => navigate(`/invoice/${invoice.id}/edit`)}
                          >
                            <Pencil className="h-4 w-4 mr-1" /> Edit
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="destructive" 
                                size="sm" 
                                className="flex-1"
                                disabled={deletingId === invoice.id}
                              >
                                <Trash2 className="h-4 w-4 mr-1" /> Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Invoice?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete invoice #{invoice.invoice_no}. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(invoice.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Invoices;
