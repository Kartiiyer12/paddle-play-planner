
import { Card, CardContent } from "@/components/ui/card";
import { Settings } from "lucide-react";

const SettingsPanel = () => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold">Settings</h2>
            <p className="text-gray-600 mt-1">
              General application settings coming soon
            </p>
          </div>
          <Settings className="h-8 w-8 text-pickleball-purple" />
        </div>
      </CardContent>
    </Card>
  );
};

export default SettingsPanel;
