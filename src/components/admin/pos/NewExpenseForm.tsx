import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { 
  ArrowLeft, 
  Wallet, 
  Save, 
  PlusCircle, 
  Building2, 
  Receipt, 
  CreditCard 
} from 'lucide-react';
import { PaymentMethod } from '../../../types';

export const NewExpenseForm: React.FC = () => {
  const { navigate, addTransaction, settings } = useApp();

  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState<string>(
    new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
  );

  const [category, setCategory] = useState<string>('Stationery / Supplies');
  const [description, setDescription] = useState<string>('');
  const [amount, setAmount] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [vendor, setVendor] = useState<string>('');
  const [reference, setReference] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const expenseCategories = [
    'Stationery / Supplies',
    'Inventory / SIM Stock',
    'Utilities (Electricity / Water / Internet)',
    'Shop Rent',
    'Transportation / Courier',
    'Salaries & Daily Wages',
    'Machine Maintenance & Toner Refills',
    'Refreshments / Tea',
    'Other Operational Expenses'
  ];

  const handleSave = (addAnother: boolean = false) => {
    if (!amount || amount <= 0 || !description.trim()) return;

    addTransaction({
      date,
      time,
      type: 'expense',
      category,
      totalAmount: Number(amount),
      paymentMethod,
      description: description.trim(),
      vendor: vendor.trim() || undefined,
      referenceNumber: reference.trim() || undefined,
      notes: notes.trim() || undefined
    });

    if (addAnother) {
      setDescription('');
      setAmount('');
      setVendor('');
      setReference('');
      setNotes('');
      setTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
    } else {
      navigate('/admin/pos');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* 10.5 Page Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/pos')}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-600 transition-colors"
            title="Back to POS"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Record Store Expense</h2>
            <p className="text-xs text-gray-500">Log operational costs, stock purchases, or bills</p>
          </div>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-soft-sm p-5 sm:p-7">
        <form onSubmit={(e) => { e.preventDefault(); handleSave(false); }} className="space-y-6">
          
          {/* Row 1: Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">
                Expense Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:border-[#1E5AA8] outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">
                Expense Time *
              </label>
              <input
                type="text"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:border-[#1E5AA8] outline-none font-mono"
              />
            </div>
          </div>

          {/* Row 2: Expense Category */}
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">
              Expense Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:border-[#1E5AA8] outline-none"
            >
              {expenseCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Row 3: Description & Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">
                Expense Description *
              </label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., A4 Double A 80gsm Paper Box (5 Reams)"
                className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:border-[#1E5AA8] outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">
                Total Amount (LKR) *
              </label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="0.00"
                className="w-full p-2.5 bg-white border border-red-300 rounded-md text-sm font-mono font-bold text-red-600 focus:border-red-600 outline-none"
              />
            </div>
          </div>

          {/* Row 4: Vendor / Supplier & Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">
                Vendor / Payee / Supplier (Optional)
              </label>
              <input
                type="text"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                placeholder="e.g., Colombo Paper Mart Ltd"
                className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:border-[#1E5AA8] outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">
                Invoice / Receipt / Bill # (Optional)
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g., INV-2026-9812"
                className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:border-[#1E5AA8] outline-none font-mono"
              />
            </div>
          </div>

          {/* Row 5: Payment Method */}
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">
              Paid Via *
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:border-[#1E5AA8] outline-none"
            >
              <option value="Cash">Cash (Store Register Drawer)</option>
              <option value="Card">Business Debit / Credit Card</option>
              <option value="Bank Transfer">Bank Transfer / Online App</option>
              <option value="Other">Other Payment Channel</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">
              Additional Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Emergency toner replacement for Canon IR 2520"
              className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-xs text-gray-900 focus:border-[#1E5AA8] outline-none"
            />
          </div>

          {/* Form Actions (Section 10.5) */}
          <div className="pt-4 border-t border-gray-200 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/admin/pos')}
              className="w-full sm:w-auto px-5 py-3 rounded-md border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 min-h-[44px]"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => handleSave(true)}
              className="w-full sm:w-auto px-5 py-3 rounded-md border border-[#1E5AA8] text-[#1E5AA8] hover:bg-blue-50 font-bold text-xs flex items-center justify-center gap-1.5 min-h-[44px] active-press"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Save & Add Another</span>
            </button>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 rounded-md bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-soft-sm flex items-center justify-center gap-2 min-h-[44px] active-press"
            >
              <Save className="w-4 h-4" />
              <span>Save Expense {amount ? `(LKR ${Number(amount).toFixed(2)})` : ''}</span>
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};
