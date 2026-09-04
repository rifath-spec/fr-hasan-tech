import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ToastContainer } from './components/common/ToastContainer';
import { PublicLayout } from './components/public/PublicLayout';
import { HomePage } from './components/public/HomePage';
import { ServicesListPage } from './components/public/ServicesListPage';
import { ServiceDetailPage } from './components/public/ServiceDetailPage';
import { AboutPage } from './components/public/AboutPage';
import { ContactPage } from './components/public/ContactPage';
import { OffersPage } from './components/public/OffersPage';

import { AdminLogin } from './components/admin/AdminLogin';
import { AdminForgotPassword } from './components/admin/AdminForgotPassword';
import { AdminResetPassword } from './components/admin/AdminResetPassword';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboardOverview } from './components/admin/AdminDashboardOverview';
import { AdminServices } from './components/admin/AdminServices';
import { AdminSims } from './components/admin/AdminSims';
import { AdminPackages } from './components/admin/AdminPackages';
import { AdminOffers } from './components/admin/AdminOffers';
import { AdminSettings } from './components/admin/AdminSettings';
import { AdminEstimateManagement } from './components/admin/AdminEstimateManagement';

import { PosDashboard } from './components/admin/pos/PosDashboard';
import { NewSaleForm } from './components/admin/pos/NewSaleForm';
import { NewExpenseForm } from './components/admin/pos/NewExpenseForm';
import { TransactionHistory } from './components/admin/pos/TransactionHistory';
import { RevenueReports } from './components/admin/pos/RevenueReports';
import { InstantEstimateModal } from './components/estimate/InstantEstimateModal';
import { RefreshCw, AlertCircle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Application error captured by boundary:", error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // ignore
    }
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-slate-200 shadow-soft-lg text-center">
            <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong</h2>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              The application encountered a temporary display issue. You can quickly reload to continue.
            </p>
            {this.state.error && (
              <div className="mb-4 p-3 bg-red-50/70 border border-red-100 rounded-xl text-left text-[11px] font-mono text-red-800 break-words max-h-24 overflow-y-auto">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}
            <div className="space-y-3">
              <button
                onClick={this.handleReload}
                className="w-full py-3 px-4 bg-[#1E5AA8] hover:bg-[#164785] text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm shadow-soft-sm active-press transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Application</span>
              </button>
              <button
                onClick={this.handleReset}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs active-press transition-colors cursor-pointer"
              >
                Reset Cache & Restore Defaults
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const AppRouter: React.FC = () => {
  const { currentPath, navigate, isAdminAuthenticated, openEstimateModal, settings } = useApp();

  React.useEffect(() => {
    if (currentPath === '/estimate') {
      openEstimateModal();
    }
  }, [currentPath, openEstimateModal]);

  React.useEffect(() => {
    const faviconHref = settings.logoUrl || '/favicon.svg';
    const iconLinks = document.querySelectorAll<HTMLLinkElement>("link[rel*='icon']");
    if (iconLinks.length > 0) {
      iconLinks.forEach(link => {
        link.href = faviconHref;
      });
    } else {
      const link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/svg+xml';
      link.href = faviconHref;
      document.head.appendChild(link);
    }
  }, [settings.logoUrl]);

  // Route parser
  const renderRoute = () => {
    // 1. Authentication Routes
    if (currentPath === '/admin/login') {
      return <AdminLogin />;
    }
    if (currentPath === '/admin/forgot-password') {
      return <AdminForgotPassword />;
    }
    if (currentPath === '/admin/reset-password') {
      return <AdminResetPassword />;
    }

    // 2. Admin Protected Routes
    if (currentPath.startsWith('/admin')) {
      if (!isAdminAuthenticated) {
        return <AdminLogin />;
      }

      if (currentPath === '/admin/dashboard' || currentPath === '/admin') {
        return (
          <AdminLayout pageTitle="Dashboard Overview">
            <AdminDashboardOverview />
          </AdminLayout>
        );
      }

      if (currentPath === '/admin/services') {
        return (
          <AdminLayout pageTitle="Services Catalog">
            <AdminServices />
          </AdminLayout>
        );
      }

      if (currentPath === '/admin/estimate-settings' || currentPath === '/admin/estimates') {
        return (
          <AdminLayout pageTitle="Estimate Calculator Management">
            <AdminEstimateManagement />
          </AdminLayout>
        );
      }

      if (currentPath === '/admin/sims') {
        return (
          <AdminLayout pageTitle="SIM Inventory">
            <AdminSims />
          </AdminLayout>
        );
      }

      if (currentPath === '/admin/packages') {
        return (
          <AdminLayout pageTitle="Mobile Packages">
            <AdminPackages />
          </AdminLayout>
        );
      }

      if (currentPath === '/admin/offers') {
        return (
          <AdminLayout pageTitle="Special Offers & Promotions">
            <AdminOffers />
          </AdminLayout>
        );
      }

      if (currentPath === '/admin' || currentPath === '/admin/' || currentPath === '/admin/pos' || currentPath === '/admin/pos/dashboard') {
        return (
          <AdminLayout pageTitle="Point of Sale (POS)">
            <PosDashboard />
          </AdminLayout>
        );
      }

      if (currentPath === '/admin/dashboard') {
        return (
          <AdminLayout pageTitle="Overview Analytics">
            <AdminDashboardOverview />
          </AdminLayout>
        );
      }

      if (currentPath === '/admin/pos/new-sale') {
        return (
          <AdminLayout pageTitle="New Sale Entry">
            <NewSaleForm />
          </AdminLayout>
        );
      }

      if (currentPath === '/admin/pos/new-expense') {
        return (
          <AdminLayout pageTitle="New Expense Entry">
            <NewExpenseForm />
          </AdminLayout>
        );
      }

      if (currentPath === '/admin/pos/transactions') {
        return (
          <AdminLayout pageTitle="Transactions Ledger">
            <TransactionHistory />
          </AdminLayout>
        );
      }

      if (currentPath === '/admin/pos/reports') {
        return (
          <AdminLayout pageTitle="Revenue & Profit Reports">
            <RevenueReports />
          </AdminLayout>
        );
      }

      if (currentPath === '/admin/settings') {
        return (
          <AdminLayout pageTitle="System Settings">
            <AdminSettings />
          </AdminLayout>
        );
      }

      // Default Admin fallback
      return (
        <AdminLayout pageTitle="Dashboard">
          <AdminDashboardOverview />
        </AdminLayout>
      );
    }

    // 3. Public Routes with Public Layout
    if (currentPath === '/' || currentPath === '') {
      return (
        <PublicLayout>
          <HomePage />
        </PublicLayout>
      );
    }

    if (currentPath === '/services' || currentPath.startsWith('/services?') || currentPath.startsWith('/services/category/')) {
      return (
        <PublicLayout>
          <ServicesListPage />
        </PublicLayout>
      );
    }

    if (currentPath === '/offers' || currentPath.startsWith('/offers?') || currentPath.startsWith('/offers/')) {
      return (
        <PublicLayout>
          <OffersPage />
        </PublicLayout>
      );
    }

    if (currentPath.startsWith('/services/')) {
      const slug = currentPath.replace('/services/', '').split('?')[0];
      return (
        <PublicLayout>
          <ServiceDetailPage slug={slug} />
        </PublicLayout>
      );
    }

    if (currentPath === '/about') {
      return (
        <PublicLayout>
          <AboutPage />
        </PublicLayout>
      );
    }

    if (currentPath === '/contact') {
      return (
        <PublicLayout>
          <ContactPage />
        </PublicLayout>
      );
    }

    if (currentPath === '/estimate') {
      return (
        <PublicLayout>
          <HomePage />
        </PublicLayout>
      );
    }

    // 404 Fallback
    return (
      <PublicLayout>
        <div className="max-w-md mx-auto py-20 text-center px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Page Not Found</h2>
          <p className="text-sm text-gray-600 mb-6">The requested page does not exist or has been moved.</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-[#1E5AA8] hover:bg-[#164785] text-white text-sm font-bold rounded-xl shadow-soft-sm"
          >
            Return to Home
          </button>
        </div>
      </PublicLayout>
    );
  };

  return (
    <>
      <ToastContainer />
      <InstantEstimateModal />
      {renderRoute()}
    </>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppRouter />
      </AppProvider>
    </ErrorBoundary>
  );
}
