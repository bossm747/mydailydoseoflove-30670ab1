import Navigation from "@/components/Navigation";
import Dashboard from "@/components/Dashboard";
import FinanceDashboard from "@/components/FinanceDashboard";
import MemoryGallery from "@/components/MemoryGallery";
import BusinessHub from "@/components/BusinessHub";
import MessagingHub from "@/components/MessagingHub";
import { useState } from "react";

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'finance':
        return <FinanceDashboard />;
      case 'memories':
        return <MemoryGallery />;
      case 'business':
        return <BusinessHub />;
      case 'messages':
        return <MessagingHub />;
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
