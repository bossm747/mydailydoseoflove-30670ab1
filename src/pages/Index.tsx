import Navigation from "@/components/Navigation";
import Dashboard from "@/components/Dashboard";
import FinanceDashboard from "@/components/FinanceDashboard";
import MemoryGallery from "@/components/MemoryGallery";
import BusinessHub from "@/components/BusinessHub";
import MessagingHub from "@/components/MessagingHub";
import SharedCalendar from "@/components/calendar/SharedCalendar";
import UserSettings from "@/components/settings/UserSettings";
import BankAccountManager from "@/components/banking/BankAccountManager";
import AssetRegistry from "@/components/assets/AssetRegistry";
import DebtTracker from "@/components/debts/DebtTracker";
import MoodSharing from "@/components/mood/MoodSharing";
import FinancialForecasting from "@/components/forecasting/FinancialForecasting";
import CustomReports from "@/components/reports/CustomReports";
import BusinessManager from "@/components/business/BusinessManager";
import SalesDashboard from "@/components/sales/SalesDashboard";
import CustomerManager from "@/components/sales/CustomerManager";
import LeadsManager from "@/components/sales/LeadsManager";
import EmployeeManager from "@/components/hr/EmployeeManager";
import PayrollManager from "@/components/hr/PayrollManager";
import LeaveManager from "@/components/hr/LeaveManager";
import PerformanceReviews from "@/components/hr/PerformanceReviews";
import TimeTracker from "@/components/hr/TimeTracker";
import ProductCatalog from "@/components/inventory/ProductCatalog";
import InventoryManager from "@/components/inventory/InventoryManager";
import { ProjectManager } from "@/components/projects/ProjectManager";
import { TaskManager } from "@/components/tasks/TaskManager";
import { InvoiceManager } from "@/components/invoices/InvoiceManager";
import { PaymentManager } from "@/components/payments/PaymentManager";
import { useState } from "react";

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'sales':
        return <SalesDashboard />;
      case 'customers':
        return <CustomerManager />;
      case 'leads':
        return <LeadsManager />;
      case 'employees':
        return <EmployeeManager />;
      case 'payroll':
        return <PayrollManager />;
      case 'leave':
        return <LeaveManager />;
      case 'reviews':
        return <PerformanceReviews />;
      case 'time-tracker':
        return <TimeTracker />;
      case 'products':
        return <ProductCatalog />;
      case 'inventory':
        return <InventoryManager />;
      case 'finance':
        return <FinanceDashboard />;
      case 'banking':
        return <BankAccountManager />;
      case 'assets':
        return <AssetRegistry />;
      case 'debts':
        return <DebtTracker />;
      case 'forecasting':
        return <FinancialForecasting />;
      case 'reports':
        return <CustomReports />;
      case 'business-manager':
        return <BusinessManager />;
      case 'projects':
        return <ProjectManager />;
      case 'tasks':
        return <TaskManager />;
      case 'invoices':
        return <InvoiceManager />;
      case 'payments':
        return <PaymentManager />;
      case 'memories':
        return <MemoryGallery />;
      case 'mood':
        return <MoodSharing />;
      case 'business':
        return <BusinessHub />;
      case 'messages':
        return <MessagingHub />;
      case 'settings':
        return <UserSettings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;
