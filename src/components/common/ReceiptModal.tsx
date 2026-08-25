import React from 'react';
import { POSTransaction, ShopSettings } from '../../types';
import { Printer, X, Download, CheckCircle, Tag, Clock, Calendar, User, DollarSign } from 'lucide-react';
import { motion } from 'motion/react';

interface ReceiptModalProps {
  transaction: POSTransaction | null;
  settings: ShopSettings;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ transaction, settings, onClose }) => {
  if (!transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-white rounded-xl shadow-soft-xl max-w-md w-full overflow-hidden z-10 border border-gray-200"
      >
        {/* Header toolbar */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full uppercase tracking-wider ${
              transaction.type === 'sale' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
            }`}>
              {transaction.type === 'sale' ? 'Sale Receipt' : 'Expense Voucher'}
            </span>
            <span className="text-xs text-gray-500 font-mono">#{transaction.id.substring(0, 10)}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrint}
              title="Print Receipt"
              className="p-2 text-gray-600 hover:text-[#1E5AA8] hover:bg-white rounded-lg transition-colors"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Thermal slip receipt look */}
        <div className="p-6 font-mono text-xs text-gray-800 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Header info */}
          <div className="text-center border-b border-dashed border-gray-300 pb-4">
            <h2 className="text-base font-bold text-gray-900 font-sans tracking-tight">{settings.shopName}</h2>
            <p className="text-gray-500 whitespace-pre-line mt-1 font-sans">{settings.posSettings.receiptHeader}</p>
          </div>

          {/* Metadata */}
          <div className="space-y-1.5 py-1 text-gray-600">
            <div className="flex justify-between">
              <span>Date:</span>
              <span className="font-semibold text-gray-900">{transaction.date} {transaction.time}</span>
            </div>
            <div className="flex justify-between">
              <span>Type:</span>
              <span className="font-semibold uppercase text-gray-900">{transaction.type}</span>
            </div>
            <div className="flex justify-between">
              <span>Category:</span>
              <span className="font-semibold text-gray-900">{transaction.category}</span>
            </div>
            {transaction.subType && (
              <div className="flex justify-between">
                <span>Sub-Type:</span>
                <span className="font-semibold text-gray-900">{transaction.subType}</span>
              </div>
            )}
            {transaction.customerName && (
              <div className="flex justify-between">
                <span>Customer:</span>
                <span className="font-semibold text-gray-900">{transaction.customerName}</span>
              </div>
            )}
            {transaction.vendor && (
              <div className="flex justify-between">
                <span>Vendor:</span>
                <span className="font-semibold text-gray-900">{transaction.vendor}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Payment:</span>
              <span className="font-semibold text-gray-900">{transaction.paymentMethod}</span>
            </div>
          </div>

          {/* Line items summary */}
          <div className="border-t border-b border-dashed border-gray-300 py-3 space-y-2">
            <div className="flex justify-between font-bold text-gray-900 text-sm">
              <span>Description</span>
              <span>Amount</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span className="pr-2">{transaction.description}</span>
              <span className="shrink-0 font-bold">
                {settings.posSettings.currencySymbol} {transaction.totalAmount.toFixed(2)}
              </span>
            </div>
            {transaction.quantity && transaction.unitPrice && (
              <div className="text-gray-500 text-[11px]">
                {transaction.quantity} × {settings.posSettings.currencySymbol} {transaction.unitPrice.toFixed(2)}
              </div>
            )}
          </div>

          {/* Total */}
          <div className="pt-1 space-y-1.5">
            <div className="flex justify-between text-sm font-bold text-gray-900 font-sans">
              <span>TOTAL PAID</span>
              <span className="text-base text-[#1E5AA8]">
                {settings.posSettings.currencySymbol} {transaction.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Notes */}
          {transaction.notes && (
            <div className="bg-gray-50 p-2.5 rounded border border-gray-200 text-gray-600 font-sans">
              <span className="font-semibold block text-gray-700">Note:</span>
              {transaction.notes}
            </div>
          )}

          {/* Footer note */}
          <div className="text-center pt-3 border-t border-dashed border-gray-300 text-gray-500 whitespace-pre-line font-sans text-[11px]">
            {settings.posSettings.receiptFooter}
          </div>
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 min-h-[44px]"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 text-sm font-semibold text-white bg-[#1E5AA8] hover:bg-[#164785] rounded-md flex items-center gap-2 min-h-[44px]"
          >
            <Printer className="w-4 h-4" />
            Print Slip
          </button>
        </div>
      </motion.div>
    </div>
  );
};
