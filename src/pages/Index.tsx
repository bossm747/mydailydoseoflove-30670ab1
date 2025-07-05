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
import { useState } from "react";

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
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
