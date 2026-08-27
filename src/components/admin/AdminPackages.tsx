import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MobilePackage, NetworkProvider, PackageCategory } from '../../types';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Package, 
  Search, 
  Copy, 
  Wifi, 
  Smartphone, 
  Tv, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  Tag, 
  Radio
} from 'lucide-react';
import { ConfirmModal } from '../common/ConfirmModal';

export const AdminPackages: React.FC = () => {
  const { packages, addPackage, updatePackage, deletePackage, reorderPackages, clearPackages } = useApp();

  const [networkFilter, setNetworkFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<MobilePackage | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MobilePackage | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Form fields
  const [network, setNetwork] = useState<NetworkProvider>('Dialog');
  const [category, setCategory] = useState<PackageCategory>('Mobile SIM Plans');
  const [name, setName] = useState('');
  const [type, setType] = useState<string>('Data & Social');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [validity, setValidity] = useState('30 Days');
  const [quota, setQuota] = useState('');
  const [speed, setSpeed] = useState('');
  const [badge, setBadge] = useState('');
  const [ussdCode, setUssdCode] = useState('');
  const [billingType, setBillingType] = useState<'Prepaid' | 'Postpaid' | 'Both'>('Prepaid');
  const [featuresText, setFeaturesText] = useState('');

  const openAddModal = (initialCategory?: PackageCategory) => {
    setEditingPackage(null);
    setNetwork('Dialog');
    setCategory(initialCategory || 'Mobile SIM Plans');
    setName('');
    setType(initialCategory === 'Home Broadband (Router / Wi-Fi)' ? 'Home Broadband' : 'Data & Social');
    setDescription('');
    setPrice(0);
    setStatus('Active');
    setDisplayOrder(packages.length + 1);
    setValidity('30 Days');
    setQuota('');
    setSpeed('');
    setBadge('');
    setUssdCode('');
    setBillingType('Prepaid');
    setFeaturesText('');
    setIsModalOpen(true);
  };

  const openEditModal = (pkg: MobilePackage) => {
    setEditingPackage(pkg);
    setNetwork(pkg.network);
    setCategory(pkg.category || (pkg.type.toLowerCase().includes('broadband') || pkg.type.toLowerCase().includes('fiber') ? 'Home Broadband (Router / Wi-Fi)' : 'Mobile SIM Plans'));
    setName(pkg.name);
    setType(pkg.type);
    setDescription(pkg.description);
    setPrice(pkg.price);
    setStatus(pkg.status);
    setDisplayOrder(pkg.displayOrder);
    setValidity(pkg.validity || '30 Days');
    setQuota(pkg.quota || '');
    setSpeed(pkg.speed || '');
    setBadge(pkg.badge || '');
    setUssdCode(pkg.ussdCode || '');
    setBillingType(pkg.billingType || 'Prepaid');
    setFeaturesText(pkg.features && pkg.features.length > 0 ? pkg.features.join('\n') : '');
    setIsModalOpen(true);
  };

  const handleDuplicate = (pkg: MobilePackage) => {
    const clonedName = `${pkg.name} (Copy)`;
    const newFeatures = pkg.features ? [...pkg.features] : [];
    addPackage({
      network: pkg.network,
      category: pkg.category || 'Mobile SIM Plans',
      name: clonedName,
      type: pkg.type,
      description: pkg.description,
      price: pkg.price,
      status: 'Active',
      displayOrder: packages.length + 1,
      validity: pkg.validity,
      quota: pkg.quota,
      speed: pkg.speed,
      features: newFeatures,
      badge: pkg.badge,
      ussdCode: pkg.ussdCode,
      billingType: pkg.billingType
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const parsedFeatures = featuresText
      .split('\n')
      .map(f => f.trim())
      .filter(f => f.length > 0);

    const packageData: Omit<MobilePackage, 'id'> = {
      network,
      category,
      name,
      type,
      description,
      price: Number(price),
      status,
      displayOrder: Number(displayOrder),
      validity: validity.trim() || undefined,
      quota: quota.trim() || undefined,
      speed: speed.trim() || undefined,
      badge: badge.trim() || undefined,
      ussdCode: ussdCode.trim() || undefined,
      billingType,
      features: parsedFeatures.length > 0 ? parsedFeatures : undefined
    };

    if (editingPackage) {
      updatePackage(editingPackage.id, packageData);
    } else {
      addPackage(packageData);
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
    const pkgCat = p.category || (p.type.toLowerCase().includes('broadband') || p.type.toLowerCase().includes('fiber') ? 'Home Broadband (Router / Wi-Fi)' : 'Mobile SIM Plans');
    const matchesCat = categoryFilter === 'All' || pkgCat === categoryFilter;
    const matchesQuery = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.quota && p.quota.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.badge && p.badge.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesNet && matchesCat && matchesQuery;
  });

  // Calculate high-level stats
  const totalCount = packages.length;
  const activeCount = packages.filter(p => p.status === 'Active').length;
  const broadbandCount = packages.filter(p => p.category === 'Home Broadband (Router / Wi-Fi)' || p.type.toLowerCase().includes('broadband') || p.type.toLowerCase().includes('router')).length;
  const mobileCount = totalCount - broadbandCount;

  return (
    <div className="space-y-6">
      
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-[#1E5AA8]" />
            <span>Packages & Broadband Management</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure mobile SIM plans, 4G/5G Home Broadband Wi-Fi packages, and social boosters across all telecom networks
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {packages.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="px-3.5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-lg border border-red-200 shadow-xs flex items-center justify-center gap-1.5 active-press transition-colors min-h-[42px]"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All</span>
            </button>
          )}
          <button
            onClick={() => openAddModal('Home Broadband (Router / Wi-Fi)')}
            className="flex-1 sm:flex-initial px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-soft-sm flex items-center justify-center gap-1.5 active-press transition-colors min-h-[42px]"
          >
            <Wifi className="w-4 h-4" />
            <span>+ Add Broadband</span>
          </button>
          <button
            onClick={() => openAddModal('Mobile SIM Plans')}
            className="flex-1 sm:flex-initial px-4 py-2.5 bg-[#1E5AA8] hover:bg-[#164785] text-white font-bold text-xs rounded-lg shadow-soft-sm flex items-center justify-center gap-1.5 active-press transition-colors min-h-[42px]"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Mobile Plan</span>
          </button>
        </div>
      </div>

      {/* High-Level Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#1E5AA8] flex items-center justify-center shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-gray-500 font-medium">Total Packages</div>
            <div className="text-lg font-bold text-gray-900">{totalCount}</div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-gray-500 font-medium">Active on Site</div>
            <div className="text-lg font-bold text-emerald-700">{activeCount}</div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Wifi className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-gray-500 font-medium">Home Broadband</div>
            <div className="text-lg font-bold text-indigo-700">{broadbandCount}</div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-gray-500 font-medium">Mobile SIM Plans</div>
            <div className="text-lg font-bold text-amber-800">{mobileCount}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-soft-sm space-y-3">
        {/* Row 1: Network Provider Selector */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1">Operator:</span>
            {['All', 'Dialog', 'Mobitel', 'Hutch', 'Airtel'].map(net => (
              <button
                key={net}
                onClick={() => setNetworkFilter(net)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                  networkFilter === net
                    ? net === 'Dialog' ? 'bg-red-600 text-white' :
                      net === 'Mobitel' ? 'bg-blue-600 text-white' :
                      net === 'Hutch' ? 'bg-orange-500 text-white' :
                      net === 'Airtel' ? 'bg-red-500 text-white' :
                      'bg-[#1E5AA8] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {net}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search package name, quota, price..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:border-[#1E5AA8] outline-none"
            />
          </div>
        </div>

        {/* Row 2: Category Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full pt-1">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1">Category:</span>
          {[
            { id: 'All', label: 'All Categories' },
            { id: 'Mobile SIM Plans', label: '📱 Mobile SIM Plans' },
            { id: 'Home Broadband (Router / Wi-Fi)', label: '📶 Home Broadband (Router / Wi-Fi)' },
            { id: 'Social & Streaming', label: '🎬 Social & Streaming' },
            { id: 'Work & Study', label: '💻 Work & Study' },
            { id: 'Special / Tourist', label: '✈️ Special / Tourist' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                categoryFilter === cat.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-xl border border-gray-200 shadow-soft-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 text-gray-600 uppercase font-semibold border-b border-gray-200">
            <tr>
              <th className="py-3.5 px-4 w-16 text-center">Order</th>
              <th className="py-3.5 px-4">Operator & Category</th>
              <th className="py-3.5 px-4">Package Name & Specs</th>
              <th className="py-3.5 px-4">Quota / Speed</th>
              <th className="py-3.5 px-4">Validity</th>
              <th className="py-3.5 px-4">Price (LKR)</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-gray-500">
                  No packages found matching the selected filters.
                </td>
              </tr>
            ) : (
              filtered.map((pkg, idx) => {
                const isBroadband = pkg.category === 'Home Broadband (Router / Wi-Fi)' || pkg.type.toLowerCase().includes('broadband');
                return (
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
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                          pkg.network === 'Dialog' ? 'bg-red-50 text-red-700 border border-red-200' :
                          pkg.network === 'Mobitel' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          pkg.network === 'Hutch' ? 'bg-orange-50 text-orange-700 border border-orange-200' : 
                          'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {pkg.network}
                        </span>
                        <div>
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            isBroadband ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {isBroadband ? <Wifi className="w-3 h-3" /> : <Smartphone className="w-3 h-3" />}
                            <span>{pkg.category || (isBroadband ? 'Home Broadband' : 'Mobile SIM')}</span>
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-gray-900 max-w-xs">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span>{pkg.name}</span>
                        {pkg.badge && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                            {pkg.badge}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-gray-500 font-normal line-clamp-1 mt-0.5">{pkg.description}</div>
                      {pkg.ussdCode && (
                        <div className="text-[10px] text-gray-400 font-mono mt-0.5">{pkg.ussdCode}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-gray-700">
                      <div className="font-semibold text-slate-900">{pkg.quota || 'Standard Quota'}</div>
                      {pkg.speed && <div className="text-[10px] text-slate-500">{pkg.speed}</div>}
                    </td>
                    <td className="py-3.5 px-4 text-gray-600">
                      {pkg.validity || '30 Days'}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#1E5AA8]">
                      Rs. {pkg.price.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => updatePackage(pkg.id, { status: pkg.status === 'Active' ? 'Inactive' : 'Active' })}
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                          pkg.status === 'Active' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        title="Click to toggle status"
                      >
                        {pkg.status}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleDuplicate(pkg)}
                          className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-emerald-600"
                          title="Duplicate / Clone Package"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
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
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards View */}
      <div className="lg:hidden space-y-3">
        {filtered.map(pkg => {
          const isBroadband = pkg.category === 'Home Broadband (Router / Wi-Fi)' || pkg.type.toLowerCase().includes('broadband');
          return (
            <div key={pkg.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-soft-sm space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      pkg.network === 'Dialog' ? 'bg-red-50 text-red-700' :
                      pkg.network === 'Mobitel' ? 'bg-blue-50 text-blue-700' :
                      pkg.network === 'Hutch' ? 'bg-orange-50 text-orange-700' : 'bg-amber-50 text-amber-800'
                    }`}>
                      {pkg.network}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                      isBroadband ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {isBroadband ? '📶 Broadband' : '📱 Mobile'}
                    </span>
                    {pkg.badge && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                        {pkg.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-sm text-gray-900">{pkg.name}</h3>
                </div>
                
                <button
                  onClick={() => updatePackage(pkg.id, { status: pkg.status === 'Active' ? 'Inactive' : 'Active' })}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    pkg.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {pkg.status}
                </button>
              </div>

              <p className="text-xs text-gray-600">{pkg.description}</p>

              <div className="bg-slate-50 p-2.5 rounded-lg flex items-center justify-between text-xs">
                <div>
                  <span className="text-gray-500 text-[10px] block">Quota / Speed</span>
                  <span className="font-semibold text-gray-900">{pkg.quota || 'Standard Quota'}</span>
                </div>
                <div className="text-right">
                  <span className="text-gray-500 text-[10px] block">Validity</span>
                  <span className="font-semibold text-gray-900">{pkg.validity || '30 Days'}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <span className="font-mono font-bold text-base text-[#1E5AA8]">Rs. {pkg.price.toLocaleString()}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleDuplicate(pkg)}
                    className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold"
                    title="Duplicate"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => openEditModal(pkg)}
                    className="px-3 py-1.5 bg-[#1E5AA8] hover:bg-[#164785] text-white font-semibold text-xs rounded-lg"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteTarget(pkg)}
                    className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Package Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
          />

          <div className="relative bg-white rounded-2xl shadow-soft-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto z-10 border border-gray-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {editingPackage ? 'Edit Package / Broadband Plan' : 'Add New Package / Broadband Plan'}
                </h3>
                <p className="text-xs text-gray-500">Specify network, broadband category, price tiers and feature benefits</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              
              {/* Operator & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Network Provider *</label>
                  <select
                    value={network}
                    onChange={(e) => setNetwork(e.target.value as NetworkProvider)}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-900 focus:border-[#1E5AA8] outline-none"
                  >
                    <option value="Dialog">Dialog (Axiata)</option>
                    <option value="Mobitel">Mobitel (SLT-Mobitel)</option>
                    <option value="Hutch">Hutch (078 / 072)</option>
                    <option value="Airtel">Airtel 5G (075)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Service / Package Line *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as PackageCategory)}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-900 focus:border-[#1E5AA8] outline-none"
                  >
                    <option value="Mobile SIM Plans">📱 Mobile SIM Plans (Prepaid / Postpaid)</option>
                    <option value="Home Broadband (Router / Wi-Fi)">📶 Home Broadband (Router / Wi-Fi / Fiber)</option>
                    <option value="Social & Streaming">🎬 Social & Streaming Media</option>
                    <option value="Work & Study">💻 Work & Study / E-Learning</option>
                    <option value="DTV & Satellite TV">📺 DTV & Satellite TV Packs</option>
                    <option value="Special / Tourist">✈️ Special / Tourist Bundles</option>
                  </select>
                </div>
              </div>

              {/* Package Name & Type */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-semibold text-gray-700 block mb-1">Package Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Dialog Home Broadband 100GB Ultra or Dialog Power Plan 990"
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:border-[#1E5AA8] outline-none font-semibold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Package Type / Tag</label>
                  <input
                    type="text"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    placeholder="e.g., Home Broadband, Combo, Data"
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:border-[#1E5AA8] outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Package Description *</label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., 100GB Total Home Wi-Fi: 50GB Anytime Day Data + 50GB Night-time Booster for 4G/5G Routers"
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:border-[#1E5AA8] outline-none"
                />
              </div>

              {/* Price, Validity, Order */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Price (LKR) *</label>
                  <input
                    type="number"
                    min={0}
                    step="1"
                    required
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-xs font-mono font-bold text-gray-900 focus:border-[#1E5AA8] outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Validity Period</label>
                  <input
                    type="text"
                    value={validity}
                    onChange={(e) => setValidity(e.target.value)}
                    placeholder="e.g., 30 Days / Monthly Bill"
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:border-[#1E5AA8] outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Display Order</label>
                  <input
                    type="number"
                    min={1}
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 1)}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-xs font-mono text-gray-900 focus:border-[#1E5AA8] outline-none"
                  />
                </div>
              </div>

              {/* Quota, Speed, Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Data / Quota Spec</label>
                  <input
                    type="text"
                    value={quota}
                    onChange={(e) => setQuota(e.target.value)}
                    placeholder="e.g., 100 GB (50GB Day + 50GB Night)"
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:border-[#1E5AA8] outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Speed / Tech Spec</label>
                  <input
                    type="text"
                    value={speed}
                    onChange={(e) => setSpeed(e.target.value)}
                    placeholder="e.g., Up to 50 Mbps / 5G Ready"
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:border-[#1E5AA8] outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Promo Badge (Optional)</label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="e.g., Popular, Broadband Choice, Best Value"
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:border-[#1E5AA8] outline-none"
                  />
                </div>
              </div>

              {/* USSD & Billing Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">USSD / Reload Code / Note</label>
                  <input
                    type="text"
                    value={ussdCode}
                    onChange={(e) => setUssdCode(e.target.value)}
                    placeholder="e.g., #678# or Counter Direct Reload"
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-xs font-mono text-gray-900 focus:border-[#1E5AA8] outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Billing Type</label>
                  <select
                    value={billingType}
                    onChange={(e) => setBillingType(e.target.value as 'Prepaid' | 'Postpaid' | 'Both')}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-900 focus:border-[#1E5AA8] outline-none"
                  >
                    <option value="Prepaid">Prepaid (Direct Reload / PIN)</option>
                    <option value="Postpaid">Postpaid (Monthly Bill Settlement)</option>
                    <option value="Both">Both (Prepaid & Postpaid)</option>
                  </select>
                </div>
              </div>

              {/* Features Bullet Points */}
              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  Feature Highlights & Benefits (One line per bullet point)
                </label>
                <textarea
                  rows={3}
                  value={featuresText}
                  onChange={(e) => setFeaturesText(e.target.value)}
                  placeholder="50 GB Anytime Daytime Data&#10;50 GB High-Speed Night Data&#10;Free in-store Router configuration assistance"
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:border-[#1E5AA8] outline-none"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <span className="font-semibold text-gray-900 text-xs block">Public Site Visibility</span>
                  <span className="text-[11px] text-gray-500">Show this package to customers on the public website catalog</span>
                </div>
                <button
                  type="button"
                  onClick={() => setStatus(status === 'Active' ? 'Inactive' : 'Active')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    status === 'Active' ? 'bg-emerald-600 text-white' : 'bg-gray-300 text-gray-700'
                  }`}
                >
                  {status === 'Active' ? '✓ Active & Published' : '✕ Inactive (Hidden)'}
                </button>
              </div>

              <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 min-h-[42px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-[#1E5AA8] hover:bg-[#164785] text-white font-bold min-h-[42px] shadow-soft-sm"
                >
                  {editingPackage ? 'Save Package Changes' : 'Create Package Plan'}
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

      {/* Clear All Packages Confirmation Modal */}
      <ConfirmModal
        isOpen={showClearConfirm}
        title="Clear All Mobile & Broadband Packages?"
        message="This will delete all packages from your database and catalog. You can create new custom packages or restore default templates in Settings > Data."
        confirmLabel="Yes, Clear All Packages"
        onConfirm={async () => {
          await clearPackages();
          setShowClearConfirm(false);
        }}
        onCancel={() => setShowClearConfirm(false)}
      />

    </div>
  );
};
