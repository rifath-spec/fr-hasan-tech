import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { 
  ArrowLeft, 
  DollarSign, 
  Save, 
  PlusCircle, 
  Check, 
  Calculator, 
  CreditCard, 
  User, 
  FileText,
  Smartphone,
  Copy,
  Printer,
  Package
} from 'lucide-react';
import { ServiceCategory, PaymentMethod } from '../../../types';

export const NewSaleForm: React.FC = () => {
  const { 
    navigate, 
    addTransaction, 
    services, 
    sims, 
    packages, 
    settings,
    quickSalePreset,
    clearQuickSalePreset
  } = useApp();

  // Form State
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState<string>(
    new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
  );

  const [category, setCategory] = useState<ServiceCategory>('Photocopy');
  const [subType, setSubType] = useState<string>('Black & White (A4)');
  const [quantity, setQuantity] = useState<number>(1);
  const [unitPrice, setUnitPrice] = useState<number>(5);
  const [manualTotalOverride, setManualTotalOverride] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [customerName, setCustomerName] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [selectedSimId, setSelectedSimId] = useState<string>('');

  // Handle pre-filled Quick Sale if user clicked 1-tap quick action
  useEffect(() => {
    if (quickSalePreset) {
      setCategory(quickSalePreset.category);
      setSubType(quickSalePreset.subType);
      setUnitPrice(quickSalePreset.unitPrice);
      setQuantity(1);
      setNotes(quickSalePreset.description);
      clearQuickSalePreset();
    }
  }, [quickSalePreset]);

  // Sub-type presets and default prices
  const photocopyOptions = [
    { name: 'Black & White (A4)', defaultPrice: 5 },
    { name: 'Colour (A4)', defaultPrice: 35 },
    { name: 'Black & White (A3)', defaultPrice: 15 },
    { name: 'Colour (A3)', defaultPrice: 70 },
    { name: 'Double-Sided B&W (A4)', defaultPrice: 8 },
    { name: 'Document Scanning (PDF)', defaultPrice: 10 },
  ];

  const printingOptions = [
    { name: 'Document Print B&W (A4)', defaultPrice: 10 },
    { name: 'Document Print Colour (A4)', defaultPrice: 40 },
    { name: 'Photo Print 4x6 Glossy', defaultPrice: 80 },
    { name: 'Photo Print A4 Glossy', defaultPrice: 250 },
    { name: 'Passport Photos (Set of 4)', defaultPrice: 200 },
    { name: 'A4 Document Lamination', defaultPrice: 70 },
  ];

  // When category changes, reset subType & price
  const handleCategoryChange = (newCat: ServiceCategory) => {
    setCategory(newCat);
    if (newCat === 'Photocopy') {
      setSubType(photocopyOptions[0].name);
      setUnitPrice(photocopyOptions[0].defaultPrice);
    } else if (newCat === 'Printing') {
      setSubType(printingOptions[0].name);
      setUnitPrice(printingOptions[0].defaultPrice);
    } else if (newCat === 'SIM Cards') {
      const avail = sims.find(s => s.status === 'Available');
      if (avail) {
        setSubType(`${avail.network} SIM (${avail.simNumber})`);
        setUnitPrice(avail.sellingPrice);
        setSelectedSimId(avail.id);
      } else {
        setSubType('Dialog 4G SIM');
        setUnitPrice(500);
      }
    } else if (newCat === 'Packages') {
      const firstPkg = packages[0];
      if (firstPkg) {
        setSubType(`${firstPkg.network} - ${firstPkg.name}`);
        setUnitPrice(firstPkg.price);
      } else {
        setSubType('Data Package Reload');
        setUnitPrice(990);
      }
    }
  };

  const handleSubTypeChange = (newSubType: string) => {
    setSubType(newSubType);
    if (category === 'Photocopy') {
      const opt = photocopyOptions.find(o => o.name === newSubType);
      if (opt) setUnitPrice(opt.defaultPrice);
    } else if (category === 'Printing') {
      const opt = printingOptions.find(o => o.name === newSubType);
      if (opt) setUnitPrice(opt.defaultPrice);
    } else if (category === 'SIM Cards') {
      const sim = sims.find(s => s.id === newSubType || `${s.network} SIM (${s.simNumber})` === newSubType);
      if (sim) {
        setUnitPrice(sim.sellingPrice);
        setSelectedSimId(sim.id);
      }
    } else if (category === 'Packages') {
      const pkg = packages.find(p => `${p.network} - ${p.name}` === newSubType || p.id === newSubType);
      if (pkg) {
        setUnitPrice(pkg.price);
      }
    }
  };

  // Calculated Total
  const calculatedTotal = quantity * unitPrice;
  const finalTotal = manualTotalOverride !== '' ? parseFloat(manualTotalOverride) || 0 : calculatedTotal;

  // Save Sale logic
  const handleSave = (addAnother: boolean = false) => {
    if (finalTotal <= 0) return;

    addTransaction({
      date,
      time,
      type: 'sale',
      category,
      subType,
      quantity,
      unitPrice,
      totalAmount: finalTotal,
      paymentMethod,
      customerName: customerName.trim() || 'Walk-in Customer',
      description: notes || `${category} - ${subType} (x${quantity})`,
      simCardId: category === 'SIM Cards' ? selectedSimId : undefined
    });

    if (addAnother) {
      // Reset form
      setQuantity(1);
      setManualTotalOverride('');
      setCustomerName('');
      setNotes('');
      setTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
    } else {
      navigate('/admin/pos');
    }
  };

  // Keyboard shortcut Ctrl+S / Cmd+S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [date, time, category, subType, quantity, unitPrice, finalTotal, paymentMethod, customerName, notes]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* 10.4 Page Header */}
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
            <h2 className="text-xl font-bold text-gray-900">Record New Sale</h2>
            <p className="text-xs text-gray-500">Log customer sale with itemized receipt calculation</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <span className="text-xs text-gray-400">Shortcut: <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded font-mono text-[10px]">Ctrl + S</kbd></span>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-soft-sm p-5 sm:p-7">
        <form onSubmit={(e) => { e.preventDefault(); handleSave(false); }} className="space-y-6">
          
          {/* Row 1: Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">
                Sale Date *
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
                Sale Time *
              </label>
              <input
                type="text"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="10:30 AM"
                className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:border-[#1E5AA8] outline-none font-mono"
              />
            </div>
          </div>

          {/* Row 2: Service Category */}
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">
              Service Category *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { cat: 'Photocopy', icon: Copy },
                { cat: 'Printing', icon: Printer },
                { cat: 'SIM Cards', icon: Smartphone },
                { cat: 'Packages', icon: Package }
              ].map(({ cat, icon: Icon }) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => handleCategoryChange(cat as ServiceCategory)}
                  className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-1.5 text-xs font-bold transition-all min-h-[60px] ${
                    category === cat
                      ? 'bg-blue-50 border-[#1E5AA8] text-[#1E5AA8] shadow-xs'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{cat}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Row 3: Service Sub-Type Selection (Dynamic based on Category) */}
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">
              Service Sub-Type / Item Selection *
            </label>

            {category === 'Photocopy' && (
              <select
                value={subType}
                onChange={(e) => handleSubTypeChange(e.target.value)}
                className="w-full p-3 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:border-[#1E5AA8] outline-none"
              >
                {photocopyOptions.map(opt => (
                  <option key={opt.name} value={opt.name}>
                    {opt.name} — LKR {opt.defaultPrice.toFixed(2)}
                  </option>
                ))}
              </select>
            )}

            {category === 'Printing' && (
              <select
                value={subType}
                onChange={(e) => handleSubTypeChange(e.target.value)}
                className="w-full p-3 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:border-[#1E5AA8] outline-none"
              >
                {printingOptions.map(opt => (
                  <option key={opt.name} value={opt.name}>
                    {opt.name} — LKR {opt.defaultPrice.toFixed(2)}
                  </option>
                ))}
              </select>
            )}

            {category === 'SIM Cards' && (
              <select
                value={subType}
                onChange={(e) => handleSubTypeChange(e.target.value)}
                className="w-full p-3 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:border-[#1E5AA8] outline-none"
              >
                {sims.filter(s => s.status === 'Available').map(sim => (
                  <option key={sim.id} value={`${sim.network} SIM (${sim.simNumber})`}>
                    {sim.network} 4G SIM — {sim.simNumber} (LKR {sim.sellingPrice})
                  </option>
                ))}
                <option value="Dialog 4G Standard SIM">Dialog 4G SIM (General) — LKR 500.00</option>
                <option value="Mobitel 4G Standard SIM">Mobitel 4G SIM (General) — LKR 500.00</option>
              </select>
            )}

            {category === 'Packages' && (
              <select
                value={subType}
                onChange={(e) => handleSubTypeChange(e.target.value)}
                className="w-full p-3 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:border-[#1E5AA8] outline-none"
              >
                {packages.map(pkg => (
                  <option key={pkg.id} value={`${pkg.network} - ${pkg.name}`}>
                    {pkg.network} — {pkg.name} (LKR {pkg.price.toFixed(2)})
                  </option>
                ))}
                <option value="Custom Reload">Custom Mobile Balance Reload</option>
              </select>
            )}
          </div>

          {/* Row 4: Quantity & Unit Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">
                Quantity *
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-sm font-mono text-gray-900 focus:border-[#1E5AA8] outline-none text-center font-bold"
                />
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded font-bold"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">
                Unit Price (LKR) *
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                required
                value={unitPrice}
                onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-sm font-mono text-gray-900 focus:border-[#1E5AA8] outline-none font-bold"
              />
            </div>
          </div>

          {/* Row 5: Total Amount Box (Calculated + Override option) */}
          <div className="p-4 rounded-xl bg-emerald-50/70 border-2 border-emerald-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                Total Payable Amount
              </span>
              <p className="text-xs text-emerald-700">
                Calculated: {quantity} × LKR {unitPrice.toFixed(2)} = LKR {calculatedTotal.toFixed(2)}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-2xl font-bold font-mono text-emerald-800 block">
                  LKR {finalTotal.toFixed(2)}
                </span>
                {manualTotalOverride && (
                  <span className="text-[10px] text-amber-700 font-semibold">(Manual Price Override)</span>
                )}
              </div>

              <input
                type="number"
                placeholder="Discount override"
                value={manualTotalOverride}
                onChange={(e) => setManualTotalOverride(e.target.value)}
                className="w-32 p-2 text-xs bg-white border border-emerald-300 rounded font-mono text-gray-800 placeholder:text-gray-400 outline-none"
                title="Optional manual total override"
              />
            </div>
          </div>

          {/* Row 6: Payment Method & Customer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">
                Payment Method *
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:border-[#1E5AA8] outline-none"
              >
                <option value="Cash">Cash (In-hand)</option>
                <option value="Card">Credit / Debit Card</option>
                <option value="Bank Transfer">Bank Transfer / Online</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">
                Customer Name / Phone (Optional)
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Walk-in customer"
                className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:border-[#1E5AA8] outline-none"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">
              Internal Sale Notes / Job Details (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Customer requested glossy paper finish"
              className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-xs text-gray-900 focus:border-[#1E5AA8] outline-none"
            />
          </div>

          {/* Form Actions (Section 10.4) */}
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
              className="w-full sm:w-auto px-6 py-3 rounded-md bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-sm shadow-soft-sm flex items-center justify-center gap-2 min-h-[44px] active-press"
            >
              <Save className="w-4 h-4" />
              <span>Save Sale (LKR {finalTotal.toFixed(2)})</span>
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};
