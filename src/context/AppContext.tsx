import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode, useCallback } from 'react';
import { 
  ServiceItem, 
  ServiceCategory,
  SIMCard, 
  MobilePackage, 
  POSTransaction, 
  ShopSettings, 
  ToastMessage,
  PaymentMethod,
  EstimateCategory,
  EstimateService,
  EstimateSize,
  EstimateItem,
  OfferItem,
  AdminUser
} from '../types';
import { 
  INITIAL_SETTINGS, 
  INITIAL_SERVICES, 
  INITIAL_SIMS, 
  INITIAL_PACKAGES, 
  INITIAL_TRANSACTIONS,
  INITIAL_ESTIMATE_CATEGORIES,
  INITIAL_ESTIMATE_SERVICES,
  INITIAL_ESTIMATE_SIZES,
  INITIAL_OFFERS
} from '../data/initialData';
import { 
  SupabaseService,
  mapServiceFromDB,
  mapSIMFromDB,
  mapPackageFromDB,
  mapTransactionFromDB,
  mapSettingsFromDB,
  mapEstimateCategoryFromDB,
  mapEstimateServiceFromDB,
  mapEstimateSizeFromDB,
  mapOfferFromDB,
  mapAdminUserFromDB
} from '../services/supabaseService';
import { supabase, isSupabaseConfigured, getSupabaseConfig, getActiveCredentials, reinitializeSupabase } from '../lib/supabase';

interface AppContextType {
  // Navigation
  currentPath: string;
  navigate: (path: string) => void;
  
  // Auth
  isAdminAuthenticated: boolean;
  adminUser: AdminUser | null;
  adminUsers: AdminUser[];
  loginAdmin: (email: string, pass: string) => Promise<boolean>;
  logoutAdmin: () => void;
  resetAdminPassword: (newPass: string) => Promise<boolean>;
  addAdminUser: (user: Omit<AdminUser, 'id'>) => Promise<void>;
  updateAdminUser: (id: string, user: Partial<AdminUser>) => Promise<void>;
  deleteAdminUser: (id: string) => Promise<void>;
  
  // Supabase Backend Status & Sync
  isSupabaseConnected: boolean;
  isLoadingData: boolean;
  refreshFromSupabase: () => Promise<void>;
  seedSupabaseDatabase: () => Promise<{ ok: boolean; message: string }>;
  updateSupabaseCredentials: (url: string, key: string) => Promise<{ ok: boolean; message: string; tables?: Record<string, number> }>;
  clearSupabaseCredentials: () => Promise<void>;
  
  // Data State
  settings: ShopSettings;
  updateSettings: (newSettings: Partial<ShopSettings>) => Promise<void>;
  resetToInitialData: () => Promise<void>;
  clearAllData: () => Promise<{ ok: boolean; message: string }>;
  clearServices: () => Promise<void>;
  clearPackages: () => Promise<void>;
  clearSims: () => Promise<void>;
  clearTransactions: () => Promise<void>;
  clearOffers: () => Promise<void>;
  
