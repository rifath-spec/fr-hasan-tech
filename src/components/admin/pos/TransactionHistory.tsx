import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { POSTransaction } from '../../../types';
import { 
  Search, 
  Download, 
  Trash2, 
  Eye, 
  Calendar, 
  ArrowUpDown, 
  Filter, 
  RefreshCw,
  Receipt,
  Plus
} from 'lucide-react';
import { ReceiptModal } from '../../common/ReceiptModal';
import { ConfirmModal } from '../../common/ConfirmModal';

export const TransactionHistory: React.FC = () => {
  const { transactions, deleteTransaction, settings, navigate } = useApp();

  // Filters State
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'sale' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals State
  const [viewReceiptTx, setViewReceiptTx] = useState<POSTransaction | null>(null);
  const [deleteTargetTx, setDeleteTargetTx] = useState<POSTransaction | null>(null);

  // Sorting
  const [sortField, setSortField] = useState<'date' | 'totalAmount'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Categories list
  const allCategories = Array.from(new Set(transactions.map(t => t.category)));

  // Filter application
  const filtered = transactions.filter(tx => {
    // Date Range
    if (startDate && tx.date < startDate) return false;
    if (endDate && tx.date > endDate) return false;

    // Type
    if (typeFilter !== 'all' && tx.type !== typeFilter) return false;

    // Category
    if (categoryFilter !== 'All' && tx.category !== categoryFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchDesc = tx.description.toLowerCase().includes(q);
      const matchCust = tx.customerName ? tx.customerName.toLowerCase().includes(q) : false;
      const matchVendor = tx.vendor ? tx.vendor.toLowerCase().includes(q) : false;
      const matchRef = tx.referenceNumber ? tx.referenceNumber.toLowerCase().includes(q) : false;
      const matchAmt = tx.totalAmount.toString().includes(q);
      if (!matchDesc && !matchCust && !matchVendor && !matchRef && !matchAmt) {
        return false;
      }
    }

    return true;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sortField === 'date') {
      const dtA = `${a.date} ${a.time || ''}`;
      const dtB = `${b.date} ${b.time || ''}`;
      return sortDirection === 'asc' ? dtA.localeCompare(dtB) : dtB.localeCompare(dtA);
    } else {
      return sortDirection === 'asc' ? a.totalAmount - b.totalAmount : b.totalAmount - a.totalAmount;
    }
  });

  // Calculations for filtered set
  const filteredSales = filtered.filter(t => t.type === 'sale').reduce((sum, t) => sum + t.totalAmount, 0);
  const filteredExpenses = filtered.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.totalAmount, 0);
  const filteredNet = filteredSales - filteredExpenses;

  const resetFilters = () => {
    setStartDate('');
    setEndDate('');
    setTypeFilter('all');
    setCategoryFilter('All');
    setSearchQuery('');
  };

  const exportCSV = () => {
    const headers = ["ID", "Date", "Time", "Type", "Category", "Sub-Type", "Qty", "Unit Price", "Total (LKR)", "Payment Method", "Customer/Vendor", "Description", "Ref#"];
    const rows = sorted.map(t => [
      t.id,
      t.date,
      t.time || '',
      t.type,
      `"${t.category}"`,
      `"${t.subType || ''}"`,
      t.quantity || 1,
      t.unitPrice || t.totalAmount,
      t.totalAmount,
      t.paymentMethod,
      `"${t.customerName || t.vendor || ''}"`,
      `"${t.description.replace(/"/g, '""')}"`,
      `"${t.referenceNumber || ''}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Transactions_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* 10.6 Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Transaction History & Ledger</h2>
          <p className="text-xs text-gray-500">Full audit log of sales receipts and operational expense vouchers</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="px-3.5 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold text-xs rounded-md shadow-xs flex items-center gap-1.5 active-press transition-colors min-h-[40px]"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => navigate('/admin/pos/new-sale')}
            className="px-3.5 py-2 bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs rounded-md shadow-soft-sm flex items-center gap-1.5 active-press transition-colors min-h-[40px]"
          >
            <Plus className="w-4 h-4" />
            <span>+ Sale</span>
          </button>
        </div>
      </div>

      {/* Filter Bar (Section 10.6 & 10.11) */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-soft-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          {/* Search Box */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search description, customer, vendor, amount..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-md focus:bg-white focus:border-[#1E5AA8] outline-none"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full py-2 px-2.5 text-xs bg-gray-50 border border-gray-300 rounded-md focus:border-[#1E5AA8] outline-none"
            >
              <option value="all">All Types (Sales & Expenses)</option>
              <option value="sale">Sales Only</option>
              <option value="expense">Expenses Only</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full py-2 px-2.5 text-xs bg-gray-50 border border-gray-300 rounded-md focus:border-[#1E5AA8] outline-none"
            >
              <option value="All">All Categories</option>
              {allCategories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Reset Filters button */}
          <div>
            <button
              onClick={resetFilters}
              className="w-full py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>

        {/* Date Range Sub-row */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-100 text-xs">
          <span className="text-gray-500 font-semibold flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Date Range:</span>
          </span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="py-1 px-2 border border-gray-300 rounded text-xs bg-white text-gray-700"
            placeholder="From Date"
          />
          <span className="text-gray-400">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="py-1 px-2 border border-gray-300 rounded text-xs bg-white text-gray-700"
            placeholder="To Date"
          />
        </div>
      </div>

      {/* Filtered Summary Header (Section 10.6) */}
      <div className="bg-slate-800 text-white p-4 rounded-xl flex flex-wrap items-center justify-between gap-4 text-xs">
        <div>
          <span className="text-slate-400 uppercase font-bold text-[11px] block">Matching Transactions</span>
          <span className="text-base font-bold font-mono">{sorted.length} Entries</span>
        </div>

        <div className="flex items-center gap-6">
          <div>
            <span className="text-emerald-400 uppercase font-bold text-[10px] block">Total Sales</span>
            <span className="font-mono font-bold text-emerald-300">LKR {filteredSales.toFixed(2)}</span>
          </div>

          <div>
            <span className="text-rose-400 uppercase font-bold text-[10px] block">Total Expenses</span>
            <span className="font-mono font-bold text-rose-300">LKR {filteredExpenses.toFixed(2)}</span>
          </div>

          <div>
            <span className="text-blue-300 uppercase font-bold text-[10px] block">Filtered Net</span>
            <span className={`font-mono font-bold ${filteredNet >= 0 ? 'text-white' : 'text-rose-400'}`}>
              LKR {filteredNet.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Desktop Ledger Table */}
      <div className="hidden lg:block bg-white rounded-xl border border-gray-200 shadow-soft-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 text-gray-600 uppercase font-semibold border-b border-gray-200">
            <tr>
              <th className="py-3.5 px-4">Date & Time</th>
              <th className="py-3.5 px-4">Type</th>
              <th className="py-3.5 px-4">Category & Sub-Type</th>
              <th className="py-3.5 px-4">Customer / Vendor</th>
              <th className="py-3.5 px-4">Method</th>
              <th className="py-3.5 px-4 text-right">Amount (LKR)</th>
              <th className="py-3.5 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sorted.map(tx => (
              <tr key={tx.id} className="hover:bg-gray-50/80 transition-colors">
                <td className="py-3 px-4 font-mono text-gray-700">
                  <div className="font-bold">{tx.date}</div>
                  <div className="text-[10px] text-gray-400">{tx.time}</div>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    tx.type === 'sale' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {tx.type}
                  </span>
                </td>
                <td className="py-3 px-4 font-medium text-gray-900">
                  <div>{tx.category}</div>
                  <div className="text-[11px] text-gray-500 font-normal truncate max-w-xs">{tx.description}</div>
                </td>
                <td className="py-3 px-4 text-gray-700">
                  {tx.customerName || tx.vendor || <span className="text-gray-400 italic">Walk-in</span>}
                </td>
                <td className="py-3 px-4 text-gray-600 font-medium">
                  {tx.paymentMethod}
                </td>
                <td className={`py-3 px-4 text-right font-mono font-bold ${
                  tx.type === 'sale' ? 'text-emerald-700' : 'text-red-600'
                }`}>
                  {tx.type === 'expense' ? '-' : '+'} {tx.totalAmount.toFixed(2)}
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => setViewReceiptTx(tx)}
                      className="p-1.5 rounded hover:bg-gray-100 text-gray-600 hover:text-[#1E5AA8]"
                      title="View Slip"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTargetTx(tx)}
                      className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"
                      title="Delete Transaction"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Card View */}
      <div className="lg:hidden space-y-3">
        {sorted.map(tx => (
          <div key={tx.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-soft-sm space-y-2.5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    tx.type === 'sale' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {tx.type}
                  </span>
                  <span className="font-bold text-sm text-gray-900">{tx.category}</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">{tx.description}</p>
                <span className="text-[10px] text-gray-400 font-mono">{tx.date} • {tx.time}</span>
              </div>

              <div className="text-right">
                <span className={`font-mono font-bold text-base block ${
                  tx.type === 'sale' ? 'text-emerald-700' : 'text-red-600'
                }`}>
                  {tx.type === 'expense' ? '-' : '+'} LKR {tx.totalAmount.toFixed(2)}
                </span>
                <span className="text-[10px] text-gray-500 font-medium block mt-0.5">{tx.paymentMethod}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[11px] text-gray-600 truncate max-w-[170px]">
                {tx.customerName || tx.vendor || 'Walk-in'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewReceiptTx(tx)}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-semibold"
                >
                  Slip
                </button>
                <button
                  onClick={() => setDeleteTargetTx(tx)}
                  className="p-1 text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Slip Modal */}
      {viewReceiptTx && (
        <ReceiptModal
          transaction={viewReceiptTx}
          settings={settings}
          onClose={() => setViewReceiptTx(null)}
        />
      )}

      {/* Delete Transaction Modal */}
      <ConfirmModal
        isOpen={!!deleteTargetTx}
        title="Delete Transaction Record?"
        message={`Are you sure you want to permanently delete this ${deleteTargetTx?.type} transaction of LKR ${deleteTargetTx?.totalAmount.toFixed(2)} (${deleteTargetTx?.description})? This will update all revenue totals immediately.`}
        confirmLabel="Delete Record"
        onConfirm={() => {
          if (deleteTargetTx) {
            deleteTransaction(deleteTargetTx.id);
            setDeleteTargetTx(null);
          }
        }}
        onCancel={() => setDeleteTargetTx(null)}
      />

    </div>
  );
};
