import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { 
  ServiceItem, 
  SIMCard, 
  MobilePackage, 
  POSTransaction, 
  ShopSettings, 
  ToastMessage,
  PaymentMethod
} from '../types';
import { 
  INITIAL_SETTINGS, 
  INITIAL_SERVICES, 
  INITIAL_SIMS, 
  INITIAL_PACKAGES, 
  INITIAL_TRANSACTIONS 
} from '../data/initialData';

interface AppContextType {
  // Navigation
  currentPath: string;
  navigate: (path: string) => void;
  
  // Auth
  isAdminAuthenticated: boolean;
  adminUser: { email: string; name: string; role: string } | null;
  loginAdmin: (email: string, pass: string) => boolean;
  logoutAdmin: () => void;
  resetAdminPassword: (newPass: string) => boolean;
  
  // Data State
  settings: ShopSettings;
  updateSettings: (newSettings: Partial<ShopSettings>) => void;
  resetToInitialData: () => void;
  
  services: ServiceItem[];
  addService: (service: Omit<ServiceItem, 'id'>) => void;
  updateService: (id: string, service: Partial<ServiceItem>) => void;
  deleteService: (id: string) => void;
  
  sims: SIMCard[];
  addSIM: (sim: Omit<SIMCard, 'id'>) => void;
  updateSIM: (id: string, sim: Partial<SIMCard>) => void;
  deleteSIM: (id: string) => void;
  
  packages: MobilePackage[];
  addPackage: (pkg: Omit<MobilePackage, 'id'>) => void;
  updatePackage: (id: string, pkg: Partial<MobilePackage>) => void;
  deletePackage: (id: string) => void;
  reorderPackages: (packages: MobilePackage[]) => void;
  
  transactions: POSTransaction[];
  addTransaction: (tx: Omit<POSTransaction, 'id' | 'createdAt' | 'updatedAt'>) => POSTransaction;
  updateTransaction: (id: string, tx: Partial<POSTransaction>) => void;
  deleteTransaction: (id: string) => void;
  
  // Toasts
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning', title?: string) => void;
  dismissToast: (id: string) => void;
  
