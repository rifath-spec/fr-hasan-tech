import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { 
  DollarSign, 
  Wallet, 
  Scale, 
  Receipt, 
  Plus, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  ArrowRight,
  PieChart as PieIcon,
  ChevronRight,
  FileSpreadsheet
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { ReceiptModal } from '../../common/ReceiptModal';
import { POSTransaction } from '../../../types';

export const PosDashboard: React.FC = () => {
  const { 
    navigate, 
    transactions, 
    settings, 
    triggerQuickSale 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'day' | 'month' | 'year'>('day');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().substring(0, 7)); // YYYY-MM
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [viewReceiptTx, setViewReceiptTx] = useState<POSTransaction | null>(null);

  // Today's Metrics (Section 10.3)
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTxs = transactions.filter(t => t.date === todayStr);

  const todayRevenue = todayTxs.filter(t => t.type === 'sale').reduce((sum, t) => sum + t.totalAmount, 0);
  const todayExpenses = todayTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.totalAmount, 0);
  const todayNet = todayRevenue - todayExpenses;
  const todayCount = todayTxs.length;

  // Selected Day Calculation
  const dayTxs = transactions.filter(t => t.date === selectedDate);
  const daySales = dayTxs.filter(t => t.type === 'sale');
  const dayRevenue = daySales.reduce((sum, t) => sum + t.totalAmount, 0);

  // Day category breakdown
  const categoryMap: Record<string, number> = {};
  daySales.forEach(tx => {
    categoryMap[tx.category] = (categoryMap[tx.category] || 0) + tx.totalAmount;
  });

  const dayCategoryData = Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value,
    percentage: dayRevenue > 0 ? Math.round((value / dayRevenue) * 100) : 0
  }));

  // Month calculation
  const monthTxs = transactions.filter(t => t.date.startsWith(selectedMonth));
  const monthRevenue = monthTxs.filter(t => t.type === 'sale').reduce((sum, t) => sum + t.totalAmount, 0);
  const monthExpenses = monthTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.totalAmount, 0);
  const monthNet = monthRevenue - monthExpenses;

  // 31-day trend for month
  const daysInSelectedMonth = new Date(
    parseInt(selectedMonth.split('-')[0]), 
    parseInt(selectedMonth.split('-')[1]), 
    0
  ).getDate();

  const monthDailyTrend = Array.from({ length: daysInSelectedMonth }, (_, i) => {
    const dayNum = i + 1;
    const dayStr = `${selectedMonth}-${dayNum.toString().padStart(2, '0')}`;
    const daySalesTotal = transactions
      .filter(t => t.date === dayStr && t.type === 'sale')
      .reduce((sum, t) => sum + t.totalAmount, 0);

    return {
      day: `Day ${dayNum}`,
      date: dayStr,
      revenue: daySalesTotal
    };
  });

  const bestDay = [...monthDailyTrend].sort((a, b) => b.revenue - a.revenue)[0];

  // Year calculation
  const yearTxs = transactions.filter(t => t.date.startsWith(selectedYear));
  const yearRevenue = yearTxs.filter(t => t.type === 'sale').reduce((sum, t) => sum + t.totalAmount, 0);
  const yearExpenses = yearTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.totalAmount, 0);
  const yearNet = yearRevenue - yearExpenses;

  const monthsList = [
    { num: '01', name: 'Jan' }, { num: '02', name: 'Feb' }, { num: '03', name: 'Mar' },
    { num: '04', name: 'Apr' }, { num: '05', name: 'May' }, { num: '06', name: 'Jun' },
    { num: '07', name: 'Jul' }, { num: '08', name: 'Aug' }, { num: '09', name: 'Sep' },
    { num: '10', name: 'Oct' }, { num: '11', name: 'Nov' }, { num: '12', name: 'Dec' }
  ];

  const yearlyMonthlyData = monthsList.map(m => {
    const prefix = `${selectedYear}-${m.num}`;
    const rev = transactions.filter(t => t.date.startsWith(prefix) && t.type === 'sale').reduce((sum, t) => sum + t.totalAmount, 0);
    const exp = transactions.filter(t => t.date.startsWith(prefix) && t.type === 'expense').reduce((sum, t) => sum + t.totalAmount, 0);
    return {
      month: m.name,
      revenue: rev,
      expenses: exp,
      net: rev - exp
    };
  });

  const bestMonth = [...yearlyMonthlyData].sort((a, b) => b.revenue - a.revenue)[0];

  const COLORS = ['#1E5AA8', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];

  return (
    <div className="space-y-6">
      
      {/* 10.3 Stats Cards Row (4 cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
        
        {/* Today's Revenue */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-soft-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Today's Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl sm:text-2xl font-bold text-emerald-600 font-mono">
              LKR {todayRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-gray-500 mt-1">Live sales register</p>
          </div>
        </div>

        {/* Today's Expenses */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-soft-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Today's Expenses</span>
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl sm:text-2xl font-bold text-red-600 font-mono">
              LKR {todayExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-gray-500 mt-1">Stock & utilities</p>
          </div>
        </div>

        {/* Today's Net */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-soft-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Today's Net</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${todayNet >= 0 ? 'bg-blue-100 text-[#1E5AA8]' : 'bg-red-100 text-red-600'}`}>
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className={`text-xl sm:text-2xl font-bold font-mono ${
              todayNet > 0 ? 'text-emerald-600' : todayNet < 0 ? 'text-red-600' : 'text-gray-600'
            }`}>
              LKR {todayNet.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-gray-500 mt-1">Net profit/loss</p>
          </div>
        </div>

        {/* Transactions Today */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-soft-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Transactions</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 font-mono">
              {todayCount}
            </h3>
            <p className="text-[11px] text-gray-500 mt-1">Sales & expenses logged</p>
          </div>
        </div>

      </div>

      {/* 10.3 Quick Actions Row (Two prominent buttons side by side) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => navigate('/admin/pos/new-sale')}
          className="p-4 sm:p-5 rounded-xl bg-[#10B981] hover:bg-emerald-600 text-white font-bold flex items-center justify-center gap-3 shadow-soft-sm active-press transition-all min-h-[56px]"
        >
          <DollarSign className="w-6 h-6 shrink-0" />
          <span className="text-base sm:text-lg">Record New Sale</span>
        </button>

        <button
          onClick={() => navigate('/admin/pos/new-expense')}
          className="p-4 sm:p-5 rounded-xl bg-[#EF4444] hover:bg-red-600 text-white font-bold flex items-center justify-center gap-3 shadow-soft-sm active-press transition-all min-h-[56px]"
        >
          <Wallet className="w-6 h-6 shrink-0" />
          <span className="text-base sm:text-lg">Record New Expense</span>
        </button>
      </div>

      {/* Fast Sale Quick Buttons Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-soft-sm space-y-2">
        <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
          1-Tap Quick Sale Entry:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => triggerQuickSale('Photocopy', 'Black & White (A4)', 5, 'A4 B&W Photocopy')}
            className="p-2.5 rounded bg-blue-50 hover:bg-blue-100 text-left border border-blue-200 text-xs font-semibold text-[#1E5AA8] active-press transition-colors"
          >
            + A4 B&W (Rs. 5)
          </button>
          <button
            onClick={() => triggerQuickSale('Photocopy', 'Colour (A4)', 35, 'A4 Colour Photocopy')}
            className="p-2.5 rounded bg-amber-50 hover:bg-amber-100 text-left border border-amber-200 text-xs font-semibold text-amber-800 active-press transition-colors"
          >
            + A4 Colour (Rs. 35)
          </button>
          <button
            onClick={() => triggerQuickSale('SIM Cards', 'Dialog 4G/5G SIM', 500, 'Dialog SIM Card')}
            className="p-2.5 rounded bg-red-50 hover:bg-red-100 text-left border border-red-200 text-xs font-semibold text-red-700 active-press transition-colors"
          >
            + Dialog SIM (Rs. 500)
          </button>
          <button
            onClick={() => triggerQuickSale('Packages', 'Data Package Reload', 990, 'Dialog 30-Day Data')}
            className="p-2.5 rounded bg-purple-50 hover:bg-purple-100 text-left border border-purple-200 text-xs font-semibold text-purple-700 active-press transition-colors"
          >
            + Dialog 30D (Rs. 990)
          </button>
        </div>
      </div>

      {/* 10.3 Revenue Overview Section (Tabs: Day | Month | Year) */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-gray-200 shadow-soft-sm space-y-6">
        
        {/* Header & Tabs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Revenue Overview & Analytics</h2>
            <p className="text-xs text-gray-500">Breakdown of earnings, reloads, and print jobs</p>
          </div>

          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
            {(['day', 'month', 'year'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-md text-xs font-bold capitalize transition-colors ${
                  activeTab === tab ? 'bg-white text-[#1E5AA8] shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab} View
              </button>
            ))}
          </div>
        </div>

        {/* Tab 1: Day View */}
        {activeTab === 'day' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-gray-600">Select Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="py-1.5 px-3 text-xs bg-gray-50 border border-gray-300 rounded-md font-mono focus:border-[#1E5AA8] outline-none"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Left Breakdown List */}
              <div className="lg:col-span-7 space-y-3">
                <div className="flex items-center justify-between font-bold text-xs uppercase text-gray-500 pb-2 border-b border-gray-100">
                  <span>Service Category</span>
                  <span>Revenue / % of Total</span>
                </div>

                {dayCategoryData.length === 0 ? (
                  <div className="py-8 text-center text-xs text-gray-400">
                    No sales recorded for {selectedDate}.
                  </div>
                ) : (
                  dayCategoryData.map((item, idx) => (
                    <div key={item.name} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-gray-800">
                        <span>{item.name}</span>
                        <span className="font-mono">
                          LKR {item.value.toFixed(2)} ({item.percentage}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${item.percentage}%`,
                            backgroundColor: COLORS[idx % COLORS.length]
                          }}
                        />
                      </div>
                    </div>
                  ))
                )}

                <div className="pt-3 border-t border-gray-200 flex justify-between font-bold text-sm text-gray-900">
                  <span>Total Day Revenue:</span>
                  <span className="text-[#1E5AA8] font-mono">
                    LKR {dayRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Right Donut Chart */}
              <div className="lg:col-span-5 h-56 flex flex-col items-center justify-center">
                {dayCategoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dayCategoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {dayCategoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => `LKR ${Number(value).toFixed(2)}`} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-xs text-gray-400 flex items-center gap-1.5">
                    <PieIcon className="w-5 h-5 text-gray-300" />
                    <span>No data for chart</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Month View */}
        {activeTab === 'month' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <label className="text-xs font-semibold text-gray-600">Select Month:</label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="py-1.5 px-3 text-xs bg-gray-50 border border-gray-300 rounded-md font-mono focus:border-[#1E5AA8] outline-none"
                />
              </div>

              {bestDay && bestDay.revenue > 0 && (
                <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full font-semibold">
                  Best Day: {bestDay.day} (LKR {bestDay.revenue.toFixed(2)})
                </span>
              )}
            </div>

            {/* Daily Line Chart */}
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthDailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip formatter={(val: any) => `LKR ${Number(val).toFixed(2)}`} />
                  <Line type="monotone" dataKey="revenue" stroke="#1E5AA8" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Monthly Summary Cards */}
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-gray-100 text-center">
              <div className="p-3 rounded-lg bg-emerald-50 text-emerald-900">
                <span className="text-[11px] font-semibold block">Month Revenue</span>
                <span className="font-bold font-mono text-sm sm:text-base">LKR {monthRevenue.toFixed(2)}</span>
              </div>
              <div className="p-3 rounded-lg bg-red-50 text-red-900">
                <span className="text-[11px] font-semibold block">Month Expenses</span>
                <span className="font-bold font-mono text-sm sm:text-base">LKR {monthExpenses.toFixed(2)}</span>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 text-[#1E5AA8]">
                <span className="text-[11px] font-semibold block">Month Net Profit</span>
                <span className="font-bold font-mono text-sm sm:text-base">LKR {monthNet.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Year View */}
        {activeTab === 'year' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <label className="text-xs font-semibold text-gray-600">Select Year:</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="py-1.5 px-3 text-xs bg-gray-50 border border-gray-300 rounded-md font-mono focus:border-[#1E5AA8] outline-none"
                >
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                </select>
              </div>

              {bestMonth && bestMonth.revenue > 0 && (
                <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full font-semibold">
                  Best Month: {bestMonth.month} (LKR {bestMonth.revenue.toFixed(2)})
                </span>
              )}
            </div>

            {/* Monthly Bar Chart */}
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yearlyMonthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip formatter={(val: any) => `LKR ${Number(val).toFixed(2)}`} />
                  <Bar dataKey="revenue" fill="#10B981" name="Revenue" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" fill="#EF4444" name="Expenses" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Yearly Summary Cards */}
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-gray-100 text-center">
              <div className="p-3 rounded-lg bg-emerald-50 text-emerald-900">
                <span className="text-[11px] font-semibold block">Year Revenue</span>
                <span className="font-bold font-mono text-sm sm:text-base">LKR {yearRevenue.toFixed(2)}</span>
              </div>
              <div className="p-3 rounded-lg bg-red-50 text-red-900">
                <span className="text-[11px] font-semibold block">Year Expenses</span>
                <span className="font-bold font-mono text-sm sm:text-base">LKR {yearExpenses.toFixed(2)}</span>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 text-[#1E5AA8]">
                <span className="text-[11px] font-semibold block">Year Net Profit</span>
                <span className="font-bold font-mono text-sm sm:text-base">LKR {yearNet.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* 10.3 Recent Transactions Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-soft-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900 text-sm">Recent POS Transactions</h3>
            <p className="text-xs text-gray-500">Live sales slips & operational expense vouchers</p>
          </div>
          <button
            onClick={() => navigate('/admin/pos/transactions')}
            className="text-xs font-bold text-[#1E5AA8] hover:underline flex items-center gap-1"
          >
            <span>View Full Ledger</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Desktop Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 uppercase font-semibold border-b border-gray-100">
              <tr>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Service / Category</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Note</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.slice(0, 6).map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono text-gray-600">
                    {tx.time}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                      tx.type === 'sale' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-900">
                    <div>{tx.category}</div>
                    {tx.subType && <div className="text-[10px] text-gray-500">{tx.subType}</div>}
                  </td>
                  <td className={`py-3 px-4 font-mono font-bold ${
                    tx.type === 'sale' ? 'text-emerald-700' : 'text-red-600'
                  }`}>
                    LKR {tx.totalAmount.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-gray-600 text-xs max-w-xs truncate">
                    {tx.description}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => setViewReceiptTx(tx)}
                      className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-[11px] font-semibold"
                    >
                      View Slip
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="sm:hidden divide-y divide-gray-100 p-3 space-y-2">
          {transactions.slice(0, 5).map(tx => (
            <div key={tx.id} className="pt-2 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    tx.type === 'sale' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {tx.type}
                  </span>
                  <span className="text-xs font-bold text-gray-900">{tx.category}</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">{tx.description}</p>
                <span className="text-[10px] text-gray-400 font-mono">{tx.time}</span>
              </div>
              <div className="text-right">
                <span className={`font-mono font-bold text-sm block ${
                  tx.type === 'sale' ? 'text-emerald-700' : 'text-red-600'
                }`}>
                  LKR {tx.totalAmount.toFixed(2)}
                </span>
                <button
                  onClick={() => setViewReceiptTx(tx)}
                  className="text-xs text-[#1E5AA8] underline mt-1 block"
                >
                  View Slip
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Slip Modal */}
      {viewReceiptTx && (
        <ReceiptModal
          transaction={viewReceiptTx}
          settings={settings}
          onClose={() => setViewReceiptTx(null)}
        />
      )}

    </div>
  );
};
