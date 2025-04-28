
import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";
import { useState } from "react";
import { useBookingUsers } from "@/hooks/useBookingUsers";

import UsersSearchAndFilter from "./UsersSearchAndFilter";
import UsersTable from "./UsersTable";
import UserEditCoinsDialog from "./UserEditCoinsDialog";

const UserManagementPanel = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const { users, isLoading, refetch } = useBookingUsers();
  
  const [editingUser, setEditingUser] = useState<{ id: string, name: string, coins: number } | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === "all") return matchesSearch;
    if (filter === "regular" && user.bookingsCount > 3) return matchesSearch;
    if (filter === "zero-coins" && user.slotCoins === 0) return matchesSearch;
    
    return matchesSearch;
  });

  const handleEditUser = async (userId: string, name: string, slotCoins: number) => {
    setEditingUser({ id: userId, name, coins: slotCoins });
    setIsEditDialogOpen(true);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold">User Management</h2>
            <p className="text-gray-600 mt-1">
              Manage users who have booked slots
            </p>
          </div>
          <Users className="h-8 w-8 text-pickleball-purple" />
        </div>

        <UsersSearchAndFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onFilterChange={setFilter}
        />

        <UsersTable
          users={filteredUsers}
          onEditUser={handleEditUser}
          isLoading={isLoading}
        />

        <UserEditCoinsDialog
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          user={editingUser}
          onSave={refetch}
        />
      </CardContent>
    </Card>
  );
};

export default UserManagementPanel;
