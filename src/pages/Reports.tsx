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

const StatCard = ({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-800 mt-0.5">{value}</p>
      </div>
    </div>
  </div>
);

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
      const invoicesRef = collection(db, "invoices");
      const invoicesQuery = query(invoicesRef, orderBy("created_at", "desc"));
      const invoicesSnapshot = await getDocs(invoicesQuery);
      const clientMap = new Map<string, ClientReport>();
      for (const docSnap of invoicesSnapshot.docs) {
        const invoiceData = docSnap.data();
        const clientId = invoiceData.client_id;
        let clientName = "Unknown";
        if (clientId) {
          try {
            const clientDocRef = doc(db, "clients", clientId);
            const clientDocSnap = await getDoc(clientDocRef);
            if (clientDocSnap.exists()) clientName = clientDocSnap.data().name || "Unknown";
          } catch {}
        }
        if (!clientMap.has(clientId)) {
          clientMap.set(clientId, { id: clientId, name: clientName, totalInvoices: 0, totalAmount: 0 });
        }
        const client = clientMap.get(clientId)!;
        client.totalInvoices += 1;
        const grandTotal = invoiceData.grand_total;
        if (grandTotal !== undefined && grandTotal !== null) {
          const num = Number(grandTotal);
          if (!isNaN(num)) client.totalAmount += num;
        }
      }
      const reports = Array.from(clientMap.values()).sort((a, b) => b.totalAmount - a.totalAmount);
      setClientReports(reports);
      let totalInvoices = 0, totalAmount = 0;
      invoicesSnapshot.forEach(doc => {
        totalInvoices += 1;
        const grandTotal = doc.data().grand_total;
        if (grandTotal !== undefined && grandTotal !== null) {
          const num = Number(grandTotal);
          if (!isNaN(num)) totalAmount += num;
        }
      });
      setTotals({ invoices: totalInvoices, amount: totalAmount, clients: reports.length });
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
        const snapshot = await getDocs(collection(db, "invoices"));
        let weekInvoices = 0, weekAmount = 0;
        snapshot.forEach(doc => {
          const invoiceData = doc.data();
          const invoiceDate = invoiceData.invoice_date;
          if (invoiceDate >= weekStartStr && invoiceDate <= weekEndStr) {
            weekInvoices++;
            const grandTotal = invoiceData.grand_total;
            if (grandTotal !== undefined && grandTotal !== null) {
              const num = Number(grandTotal);
              if (!isNaN(num)) weekAmount += num;
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
        const snapshot = await getDocs(collection(db, "invoices"));
        let monthInvoices = 0, monthAmount = 0;
        snapshot.forEach(doc => {
          const invoiceData = doc.data();
          const invoiceDate = invoiceData.invoice_date;
          if (invoiceDate >= monthStartStr && invoiceDate <= monthEndStr) {
            monthInvoices++;
            const grandTotal = invoiceData.grand_total;
            if (grandTotal !== undefined && grandTotal !== null) {
              const num = Number(grandTotal);
              if (!isNaN(num)) monthAmount += num;
            }
          }
        });
        months.push({ label: format(monthStart, "MMMM yyyy"), invoices: monthInvoices, amount: monthAmount });
      }
      setMonthlyReports(months);
    } catch (error) {
      console.error("Error fetching monthly reports:", error);
    }
  };

  const tabs = [
    { id: "overview", label: "Client-wise", icon: TrendingUp },
    { id: "weekly", label: "Weekly", icon: Calendar },
    { id: "monthly", label: "Monthly", icon: BarChart3 },
  ];

  const maxAmount = clientReports.length > 0 ? clientReports[0].totalAmount : 1;

  return (
    <Layout>
      <div className="py-6 px-4 sm:px-6 mb-20 lg:mb-0">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Reports</h1>
          <p className="text-slate-500 text-sm mt-0.5">Business overview and analytics</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatCard icon={Users} label="Total Clients" value={String(totals.clients)} color="bg-purple-50 text-purple-600" />
          <StatCard icon={FileText} label="Total Invoices" value={String(totals.invoices)} color="bg-blue-50 text-blue-600" />
          <StatCard
            icon={IndianRupee}
            label="Total Revenue"
            value={`₹${totals.amount.toLocaleString("en-IN", { minimumFractionDigits: 0 })}`}
            color="bg-green-50 text-green-600"
          />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex border-b border-slate-100">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="p-5">
            {/* Client-wise Tab */}
            {activeTab === "overview" && (
              loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
                  <p className="text-slate-400 text-sm">Loading reports...</p>
                </div>
              ) : clientReports.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
                    <BarChart3 className="h-7 w-7 text-slate-400" />
                  </div>
                  <p className="text-slate-500 text-sm">No data yet. Create some invoices to see reports.</p>
                </div>
              ) : (
                <>
                  {/* Desktop */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="text-left pb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">#</th>
                          <th className="text-left pb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Client</th>
                          <th className="text-right pb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Invoices</th>
                          <th className="text-right pb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Amount</th>
                          <th className="pb-3 w-40"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {clientReports.map((client, index) => (
                          <tr key={client.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3.5 pr-4">
                              <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                                index === 0 ? "bg-yellow-100 text-yellow-700" :
                                index === 1 ? "bg-slate-100 text-slate-600" :
                                index === 2 ? "bg-orange-100 text-orange-700" :
                                "bg-slate-50 text-slate-500"
                              }`}>
                                {index + 1}
                              </span>
                            </td>
                            <td className="py-3.5">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                  <span className="text-blue-700 text-xs font-bold">{(client.name || "?")[0].toUpperCase()}</span>
                                </div>
                                <span className="font-medium text-slate-800 text-sm">{client.name}</span>
                              </div>
                            </td>
                            <td className="py-3.5 text-right">
                              <span className="inline-flex items-center justify-center bg-blue-50 text-blue-700 text-sm font-semibold px-2.5 py-0.5 rounded-lg">
                                {client.totalInvoices}
                              </span>
                            </td>
                            <td className="py-3.5 text-right font-bold text-green-700 text-sm">
                              ₹{client.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-3.5 pl-4">
                              <div className="w-full bg-slate-100 rounded-full h-1.5">
                                <div
                                  className="bg-blue-500 h-1.5 rounded-full transition-all"
                                  style={{ width: `${(client.totalAmount / maxAmount) * 100}%` }}
                                />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile */}
                  <div className="md:hidden space-y-3">
                    {clientReports.map((client, index) => (
                      <div key={client.id} className="p-4 bg-slate-50 rounded-xl">
                        <div className="flex items-center gap-3 mb-3">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold flex-shrink-0 ${
                            index === 0 ? "bg-yellow-100 text-yellow-700" :
                            index === 1 ? "bg-slate-200 text-slate-600" :
                            index === 2 ? "bg-orange-100 text-orange-700" :
                            "bg-white text-slate-500"
                          }`}>
                            {index + 1}
                          </span>
                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                            <span className="text-blue-700 text-xs font-bold">{(client.name || "?")[0].toUpperCase()}</span>
                          </div>
                          <span className="font-semibold text-slate-800 text-sm flex-1">{client.name}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <div className="bg-white p-2.5 rounded-lg text-center">
                            <p className="text-xs text-slate-400">Invoices</p>
                            <p className="text-lg font-bold text-slate-800">{client.totalInvoices}</p>
                          </div>
                          <div className="bg-white p-2.5 rounded-lg text-center">
                            <p className="text-xs text-slate-400">Amount</p>
                            <p className="text-base font-bold text-green-700">
                              ₹{client.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 0 })}
                            </p>
                          </div>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5">
                          <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${(client.totalAmount / maxAmount) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )
            )}

            {/* Weekly Tab */}
            {activeTab === "weekly" && (
              weeklyReports.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="space-y-2">
                  {weeklyReports.map((week, index) => (
                    <div key={index} className={`p-4 rounded-xl flex items-center justify-between gap-4 ${index === 0 ? "bg-blue-50 border border-blue-100" : "bg-slate-50"}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${index === 0 ? "bg-blue-600" : "bg-white"}`}>
                          <Calendar className={`h-4 w-4 ${index === 0 ? "text-white" : "text-slate-400"}`} />
                        </div>
                        <div>
                          <p className={`text-sm font-semibold ${index === 0 ? "text-blue-700" : "text-slate-700"}`}>{week.label}</p>
                          <p className="text-xs text-slate-400">{week.invoices} invoice{week.invoices !== 1 ? "s" : ""}</p>
                        </div>
                      </div>
                      <span className={`font-bold text-sm ${index === 0 ? "text-blue-700" : "text-green-700"}`}>
                        ₹{week.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* Monthly Tab */}
            {activeTab === "monthly" && (
              monthlyReports.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="space-y-2">
                  {monthlyReports.map((month, index) => (
                    <div key={index} className={`p-4 rounded-xl flex items-center justify-between gap-4 ${index === 0 ? "bg-blue-50 border border-blue-100" : "bg-slate-50"}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${index === 0 ? "bg-blue-600" : "bg-white"}`}>
                          <BarChart3 className={`h-4 w-4 ${index === 0 ? "text-white" : "text-slate-400"}`} />
                        </div>
                        <div>
                          <p className={`text-sm font-semibold ${index === 0 ? "text-blue-700" : "text-slate-700"}`}>{month.label}</p>
                          <p className="text-xs text-slate-400">{month.invoices} invoice{month.invoices !== 1 ? "s" : ""}</p>
                        </div>
                      </div>
                      <span className={`font-bold text-sm ${index === 0 ? "text-blue-700" : "text-green-700"}`}>
                        ₹{month.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Reports;
