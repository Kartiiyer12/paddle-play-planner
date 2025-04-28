
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Search, 
  Edit, 
  Filter, 
  Save
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";
import { useBookingUsers } from "@/hooks/useBookingUsers";
import { format } from "date-fns";
import { profileService } from "@/services/profileService";

const UserManagementPanel = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const { users, isLoading, refetch } = useBookingUsers();
  
  const [editingUser, setEditingUser] = useState<{ id: string, name: string, coins: number } | null>(null);
  const [slotCoins, setSlotCoins] = useState(0);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === "all") return matchesSearch;
    if (filter === "regular" && user.bookingsCount > 3) return matchesSearch;
    
    return matchesSearch;
  });

  const handleEditUser = async (userId: string, name: string) => {
    try {
      // Fetch the user's current profile data including slot_coins
      const profileData = await profileService.getProfile(userId);
      const currentCoins = profileData?.slot_coins || 0;
      
      setEditingUser({ id: userId, name, coins: currentCoins });
      setSlotCoins(currentCoins);
      setIsEditDialogOpen(true);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast.error("Could not load user data");
    }
  };

  const handleSaveCoins = async () => {
    if (!editingUser) return;
    
    try {
      await profileService.updateProfile(editingUser.id, {
        slot_coins: slotCoins
      });
      
      toast.success(`Updated slot coins for ${editingUser.name}`);
      setIsEditDialogOpen(false);
      refetch(); // Refresh the user list to show updated data
    } catch (error) {
      console.error("Error updating slot coins:", error);
      toast.error("Failed to update slot coins");
    }
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

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter size={16} />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilter("all")}>All Users</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("regular")}>Regular Players (3+ bookings)</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <p>Loading users...</p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bookings</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Booking</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slot Coins</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{user.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{user.bookingsCount} bookings</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {user.lastBookingDate ? format(new Date(user.lastBookingDate), 'MMM d, yyyy') : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {/* We'll display actual slot coins from the profile once we've set it up */}
                          {user.slotCoins || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-pickleball-purple border-pickleball-purple" 
                            onClick={() => handleEditUser(user.id, user.name)}
                          >
                            <Edit size={14} className="mr-1" />
                            Edit Coins
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No users found with booking history.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>

      {/* Edit User Coins Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Slot Coins</DialogTitle>
            <DialogDescription>
              {editingUser && `Update slot coins for ${editingUser.name}`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="slotCoins" className="text-right">
                Slot Coins
              </label>
              <Input
                id="slotCoins"
                type="number"
                min="0"
                value={slotCoins}
                onChange={(e) => setSlotCoins(parseInt(e.target.value) || 0)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCoins}>
              <Save className="mr-2 h-4 w-4" /> Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default UserManagementPanel;
