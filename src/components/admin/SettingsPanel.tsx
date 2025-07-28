
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, HelpCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import BookingWithoutCoinsToggle from "./BookingWithoutCoinsToggle";

const SettingsPanel = () => {
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [autoLogout, setAutoLogout] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSettings = () => {
    setIsSaving(true);
    
    // Simulating a save operation
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Settings saved successfully");
    }, 1000);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold">Settings</h2>
            <p className="text-gray-600 mt-1">
              Application settings and preferences
            </p>
          </div>
          <Settings className="h-8 w-8 text-pickleball-purple" />
        </div>

        <div className="space-y-6">
          {/* Booking Settings - New Section */}
          <BookingWithoutCoinsToggle />
          
          {/* Notification Settings */}
          <div className="space-y-4">
            <h3 className="font-medium">Notification Settings</h3>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-gray-500">Receive booking and venue updates via email</p>
              </div>
              <Switch
                id="email-notifications"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>
          </div>

          {/* Appearance Settings */}
          <div className="space-y-4">
            <h3 className="font-medium">Appearance</h3>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode">Dark Mode</Label>
                <p className="text-sm text-gray-500">Use dark theme for the application</p>
              </div>
              <Switch
                id="dark-mode"
                checked={darkMode}
                onCheckedChange={setDarkMode}
              />
            </div>
          </div>

          {/* Security Settings */}
          <div className="space-y-4">
            <h3 className="font-medium">Security</h3>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-logout">Auto Logout</Label>
                <p className="text-sm text-gray-500">Automatically log out after 30 minutes of inactivity</p>
              </div>
              <Switch
                id="auto-logout"
                checked={autoLogout}
                onCheckedChange={setAutoLogout}
              />
            </div>
          </div>

          {/* Help Section */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-start">
            <HelpCircle className="h-5 w-5 text-pickleball-purple mr-3 mt-0.5" />
            <div>
              <h4 className="font-medium">Need Help?</h4>
              <p className="text-sm text-gray-600 mt-1">
                If you need assistance with any settings or configuration, please contact our support team.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              className="bg-pickleball-purple hover:bg-pickleball-purple/90"
              onClick={handleSaveSettings}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SettingsPanel;
