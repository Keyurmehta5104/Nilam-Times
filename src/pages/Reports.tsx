import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { db } from "@/firebase/config";
import { 
  collection, 
  doc,
  getDoc,
  getDocs,
  query,
  orderBy
} from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, FileText, IndianRupee, Users, TrendingUp, Calendar } from "lucide-react";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subMonths } from "date-fns";

interface ClientReport {
  id: string;
  name: string;
  totalInvoices: number;
  totalAmount: number;
}

interface PeriodReport {
  label: string;
  invoices: number;
  amount: number;
}

const Reports = () => {
  const [clientReports, setClientReports] = useState<ClientReport[]>([]);
  const [totals, setTotals] = useState({ invoices: 0, amount: 0, clients: 0 });
  const [weeklyReports, setWeeklyReports] = useState<PeriodReport[]>([]);
  const [monthlyReports, setMonthlyReports] = useState<PeriodReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchReports();
    fetchWeeklyReports();
    fetchMonthlyReports();
  }, []);

  const fetchReports = async () => {
    try {
      // Fetch all invoices
      const invoicesRef = collection(db, "invoices");
      const invoicesQuery = query(invoicesRef, orderBy("created_at", "desc"));
      const invoicesSnapshot = await getDocs(invoicesQuery);
      
      const clientMap = new Map<string, ClientReport>();
      
      // Process each invoice
      for (const docSnap of invoicesSnapshot.docs) {
        const invoiceData = docSnap.data();
        const clientId = invoiceData.client_id;
        
        // Fetch client data
        let clientName = "Unknown";
        if (clientId) {
          try {
            const clientDocRef = doc(db, "clients", clientId);
            const clientDocSnap = await getDoc(clientDocRef);
            if (clientDocSnap.exists()) {
              clientName = clientDocSnap.data().name || "Unknown";
            }
          } catch (clientError) {
            console.error(`Error fetching client ${clientId}:`, clientError);
          }
        }
        
        if (!clientMap.has(clientId)) {
          clientMap.set(clientId, {
            id: clientId,
            name: clientName,
            totalInvoices: 0,
            totalAmount: 0,
          });
        }
        
        const client = clientMap.get(clientId)!;
        client.totalInvoices += 1;
        
        // Safely convert grand_total to number
        const grandTotal = invoiceData.grand_total;
        if (grandTotal !== undefined && grandTotal !== null) {
          const num = Number(grandTotal);
          if (!isNaN(num)) {
            client.totalAmount += num;
          }
        }
      }

      const reports = Array.from(clientMap.values()).sort(
        (a, b) => b.totalAmount - a.totalAmount
      );

      setClientReports(reports);
      
      // Calculate totals
      let totalInvoices = 0;
      let totalAmount = 0;
      
      invoicesSnapshot.forEach(doc => {
        totalInvoices += 1;
        const grandTotal = doc.data().grand_total;
        if (grandTotal !== undefined && grandTotal !== null) {
          const num = Number(grandTotal);
          if (!isNaN(num)) {
            totalAmount += num;
          }
        }
      });

      setTotals({
        invoices: totalInvoices,
        amount: totalAmount,
        clients: reports.length,
      });
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeeklyReports = async () => {
    try {
      const weeks: PeriodReport[] = [];
      
      for (let i = 0; i < 8; i++) {
        const weekStart = startOfWeek(subWeeks(new Date(), i), { weekStartsOn: 1 });
        const weekEnd = endOfWeek(subWeeks(new Date(), i), { weekStartsOn: 1 });
        
        const weekStartStr = format(weekStart, "yyyy-MM-dd");
        const weekEndStr = format(weekEnd, "yyyy-MM-dd");
        
        // Fetch all invoices and filter by week
        const invoicesRef = collection(db, "invoices");
        const snapshot = await getDocs(invoicesRef);
        
        let weekInvoices = 0;
        let weekAmount = 0;
        
        snapshot.forEach(doc => {
          const invoiceData = doc.data();
          const invoiceDate = invoiceData.invoice_date;
          
          if (invoiceDate >= weekStartStr && invoiceDate <= weekEndStr) {
            weekInvoices++;
            const grandTotal = invoiceData.grand_total;
            if (grandTotal !== undefined && grandTotal !== null) {
              const num = Number(grandTotal);
              if (!isNaN(num)) {
                weekAmount += num;
              }
            }
          }
        });

        weeks.push({
          label: i === 0 ? "This Week" : i === 1 ? "Last Week" : `${format(weekStart, "dd MMM")} - ${format(weekEnd, "dd MMM")}`,
          invoices: weekInvoices,
          amount: weekAmount,
        });
      }
      
      setWeeklyReports(weeks);
    } catch (error) {
      console.error("Error fetching weekly reports:", error);
    }
  };

  const fetchMonthlyReports = async () => {
    try {
      const months: PeriodReport[] = [];
      
      for (let i = 0; i < 12; i++) {
        const monthStart = startOfMonth(subMonths(new Date(), i));
        const monthEnd = endOfMonth(subMonths(new Date(), i));
        
        const monthStartStr = format(monthStart, "yyyy-MM-dd");
        const monthEndStr = format(monthEnd, "yyyy-MM-dd");
        
        // Fetch all invoices and filter by month
        const invoicesRef = collection(db, "invoices");
        const snapshot = await getDocs(invoicesRef);
        
        let monthInvoices = 0;
        let monthAmount = 0;
        
        snapshot.forEach(doc => {
          const invoiceData = doc.data();
          const invoiceDate = invoiceData.invoice_date;
          
          if (invoiceDate >= monthStartStr && invoiceDate <= monthEndStr) {
            monthInvoices++;
            const grandTotal = invoiceData.grand_total;
            if (grandTotal !== undefined && grandTotal !== null) {
              const num = Number(grandTotal);
              if (!isNaN(num)) {
                monthAmount += num;
              }
            }
          }
        });

        months.push({
          label: format(monthStart, "MMMM yyyy"),
          invoices: monthInvoices,
          amount: monthAmount,
        });
      }
      
      setMonthlyReports(months);
    } catch (error) {
      console.error("Error fetching monthly reports:", error);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
          <BarChart3 className="h-8 w-8" />
          Reports
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Clients</p>
                  <p className="text-3xl font-bold">{totals.clients}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-full">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Invoices</p>
                  <p className="text-3xl font-bold">{totals.invoices}</p>
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
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-3xl font-bold">
                    ₹{totals.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Client-wise</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Client-wise Report
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading reports...</div>
                ) : clientReports.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No data available. Create some invoices to see reports.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rank</TableHead>
                        <TableHead>Client Name</TableHead>
                        <TableHead className="text-right">No. of Invoices</TableHead>
                        <TableHead className="text-right">Total Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clientReports.map((client, index) => (
                        <TableRow key={client.id}>
                          <TableCell>
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold">
                              {index + 1}
                            </span>
                          </TableCell>
                          <TableCell className="font-medium">{client.name}</TableCell>
                          <TableCell className="text-right">{client.totalInvoices}</TableCell>
                          <TableCell className="text-right font-semibold">
                            ₹{client.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="weekly">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Weekly Report (Last 8 Weeks)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {weeklyReports.length === 0 ? (
                  <div className="text-center py-8">Loading...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Week</TableHead>
                        <TableHead className="text-right">No. of Invoices</TableHead>
                        <TableHead className="text-right">Total Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {weeklyReports.map((week, index) => (
                        <TableRow key={index} className={index === 0 ? "bg-primary/5" : ""}>
                          <TableCell className="font-medium">{week.label}</TableCell>
                          <TableCell className="text-right">{week.invoices}</TableCell>
                          <TableCell className="text-right font-semibold">
                            ₹{week.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monthly">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Monthly Report (Last 12 Months)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {monthlyReports.length === 0 ? (
                  <div className="text-center py-8">Loading...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Month</TableHead>
                        <TableHead className="text-right">No. of Invoices</TableHead>
                        <TableHead className="text-right">Total Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {monthlyReports.map((month, index) => (
                        <TableRow key={index} className={index === 0 ? "bg-primary/5" : ""}>
                          <TableCell className="font-medium">{month.label}</TableCell>
                          <TableCell className="text-right">{month.invoices}</TableCell>
                          <TableCell className="text-right font-semibold">
                            ₹{month.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Reports;