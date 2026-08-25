import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { 
  BarChart3, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Scale, 
  Receipt, 
  Download, 
  DollarSign, 
  PieChart as PieIcon,
  Award,
  Layers,
  ArrowRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';

export const RevenueReports: React.FC = () => {
  const { transactions, settings } = useApp();

  const [activeTab, setActiveTab] = useState<'daily' | 'monthly' | 'yearly' | 'custom'>('daily');

  // Filter selections
  const [reportDate, setReportDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [reportMonth, setReportMonth] = useState<string>(new Date().toISOString().substring(0, 7));
  const [reportYear, setReportYear] = useState<string>(new Date().getFullYear().toString());
  const [customStart, setCustomStart] = useState<string>(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [customEnd, setCustomEnd] = useState<string>(new Date().toISOString().split('T')[0]);

  const COLORS = ['#1E5AA8', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#64748B'];

  // --- 1. DAILY CALCULATIONS ---
  const dayTxs = transactions.filter(t => t.date === reportDate);
  const dayRevenue = dayTxs.filter(t => t.type === 'sale').reduce((sum, t) => sum + t.totalAmount, 0);
  const dayExpenses = dayTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.totalAmount, 0);
  const dayNet = dayRevenue - dayExpenses;
  const dayCount = dayTxs.length;

  // Hourly Breakdown (8 AM to 8 PM)
  const hoursList = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];
  const hourlyData = hoursList.map(h => {
    const hourPrefix = h.split(':')[0];
    const hourSales = dayTxs
      .filter(t => t.type === 'sale' && t.time && t.time.includes(` ${hourPrefix}:`) || (t.time && t.time.startsWith(hourPrefix)))
      .reduce((sum, t) => sum + t.totalAmount, 0);
    return {
      hour: h,
      sales: hourSales
    };
  });

  // Daily Category Breakdown
  const dayCatMap: Record<string, number> = {};
  dayTxs.filter(t => t.type === 'sale').forEach(t => {
    dayCatMap[t.category] = (dayCatMap[t.category] || 0) + t.totalAmount;
  });
  const dayCatData = Object.entries(dayCatMap).map(([name, value]) => ({
    name,
    value,
    percentage: dayRevenue > 0 ? Math.round((value / dayRevenue) * 100) : 0
  }));

  // --- 2. MONTHLY CALCULATIONS ---
  const monthTxs = transactions.filter(t => t.date.startsWith(reportMonth));
  const monthRevenue = monthTxs.filter(t => t.type === 'sale').reduce((sum, t) => sum + t.totalAmount, 0);
  const monthExpenses = monthTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.totalAmount, 0);
  const monthNet = monthRevenue - monthExpenses;
  
  const daysInMonth = new Date(parseInt(reportMonth.split('-')[0]), parseInt(reportMonth.split('-')[1]), 0).getDate();
  const avgDailyRevenue = daysInMonth > 0 ? (monthRevenue / daysInMonth) : 0;

  const monthDailyData = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const dStr = `${reportMonth}-${day.toString().padStart(2, '0')}`;
    const rev = transactions.filter(t => t.date === dStr && t.type === 'sale').reduce((sum, t) => sum + t.totalAmount, 0);
    const exp = transactions.filter(t => t.date === dStr && t.type === 'expense').reduce((sum, t) => sum + t.totalAmount, 0);
    return {
      day: `${day}`,
      date: dStr,
      revenue: rev,
      expense: exp,
      net: rev - exp
    };
  });

  const bestMonthDay = [...monthDailyData].sort((a, b) => b.revenue - a.revenue)[0];

  // --- 3. YEARLY CALCULATIONS ---
  const yearTxs = transactions.filter(t => t.date.startsWith(reportYear));
  const yearRevenue = yearTxs.filter(t => t.type === 'sale').reduce((sum, t) => sum + t.totalAmount, 0);
  const yearExpenses = yearTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.totalAmount, 0);
  const yearNet = yearRevenue - yearExpenses;
  const avgMonthlyRevenue = yearRevenue / 12;

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const yearMonthlyData = months.map((name, idx) => {
    const mStr = `${reportYear}-${(idx + 1).toString().padStart(2, '0')}`;
    const rev = transactions.filter(t => t.date.startsWith(mStr) && t.type === 'sale').reduce((sum, t) => sum + t.totalAmount, 0);
    const exp = transactions.filter(t => t.date.startsWith(mStr) && t.type === 'expense').reduce((sum, t) => sum + t.totalAmount, 0);
    return {
      month: name,
      revenue: rev,
      expenses: exp,
      net: rev - exp
    };
  });

  const bestYearMonth = [...yearMonthlyData].sort((a, b) => b.revenue - a.revenue)[0];

  // --- 4. CUSTOM RANGE CALCULATIONS ---
  const customTxs = transactions.filter(t => t.date >= customStart && t.date <= customEnd);
  const customRevenue = customTxs.filter(t => t.type === 'sale').reduce((sum, t) => sum + t.totalAmount, 0);
  const customExpenses = customTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.totalAmount, 0);
  const customNet = customRevenue - customExpenses;

  const exportCustomCSV = () => {
    const headers = ["ID", "Date", "Time", "Type", "Category", "Sub-Type", "Amount (LKR)", "Payment Method", "Party", "Description"];
    const rows = customTxs.map(t => [
      t.id,
      t.date,
      t.time || '',
      t.type,
      `"${t.category}"`,
      `"${t.subType || ''}"`,
      t.totalAmount,
      t.paymentMethod,
      `"${t.customerName || t.vendor || ''}"`,
      `"${t.description.replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Report_${customStart}_to_${customEnd}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* 10.7 Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Revenue & Financial Reports</h2>
          <p className="text-xs text-gray-500">Comprehensive sales metrics, profit/loss analysis, and category charts</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center bg-gray-200/80 p-1 rounded-lg">
          {(['daily', 'monthly', 'yearly', 'custom'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 sm:px-4 py-1.5 rounded-md text-xs font-bold capitalize transition-colors ${
                activeTab === tab ? 'bg-white text-[#1E5AA8] shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab === 'custom' ? 'Custom Range' : `${tab} Report`}
            </button>
          ))}
        </div>
      </div>

      {/* --- TAB 1: DAILY SUMMARY --- */}
      {activeTab === 'daily' && (
        <div className="space-y-6">
          {/* Controls */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-soft-sm flex items-center gap-3">
            <Calendar className="w-4 h-4 text-[#1E5AA8]" />
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Report Date:</label>
            <input
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              className="py-1.5 px-3 bg-gray-50 border border-gray-300 rounded text-xs font-mono font-bold text-gray-900 focus:border-[#1E5AA8] outline-none"
            />
          </div>

          {/* 4 Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-soft-sm">
              <span className="text-xs text-gray-500 font-medium block">Day Revenue</span>
              <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-600 mt-1 block">
                LKR {dayRevenue.toFixed(2)}
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-soft-sm">
              <span className="text-xs text-gray-500 font-medium block">Day Expenses</span>
              <span className="text-xl sm:text-2xl font-bold font-mono text-red-600 mt-1 block">
                LKR {dayExpenses.toFixed(2)}
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-soft-sm">
              <span className="text-xs text-gray-500 font-medium block">Net Daily Profit</span>
              <span className={`text-xl sm:text-2xl font-bold font-mono mt-1 block ${
                dayNet >= 0 ? 'text-[#1E5AA8]' : 'text-red-600'
              }`}>
                LKR {dayNet.toFixed(2)}
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-soft-sm">
              <span className="text-xs text-gray-500 font-medium block">Transactions</span>
              <span className="text-xl sm:text-2xl font-bold font-mono text-gray-900 mt-1 block">
                {dayCount}
              </span>
            </div>
          </div>

          {/* Category Distribution + Donut Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-soft-sm space-y-4">
              <h3 className="font-bold text-sm text-gray-900">Day Category Breakdown</h3>
              {dayCatData.length === 0 ? (
                <p className="text-xs text-gray-400 py-6 text-center">No sales logged for this date.</p>
              ) : (
                <div className="space-y-3">
                  {dayCatData.map((item, i) => (
                    <div key={item.name} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-gray-800">
                        <span>{item.name}</span>
                        <span className="font-mono">LKR {item.value.toFixed(2)} ({item.percentage}%)</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${item.percentage}%`, backgroundColor: COLORS[i % COLORS.length] }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-soft-sm flex flex-col items-center justify-center min-h-[220px]">
              <h3 className="font-bold text-sm text-gray-900 self-start mb-2">Category Distribution</h3>
              {dayCatData.length > 0 ? (
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={dayCatData} dataKey="value" cx="50%" cy="50%" outerRadius={70} label>
                        {dayCatData.map((_, i) => (
                          <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: any) => `LKR ${Number(v).toFixed(2)}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <span className="text-xs text-gray-400">No chart data</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: MONTHLY SUMMARY --- */}
      {activeTab === 'monthly' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-soft-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-[#1E5AA8]" />
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Report Month:</label>
              <input
                type="month"
                value={reportMonth}
                onChange={(e) => setReportMonth(e.target.value)}
                className="py-1.5 px-3 bg-gray-50 border border-gray-300 rounded text-xs font-mono font-bold text-gray-900 focus:border-[#1E5AA8] outline-none"
              />
            </div>

            {bestMonthDay && bestMonthDay.revenue > 0 && (
              <div className="flex items-center gap-2 text-xs bg-amber-50 text-amber-900 px-3 py-1.5 rounded-lg border border-amber-200 font-semibold">
                <Award className="w-4 h-4 text-amber-600" />
                <span>Peak Sales Day: Day {bestMonthDay.day} (LKR {bestMonthDay.revenue.toFixed(2)})</span>
              </div>
            )}
          </div>

          {/* 4 Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-soft-sm">
              <span className="text-xs text-gray-500 font-medium block">Monthly Total Revenue</span>
              <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-600 mt-1 block">
                LKR {monthRevenue.toFixed(2)}
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-soft-sm">
              <span className="text-xs text-gray-500 font-medium block">Monthly Expenses</span>
              <span className="text-xl sm:text-2xl font-bold font-mono text-red-600 mt-1 block">
                LKR {monthExpenses.toFixed(2)}
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-soft-sm">
              <span className="text-xs text-gray-500 font-medium block">Monthly Net Profit</span>
              <span className={`text-xl sm:text-2xl font-bold font-mono mt-1 block ${
                monthNet >= 0 ? 'text-[#1E5AA8]' : 'text-red-600'
              }`}>
                LKR {monthNet.toFixed(2)}
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-soft-sm">
              <span className="text-xs text-gray-500 font-medium block">Avg Daily Revenue</span>
              <span className="text-xl sm:text-2xl font-bold font-mono text-gray-900 mt-1 block">
                LKR {avgDailyRevenue.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Daily Trend Line Chart */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-soft-sm space-y-4">
            <h3 className="font-bold text-sm text-gray-900">Daily Revenue Performance for {reportMonth}</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthDailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip formatter={(v: any) => `LKR ${Number(v).toFixed(2)}`} />
                  <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2.5} name="Revenue" />
                  <Line type="monotone" dataKey="expense" stroke="#EF4444" strokeWidth={2} name="Expense" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 3: YEARLY SUMMARY --- */}
      {activeTab === 'yearly' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-soft-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-[#1E5AA8]" />
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Report Year:</label>
              <select
                value={reportYear}
                onChange={(e) => setReportYear(e.target.value)}
                className="py-1.5 px-3 bg-gray-50 border border-gray-300 rounded text-xs font-mono font-bold text-gray-900 focus:border-[#1E5AA8] outline-none"
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
              </select>
            </div>

            {bestYearMonth && bestYearMonth.revenue > 0 && (
              <div className="flex items-center gap-2 text-xs bg-emerald-50 text-emerald-900 px-3 py-1.5 rounded-lg border border-emerald-200 font-semibold">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>Peak Revenue Month: {bestYearMonth.month} (LKR {bestYearMonth.revenue.toFixed(2)})</span>
              </div>
            )}
          </div>

          {/* 4 Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-soft-sm">
              <span className="text-xs text-gray-500 font-medium block">Annual Revenue</span>
              <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-600 mt-1 block">
                LKR {yearRevenue.toFixed(2)}
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-soft-sm">
              <span className="text-xs text-gray-500 font-medium block">Annual Expenses</span>
              <span className="text-xl sm:text-2xl font-bold font-mono text-red-600 mt-1 block">
                LKR {yearExpenses.toFixed(2)}
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-soft-sm">
              <span className="text-xs text-gray-500 font-medium block">Annual Net Profit</span>
              <span className={`text-xl sm:text-2xl font-bold font-mono mt-1 block ${
                yearNet >= 0 ? 'text-[#1E5AA8]' : 'text-red-600'
              }`}>
                LKR {yearNet.toFixed(2)}
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-soft-sm">
              <span className="text-xs text-gray-500 font-medium block">Avg Monthly Revenue</span>
              <span className="text-xl sm:text-2xl font-bold font-mono text-gray-900 mt-1 block">
                LKR {avgMonthlyRevenue.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Monthly Bar Chart */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-soft-sm space-y-4">
            <h3 className="font-bold text-sm text-gray-900">Month-by-Month Financial Performance ({reportYear})</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yearMonthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip formatter={(v: any) => `LKR ${Number(v).toFixed(2)}`} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#10B981" name="Revenue (LKR)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" fill="#EF4444" name="Expenses (LKR)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 4: CUSTOM RANGE REPORT --- */}
      {activeTab === 'custom' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-soft-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <Calendar className="w-4 h-4 text-[#1E5AA8]" />
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Date Range:</label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="py-1.5 px-3 bg-gray-50 border border-gray-300 rounded text-xs font-mono font-bold text-gray-900 outline-none"
              />
              <span className="text-gray-400">to</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="py-1.5 px-3 bg-gray-50 border border-gray-300 rounded text-xs font-mono font-bold text-gray-900 outline-none"
              />
            </div>

            <button
              onClick={exportCustomCSV}
              className="px-4 py-2 bg-[#1E5AA8] hover:bg-[#164785] text-white text-xs font-bold rounded-md shadow-xs flex items-center gap-1.5 active-press"
            >
              <Download className="w-4 h-4" />
              <span>Export Custom Report CSV</span>
            </button>
          </div>

          {/* 3 Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-soft-sm">
              <span className="text-xs text-gray-500 font-medium block">Range Total Revenue</span>
              <span className="text-2xl font-bold font-mono text-emerald-600 mt-1 block">
                LKR {customRevenue.toFixed(2)}
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-soft-sm">
              <span className="text-xs text-gray-500 font-medium block">Range Expenses</span>
              <span className="text-2xl font-bold font-mono text-red-600 mt-1 block">
                LKR {customExpenses.toFixed(2)}
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-soft-sm">
              <span className="text-xs text-gray-500 font-medium block">Range Net Profit</span>
              <span className={`text-2xl font-bold font-mono mt-1 block ${
                customNet >= 0 ? 'text-[#1E5AA8]' : 'text-red-600'
              }`}>
                LKR {customNet.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Detailed Transactions List for Range */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-soft-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 font-bold text-sm text-gray-900">
              Transactions in Selected Period ({customTxs.length})
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 uppercase font-semibold border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4 text-right">Amount (LKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {customTxs.map(t => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="py-2.5 px-4 font-mono">{t.date}</td>
                      <td className="py-2.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          t.type === 'sale' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {t.type}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-medium">{t.category}</td>
                      <td className="py-2.5 px-4 text-gray-600 max-w-xs truncate">{t.description}</td>
                      <td className={`py-2.5 px-4 text-right font-mono font-bold ${
                        t.type === 'sale' ? 'text-emerald-700' : 'text-red-600'
                      }`}>
                        {t.totalAmount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
