import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SIMCard, NetworkProvider, SIMStatus } from '../../types';
import { 
  Plus, 
  Download, 
  Search, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff, 
  Smartphone, 
  Radio, 
  CheckCircle, 
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  BarChart2,
  Calendar
} from 'lucide-react';
import { ConfirmModal } from '../common/ConfirmModal';

export const AdminSims: React.FC = () => {
  const { sims, addSIM, updateSIM, deleteSIM, settings } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [networkFilter, setNetworkFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [showMaskedData, setShowMaskedData] = useState<Record<string, boolean>>({});

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSIM, setEditingSIM] = useState<SIMCard | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SIMCard | null>(null);
  const [expandedMobileCard, setExpandedMobileCard] = useState<string | null>(null);

  // Form Fields
  const [network, setNetwork] = useState<NetworkProvider>('Dialog');
  const [simNumber, setSimNumber] = useState('');
  const [iccid, setIccid] = useState('');
  const [packageName, setPackageName] = useState('');
  const [purchasePrice, setPurchasePrice] = useState<number>(300);
  const [sellingPrice, setSellingPrice] = useState<number>(500);
  const [status, setStatus] = useState<SIMStatus>('Available');
  const [receivedDate, setReceivedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [soldDate, setSoldDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const openAddModal = () => {
    setEditingSIM(null);
    setNetwork('Dialog');
    setSimNumber('077' + Math.floor(1000000 + Math.random() * 9000000));
    setIccid('899401' + Math.floor(100000000000 + Math.random() * 900000000000));
    setPackageName('Dialog Triple Play 30GB Starter');
    setPurchasePrice(300);
    setSellingPrice(500);
    setStatus('Available');
    setReceivedDate(new Date().toISOString().split('T')[0]);
    setSoldDate('');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (sim: SIMCard) => {
    setEditingSIM(sim);
    setNetwork(sim.network);
    setSimNumber(sim.simNumber);
    setIccid(sim.iccid);
    setPackageName(sim.package);
    setPurchasePrice(sim.purchasePrice);
    setSellingPrice(sim.sellingPrice);
    setStatus(sim.status);
    setReceivedDate(sim.receivedDate);
    setSoldDate(sim.soldDate || '');
    setNotes(sim.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simNumber.trim() || !iccid.trim()) return;

    if (editingSIM) {
      updateSIM(editingSIM.id, {
        network,
        simNumber,
        iccid,
        package: packageName,
        purchasePrice: Number(purchasePrice),
        sellingPrice: Number(sellingPrice),
        status,
        receivedDate,
        soldDate: status === 'Sold' ? (soldDate || new Date().toISOString().split('T')[0]) : undefined,
        notes
      });
    } else {
      addSIM({
        network,
        simNumber,
        iccid,
        package: packageName,
        purchasePrice: Number(purchasePrice),
        sellingPrice: Number(sellingPrice),
        status,
        receivedDate,
        soldDate: status === 'Sold' ? (soldDate || new Date().toISOString().split('T')[0]) : undefined,
        notes
      });
    }
    setIsModalOpen(false);
  };

  const toggleMask = (id: string) => {
    setShowMaskedData(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const maskValue = (val: string, show: boolean) => {
    if (show) return val;
    if (val.length <= 4) return '••••';
    return val.substring(0, 3) + '••••' + val.substring(val.length - 3);
  };

  // Stock calculations
  const totalSims = sims.length;
  const availableCount = sims.filter(s => s.status === 'Available').length;
  const reservedCount = sims.filter(s => s.status === 'Reserved').length;
  const soldCount = sims.filter(s => s.status === 'Sold').length;

  const filtered = sims.filter(sim => {
    const matchesNet = networkFilter === 'All' || sim.network === networkFilter;
    const matchesStatus = statusFilter === 'All' || sim.status === statusFilter;
    const matchesSearch = sim.simNumber.includes(searchQuery) ||
                          sim.iccid.includes(searchQuery) ||
                          sim.package.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (sim.notes && sim.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesNet && matchesStatus && matchesSearch;
  });

  const exportCSV = () => {
    const headers = ["ID", "Network", "SIM Number", "ICCID", "Package", "Purchase Price (LKR)", "Selling Price (LKR)", "Status", "Received Date", "Sold Date", "Notes"];
    const rows = filtered.map(s => [
      s.id,
      s.network,
      s.simNumber,
      s.iccid,
      `"${s.package}"`,
      s.purchasePrice,
      s.sellingPrice,
      s.status,
      s.receivedDate,
      s.soldDate || '',
      `"${s.notes || ''}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SIM_Inventory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (st: SIMStatus) => {
    switch (st) {
      case 'Available':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">Available</span>;
      case 'Reserved':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">Reserved</span>;
      case 'Sold':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-700">Sold</span>;
      case 'Returned':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-[#1E5AA8]">Returned</span>;
      case 'Damaged':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800">Damaged</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 3.8 Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">SIM Inventory Management</h2>
          <p className="text-xs text-gray-500">Track and manage network SIMs, serials, and sales status</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="px-3.5 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold text-xs rounded-md shadow-xs flex items-center gap-1.5 active-press transition-colors min-h-[44px]"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          
          <button
            onClick={openAddModal}
            className="px-4 py-2.5 bg-[#1E5AA8] hover:bg-[#164785] text-white font-bold text-xs sm:text-sm rounded-md shadow-soft-sm flex items-center gap-2 active-press transition-colors min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>Add SIM</span>
          </button>
        </div>
      </div>

      {/* Stock Summary Card (Section 3.8) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-soft-sm">
          <span className="text-xs text-gray-500 font-medium block">Total Registered SIMs</span>
          <span className="text-2xl font-bold font-mono text-gray-900 mt-1 block">{totalSims}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-soft-sm">
          <span className="text-xs text-emerald-600 font-bold block">Available In Stock</span>
          <span className="text-2xl font-bold font-mono text-emerald-600 mt-1 block">{availableCount}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-soft-sm">
          <span className="text-xs text-amber-600 font-bold block">Customer Reserved</span>
          <span className="text-2xl font-bold font-mono text-amber-600 mt-1 block">{reservedCount}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-soft-sm">
          <span className="text-xs text-gray-500 font-medium block">Sold SIMs</span>
          <span className="text-2xl font-bold font-mono text-gray-700 mt-1 block">{soldCount}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-soft-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by number, ICCID, pack..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-md focus:bg-white focus:border-[#1E5AA8] outline-none"
            />
          </div>

          {/* Network Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-gray-500 shrink-0">Network:</span>
            <select
              value={networkFilter}
              onChange={(e) => setNetworkFilter(e.target.value)}
              className="w-full py-2 px-2.5 text-xs bg-gray-50 border border-gray-300 rounded-md focus:border-[#1E5AA8] outline-none"
            >
              <option value="All">All Networks</option>
              <option value="Dialog">Dialog</option>
              <option value="Mobitel">Mobitel</option>
              <option value="Hutch">Hutch</option>
              <option value="Airtel">Airtel</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-gray-500 shrink-0">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-2 px-2.5 text-xs bg-gray-50 border border-gray-300 rounded-md focus:border-[#1E5AA8] outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Reserved">Reserved</option>
              <option value="Sold">Sold</option>
              <option value="Returned">Returned</option>
              <option value="Damaged">Damaged</option>
            </select>
          </div>
        </div>
      </div>

      {/* Desktop SIM Inventory Table */}
      <div className="hidden lg:block bg-white rounded-xl border border-gray-200 shadow-soft-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 text-gray-600 uppercase font-semibold border-b border-gray-200">
            <tr>
              <th className="py-3.5 px-4">Network</th>
              <th className="py-3.5 px-4">SIM Number</th>
              <th className="py-3.5 px-4">ICCID Serial</th>
              <th className="py-3.5 px-4">Package / Plan</th>
              <th className="py-3.5 px-4">Purchase Price</th>
              <th className="py-3.5 px-4">Selling Price</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Received</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(sim => {
              const show = showMaskedData[sim.id] || false;

              return (
                <tr key={sim.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold">
                    <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                      sim.network === 'Dialog' ? 'bg-red-50 text-red-700' :
                      sim.network === 'Mobitel' ? 'bg-blue-50 text-blue-700' :
                      sim.network === 'Hutch' ? 'bg-orange-50 text-orange-700' : 'bg-amber-50 text-amber-800'
                    }`}>
                      {sim.network}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-gray-900">
                    <div className="flex items-center gap-1.5">
                      <span>{maskValue(sim.simNumber, show)}</span>
                      <button
                        onClick={() => toggleMask(sim.id)}
                        className="text-gray-400 hover:text-gray-600 p-0.5"
                        title={show ? 'Mask' : 'Unmask'}
                      >
                        {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-gray-500">
                    {maskValue(sim.iccid, show)}
                  </td>
                  <td className="py-3.5 px-4 text-gray-800 font-medium">
                    {sim.package}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-gray-600">
                    Rs. {sim.purchasePrice.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#1E5AA8]">
                    Rs. {sim.sellingPrice.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4">
                    {getStatusBadge(sim.status)}
                  </td>
                  <td className="py-3.5 px-4 text-gray-500 font-mono text-[11px]">
                    {sim.receivedDate}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEditModal(sim)}
                        className="p-1.5 rounded hover:bg-gray-100 text-gray-600 hover:text-[#1E5AA8]"
                        title="Edit SIM"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(sim)}
                        className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"
                        title="Delete SIM"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Expandable Cards View (Section 3.8) */}
      <div className="lg:hidden space-y-3">
        {filtered.map(sim => {
          const isExpanded = expandedMobileCard === sim.id;
          const show = showMaskedData[sim.id] || false;

          return (
            <div key={sim.id} className="bg-white rounded-xl p-4 border border-gray-200 shadow-soft-sm space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    sim.network === 'Dialog' ? 'bg-red-50 text-red-700' :
                    sim.network === 'Mobitel' ? 'bg-blue-50 text-blue-700' :
                    sim.network === 'Hutch' ? 'bg-orange-50 text-orange-700' : 'bg-amber-50 text-amber-800'
                  }`}>
                    {sim.network}
                  </span>
                  <span className="font-mono font-bold text-xs text-gray-900">
                    {maskValue(sim.simNumber, show)}
                  </span>
                </div>
                <div>
                  {getStatusBadge(sim.status)}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-gray-600 truncate max-w-[200px]">{sim.package}</span>
                <span className="font-mono font-bold text-[#1E5AA8]">Rs. {sim.sellingPrice}</span>
              </div>

              {/* Expand Toggle */}
              <button
                onClick={() => setExpandedMobileCard(isExpanded ? null : sim.id)}
                className="w-full py-1.5 bg-gray-50 hover:bg-gray-100 rounded text-gray-600 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors"
              >
                <span>{isExpanded ? 'Hide Details' : 'View Full Details'}</span>
                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {/* Expanded Info */}
              {isExpanded && (
                <div className="pt-2 border-t border-gray-100 space-y-2 text-xs text-gray-700">
                  <div className="flex justify-between font-mono">
                    <span className="text-gray-500">ICCID:</span>
                    <span>{sim.iccid}</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-gray-500">Purchase Price:</span>
                    <span>Rs. {sim.purchasePrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Received Date:</span>
                    <span>{sim.receivedDate}</span>
                  </div>
                  {sim.notes && (
                    <div className="bg-gray-50 p-2 rounded text-[11px] text-gray-600">
                      <span className="font-bold block">Notes:</span>
                      {sim.notes}
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => toggleMask(sim.id)}
                      className="px-3 py-1.5 rounded bg-gray-100 text-gray-700 text-xs font-semibold"
                    >
                      {show ? 'Hide Masked' : 'Reveal Masked'}
                    </button>
                    <button
                      onClick={() => openEditModal(sim)}
                      className="px-3 py-1.5 rounded bg-[#1E5AA8] text-white text-xs font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget(sim)}
                      className="px-3 py-1.5 rounded bg-red-50 text-red-600 text-xs font-semibold"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add / Edit SIM Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
          />

          <div className="relative bg-white rounded-xl shadow-soft-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto z-10 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingSIM ? 'Edit SIM Details' : 'Add New SIM to Inventory'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Network Provider *</label>
                  <select
                    value={network}
                    onChange={(e) => setNetwork(e.target.value as NetworkProvider)}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:border-[#1E5AA8] outline-none"
                  >
                    <option value="Dialog">Dialog</option>
                    <option value="Mobitel">Mobitel</option>
                    <option value="Hutch">Hutch</option>
                    <option value="Airtel">Airtel</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Status *</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as SIMStatus)}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:border-[#1E5AA8] outline-none"
                  >
                    <option value="Available">Available</option>
                    <option value="Reserved">Reserved</option>
                    <option value="Sold">Sold</option>
                    <option value="Returned">Returned</option>
                    <option value="Damaged">Damaged</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">SIM Mobile Number *</label>
                <input
                  type="text"
                  required
                  value={simNumber}
                  onChange={(e) => setSimNumber(e.target.value)}
                  placeholder="0771234567"
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-sm font-mono text-gray-900 focus:border-[#1E5AA8] outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">ICCID Barcode / Serial Number *</label>
                <input
                  type="text"
                  required
                  value={iccid}
                  onChange={(e) => setIccid(e.target.value)}
                  placeholder="899401..."
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-sm font-mono text-gray-900 focus:border-[#1E5AA8] outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Associated Starter Package / Plan</label>
                <input
                  type="text"
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                  placeholder="e.g., Dialog Triple Play 30GB Starter"
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:border-[#1E5AA8] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Purchase Price (LKR) *</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    required
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-sm font-mono text-gray-900 focus:border-[#1E5AA8] outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Selling Price (LKR) *</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    required
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-sm font-mono text-gray-900 focus:border-[#1E5AA8] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Received Date *</label>
                  <input
                    type="date"
                    required
                    value={receivedDate}
                    onChange={(e) => setReceivedDate(e.target.value)}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-xs text-gray-900 focus:border-[#1E5AA8] outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Sold Date (Optional)</label>
                  <input
                    type="date"
                    value={soldDate}
                    onChange={(e) => setSoldDate(e.target.value)}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-xs text-gray-900 focus:border-[#1E5AA8] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Notes / Location in Store</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., Drawer A, Showcase Tray 2"
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-xs text-gray-900 focus:border-[#1E5AA8] outline-none"
                />
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-md border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-md bg-[#1E5AA8] hover:bg-[#164785] text-white font-bold min-h-[44px]"
                >
                  {editingSIM ? 'Save Changes' : 'Add to Inventory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title={`Delete SIM ${deleteTarget?.simNumber}?`}
        message={`Are you sure you want to remove this ${deleteTarget?.network} SIM card (ICCID: ${deleteTarget?.iccid}) from your inventory?`}
        confirmLabel="Delete SIM"
        onConfirm={() => {
          if (deleteTarget) {
            deleteSIM(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />

    </div>
  );
};
