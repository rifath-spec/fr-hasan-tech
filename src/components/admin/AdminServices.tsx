import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ServiceItem, ServiceCategory } from '../../types';
import { Plus, Edit2, Trash2, CheckCircle2, XCircle, Search, Eye, Copy, Printer, Smartphone, Package, FileText, Image as ImageIcon } from 'lucide-react';
import { ConfirmModal } from '../common/ConfirmModal';

export const AdminServices: React.FC = () => {
  const { services, addService, updateService, deleteService, settings } = useApp();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ServiceItem | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ServiceCategory>('Photocopy');
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [priceInfo, setPriceInfo] = useState('');
  const [image, setImage] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [isPublished, setIsPublished] = useState(true);
  const [availableListStr, setAvailableListStr] = useState('');
  const [notesStr, setNotesStr] = useState('');

  const openAddModal = () => {
    setEditingService(null);
    setName('');
    setCategory('Photocopy');
    setShortDescription('');
    setFullDescription('');
    setPriceInfo('');
    setImage('');
    setStatus('Active');
    setIsPublished(true);
    setAvailableListStr('Standard Photocopy\nExpress Document Scan');
    setNotesStr('Clear originals recommended');
    setIsModalOpen(true);
  };

  const openEditModal = (service: ServiceItem) => {
    setEditingService(service);
    setName(service.name);
    setCategory(service.category);
    setShortDescription(service.shortDescription);
    setFullDescription(service.fullDescription);
    setPriceInfo(service.priceInfo);
    setImage(service.image || '');
    setStatus(service.status);
    setIsPublished(service.isPublished);
    setAvailableListStr(service.availableServicesList.join('\n'));
    setNotesStr(service.importantNotes.join('\n'));
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const availableServicesList = availableListStr
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const importantNotes = notesStr
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    if (editingService) {
      updateService(editingService.id, {
        name,
        category,
        shortDescription,
        fullDescription,
        priceInfo,
        image,
        status,
        isPublished,
        availableServicesList,
        importantNotes,
        slug: editingService.slug || slug,
      });
    } else {
      addService({
        slug: slug || `service-${Date.now()}`,
        name,
        category,
        icon: category === 'Photocopy' ? 'Copy' : category === 'Printing' ? 'Printer' : category === 'SIM Cards' ? 'Smartphone' : 'Package',
        shortDescription,
        fullDescription,
        priceInfo,
        image,
        availableServicesList,
        importantNotes,
        status,
        isPublished,
      });
    }

    setIsModalOpen(false);
  };

  const filtered = services.filter(s => {
    const matchesCat = categoryFilter === 'All' || s.category === categoryFilter;
    const matchesQuery = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         s.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="space-y-6">
      
      {/* 3.7 Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Services Management</h2>
          <p className="text-xs text-gray-500">Configure public service catalog, pricing notes, and availability</p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-[#1E5AA8] hover:bg-[#164785] text-white font-bold text-xs sm:text-sm rounded-md shadow-soft-sm flex items-center gap-2 active-press transition-colors min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Service</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-soft-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['All', 'Photocopy', 'Printing', 'SIM Cards', 'Packages'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                categoryFilter === cat
                  ? 'bg-[#1E5AA8] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search service..."
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
              <th className="py-3.5 px-4">Service</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Public Status</th>
              <th className="py-3.5 px-4">Price Info</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(service => (
              <tr key={service.id} className="hover:bg-gray-50/80 transition-colors">
                <td className="py-3.5 px-4 font-bold text-gray-900">
                  <div className="flex items-center gap-3">
                    {service.image ? (
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-100 shadow-xs">
                        <img src={service.image} alt={service.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#1E5AA8] flex items-center justify-center font-bold shrink-0">
                        {service.category === 'Photocopy' ? <Copy className="w-4 h-4" /> : service.category === 'Printing' ? <Printer className="w-4 h-4" /> : service.category === 'SIM Cards' ? <Smartphone className="w-4 h-4" /> : <Package className="w-4 h-4" />}
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-bold text-gray-900">{service.name}</div>
                      <div className="text-[11px] text-gray-500 font-normal truncate max-w-xs">{service.shortDescription}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4 font-medium text-gray-700">
                  <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-800 text-[11px] font-semibold">
                    {service.category}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                    service.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {service.status}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <span className={`text-xs font-semibold flex items-center gap-1 ${
                    service.isPublished ? 'text-emerald-700' : 'text-gray-400'
                  }`}>
                    {service.isPublished ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    <span>{service.isPublished ? 'Published' : 'Hidden'}</span>
                  </span>
                </td>
                <td className="py-3.5 px-4 font-mono font-medium text-gray-900">
                  {service.priceInfo}
                </td>
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEditModal(service)}
                      className="p-1.5 rounded hover:bg-gray-100 text-gray-600 hover:text-[#1E5AA8] transition-colors"
                      title="Edit Service"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(service)}
                      className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete Service"
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
        {filtered.map(service => (
          <div key={service.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-soft-sm space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                {service.image ? (
                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-100 shadow-xs">
                    <img src={service.image} alt={service.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#1E5AA8] flex items-center justify-center font-bold shrink-0">
                    {service.category === 'Photocopy' ? <Copy className="w-5 h-5" /> : service.category === 'Printing' ? <Printer className="w-5 h-5" /> : service.category === 'SIM Cards' ? <Smartphone className="w-5 h-5" /> : <Package className="w-5 h-5" />}
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-sm text-gray-900">{service.name}</h3>
                  <span className="text-[11px] text-gray-500">{service.category}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  service.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'
                }`}>
                  {service.status}
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">{service.shortDescription}</p>

            <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-[#1E5AA8]">{service.priceInfo}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(service)}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-md"
                >
                  Edit
                </button>
                <button
                  onClick={() => setDeleteTarget(service)}
                  className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs rounded-md"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Service Modal (Section 3.7) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
          />

          <div className="relative bg-white rounded-xl shadow-soft-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto z-10 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingService ? 'Edit Service' : 'Add New Service'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              {/* Service Name */}
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Service Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Colour Document Photocopy"
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:border-[#1E5AA8] outline-none"
                />
              </div>

              {/* Category */}
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ServiceCategory)}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:border-[#1E5AA8] outline-none"
                >
                  <option value="Photocopy">Photocopy</option>
                  <option value="Printing">Printing</option>
                  <option value="SIM Cards">SIM Cards</option>
                  <option value="Packages">Packages</option>
                </select>
              </div>

              {/* Price Information */}
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Price Information *</label>
                <input
                  type="text"
                  required
                  value={priceInfo}
                  onChange={(e) => setPriceInfo(e.target.value)}
                  placeholder="e.g., From LKR 5.00 / page"
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:border-[#1E5AA8] outline-none"
                />
              </div>

              {/* Service Image URL */}
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Service Cover Image URL</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://images.unsplash.com/... or https://..."
                    className="flex-1 p-2.5 bg-white border border-gray-300 rounded-md text-xs text-gray-900 focus:border-[#1E5AA8] outline-none"
                  />
                  {image && (
                    <div className="w-10 h-10 rounded-md overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                      <img src={image} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              {/* Short Description */}
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Short Description *</label>
                <input
                  type="text"
                  required
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Summary for cards and teasers"
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:border-[#1E5AA8] outline-none"
                />
              </div>

              {/* Full Description */}
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Full Service Description</label>
                <textarea
                  rows={3}
                  value={fullDescription}
                  onChange={(e) => setFullDescription(e.target.value)}
                  placeholder="Detailed description for service detail page"
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:border-[#1E5AA8] outline-none"
                />
              </div>

              {/* Available Options (Newline separated) */}
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Available Service Items (One per line)</label>
                <textarea
                  rows={3}
                  value={availableListStr}
                  onChange={(e) => setAvailableListStr(e.target.value)}
                  placeholder="Black & White (A4)\nColour Photocopy\nDocument Scanning"
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-xs font-mono text-gray-900 focus:border-[#1E5AA8] outline-none"
                />
              </div>

              {/* Important Notes */}
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Important Customer Notes (One per line)</label>
                <textarea
                  rows={2}
                  value={notesStr}
                  onChange={(e) => setNotesStr(e.target.value)}
                  placeholder="Please bring clear originals for best results"
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-xs font-mono text-gray-900 focus:border-[#1E5AA8] outline-none"
                />
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
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

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-semibold text-gray-800 text-xs">Publish on Website</span>
                  <button
                    type="button"
                    onClick={() => setIsPublished(!isPublished)}
                    className={`px-3 py-1 rounded text-xs font-bold ${
                      isPublished ? 'bg-[#1E5AA8] text-white' : 'bg-gray-300 text-gray-700'
                    }`}
                  >
                    {isPublished ? 'Published' : 'Hidden'}
                  </button>
                </div>
              </div>

              {/* Modal Actions */}
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
                  {editingService ? 'Save Changes' : 'Create Service'}
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
        message="This action will remove the service from both the public website and the POS system catalog. This cannot be undone."
        confirmLabel="Delete Service"
        onConfirm={() => {
          if (deleteTarget) {
            deleteService(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />

    </div>
  );
};