  services: ServiceItem[];
  addService: (service: Omit<ServiceItem, 'id'>) => Promise<void>;
  updateService: (id: string, service: Partial<ServiceItem>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  
  sims: SIMCard[];
  addSIM: (sim: Omit<SIMCard, 'id'>) => Promise<void>;
  updateSIM: (id: string, sim: Partial<SIMCard>) => Promise<void>;
  deleteSIM: (id: string) => Promise<void>;
  
  packages: MobilePackage[];
  addPackage: (pkg: Omit<MobilePackage, 'id'>) => Promise<void>;
  updatePackage: (id: string, pkg: Partial<MobilePackage>) => Promise<void>;
  deletePackage: (id: string) => Promise<void>;
  reorderPackages: (packages: MobilePackage[]) => Promise<void>;
  
  offers: OfferItem[];
  addOffer: (offer: Omit<OfferItem, 'id'>) => Promise<void>;
  updateOffer: (id: string, offer: Partial<OfferItem>) => Promise<void>;
  deleteOffer: (id: string) => Promise<void>;
  
  transactions: POSTransaction[];
  addTransaction: (tx: Omit<POSTransaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<POSTransaction>;
  updateTransaction: (id: string, tx: Partial<POSTransaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  // Estimate Calculator State & Operations
  estimateCategories: EstimateCategory[];
  estimateServices: EstimateService[];
  estimateSizes: EstimateSize[];
  isEstimateModalOpen: boolean;
  openEstimateModal: (initialCategoryId?: string) => void;
  closeEstimateModal: () => void;
  selectedEstimateCategory: string | null;
  setSelectedEstimateCategory: (categoryId: string | null) => void;
  
  addEstimateService: (service: Omit<EstimateService, 'id'>) => Promise<void>;
  updateEstimateService: (id: string, service: Partial<EstimateService>) => Promise<void>;
  deleteEstimateService: (id: string) => Promise<void>;
  
  addEstimateCategory: (category: Omit<EstimateCategory, 'id'>) => Promise<void>;
  updateEstimateCategory: (id: string, category: Partial<EstimateCategory>) => Promise<void>;
  deleteEstimateCategory: (id: string) => Promise<void>;

  addEstimateSize: (size: Omit<EstimateSize, 'id'>) => Promise<void>;
  updateEstimateSize: (id: string, size: Partial<EstimateSize>) => Promise<void>;
  deleteEstimateSize: (id: string) => Promise<void>;
  seedEstimateDatabase: () => Promise<{ ok: boolean; message: string }>;
  
  // Toasts
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning', title?: string) => void;
  dismissToast: (id: string) => void;
  
  // Fast Quick Sale trigger
  triggerQuickSale: (category: string, subType: string, defaultPrice: number, desc: string) => void;
  quickSalePrefill: { category: string; subType: string; price: number; desc: string } | null;
  clearQuickSalePrefill: () => void;
  quickSalePreset: { category: ServiceCategory; subType: string; unitPrice: number; description: string } | null;
  clearQuickSalePreset: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const getInitialPath = (): string => {
  try {
    if (typeof window !== 'undefined') {
      if (window.location.hash) {
        const hashPath = window.location.hash.replace(/^#/, '');
        if (hashPath) {
          const cleanPath = hashPath.startsWith('/') ? hashPath : `/${hashPath}`;
          window.history.replaceState(null, '', cleanPath);
          return cleanPath;
        }
      }
      return (window.location.pathname + window.location.search) || '/';
    }
  } catch {
    // fallback
  }
  return '/';
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Navigation State
  const [currentPath, setCurrentPath] = useState<string>(getInitialPath);

  // Database-backed Admin Users & Authentication State
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('fr_hasan_admin_users');
        if (saved) return JSON.parse(saved);
      }
    } catch {}
    return [
      {
        id: 'user-founder-001',
        email: 'admin@frhasantech.com',
        name: 'FR Hasan',
        role: 'Super-Admin',
        phone: '076 859 7800',
        isActive: true,
        password: 'admin123'
      },
      {
        id: 'user-founder-002',
        email: 'ceo@frhasantech.com',
        name: 'FR Hasan (Founder & CEO)',
        role: 'Super-Admin',
        phone: '076 859 7800',
        isActive: true,
        password: 'admin123'
      }
    ];
  });

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined') {
        return localStorage.getItem('fr_hasan_is_admin_auth') === 'true';
      }
    } catch {}
    return false;
  });

  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('fr_hasan_current_admin');
        if (saved) return JSON.parse(saved);
      }
    } catch {}
    return {
      id: 'user-founder-001',
      email: 'admin@frhasantech.com',
      name: 'FR Hasan',
      role: 'Super-Admin',
      phone: '076 859 7800',
      isActive: true
    };
  });

  // Supabase connection & loading state
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(getActiveCredentials().isConfigured);

  // Core Data States (Synchronized directly with Supabase PostgreSQL backend)
  const [settings, setSettings] = useState<ShopSettings>(INITIAL_SETTINGS);
  const [services, setServices] = useState<ServiceItem[]>(INITIAL_SERVICES);
  const [sims, setSims] = useState<SIMCard[]>(INITIAL_SIMS);
  const [packages, setPackages] = useState<MobilePackage[]>(INITIAL_PACKAGES);
  const [offers, setOffers] = useState<OfferItem[]>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('fr_hasan_offers_cache');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            const dummyIds = [
              'offer-business-starter-pack',
              'offer-print-starter-bundle',
              'offer-pc-windows-clean-setup',
              'offer-sim-unlimited-combo',
              'offer-student-thesis-print-bundle'
            ];
            const clean = parsed.filter(o => !dummyIds.includes(o.id));
            localStorage.setItem('fr_hasan_offers_cache', JSON.stringify(clean));
            return clean;
          }
        }
      }
    } catch {}
    return INITIAL_OFFERS;
  });
  const [transactions, setTransactions] = useState<POSTransaction[]>(INITIAL_TRANSACTIONS);

  // Estimate Calculator States (Synchronized with Supabase)
  const [estimateCategories, setEstimateCategories] = useState<EstimateCategory[]>(INITIAL_ESTIMATE_CATEGORIES);
  const [estimateServices, setEstimateServices] = useState<EstimateService[]>(INITIAL_ESTIMATE_SERVICES);
  const [estimateSizes, setEstimateSizes] = useState<EstimateSize[]>(INITIAL_ESTIMATE_SIZES);
  const [isEstimateModalOpen, setIsEstimateModalOpen] = useState<boolean>(false);
  const [selectedEstimateCategory, setSelectedEstimateCategory] = useState<string | null>(null);

  const openEstimateModal = useCallback((initialCategoryId?: string) => {
    if (initialCategoryId) {
      setSelectedEstimateCategory(initialCategoryId);
    }
    setIsEstimateModalOpen(true);
  }, []);

  const closeEstimateModal = useCallback(() => {
    setIsEstimateModalOpen(false);
  }, []);

  // Toasts State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Quick Sale Prefill
  const [quickSalePrefill, setQuickSalePrefill] = useState<{ category: string; subType: string; price: number; desc: string } | null>(null);

  // Toast helper
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success', title?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Sync browser back/forward history navigation cleanly
  useEffect(() => {
    const handlePopState = () => {
      try {
        const path = (window.location.pathname + window.location.search) || '/';
        setCurrentPath(path);
      } catch {
        // Safe fallback
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((path: string) => {
    try {
      const cleanPath = path.startsWith('/') ? path : `/${path}`;
      if (typeof window !== 'undefined') {
        const currentFull = (window.location.pathname + window.location.search) || '/';
        if (currentFull !== cleanPath) {
          window.history.pushState(null, '', cleanPath);
        }
        window.scrollTo(0, 0);
      }
      setCurrentPath(cleanPath);
    } catch {
      setCurrentPath(path);
    }
  }, []);

  // Fetch data guard refs to prevent infinite / rapid refetching on mobile tab switches or window focus
  const isFetchingRef = React.useRef(false);
  const lastFetchTimeRef = React.useRef(0);

  // Fetch all initial data from Supabase backend on load
  const loadDataFromSupabase = useCallback(async (force = false) => {
    if (!getActiveCredentials().isConfigured) {
      setIsLoadingData(false);
      return;
    }

    const now = Date.now();
    // Throttle to at most once every 4 seconds unless forced
    if (!force && (isFetchingRef.current || (now - lastFetchTimeRef.current < 4000))) {
      return;
    }

    try {
      isFetchingRef.current = true;
      lastFetchTimeRef.current = now;
      setIsLoadingData(true);

      const [
        dbSettings, 
        dbServices, 
        dbSims, 
        dbPackages, 
        dbOffers,
        dbTransactions,
        dbEstCategories,
        dbEstServices,
        dbEstSizes,
        dbAdminUsers
      ] = await Promise.all([
        SupabaseService.getSettings(),
        SupabaseService.getServices(),
        SupabaseService.getSIMs(),
        SupabaseService.getPackages(),
        SupabaseService.getOffers(),
        SupabaseService.getTransactions(),
        SupabaseService.getEstimateCategories(),
        SupabaseService.getEstimateServices(),
        SupabaseService.getEstimateSizes(),
        SupabaseService.getAdminUsers(),
      ]);

      if (dbSettings) {
        setSettings(dbSettings);
      }
      if (dbServices !== null) {
        if (dbServices.length === 0) {
          setServices(INITIAL_SERVICES);
          if (getActiveCredentials().isConfigured) {
            INITIAL_SERVICES.forEach(s => {
              SupabaseService.createService(s).catch(err => {
                console.warn('Background service sync notice:', err);
              });
            });
          }
        } else {
          // Deduplicate dbServices by id and slug
          const seenIds = new Set<string>();
          const seenSlugs = new Set<string>();
          const uniqueDbServices: ServiceItem[] = [];

          dbServices.forEach(s => {
            const idKey = s.id ? String(s.id).trim() : '';
            const slugKey = (s.slug || '').trim().toLowerCase();
            if (idKey && seenIds.has(idKey)) return;
            if (slugKey && seenSlugs.has(slugKey)) return;
            if (idKey) seenIds.add(idKey);
            if (slugKey) seenSlugs.add(slugKey);
            uniqueDbServices.push(s);
          });

          // Keep existing services and non-destructively merge any missing default services
          const missingDefaults = INITIAL_SERVICES.filter(s => {
            const sSlug = (s.slug || '').trim().toLowerCase();
            const sId = (s.id || '').trim();
            return !seenSlugs.has(sSlug) && !seenIds.has(sId);
          });

          if (missingDefaults.length > 0) {
            const merged = [...uniqueDbServices, ...missingDefaults];
            setServices(merged);
            if (getActiveCredentials().isConfigured) {
              missingDefaults.forEach(s => {
                SupabaseService.createService(s).catch(err => {
                  console.warn('Background service sync notice:', err);
                });
              });
            }
          } else {
            setServices(uniqueDbServices);
          }
        }
      }
      if (dbSims !== null) {
        setSims(dbSims);
      }
      if (dbPackages !== null) {
        setPackages(dbPackages);
      }
      if (dbOffers !== null && dbOffers.length > 0) {
        setOffers(dbOffers);
      }
      if (dbTransactions !== null) {
        setTransactions(dbTransactions);
      }
      if (dbEstCategories !== null && dbEstCategories.length > 0) {
        setEstimateCategories(dbEstCategories);
      }
      if (dbEstServices !== null && dbEstServices.length > 0) {
        setEstimateServices(dbEstServices);
      }
      if (dbEstSizes !== null && dbEstSizes.length > 0) {
        setEstimateSizes(dbEstSizes);
      }
      if (dbAdminUsers !== null && dbAdminUsers.length > 0) {
        setAdminUsers(dbAdminUsers);
        if (typeof window !== 'undefined') {
          localStorage.setItem('fr_hasan_admin_users', JSON.stringify(dbAdminUsers));
        }
      }

      setIsSupabaseConnected(true);
    } catch (error) {
      console.warn('Could not fetch data from Supabase:', error);
      setIsSupabaseConnected(false);
    } finally {
      setIsLoadingData(false);
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    loadDataFromSupabase();

    // 1. Re-sync immediately when tab/window becomes active or focused
    const handleVisibilityOrFocus = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        loadDataFromSupabase();
      }
    };
    window.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);

    // 2. Setup Supabase Realtime subscription for instant multi-device synchronization
    let channel: any = null;
    try {
      if (getActiveCredentials().isConfigured) {
        channel = supabase
          .channel('fr-hasan-realtime-catalog-sync')
          // A. Services table real-time changes
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'services' },
            (payload) => {
              if (payload.eventType === 'INSERT') {
                const newServ = mapServiceFromDB(payload.new);
                setServices(prev => {
                  if (prev.some(s => s.id === newServ.id)) {
                    return prev.map(s => s.id === newServ.id ? newServ : s);
                  }
                  return [newServ, ...prev];
                });
              } else if (payload.eventType === 'UPDATE') {
                const updatedServ = mapServiceFromDB(payload.new);
                setServices(prev => prev.map(s => s.id === updatedServ.id ? updatedServ : s));
              } else if (payload.eventType === 'DELETE') {
                const deletedId = String(payload.old?.id);
                setServices(prev => prev.filter(s => s.id !== deletedId));
              }
            }
          )
          // B. Shop Settings real-time changes (Shop Name, hero, contact, opening hours, etc.)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'shop_settings' },
            (payload) => {
              if (payload.new) {
                const updatedSettings = mapSettingsFromDB(payload.new);
                setSettings(updatedSettings);
              }
            }
          )
          // C. SIM Cards table real-time changes
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'sim_cards' },
            (payload) => {
              if (payload.eventType === 'INSERT') {
                const newSim = mapSIMFromDB(payload.new);
                setSims(prev => {
                  if (prev.some(s => s.id === newSim.id)) {
                    return prev.map(s => s.id === newSim.id ? newSim : s);
                  }
                  return [newSim, ...prev];
                });
              } else if (payload.eventType === 'UPDATE') {
                const updatedSim = mapSIMFromDB(payload.new);
                setSims(prev => prev.map(s => s.id === updatedSim.id ? updatedSim : s));
              } else if (payload.eventType === 'DELETE') {
                const deletedId = String(payload.old?.id);
                setSims(prev => prev.filter(s => s.id !== deletedId));
              }
            }
          )
          // D. Mobile Packages table real-time changes
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'mobile_packages' },
            (payload) => {
              if (payload.eventType === 'INSERT') {
                const newPkg = mapPackageFromDB(payload.new);
                setPackages(prev => {
                  if (prev.some(p => p.id === newPkg.id)) {
                    return prev.map(p => p.id === newPkg.id ? newPkg : p);
                  }
                  return [...prev, newPkg].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
                });
              } else if (payload.eventType === 'UPDATE') {
                const updatedPkg = mapPackageFromDB(payload.new);
                setPackages(prev => 
                  prev.map(p => p.id === updatedPkg.id ? updatedPkg : p)
                      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                );
              } else if (payload.eventType === 'DELETE') {
                const deletedId = String(payload.old?.id);
                setPackages(prev => prev.filter(p => p.id !== deletedId));
              }
            }
          )
          // E. POS Transactions table real-time changes
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'pos_transactions' },
            (payload) => {
              if (payload.eventType === 'INSERT') {
                const newTx = mapTransactionFromDB(payload.new);
                setTransactions(prev => {
                  if (prev.some(t => t.id === newTx.id)) {
                    return prev.map(t => t.id === newTx.id ? newTx : t);
                  }
                  return [newTx, ...prev];
                });
              } else if (payload.eventType === 'UPDATE') {
                const updatedTx = mapTransactionFromDB(payload.new);
                setTransactions(prev => prev.map(t => t.id === updatedTx.id ? updatedTx : t));
              } else if (payload.eventType === 'DELETE') {
                const deletedId = String(payload.old?.id);
                setTransactions(prev => prev.filter(t => t.id !== deletedId));
              }
            }
          )
          // F. Estimate Categories real-time changes
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'estimate_categories' },
            (payload) => {
              if (payload.eventType === 'INSERT') {
                const newCat = mapEstimateCategoryFromDB(payload.new);
                setEstimateCategories(prev => {
                  if (prev.some(c => c.id === newCat.id)) {
                    return prev.map(c => c.id === newCat.id ? newCat : c);
                  }
                  return [...prev, newCat].sort((a, b) => a.sortOrder - b.sortOrder);
                });
              } else if (payload.eventType === 'UPDATE') {
                const updatedCat = mapEstimateCategoryFromDB(payload.new);
                setEstimateCategories(prev => 
                  prev.map(c => c.id === updatedCat.id ? updatedCat : c)
                      .sort((a, b) => a.sortOrder - b.sortOrder)
                );
              } else if (payload.eventType === 'DELETE') {
                const deletedId = String(payload.old?.id);
                setEstimateCategories(prev => prev.filter(c => c.id !== deletedId));
              }
            }
          )
          // G. Estimate Services real-time changes
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'estimate_services' },
            (payload) => {
              if (payload.eventType === 'INSERT') {
                const newServ = mapEstimateServiceFromDB(payload.new);
                setEstimateServices(prev => {
                  if (prev.some(s => s.id === newServ.id)) {
                    return prev.map(s => s.id === newServ.id ? newServ : s);
                  }
                  return [...prev, newServ].sort((a, b) => a.sortOrder - b.sortOrder);
                });
              } else if (payload.eventType === 'UPDATE') {
                const updatedServ = mapEstimateServiceFromDB(payload.new);
                setEstimateServices(prev => 
                  prev.map(s => s.id === updatedServ.id ? updatedServ : s)
                      .sort((a, b) => a.sortOrder - b.sortOrder)
                );
              } else if (payload.eventType === 'DELETE') {
                const deletedId = String(payload.old?.id);
                setEstimateServices(prev => prev.filter(s => s.id !== deletedId));
              }
            }
          )
          // H. Estimate Sizes real-time changes
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'estimate_sizes' },
            (payload) => {
              if (payload.eventType === 'INSERT') {
                const newSize = mapEstimateSizeFromDB(payload.new);
                setEstimateSizes(prev => {
                  if (prev.some(s => s.id === newSize.id)) {
                    return prev.map(s => s.id === newSize.id ? newSize : s);
                  }
                  return [...prev, newSize].sort((a, b) => a.sortOrder - b.sortOrder);
                });
              } else if (payload.eventType === 'UPDATE') {
                const updatedSize = mapEstimateSizeFromDB(payload.new);
                setEstimateSizes(prev => 
                  prev.map(s => s.id === updatedSize.id ? updatedSize : s)
                      .sort((a, b) => a.sortOrder - b.sortOrder)
                );
              } else if (payload.eventType === 'DELETE') {
                const deletedId = String(payload.old?.id);
                setEstimateSizes(prev => prev.filter(s => s.id !== deletedId));
              }
            }
          )
          // I. Offers table real-time changes
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'offers' },
            (payload) => {
              if (payload.eventType === 'INSERT') {
                const newOffer = mapOfferFromDB(payload.new);
                setOffers(prev => {
                  if (prev.some(o => o.id === newOffer.id)) {
                    return prev.map(o => o.id === newOffer.id ? newOffer : o);
                  }
                  return [newOffer, ...prev].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
                });
              } else if (payload.eventType === 'UPDATE') {
                const updatedOffer = mapOfferFromDB(payload.new);
                setOffers(prev => 
                  prev.map(o => o.id === updatedOffer.id ? updatedOffer : o)
                      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                );
              } else if (payload.eventType === 'DELETE') {
                const deletedId = String(payload.old?.id);
                setOffers(prev => prev.filter(o => o.id !== deletedId));
              }
            }
          )
          // J. Admin Users table real-time changes
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'admin_users' },
            (payload) => {
              if (payload.eventType === 'INSERT') {
                const newUser = mapAdminUserFromDB(payload.new);
                setAdminUsers(prev => {
                  if (prev.some(u => u.id === newUser.id)) {
                    return prev.map(u => u.id === newUser.id ? newUser : u);
                  }
                  return [...prev, newUser];
                });
              } else if (payload.eventType === 'UPDATE') {
                const updatedUser = mapAdminUserFromDB(payload.new);
                setAdminUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
                setAdminUser(current => current && current.id === updatedUser.id ? updatedUser : current);
              } else if (payload.eventType === 'DELETE') {
                const deletedId = String(payload.old?.id);
                setAdminUsers(prev => prev.filter(u => u.id !== deletedId));
              }
            }
          )
          // K. Catch-all for schema or general mutations
          .on(
            'postgres_changes',
            { event: '*', schema: 'public' },
            () => {
              // Safety catch-all to ensure complete sync
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              setIsSupabaseConnected(true);
            }
          });
      }
    } catch (e) {
      console.warn('Could not initialize Supabase Realtime channel:', e);
    }

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch {
          // ignore
        }
      }
    };
  }, [loadDataFromSupabase]);

  // Auth methods (Database-backed with Supabase & local fallback)
  const loginAdmin = async (email: string, pass: string): Promise<boolean> => {
    const trimmedEmail = email.trim().toLowerCase();
    
    // First try authenticating against Supabase admin_users table
    try {
      const authResult = await SupabaseService.authenticateAdminUser(trimmedEmail, pass);
      if (authResult.success && authResult.user) {
        setIsAdminAuthenticated(true);
        setAdminUser(authResult.user);
        if (typeof window !== 'undefined') {
          localStorage.setItem('fr_hasan_is_admin_auth', 'true');
          localStorage.setItem('fr_hasan_current_admin', JSON.stringify(authResult.user));
        }
        showToast(`Welcome back, ${authResult.user.name}! Signed in successfully.`, 'success');
        return true;
      }
      
      // If table is unconfigured or fallback needed, check local state
      const localMatch = adminUsers.find(
        u => u.email.toLowerCase() === trimmedEmail && u.password && u.password === pass
      );
      if (localMatch) {
        if (!localMatch.isActive) {
          showToast('This account has been deactivated. Please contact the administrator.', 'error');
          return false;
        }
        setIsAdminAuthenticated(true);
        setAdminUser(localMatch);
        if (typeof window !== 'undefined') {
          localStorage.setItem('fr_hasan_is_admin_auth', 'true');
          localStorage.setItem('fr_hasan_current_admin', JSON.stringify(localMatch));
        }
        showToast(`Welcome back, ${localMatch.name}!`, 'success');
        return true;
      }

      showToast(authResult.error || 'Invalid email or password', 'error');
      return false;
    } catch (err: any) {
      console.warn('Login error:', err);
      showToast('Authentication failed. Please verify your credentials.', 'error');
      return false;
    }
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('fr_hasan_is_admin_auth');
      localStorage.removeItem('fr_hasan_current_admin');
    }
    showToast("Signed out successfully", "info");
    navigate('/admin/login');
  };

  const resetAdminPassword = async (newPass: string): Promise<boolean> => {
    if (newPass.length < 6) {
      showToast("Password must be at least 6 characters", "error");
      return false;
    }
    const currentEmail = adminUser?.email || 'admin@frhasantech.com';
    try {
      const res = await SupabaseService.updateAdminPassword(currentEmail, newPass);
      // Update local state and cache
      setAdminUsers(prev => prev.map(u => u.email.toLowerCase() === currentEmail.toLowerCase() ? { ...u, password: newPass } : u));
      if (adminUser) {
        const updated = { ...adminUser, password: newPass };
        setAdminUser(updated);
        if (typeof window !== 'undefined') {
          localStorage.setItem('fr_hasan_current_admin', JSON.stringify(updated));
        }
      }
      if (res.ok) {
        showToast("Password updated in database! Please log in with your new password.", "success");
      } else {
        showToast(`Password updated locally. Notice: ${res.error}`, "info");
      }
      return true;
    } catch (err: any) {
      showToast(err?.message || "Failed to update password", "error");
      return false;
    }
  };

  const addAdminUser = async (user: Omit<AdminUser, 'id'>) => {
    const id = `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newUser: AdminUser = {
      ...user,
      id,
      email: user.email.trim().toLowerCase(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setAdminUsers(prev => {
      const updated = [...prev, newUser];
      if (typeof window !== 'undefined') {
        localStorage.setItem('fr_hasan_admin_users', JSON.stringify(updated));
      }
      return updated;
    });
    if (getActiveCredentials().isConfigured) {
      await SupabaseService.saveAdminUser(newUser);
    }
    showToast(`Staff account created for ${newUser.name}`, 'success');
  };

  const updateAdminUser = async (id: string, updates: Partial<AdminUser>) => {
    setAdminUsers(prev => {
      const updated = prev.map(u => u.id === id ? { ...u, ...updates, updatedAt: new Date().toISOString() } : u);
      if (typeof window !== 'undefined') {
        localStorage.setItem('fr_hasan_admin_users', JSON.stringify(updated));
      }
      return updated;
    });
    if (adminUser?.id === id) {
      const updatedCurrent = { ...adminUser, ...updates };
      setAdminUser(updatedCurrent);
      if (typeof window !== 'undefined') {
        localStorage.setItem('fr_hasan_current_admin', JSON.stringify(updatedCurrent));
      }
    }
    if (getActiveCredentials().isConfigured) {
      await SupabaseService.saveAdminUser({ id, ...updates });
    }
    showToast('User account updated successfully', 'success');
  };

  const deleteAdminUser = async (id: string) => {
    if (adminUsers.length <= 1) {
      showToast('Cannot delete the last administrator account', 'error');
      return;
    }
    setAdminUsers(prev => {
      const updated = prev.filter(u => u.id !== id);
      if (typeof window !== 'undefined') {
        localStorage.setItem('fr_hasan_admin_users', JSON.stringify(updated));
      }
      return updated;
    });
    if (getActiveCredentials().isConfigured) {
      await SupabaseService.deleteAdminUser(id);
    }
    showToast('User account removed', 'info');
  };

  // 1. Settings CRUD with Supabase persistence
  const updateSettings = async (newSettings: Partial<ShopSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);

    if (getActiveCredentials().isConfigured) {
      const res = await SupabaseService.saveSettings(updated);
      if (res.ok) {
        showToast("Settings saved to Supabase successfully!", "success");
      } else {
        showToast(`Supabase save error: ${res.error || 'Failed to save'}`, "error");
      }
    } else {
      showToast("Settings updated locally (Supabase credentials not configured in environment)", "warning");
    }
  };

  const resetToInitialData = async () => {
    setSettings(INITIAL_SETTINGS);
    setServices(INITIAL_SERVICES);
    setSims(INITIAL_SIMS);
    setPackages(INITIAL_PACKAGES);
    setOffers(INITIAL_OFFERS);
    setTransactions(INITIAL_TRANSACTIONS);
    setEstimateCategories(INITIAL_ESTIMATE_CATEGORIES);
    setEstimateServices(INITIAL_ESTIMATE_SERVICES);
    setEstimateSizes(INITIAL_ESTIMATE_SIZES);

    if (getActiveCredentials().isConfigured) {
      const res = await SupabaseService.seedInitialDataToSupabase({
        settings: INITIAL_SETTINGS,
        services: INITIAL_SERVICES,
        sims: INITIAL_SIMS,
        packages: INITIAL_PACKAGES,
        offers: INITIAL_OFFERS,
        transactions: INITIAL_TRANSACTIONS,
      });
      await SupabaseService.seedEstimateData({
        categories: INITIAL_ESTIMATE_CATEGORIES,
        services: INITIAL_ESTIMATE_SERVICES,
        sizes: INITIAL_ESTIMATE_SIZES,
      });
      showToast(res.message, res.ok ? "success" : "warning");
    } else {
      showToast("Store state reset to default templates", "info");
    }
  };

  // Clear all catalog & dummy data from state & database
  const clearAllData = async (): Promise<{ ok: boolean; message: string }> => {
    setServices([]);
    setSims([]);
    setPackages([]);
    setOffers([]);
    setTransactions([]);

    if (getActiveCredentials().isConfigured) {
      const res = await SupabaseService.clearAllCatalogData();
      showToast(res.message, res.ok ? "success" : "error");
      return res;
    } else {
      const msg = "All services, packages, offers, and SIM inventory cleared locally.";
      showToast(msg, "info");
      return { ok: true, message: msg };
    }
  };

  const clearServices = async () => {
    setServices([]);
    if (getActiveCredentials().isConfigured) {
      const res = await SupabaseService.clearServicesTable();
      showToast(res.message, res.ok ? "success" : "error");
    } else {
      showToast("All services cleared locally", "info");
    }
  };

  const clearPackages = async () => {
    setPackages([]);
    if (getActiveCredentials().isConfigured) {
      const res = await SupabaseService.clearPackagesTable();
      showToast(res.message, res.ok ? "success" : "error");
    } else {
      showToast("All packages cleared locally", "info");
    }
  };

  const clearOffers = async () => {
    setOffers([]);
    if (getActiveCredentials().isConfigured) {
      const res = await SupabaseService.clearOffersTable();
      showToast(res.message, res.ok ? "success" : "error");
    } else {
      showToast("All offers cleared locally", "info");
    }
  };

  const clearSims = async () => {
    setSims([]);
    if (getActiveCredentials().isConfigured) {
      const res = await SupabaseService.clearSimsTable();
      showToast(res.message, res.ok ? "success" : "error");
    } else {
      showToast("All SIMs cleared locally", "info");
    }
  };

  const clearTransactions = async () => {
    setTransactions([]);
    if (getActiveCredentials().isConfigured) {
      const res = await SupabaseService.clearTransactionsTable();
      showToast(res.message, res.ok ? "success" : "error");
    } else {
      showToast("All transactions cleared locally", "info");
    }
  };

  const seedSupabaseDatabase = async () => {
    if (!getActiveCredentials().isConfigured) {
      return { ok: false, message: 'Supabase credentials are not configured in environment' };
    }
    const res = await SupabaseService.seedInitialDataToSupabase({
      settings,
      services,
      sims,
      packages,
      offers,
      transactions,
    });
    if (res.ok) {
      await loadDataFromSupabase();
    }
    return res;
  };

  const updateSupabaseCredentials = async (url: string, key: string): Promise<{ ok: boolean; message: string; tables?: Record<string, number> }> => {
    try {
      reinitializeSupabase(url, key);
      const testRes = await SupabaseService.testConnection();
      if (testRes.ok) {
        setIsSupabaseConnected(true);
        await loadDataFromSupabase();
        showToast("Supabase connected & verified successfully!", "success");
      } else {
        setIsSupabaseConnected(false);
        showToast(`Supabase connection failed: ${testRes.message}`, "error");
      }
      return testRes;
    } catch (err: any) {
      setIsSupabaseConnected(false);
      const msg = err?.message || "Failed to initialize Supabase client";
      showToast(msg, "error");
      return { ok: false, message: msg };
    }
  };

  const clearSupabaseCredentials = async () => {
    reinitializeSupabase("", "");
    setIsSupabaseConnected(false);
    showToast("Custom Supabase credentials cleared. Using local fallback.", "info");
  };

  // 2. Services CRUD with Supabase
  const addService = async (service: Omit<ServiceItem, 'id'>) => {
    const tempId = `serv-${Date.now()}`;
    const newService: ServiceItem = { ...service, id: tempId };
    
    // Optimistic UI update
    setServices(prev => [newService, ...prev]);

    if (getActiveCredentials().isConfigured) {
      const res = await SupabaseService.createService(service);
      if (res.ok && res.data) {
        setServices(prev => prev.map(s => s.id === tempId ? res.data! : s));
        showToast(`Service "${service.name}" saved to Supabase!`, "success");
        return;
      } else {
        showToast(`Supabase save error: ${res.error || 'Failed to insert'}`, "error");
        return;
      }
    }
    showToast(`Service "${service.name}" saved locally (Supabase not configured in .env)`, "warning");
  };

  const updateService = async (id: string, updated: Partial<ServiceItem>) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, ...updated } : s));

    if (getActiveCredentials().isConfigured) {
      const res = await SupabaseService.updateService(id, updated);
      if (res.ok) {
        showToast("Service updated in Supabase", "success");
      } else {
        showToast(`Supabase update error: ${res.error || 'Failed to update'}`, "error");
      }
    } else {
      showToast("Service updated locally", "info");
    }
  };

  const deleteService = async (id: string) => {
    const target = services.find(s => s.id === id);
    setServices(prev => prev.filter(s => s.id !== id));

    if (getActiveCredentials().isConfigured) {
      const res = await SupabaseService.deleteService(id);
      if (res.ok) {
        showToast(`Service "${target?.name || ''}" deleted from Supabase`, "info");
      } else {
        showToast(`Supabase delete error: ${res.error || 'Failed to delete'}`, "error");
      }
    } else {
      showToast(`Service "${target?.name || ''}" deleted`, "info");
    }
  };

  // 3. SIM Cards CRUD with Supabase
  const addSIM = async (sim: Omit<SIMCard, 'id'>) => {
    const tempId = `sim-${Date.now()}`;
    const newSim: SIMCard = { ...sim, id: tempId };

    setSims(prev => [newSim, ...prev]);

    if (getActiveCredentials().isConfigured) {
      const res = await SupabaseService.createSIM(sim);
      if (res.ok && res.data) {
        setSims(prev => prev.map(s => s.id === tempId ? res.data! : s));
        showToast(`SIM ${sim.simNumber} saved to Supabase!`, "success");
        return;
      } else {
        showToast(`Supabase save error: ${res.error || 'Failed to insert'}`, "error");
        return;
      }
    }
    showToast(`SIM card ${sim.simNumber} added locally (Supabase not configured in .env)`, "warning");
  };

  const updateSIM = async (id: string, updated: Partial<SIMCard>) => {
    setSims(prev => prev.map(s => s.id === id ? { ...s, ...updated } : s));

    if (getActiveCredentials().isConfigured) {
      const res = await SupabaseService.updateSIM(id, updated);
      if (res.ok) {
        showToast("SIM details updated in Supabase", "success");
      } else {
        showToast(`Supabase update error: ${res.error || 'Failed to update'}`, "error");
      }
    } else {
      showToast("SIM details updated locally", "info");
    }
  };

  const deleteSIM = async (id: string) => {
    setSims(prev => prev.filter(s => s.id !== id));

    if (getActiveCredentials().isConfigured) {
      const res = await SupabaseService.deleteSIM(id);
      if (res.ok) {
        showToast("SIM card removed from Supabase", "info");
      } else {
        showToast(`Supabase delete error: ${res.error || 'Failed to delete'}`, "error");
      }
    } else {
      showToast("SIM card removed from inventory", "info");
    }
  };

  // 4. Mobile Packages CRUD with Supabase
  const addPackage = async (pkg: Omit<MobilePackage, 'id'>) => {
    const tempId = `pkg-${Date.now()}`;
    const newPkg: MobilePackage = { ...pkg, id: tempId };

    setPackages(prev => [...prev, newPkg]);

    if (getActiveCredentials().isConfigured) {
      const res = await SupabaseService.createPackage(pkg);
      if (res.ok && res.data) {
        setPackages(prev => prev.map(p => p.id === tempId ? res.data! : p));
        showToast(`Package "${pkg.name}" saved to Supabase!`, "success");
        return;
      } else {
        showToast(`Supabase save error: ${res.error || 'Failed to insert'}`, "error");
        return;
      }
    }
    showToast(`Package "${pkg.name}" added locally (Supabase not configured in .env)`, "warning");
  };

  const updatePackage = async (id: string, updated: Partial<MobilePackage>) => {
    setPackages(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));

    if (getActiveCredentials().isConfigured) {
      const res = await SupabaseService.updatePackage(id, updated);
      if (res.ok) {
        showToast("Package updated in Supabase", "success");
      } else {
        showToast(`Supabase update error: ${res.error || 'Failed to update'}`, "error");
      }
    } else {
      showToast("Package updated locally", "info");
    }
  };

  const deletePackage = async (id: string) => {
    setPackages(prev => prev.filter(p => p.id !== id));

    if (getActiveCredentials().isConfigured) {
      const res = await SupabaseService.deletePackage(id);
      if (res.ok) {
        showToast("Package deleted from Supabase", "info");
      } else {
        showToast(`Supabase delete error: ${res.error || 'Failed to delete'}`, "error");
      }
    } else {
      showToast("Package deleted", "info");
    }
  };

  const reorderPackages = async (reordered: MobilePackage[]) => {
    const withOrder = reordered.map((p, idx) => ({ ...p, displayOrder: idx + 1 }));
    setPackages(withOrder);

    if (getActiveCredentials().isConfigured) {
      const res = await SupabaseService.reorderPackages(withOrder);
      if (res.ok) {
        showToast("Package order synced with Supabase", "success");
      } else {
        showToast(`Supabase reorder error: ${res.error || 'Failed to sync'}`, "error");
      }
    } else {
      showToast("Package order updated", "info");
    }
  };

  // 5. Offers CRUD with Supabase
  const addOffer = async (offer: Omit<OfferItem, 'id'>) => {
    const tempId = `offer-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newOffer: OfferItem = { 
      ...offer, 
      id: tempId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setOffers(prev => {
      const updated = [newOffer, ...prev];
      try {
        localStorage.setItem('fr_hasan_offers_cache', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (getActiveCredentials().isConfigured) {
      const res = await SupabaseService.createOffer(offer);
      if (res.ok && res.data) {
        setOffers(prev => {
          const updated = prev.map(o => o.id === tempId ? res.data! : o);
          try {
            localStorage.setItem('fr_hasan_offers_cache', JSON.stringify(updated));
          } catch {}
          return updated;
        });
        showToast(`Special Offer "${offer.title}" saved to Supabase!`, "success");
        return;
      } else if (res.isMissingTable) {
        showToast(
          `Offer saved locally! To sync with Supabase cloud, please run the Special Offers SQL script from Admin > Settings > Database.`,
          "warning",
          "Saved Locally (Database Migration Required)"
        );
        return;
      } else {
        showToast(`Supabase save notice: ${res.error || 'Saved locally'}`, "warning");
        return;
      }
    }
    showToast(`Special Offer "${offer.title}" saved locally`, "info");
  };

  const updateOffer = async (id: string, updated: Partial<OfferItem>) => {
    setOffers(prev => {
      const nextOffers = prev.map(o => o.id === id ? { ...o, ...updated, updatedAt: new Date().toISOString() } : o);
      try {
        localStorage.setItem('fr_hasan_offers_cache', JSON.stringify(nextOffers));
      } catch {}
      return nextOffers;
    });

    if (getActiveCredentials().isConfigured) {
      const res = await SupabaseService.updateOffer(id, updated);
      if (res.ok) {
        showToast("Offer updated in Supabase", "success");
      } else if (res.isMissingTable) {
        showToast("Offer updated locally. (Supabase 'offers' table needs to be created to sync)", "warning");
      } else {
        showToast(`Supabase update error: ${res.error || 'Failed to update'}`, "error");
      }
    } else {
      showToast("Offer updated locally", "info");
    }
  };

  const deleteOffer = async (id: string) => {
    setOffers(prev => {
      const filtered = prev.filter(o => o.id !== id);
      try {
        localStorage.setItem('fr_hasan_offers_cache', JSON.stringify(filtered));
      } catch {}
      return filtered;
    });

    if (getActiveCredentials().isConfigured) {
      const res = await SupabaseService.deleteOffer(id);
      if (res.ok) {
        showToast("Offer deleted from Supabase", "info");
      } else if (res.isMissingTable) {
        showToast("Offer removed from local view", "info");
      } else {
        showToast(`Supabase delete error: ${res.error || 'Failed to delete'}`, "error");
      }
    } else {
      showToast("Offer deleted", "info");
    }
  };

  // 6. POS Transactions CRUD with Supabase
  const addTransaction = async (tx: Omit<POSTransaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<POSTransaction> => {
    const nowIso = new Date().toISOString();
    const tempId = `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newTx: POSTransaction = {
      ...tx,
      id: tempId,
      createdBy: tx.createdBy || 'FR Hasan (CEO)',
      createdAt: nowIso,
      updatedAt: nowIso
    };

    setTransactions(prev => [newTx, ...prev]);

    // If it's a SIM card sale, mark corresponding SIM as Sold if found
    if (tx.type === 'sale' && tx.category === 'SIM Cards') {
      const matchingSim = sims.find(s => s.status === 'Available' && (tx.subType?.includes(s.network) || tx.description.includes(s.simNumber)));
      if (matchingSim) {
        updateSIM(matchingSim.id, { status: 'Sold', soldDate: tx.date });
      }
    }

    if (getActiveCredentials().isConfigured) {
      const res = await SupabaseService.createTransaction(tx);
      if (res.ok && res.data) {
        setTransactions(prev => prev.map(t => t.id === tempId ? res.data! : t));
        showToast(
          tx.type === 'sale' 
            ? `Sale recorded in Supabase — ${settings.posSettings.currencySymbol} ${tx.totalAmount.toLocaleString()}` 
            : `Expense recorded in Supabase — ${settings.posSettings.currencySymbol} ${tx.totalAmount.toLocaleString()}`,
          tx.type === 'sale' ? 'success' : 'info'
        );
        return res.data;
      } else {
        showToast(`Supabase transaction save error: ${res.error || 'Failed to record'}`, "error");
      }
    }

    showToast(
      tx.type === 'sale' 
        ? `Sale recorded (Local session) — ${settings.posSettings.currencySymbol} ${tx.totalAmount.toLocaleString()}` 
        : `Expense recorded (Local session) — ${settings.posSettings.currencySymbol} ${tx.totalAmount.toLocaleString()}`,
      tx.type === 'sale' ? 'success' : 'info'
    );

    return newTx;
  };

  const updateTransaction = async (id: string, updated: Partial<POSTransaction>) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updated, updatedAt: new Date().toISOString() } : t));

    if (getActiveCredentials().isConfigured) {
      const res = await SupabaseService.updateTransaction(id, updated);
      if (res.ok) {
        showToast("Transaction updated in Supabase", "success");
      } else {
        showToast(`Supabase update error: ${res.error || 'Failed to update'}`, "error");
      }
    } else {
      showToast("Transaction updated locally", "info");
    }
  };

  const deleteTransaction = async (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));

    if (getActiveCredentials().isConfigured) {
      const res = await SupabaseService.deleteTransaction(id);
      if (res.ok) {
        showToast("Transaction deleted from Supabase", "info");
      } else {
        showToast(`Supabase delete error: ${res.error || 'Failed to delete'}`, "error");
      }
    } else {
      showToast("Transaction deleted", "info");
    }
  };

  // --------------------------------------------------------------------------
  // ESTIMATE SERVICES, CATEGORIES & SIZES CRUD
  // --------------------------------------------------------------------------

  const addEstimateService = async (service: Omit<EstimateService, 'id'>) => {
    const tempId = `est-serv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newService: EstimateService = {
      ...service,
      id: tempId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setEstimateServices(prev => [...prev, newService]);

    if (getActiveCredentials().isConfigured) {
      const res = await SupabaseService.createEstimateService(service);
      if (res.ok && res.data) {
        setEstimateServices(prev => prev.map(s => s.id === tempId ? res.data! : s));
        showToast(`Service "${service.name}" added to Estimate Calculator`, "success");
        return;
      } else {
        showToast(`Supabase error: ${res.error || 'Failed to create service'}`, "error");
      }
    } else {
      showToast(`Service "${service.name}" saved locally`, "info");
    }
  };

  const updateEstimateService = async (id: string, updated: Partial<EstimateService>) => {
    setEstimateServices(prev => prev.map(s => s.id === id ? { ...s, ...updated, updatedAt: new Date().toISOString() } : s));

    if (getActiveCredentials().isConfigured) {
      const res = await SupabaseService.updateEstimateService(id, updated);
      if (res.ok) {
        showToast("Estimate service updated in Supabase", "success");
      } else {
        showToast(`Supabase update error: ${res.error || 'Failed to update'}`, "error");
      }
    } else {
      showToast("Estimate service updated locally", "info");
    }
  };

  const deleteEstimateService = async (id: string) => {
    setEstimateServices(prev => prev.filter(s => s.id !== id));

    if (getActiveCredentials().isConfigured) {
      const res = await SupabaseService.deleteEstimateService(id);
      if (res.ok) {
        showToast("Service deleted from Estimate Calculator", "info");
      } else {
        showToast(`Supabase delete error: ${res.error || 'Failed to delete'}`, "error");
      }
    } else {
      showToast("Service deleted", "info");
    }
  };

  const addEstimateCategory = async (category: Omit<EstimateCategory, 'id'>) => {
    const tempId = `cat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newCategory: EstimateCategory = {
      ...category,
      id: tempId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setEstimateCategories(prev => [...prev, newCategory]);

    if (getActiveCredentials().isConfigured) {
      const res = await SupabaseService.createEstimateCategory(category);
      if (res.ok && res.data) {
        setEstimateCategories(prev => prev.map(c => c.id === tempId ? res.data! : c));
        showToast(`Category "${category.name}" added to Supabase`, "success");
        return;
      } else {
        showToast(`Supabase error: ${res.error || 'Failed to create category'}`, "error");
        return;
      }
    }
    showToast(`Category "${category.name}" added locally (Supabase not configured)`, "warning");
  };

  const updateEstimateCategory = async (id: string, updated: Partial<EstimateCategory>) => {
    setEstimateCategories(prev => prev.map(c => c.id === id ? { ...c, ...updated, updatedAt: new Date().toISOString() } : c));

    if (getActiveCredentials().isConfigured) {
      const res = await SupabaseService.updateEstimateCategory(id, updated);
      if (res.ok) {
        showToast("Category updated in Supabase", "success");
      } else {
        showToast(`Supabase update error: ${res.error || 'Failed to update category'}`, "error");
      }
    } else {
      showToast("Category updated locally", "info");
    }
  };

  const deleteEstimateCategory = async (id: string) => {
    setEstimateCategories(prev => prev.filter(c => c.id !== id));

    if (getActiveCredentials().isConfigured) {
      const res = await SupabaseService.deleteEstimateCategory(id);
      if (res.ok) {
        showToast("Category deleted from Supabase", "info");
      } else {
        showToast(`Supabase delete error: ${res.error || 'Failed to delete category'}`, "error");
      }
    } else {
      showToast("Category deleted locally", "info");
    }
  };

  const addEstimateSize = async (size: Omit<EstimateSize, 'id'>) => {
    const tempId = `size-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newSize: EstimateSize = {
      ...size,
      id: tempId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setEstimateSizes(prev => [...prev, newSize]);

    if (getActiveCredentials().isConfigured) {
      const res = await SupabaseService.createEstimateSize(size);
      if (res.ok && res.data) {
        setEstimateSizes(prev => prev.map(s => s.id === tempId ? res.data! : s));
        showToast(`Size "${size.name}" added to Supabase standard sizes`, "success");
        return;
      } else {
        showToast(`Supabase error: ${res.error || 'Failed to create size'}`, "error");
        return;
      }
    }
    showToast(`Size "${size.name}" added locally (Supabase not configured)`, "warning");
  };

  const updateEstimateSize = async (id: string, updated: Partial<EstimateSize>) => {
    setEstimateSizes(prev => prev.map(s => s.id === id ? { ...s, ...updated, updatedAt: new Date().toISOString() } : s));

    if (getActiveCredentials().isConfigured) {
      const res = await SupabaseService.updateEstimateSize(id, updated);
      if (res.ok) {
        showToast("Size updated in Supabase", "success");
      } else {
        showToast(`Supabase update error: ${res.error || 'Failed to update size'}`, "error");
      }
    } else {
      showToast("Size updated locally", "info");
    }
  };

  const deleteEstimateSize = async (id: string) => {
    setEstimateSizes(prev => prev.filter(s => s.id !== id));

    if (getActiveCredentials().isConfigured) {
      const res = await SupabaseService.deleteEstimateSize(id);
      if (res.ok) {
        showToast("Size deleted from Supabase", "info");
      } else {
        showToast(`Supabase delete error: ${res.error || 'Failed to delete size'}`, "error");
      }
    } else {
      showToast("Size deleted locally", "info");
    }
  };

  const seedEstimateDatabase = async () => {
    if (!getActiveCredentials().isConfigured) {
      return { ok: false, message: 'Supabase credentials are not configured in environment' };
    }
    const res = await SupabaseService.seedEstimateData({
      categories: estimateCategories.length > 0 ? estimateCategories : INITIAL_ESTIMATE_CATEGORIES,
      services: estimateServices.length > 0 ? estimateServices : INITIAL_ESTIMATE_SERVICES,
      sizes: estimateSizes.length > 0 ? estimateSizes : INITIAL_ESTIMATE_SIZES,
    });
    showToast(res.message, res.ok ? 'success' : 'warning');
    return res;
  };

  const triggerQuickSale = (category: string, subType: string, price: number, desc: string) => {
    setQuickSalePrefill({ category, subType, price, desc });
    navigate('/admin/pos/new-sale');
  };

  const clearQuickSalePrefill = () => {
    setQuickSalePrefill(null);
  };

  const quickSalePreset = quickSalePrefill ? {
    category: quickSalePrefill.category as any,
    subType: quickSalePrefill.subType,
    unitPrice: quickSalePrefill.price,
    description: quickSalePrefill.desc
  } : null;

  const clearQuickSalePreset = clearQuickSalePrefill;

  const value = useMemo(() => ({
    currentPath,
    navigate,
    isAdminAuthenticated,
    adminUser,
    adminUsers,
    loginAdmin,
    logoutAdmin,
    resetAdminPassword,
    addAdminUser,
    updateAdminUser,
    deleteAdminUser,
    isSupabaseConnected,
    isLoadingData,
    refreshFromSupabase: loadDataFromSupabase,
    seedSupabaseDatabase,
    updateSupabaseCredentials,
    clearSupabaseCredentials,
    settings,
    updateSettings,
    resetToInitialData,
    clearAllData,
    clearServices,
    clearPackages,
    clearOffers,
    clearSims,
    clearTransactions,
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
    offers,
    addOffer,
    updateOffer,
    deleteOffer,
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,

    // Estimate Calculator
    estimateCategories,
    estimateServices,
    estimateSizes,
    isEstimateModalOpen,
    openEstimateModal,
    closeEstimateModal,
    selectedEstimateCategory,
    setSelectedEstimateCategory,
    addEstimateService,
    updateEstimateService,
    deleteEstimateService,
    addEstimateCategory,
    updateEstimateCategory,
    deleteEstimateCategory,
    addEstimateSize,
    updateEstimateSize,
    deleteEstimateSize,
    seedEstimateDatabase,

    toasts,
    showToast,
    dismissToast,
    triggerQuickSale,
    quickSalePrefill,
    clearQuickSalePrefill,
    quickSalePreset,
    clearQuickSalePreset
  }), [
    currentPath,
    isAdminAuthenticated,
    adminUser,
    adminUsers,
    isSupabaseConnected,
    isLoadingData,
    loadDataFromSupabase,
    settings,
    services,
    sims,
    packages,
    offers,
    transactions,
    estimateCategories,
    estimateServices,
    estimateSizes,
    isEstimateModalOpen,
    selectedEstimateCategory,
    toasts,
    quickSalePrefill,
    quickSalePreset
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
