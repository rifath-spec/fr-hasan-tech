import React, { useState } from 'react';
import { 
  FileCode, 
  Copy, 
  Check, 
  Download, 
  X, 
  ExternalLink, 
  Database, 
  CheckCircle2, 
  Layers, 
  Smartphone, 
  Printer, 
  Receipt, 
  Tag, 
  Info,
  Calendar
} from 'lucide-react';
import { BackupStats, downloadFile } from '../../utils/sqlBackupGenerator';

interface SqlBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  sqlContent: string;
  stats: BackupStats;
  shopName: string;
}

export const SqlBackupModal: React.FC<SqlBackupModalProps> = ({
  isOpen,
  onClose,
  sqlContent,
  stats,
  shopName
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleDownload = () => {
    const filename = `FRHasanTech_Database_Backup_${new Date().toISOString().split('T')[0]}.sql`;
    downloadFile(sqlContent, filename, 'application/sql');
  };

  const fileSizeKb = (new Blob([sqlContent]).size / 1024).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
      />

      {/* Dialog Container */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col z-10 border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#1E5AA8] flex items-center justify-center shadow-xs">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Database SQL Backup</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-[#1E5AA8] border border-blue-200">
                  PostgreSQL & Supabase Ready
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Complete self-contained SQL dump with schema definitions and idempotent record updates
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* Statistics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1E5AA8] flex items-center justify-center shrink-0">
                <Printer className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block font-medium">Services</span>
                <span className="text-sm font-bold text-slate-900">{stats.servicesCount} items</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block font-medium">SIMs & Packages</span>
                <span className="text-sm font-bold text-slate-900">{stats.simsCount + stats.packagesCount} items</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Receipt className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block font-medium">POS Transactions</span>
                <span className="text-sm font-bold text-slate-900">{stats.transactionsCount} records</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block font-medium">Total Size</span>
                <span className="text-sm font-bold text-slate-900">{fileSizeKb} KB</span>
              </div>
            </div>
          </div>

          {/* Quick Guidance Banner */}
          <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 flex items-start gap-3">
            <Info className="w-4 h-4 text-[#1E5AA8] shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900 space-y-1">
              <p className="font-semibold">How to use this SQL Backup:</p>
              <ol className="list-decimal pl-4 space-y-0.5 text-blue-800 text-[11.5px]">
                <li>Download the <code className="bg-blue-100/80 px-1 py-0.2 rounded font-mono text-blue-900">.sql</code> file or click <strong>Copy SQL Script</strong> below.</li>
                <li>Go to your <strong>Supabase Dashboard</strong> &rarr; <strong>SQL Editor</strong>.</li>
                <li>Paste the script into a new query tab and click <strong>Run</strong>.</li>
                <li>All tables, security policies, and live records will be safely inserted or updated.</li>
              </ol>
            </div>
          </div>

          {/* SQL Preview Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-700">SQL Preview:</span>
              <span className="font-mono text-[11px] text-slate-400">Lines: ~{sqlContent.split('\n').length}</span>
            </div>

            <div className="relative rounded-xl border border-slate-300 bg-slate-900 text-slate-100 p-4 font-mono text-xs max-h-72 overflow-y-auto leading-relaxed shadow-inner select-all">
              <pre>{sqlContent}</pre>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Safe Idempotent Script (Uses <code className="font-mono bg-slate-200 px-1 rounded">ON CONFLICT DO UPDATE</code>)</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCopy}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs active-press flex-1 sm:flex-initial ${
                copied 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy SQL Script'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="px-4 py-2 bg-[#1E5AA8] hover:bg-[#164785] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-soft-sm active-press transition-colors flex-1 sm:flex-initial"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .SQL File</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