  // Fast Quick Sale trigger
  triggerQuickSale: (category: string, subType: string, defaultPrice: number, desc: string) => void;
  quickSalePrefill: { category: string; subType: string; price: number; desc: string } | null;
  clearQuickSalePrefill: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEYS = {
  SETTINGS: 'frhasantech_settings_v3',
  SERVICES: 'frhasantech_services_v2',
  SIMS: 'frhasantech_sims_v2',
  PACKAGES: 'frhasantech_packages_v2',
  TRANSACTIONS: 'frhasantech_transactions_v2',
  AUTH: 'frhasantech_auth_v2',
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Navigation State
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace(/^#/, '');
      return hash || '/';
    }
    return '/';
  });

  // Auth State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH);
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const [adminUser] = useState({
    email: 'ceo@frhasantech.com',
    name: 'FR Hasan',
    role: 'Founder & CEO'
  });

  // Settings State
  const [settings, setSettings] = useState<ShopSettings>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.SETTINGS);
      return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  // Services State
  const [services, setServices] = useState<ServiceItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.SERVICES);
      if (saved) {
        const parsed: ServiceItem[] = JSON.parse(saved);
        // Merge image from initial services if missing or default
        return parsed.map(item => {
          const defaultMatch = INITIAL_SERVICES.find(init => init.slug === item.slug || init.id === item.id);
          if (defaultMatch && (!item.image || item.image.includes('unsplash'))) {
            return { ...item, image: defaultMatch.image };
          }
          return item;
        });
      }
      return INITIAL_SERVICES;
    } catch {
      return INITIAL_SERVICES;
    }
  });

  // SIM Cards State
  const [sims, setSims] = useState<SIMCard[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.SIMS);
      return saved ? JSON.parse(saved) : INITIAL_SIMS;
    } catch {
      return INITIAL_SIMS;
    }
  });

  // Packages State
  const [packages, setPackages] = useState<MobilePackage[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.PACKAGES);
      return saved ? JSON.parse(saved) : INITIAL_PACKAGES;
    } catch {
      return INITIAL_PACKAGES;
    }
  });

  // Transactions State
  const [transactions, setTransactions] = useState<POSTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.TRANSACTIONS);
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  // Toasts State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Quick Sale Prefill
  const [quickSalePrefill, setQuickSalePrefill] = useState<{ category: string; subType: string; price: number; desc: string } | null>(null);

  // Sync window hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#/, '');
      setCurrentPath(hash || '/');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (path: string) => {
    window.location.hash = path;
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Persist items
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.SERVICES, JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.SIMS, JSON.stringify(sims));
  }, [sims]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.PACKAGES, JSON.stringify(packages));
  }, [packages]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.AUTH, JSON.stringify(isAdminAuthenticated));
  }, [isAdminAuthenticated]);

  // Toast helper
  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success', title?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Auth methods
  const loginAdmin = (email: string, pass: string): boolean => {
    // Simple mock auth for client-side demo
    if (email && pass) {
      setIsAdminAuthenticated(true);
      showToast("Welcome back, Admin! Signed in successfully.", "success");
      return true;
    }
    showToast("Invalid email or password", "error");
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    showToast("Signed out successfully", "info");
    navigate('/admin/login');
  };

  const resetAdminPassword = (newPass: string): boolean => {
    if (newPass.length >= 8) {
      showToast("Password updated successfully! Please log in.", "success");
      return true;
    }
    showToast("Password does not meet criteria", "error");
    return false;
  };

  // Settings
  const updateSettings = (newSettings: Partial<ShopSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    showToast("Website and shop settings updated successfully", "success");
  };

  const resetToInitialData = () => {
    setSettings(INITIAL_SETTINGS);
    setServices(INITIAL_SERVICES);
    setSims(INITIAL_SIMS);
    setPackages(INITIAL_PACKAGES);
    setTransactions(INITIAL_TRANSACTIONS);
    localStorage.setItem(LOCAL_STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
    localStorage.setItem(LOCAL_STORAGE_KEYS.SERVICES, JSON.stringify(INITIAL_SERVICES));
    localStorage.setItem(LOCAL_STORAGE_KEYS.SIMS, JSON.stringify(INITIAL_SIMS));
    localStorage.setItem(LOCAL_STORAGE_KEYS.PACKAGES, JSON.stringify(INITIAL_PACKAGES));
    localStorage.setItem(LOCAL_STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
    showToast("All data successfully restored to FR HASAN TECH defaults", "info");
  };

  // Services CRUD
  const addService = (service: Omit<ServiceItem, 'id'>) => {
    const newService: ServiceItem = {
      ...service,
      id: `serv-${Date.now()}`
    };
    setServices(prev => [newService, ...prev]);
    showToast(`Service "${service.name}" created successfully`, "success");
  };

  const updateService = (id: string, updated: Partial<ServiceItem>) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, ...updated } : s));
    showToast("Service updated successfully", "success");
  };

  const deleteService = (id: string) => {
    const target = services.find(s => s.id === id);
    setServices(prev => prev.filter(s => s.id !== id));
    showToast(`Service "${target?.name || ''}" deleted`, "info");
  };

  // SIM Cards CRUD
  const addSIM = (sim: Omit<SIMCard, 'id'>) => {
    const newSim: SIMCard = {
      ...sim,
      id: `sim-${Date.now()}`
    };
    setSims(prev => [newSim, ...prev]);
    showToast(`SIM card ${sim.simNumber} added to inventory`, "success");
  };

  const updateSIM = (id: string, updated: Partial<SIMCard>) => {
    setSims(prev => prev.map(s => s.id === id ? { ...s, ...updated } : s));
    showToast("SIM details updated successfully", "success");
  };

  const deleteSIM = (id: string) => {
    setSims(prev => prev.filter(s => s.id !== id));
    showToast("SIM card removed from inventory", "info");
  };

  // Packages CRUD
  const addPackage = (pkg: Omit<MobilePackage, 'id'>) => {
    const newPkg: MobilePackage = {
      ...pkg,
      id: `pkg-${Date.now()}`
    };
    setPackages(prev => [...prev, newPkg]);
    showToast(`Package "${pkg.name}" added successfully`, "success");
  };

  const updatePackage = (id: string, updated: Partial<MobilePackage>) => {
    setPackages(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
    showToast("Package updated successfully", "success");
  };

  const deletePackage = (id: string) => {
    setPackages(prev => prev.filter(p => p.id !== id));
    showToast("Package deleted", "info");
  };

  const reorderPackages = (reordered: MobilePackage[]) => {
    setPackages(reordered.map((p, idx) => ({ ...p, displayOrder: idx + 1 })));
    showToast("Package order updated", "success");
  };

  // POS Transactions CRUD
  const addTransaction = (tx: Omit<POSTransaction, 'id' | 'createdAt' | 'updatedAt'>): POSTransaction => {
    const nowIso = new Date().toISOString();
    const newTx: POSTransaction = {
      ...tx,
      id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: nowIso,
      updatedAt: nowIso
    };
    setTransactions(prev => [newTx, ...prev]);
    
    // If it's a SIM card sale, mark corresponding SIM as Sold if found
    if (tx.type === 'sale' && tx.category === 'SIM Cards') {
      const matchingSim = sims.find(s => s.status === 'Available' && (tx.subType?.includes(s.network) || tx.description.includes(s.simNumber)));
      if (matchingSim) {
        setSims(prev => prev.map(s => s.id === matchingSim.id ? { ...s, status: 'Sold', soldDate: tx.date } : s));
      }
    }

    showToast(
      tx.type === 'sale' 
        ? `Sale recorded successfully — ${settings.posSettings.currencySymbol} ${tx.totalAmount.toLocaleString()}` 
        : `Expense recorded — ${settings.posSettings.currencySymbol} ${tx.totalAmount.toLocaleString()}`,
      tx.type === 'sale' ? 'success' : 'info'
    );

    return newTx;
  };

  const updateTransaction = (id: string, updated: Partial<POSTransaction>) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updated, updatedAt: new Date().toISOString() } : t));
    showToast("Transaction updated successfully", "success");
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    showToast("Transaction deleted", "info");
  };

  const triggerQuickSale = (category: string, subType: string, price: number, desc: string) => {
    setQuickSalePrefill({ category, subType, price, desc });
    navigate('/admin/pos/new-sale');
  };

  const clearQuickSalePrefill = () => {
    setQuickSalePrefill(null);
  };

  const value = useMemo(() => ({
    currentPath,
    navigate,
    isAdminAuthenticated,
    adminUser,
    loginAdmin,
    logoutAdmin,
    resetAdminPassword,
    settings,
    updateSettings,
    resetToInitialData,
    services,
    addService,
    updateService,
    deleteService,
    sims,
    addSIM,
    updateSIM,
    deleteSIM,
    packages,
    addPackage,
    updatePackage,
    deletePackage,
    reorderPackages,
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    toasts,
    showToast,
    dismissToast,
    triggerQuickSale,
    quickSalePrefill,
    clearQuickSalePrefill
  }), [
    currentPath,
    isAdminAuthenticated,
    adminUser,
    settings,
    services,
    sims,
    packages,
    transactions,
    toasts,
    quickSalePrefill
  ]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
