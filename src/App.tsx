import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ToastContainer } from './components/common/ToastContainer';
import { PublicLayout } from './components/public/PublicLayout';
import { HomePage } from './components/public/HomePage';
import { ServicesListPage } from './components/public/ServicesListPage';
import { ServiceDetailPage } from './components/public/ServiceDetailPage';
import { AboutPage } from './components/public/AboutPage';
import { ContactPage } from './components/public/ContactPage';

import { AdminLogin } from './components/admin/AdminLogin';
import { AdminForgotPassword } from './components/admin/AdminForgotPassword';
import { AdminResetPassword } from './components/admin/AdminResetPassword';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboardOverview } from './components/admin/AdminDashboardOverview';
import { AdminServices } from './components/admin/AdminServices';
import { AdminSims } from './components/admin/AdminSims';
import { AdminPackages } from './components/admin/AdminPackages';
import { AdminSettings } from './components/admin/AdminSettings';

import { PosDashboard } from './components/admin/pos/PosDashboard';
import { NewSaleForm } from './components/admin/pos/NewSaleForm';
import { NewExpenseForm } from './components/admin/pos/NewExpenseForm';
import { TransactionHistory } from './components/admin/pos/TransactionHistory';
import { RevenueReports } from './components/admin/pos/RevenueReports';

const AppRouter: React.FC = () => {
  const { currentPath, navigate, isAdminAuthenticated } = useApp();

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

      if (currentPath === '/admin/pos' || currentPath === '/admin/pos/dashboard') {
        return (
          <AdminLayout pageTitle="Point of Sale">
            <PosDashboard />
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

    if (currentPath === '/services') {
      return (
        <PublicLayout>
          <ServicesListPage />
        </PublicLayout>
      );
    }

    if (currentPath.startsWith('/services/')) {
      const slug = currentPath.replace('/services/', '');
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

    // 404 Fallback
    return (
      <PublicLayout>
        <div className="max-w-md mx-auto py-20 text-center px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Page Not Found</h2>
          <p className="text-sm text-gray-600 mb-6">The requested page does not exist or has been moved.</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-[#1E5AA8] hover:bg-[#164785] text-white text-sm font-bold rounded-md"
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
      {renderRoute()}
    </>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}
