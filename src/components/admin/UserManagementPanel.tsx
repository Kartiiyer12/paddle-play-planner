
import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

const UserManagementPanel = () => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold">User Management</h2>
            <p className="text-gray-600 mt-1">
              User management coming soon
            </p>
          </div>
          <Users className="h-8 w-8 text-pickleball-purple" />
        </div>
      </CardContent>
    </Card>
  );
};

export default UserManagementPanel;
