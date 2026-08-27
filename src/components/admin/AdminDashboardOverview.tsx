import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Receipt, 
  Smartphone, 
  Grid, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight, 
  Scale, 
  Calendar, 
  Clock, 
  ChevronRight, 
  AlertCircle,
  FileText,
  Eye,
  CheckCircle2,
  Wallet
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart, 
  Bar 
} from 'recharts';
import { ReceiptModal } from '../common/ReceiptModal';
import { POSTransaction } from '../../types';

export const AdminDashboardOverview: React.FC = () => {
  const { 
    navigate, 
    transactions, 
    sims, 
    services, 
    settings, 
    triggerQuickSale 
  } = useApp();

  const [chartMetric, setChartMetric] = useState<'revenue' | 'expenses' | 'net'>('revenue');
  const [selectedTx, setSelectedTx] = useState<POSTransaction | null>(null);

  // Filter today's transactions (comparing YYYY-MM-DD)
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTransactions = transactions.filter(t => t.date === todayStr);

  const todayRevenue = todayTransactions
    .filter(t => t.type === 'sale')
    .reduce((sum, t) => sum + t.totalAmount, 0);

  const todayExpenses = todayTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.totalAmount, 0);

  const todayNet = todayRevenue - todayExpenses;
  const todayCount = todayTransactions.length;

  // SIM Inventory Counts
  const availableSims = sims.filter(s => s.status === 'Available').length;
  const reservedSims = sims.filter(s => s.status === 'Reserved').length;
  const soldSims = sims.filter(s => s.status === 'Sold').length;

  // 7-day trend calculation
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });

    const daySales = transactions
      .filter(t => t.date === dateStr && t.type === 'sale')
      .reduce((sum, t) => sum + t.totalAmount, 0);

    const dayExpenses = transactions
      .filter(t => t.date === dateStr && t.type === 'expense')
      .reduce((sum, t) => sum + t.totalAmount, 0);

    const dayNet = daySales - dayExpenses;

    return {
      date: dateStr,
      day: dayLabel,
      revenue: daySales,
      expenses: dayExpenses,
      net: dayNet
    };
  });

  return (
    <div className="space-y-6">
      
      {/* 3.6 & 10.8 Stats Bento Cards Row (Mobile 2x2, Desktop 4 columns) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
        
        {/* 1. Today's Revenue */}
        <div className="bento-card p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today's Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100/80 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl sm:text-2xl font-bold text-emerald-600 tracking-tight font-mono">
              {settings.posSettings.currencySymbol} {todayRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-600" />
              <span>Real-time from POS</span>
            </p>
          </div>
        </div>

        {/* 2. Today's Expenses */}
        <div className="bento-card p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today's Expenses</span>
            <div className="w-8 h-8 rounded-xl bg-red-100/80 text-red-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl sm:text-2xl font-bold text-red-600 tracking-tight font-mono">
              {settings.posSettings.currencySymbol} {todayExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <TrendingDown className="w-3 h-3 text-red-500" />
              <span>Supplies & operational</span>
            </p>
          </div>
        </div>

        {/* 3. Today's Net */}
        <div className="bento-card p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today's Net</span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${todayNet >= 0 ? 'bg-blue-100/80 text-[#1E5AA8]' : 'bg-red-100/80 text-red-600'}`}>
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className={`text-xl sm:text-2xl font-bold tracking-tight font-mono ${todayNet >= 0 ? 'text-[#1E5AA8]' : 'text-red-600'}`}>
              {settings.posSettings.currencySymbol} {todayNet.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              Revenue – Expenses
            </p>
          </div>
        </div>

        {/* 4. Transactions Count */}
        <div className="bento-card p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Transactions</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100/80 text-amber-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-mono">
              {todayCount}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              {availableSims} SIMs available in stock
            </p>
          </div>
        </div>

      </div>

      {/* Quick POS Sales Bar & Fast Action Bento Grid */}
      <div className="bento-card p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Fast Point of Sale Actions
            </h2>
            <p className="text-xs text-slate-500">Tap common service buttons for 1-click pre-filled sale creation</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/admin/pos/new-sale')}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 active-press transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Custom Sale</span>
            </button>
            <button
              onClick={() => navigate('/admin/pos/new-expense')}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 active-press transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Expense</span>
            </button>
          </div>
        </div>

        {/* Fast Sale Quick Buttons (Section 10.12) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => triggerQuickSale('Photocopy', 'Black & White (A4)', 5, 'A4 B&W Photocopy')}
            className="p-3.5 rounded-xl border border-blue-200/80 bg-blue-50/50 hover:bg-blue-100/70 text-left transition-colors active-press shadow-2xs"
          >
            <span className="text-xs font-bold text-[#1E5AA8] block">A4 B&W Copy</span>
            <span className="text-[11px] text-slate-600">LKR 5.00 / page</span>
          </button>

          <button
            onClick={() => triggerQuickSale('Photocopy', 'Colour (A4)', 35, 'A4 Colour Photocopy')}
            className="p-3.5 rounded-xl border border-amber-200/80 bg-amber-50/50 hover:bg-amber-100/70 text-left transition-colors active-press shadow-2xs"
          >
            <span className="text-xs font-bold text-[#D97706] block">A4 Colour Copy</span>
            <span className="text-[11px] text-slate-600">LKR 35.00 / page</span>
          </button>

          <button
            onClick={() => triggerQuickSale('SIM Cards', 'Dialog 4G/5G SIM', 500, 'Dialog 4G SIM Starter Kit')}
            className="p-3.5 rounded-xl border border-red-200/80 bg-red-50/50 hover:bg-red-100/70 text-left transition-colors active-press shadow-2xs"
          >
            <span className="text-xs font-bold text-red-700 block">Dialog SIM</span>
            <span className="text-[11px] text-slate-600">LKR 500.00</span>
          </button>

          <button
            onClick={() => triggerQuickSale('Packages', 'Data Package Reload', 990, 'Dialog Power Plan 30 Days')}
            className="p-3.5 rounded-xl border border-purple-200/80 bg-purple-50/50 hover:bg-purple-100/70 text-left transition-colors active-press shadow-2xs"
          >
            <span className="text-xs font-bold text-purple-700 block">Dialog 30D Pack</span>
            <span className="text-[11px] text-slate-600">LKR 990.00</span>
          </button>
        </div>
      </div>

      {/* 10.3 & 10.8 Activity Overview Chart */}
      <div className="bento-card p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">7-Day Sales & Financial Activity</h2>
            <p className="text-xs text-slate-500">Live transaction history across Sri Lanka shop operations</p>
          </div>

          {/* Metric Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setChartMetric('revenue')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                chartMetric === 'revenue' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Revenue
            </button>
            <button
              onClick={() => setChartMetric('expenses')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                chartMetric === 'expenses' ? 'bg-white text-red-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Expenses
            </button>
            <button
              onClick={() => setChartMetric('net')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                chartMetric === 'net' ? 'bg-white text-[#1E5AA8] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Net Profit
            </button>
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={last7Days} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1E5AA8" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#1E5AA8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748B' }} />
              <YAxis tick={{ fontSize: 12, fill: '#64748B' }} tickFormatter={(v) => `Rs.${v}`} />
              <Tooltip 
                formatter={(value: any) => [`LKR ${Number(value).toFixed(2)}`, chartMetric.toUpperCase()]}
                contentStyle={{ backgroundColor: '#1E293B', color: '#FFF', borderRadius: '8px', border: 'none', fontSize: '12px' }}
              />
              {chartMetric === 'revenue' && (
                <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
              )}
              {chartMetric === 'expenses' && (
                <Area type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2.5} fillOpacity={1} fill="url(#colorExp)" />
              )}
              {chartMetric === 'net' && (
                <Area type="monotone" dataKey="net" stroke="#1E5AA8" strokeWidth={2.5} fillOpacity={1} fill="url(#colorNet)" />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Bento Grid: Recent Transactions + Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Recent Transactions */}
        <div className="lg:col-span-2 bento-card overflow-hidden flex flex-col justify-between">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Recent POS Activity</h3>
              <p className="text-xs text-slate-500">Latest recorded customer sales & store expenses</p>
            </div>
            <button
              onClick={() => navigate('/admin/pos/transactions')}
              className="text-xs font-bold text-[#1E5AA8] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {transactions.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              <Receipt className="w-8 h-8 mx-auto mb-2 text-slate-400" />
              <p className="font-semibold text-slate-700">No POS transactions recorded yet</p>
              <p className="text-[11px] text-slate-400 mt-1">Start recording sales or store expenses in POS.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4">Time</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4 text-right">Amount</th>
                      <th className="py-3 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {transactions.slice(0, 5).map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono text-slate-600">
                          {tx.time || '10:00 AM'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                            tx.type === 'sale' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-900">
                          <div>{tx.category}</div>
                          <div className="text-[11px] text-slate-500 truncate max-w-[180px]">{tx.description}</div>
                        </td>
                        <td className={`py-3 px-4 text-right font-mono font-bold ${
                          tx.type === 'sale' ? 'text-emerald-700' : 'text-red-600'
                        }`}>
                          {settings.posSettings.currencySymbol} {tx.totalAmount.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => setSelectedTx(tx)}
                            className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-[#1E5AA8]"
                            title="View Slip"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Stacked Cards View */}
              <div className="sm:hidden divide-y divide-slate-100 p-3 space-y-2">
                {transactions.slice(0, 4).map((tx) => (
                  <div key={tx.id} className="pt-2 flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          tx.type === 'sale' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {tx.type}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-800">{tx.category}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{tx.description}</p>
                      <span className="text-[10px] text-slate-400 font-mono">{tx.date} • {tx.time}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`font-mono font-bold text-sm block ${
                        tx.type === 'sale' ? 'text-emerald-700' : 'text-red-600'
                      }`}>
                        LKR {tx.totalAmount.toFixed(2)}
                      </span>
                      <button
                        onClick={() => setSelectedTx(tx)}
                        className="text-[11px] text-[#1E5AA8] underline mt-1"
                      >
                        View Slip
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
            <button
              onClick={() => navigate('/admin/pos/transactions')}
              className="text-xs font-bold text-[#1E5AA8] hover:text-[#164785]"
            >
              Open Full Transaction Ledger →
            </button>
          </div>
        </div>

        {/* Right 1 Col: Quick Links & SIM Inventory Overview */}
        <div className="space-y-6">
          
          {/* Quick Links Card (Section 10.8) */}
          <div className="bento-card p-5 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">POS Navigation Links</h3>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/admin/pos/new-sale')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-semibold text-xs transition-colors"
              >
                <span>Record New Sale</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/admin/pos/new-expense')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-rose-50 text-rose-800 hover:bg-rose-100 font-semibold text-xs transition-colors"
              >
                <span>Record Store Expense</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/admin/pos/reports')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-blue-50 text-[#1E5AA8] hover:bg-blue-100 font-semibold text-xs transition-colors"
              >
                <span>View Revenue Reports & Charts</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/admin/pos/transactions')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-100 text-slate-800 hover:bg-slate-200 font-semibold text-xs transition-colors"
              >
                <span>Transaction History Ledger</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* SIM Stock Card */}
          <div className="bento-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 text-sm">SIM Cards In Stock</h3>
              <button onClick={() => navigate('/admin/sims')} className="text-xs text-[#1E5AA8] font-bold hover:underline">
                Manage
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-semibold text-red-700">Dialog 4G/5G</span>
                <span className="font-mono font-bold text-slate-900">
                  {sims.filter(s => s.network === 'Dialog' && s.status === 'Available').length} Available
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-semibold text-blue-700">Mobitel 4G</span>
                <span className="font-mono font-bold text-slate-900">
                  {sims.filter(s => s.network === 'Mobitel' && s.status === 'Available').length} Available
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-semibold text-orange-700">Hutch</span>
                <span className="font-mono font-bold text-slate-900">
                  {sims.filter(s => s.network === 'Hutch' && s.status === 'Available').length} Available
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-semibold text-amber-700">Airtel</span>
                <span className="font-mono font-bold text-slate-900">
                  {sims.filter(s => s.network === 'Airtel' && s.status === 'Available').length} Available
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Slip / Receipt Viewer Modal */}
      {selectedTx && (
        <ReceiptModal
          transaction={selectedTx}
          settings={settings}
          onClose={() => setSelectedTx(null)}
        />
      )}

    </div>
  );
};
