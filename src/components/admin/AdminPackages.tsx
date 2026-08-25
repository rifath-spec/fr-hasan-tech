import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MobilePackage, NetworkProvider } from '../../types';
import { Plus, Edit2, Trash2, ArrowUpDown, ArrowUp, ArrowDown, Package, Search } from 'lucide-react';
import { ConfirmModal } from '../common/ConfirmModal';

export const AdminPackages: React.FC = () => {
  const { packages, addPackage, updatePackage, deletePackage, reorderPackages, settings } = useApp();

  const [networkFilter, setNetworkFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<MobilePackage | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MobilePackage | null>(null);

  // Form fields
  const [network, setNetwork] = useState<NetworkProvider>('Dialog');
  const [name, setName] = useState('');
  const [type, setType] = useState<'Data' | 'Voice' | 'Combo' | 'Reload'>('Data');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(990);
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [validity, setValidity] = useState('30 Days');
  const [quota, setQuota] = useState('30 GB');

  const openAddModal = () => {
    setEditingPackage(null);
    setNetwork('Dialog');
    setName('');
    setType('Data');
    setDescription('');
    setPrice(990);
    setStatus('Active');
    setDisplayOrder(packages.length + 1);
    setValidity('30 Days');
    setQuota('30 GB');
    setIsModalOpen(true);
  };

  const openEditModal = (pkg: MobilePackage) => {
    setEditingPackage(pkg);
    setNetwork(pkg.network);
    setName(pkg.name);
    setType(pkg.type);
    setDescription(pkg.description);
    setPrice(pkg.price);
    setStatus(pkg.status);
    setDisplayOrder(pkg.displayOrder);
    setValidity(pkg.validity || '30 Days');
    setQuota(pkg.quota || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingPackage) {
      updatePackage(editingPackage.id, {
        network,
        name,
        type,
        description,
        price: Number(price),
        status,
        displayOrder: Number(displayOrder),
        validity,
        quota
      });
    } else {
      addPackage({
        network,
        name,
        type,
        description,
        price: Number(price),
        status,
        displayOrder: Number(displayOrder),
        validity,
        quota
      });
    }
    setIsModalOpen(false);
  };

  const moveOrder = (index: number, direction: 'up' | 'down') => {
    const sorted = [...packages].sort((a, b) => a.displayOrder - b.displayOrder);
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= sorted.length) return;

    const temp = sorted[index];
    sorted[index] = sorted[targetIdx];
    sorted[targetIdx] = temp;

    reorderPackages(sorted);
  };

  const sortedPackages = [...packages].sort((a, b) => a.displayOrder - b.displayOrder);

  const filtered = sortedPackages.filter(p => {
    const matchesNet = networkFilter === 'All' || p.network === networkFilter;
    const matchesQuery = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesNet && matchesQuery;
  });

  return (
    <div className="space-y-6">
      
      {/* 3.9 Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Mobile Package Management</h2>
          <p className="text-xs text-gray-500">Configure data, voice, and combo plans across all mobile operators</p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-[#1E5AA8] hover:bg-[#164785] text-white font-bold text-xs sm:text-sm rounded-md shadow-soft-sm flex items-center gap-2 active-press transition-colors min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Package</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-soft-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['All', 'Dialog', 'Mobitel', 'Hutch', 'Airtel'].map(net => (
            <button
              key={net}
              onClick={() => setNetworkFilter(net)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                networkFilter === net
                  ? 'bg-[#1E5AA8] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {net}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search packages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-md focus:bg-white focus:border-[#1E5AA8] outline-none"
          />
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-xl border border-gray-200 shadow-soft-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 text-gray-600 uppercase font-semibold border-b border-gray-200">
            <tr>
              <th className="py-3.5 px-4 w-16 text-center">Order</th>
              <th className="py-3.5 px-4">Package Name</th>
              <th className="py-3.5 px-4">Network</th>
              <th className="py-3.5 px-4">Type</th>
              <th className="py-3.5 px-4">Price (LKR)</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((pkg, idx) => (
              <tr key={pkg.id} className="hover:bg-gray-50/80 transition-colors">
                <td className="py-3.5 px-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => moveOrder(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30"
                      title="Move up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-mono font-bold text-gray-800">{pkg.displayOrder}</span>
                    <button
                      onClick={() => moveOrder(idx, 'down')}
                      disabled={idx === filtered.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30"
                      title="Move down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
                <td className="py-3.5 px-4 font-bold text-gray-900">
                  <div>{pkg.name}</div>
                  <div className="text-[11px] text-gray-500 font-normal truncate max-w-sm">{pkg.description}</div>
                </td>
                <td className="py-3.5 px-4">
                  <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                    pkg.network === 'Dialog' ? 'bg-red-50 text-red-700' :
                    pkg.network === 'Mobitel' ? 'bg-blue-50 text-blue-700' :
                    pkg.network === 'Hutch' ? 'bg-orange-50 text-orange-700' : 'bg-amber-50 text-amber-800'
                  }`}>
                    {pkg.network}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-medium text-gray-700">
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-semibold text-[11px]">
                    {pkg.type}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-mono font-bold text-[#1E5AA8]">
                  Rs. {pkg.price.toFixed(2)}
                </td>
                <td className="py-3.5 px-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    pkg.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {pkg.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEditModal(pkg)}
                      className="p-1.5 rounded hover:bg-gray-100 text-gray-600 hover:text-[#1E5AA8]"
                      title="Edit Package"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(pkg)}
                      className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"
                      title="Delete Package"
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

      {/* Mobile Cards View */}
      <div className="lg:hidden space-y-3">
        {filtered.map(pkg => (
          <div key={pkg.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-soft-sm space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  pkg.network === 'Dialog' ? 'bg-red-50 text-red-700' :
                  pkg.network === 'Mobitel' ? 'bg-blue-50 text-blue-700' :
                  pkg.network === 'Hutch' ? 'bg-orange-50 text-orange-700' : 'bg-amber-50 text-amber-800'
                }`}>
                  {pkg.network}
                </span>
                <span className="font-bold text-sm text-gray-900">{pkg.name}</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                pkg.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'
              }`}>
                {pkg.status}
              </span>
            </div>

            <p className="text-xs text-gray-600">{pkg.description}</p>

            <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
              <span className="font-mono font-bold text-sm text-[#1E5AA8]">Rs. {pkg.price}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(pkg)}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => setDeleteTarget(pkg)}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Package Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
          />

          <div className="relative bg-white rounded-xl shadow-soft-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto z-10 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingPackage ? 'Edit Mobile Package' : 'Add New Mobile Package'}
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
                  <label className="font-semibold text-gray-700 block mb-1">Package Type *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:border-[#1E5AA8] outline-none"
                  >
                    <option value="Data">Data Package</option>
                    <option value="Voice">Voice Package</option>
                    <option value="Combo">Combo / Non-Stop</option>
                    <option value="Reload">Standard Reload</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Package Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Dialog Power Plan 30 Days"
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:border-[#1E5AA8] outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Package Description *</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., 30GB Anytime Data + Unlimited YouTube (HD 1080p)"
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:border-[#1E5AA8] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Package Price (LKR) *</label>
                  <input
                    type="number"
                    min={0}
                    step="1"
                    required
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-sm font-mono text-gray-900 focus:border-[#1E5AA8] outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Display Order</label>
                  <input
                    type="number"
                    min={1}
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 1)}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-sm font-mono text-gray-900 focus:border-[#1E5AA8] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Validity Period</label>
                  <input
                    type="text"
                    value={validity}
                    onChange={(e) => setValidity(e.target.value)}
                    placeholder="e.g., 30 Days"
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-xs text-gray-900 focus:border-[#1E5AA8] outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Data / Quota (Optional)</label>
                  <input
                    type="text"
                    value={quota}
                    onChange={(e) => setQuota(e.target.value)}
                    placeholder="e.g., 50 GB"
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-xs text-gray-900 focus:border-[#1E5AA8] outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-semibold text-gray-800 text-xs">Active Status</span>
                <button
                  type="button"
                  onClick={() => setStatus(status === 'Active' ? 'Inactive' : 'Active')}
                  className={`px-3 py-1 rounded text-xs font-bold ${
                    status === 'Active' ? 'bg-emerald-600 text-white' : 'bg-gray-300 text-gray-700'
                  }`}
                >
                  {status}
                </button>
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
                  {editingPackage ? 'Save Changes' : 'Create Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title={`Delete "${deleteTarget?.name}"?`}
        message="Are you sure you want to delete this package? It will no longer appear on the public website or in POS reload options."
        confirmLabel="Delete Package"
        onConfirm={() => {
          if (deleteTarget) {
            deletePackage(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />

    </div>
  );
};
