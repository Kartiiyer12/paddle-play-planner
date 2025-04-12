
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import AdminNavigation from "./AdminNavigation";
import UserManagementPanel from "./UserManagementPanel";
import VenueManagementPanel from "./VenueManagementPanel";
import SlotManagementPanel from "./SlotManagementPanel";
import PaymentSetupPanel from "./PaymentSetupPanel";
import SlotConfigPanel from "./SlotConfigPanel";
import SettingsPanel from "./SettingsPanel";

const AdminPanelContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => {
    const path = location.pathname;
    
    if (path.includes('/users')) return 'users';
    if (path.includes('/venues')) return 'venues';
    if (path.includes('/slots')) return 'slots';
    if (path.includes('/payments')) return 'payments';
    if (path.includes('/slot-config')) return 'slot-config';
    if (path.includes('/settings')) return 'settings';
    
    return 'venues'; // Default tab
  });

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`/admin/${value}`);
  };

  return (
    <div className="container mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Manage venues, game times, and users
        </p>
      </div>

      <AdminNavigation />

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsContent value="users">
          <UserManagementPanel />
        </TabsContent>

        <TabsContent value="venues">
          <VenueManagementPanel />
        </TabsContent>

        <TabsContent value="slots">
          <SlotManagementPanel />
        </TabsContent>

        <TabsContent value="payments">
          <PaymentSetupPanel />
        </TabsContent>

        <TabsContent value="slot-config">
          <SlotConfigPanel />
        </TabsContent>

        <TabsContent value="settings">
          <SettingsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanelContent;
