
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Search, 
  UserPlus, 
  Edit, 
  Trash, 
  Shield,
  Filter 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { toast } from "sonner";

// Mock user data for demonstration
const mockUsers = [
  { id: '1', name: 'John Doe', email: 'john.doe@example.com', role: 'user', status: 'active' },
  { id: '2', name: 'Jane Smith', email: 'jane.smith@example.com', role: 'admin', status: 'active' },
  { id: '3', name: 'Bob Johnson', email: 'bob.johnson@example.com', role: 'user', status: 'inactive' },
  { id: '4', name: 'Alice Brown', email: 'alice.brown@example.com', role: 'user', status: 'active' },
];

const UserManagementPanel = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users] = useState(mockUsers);
  const [filter, setFilter] = useState("all");
  
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === "all") return matchesSearch;
    if (filter === "admins") return matchesSearch && user.role === "admin";
    if (filter === "active") return matchesSearch && user.status === "active";
    if (filter === "inactive") return matchesSearch && user.status === "inactive";
    
    return matchesSearch;
  });

  const handleMakeAdmin = (userId: string) => {
    toast.success(`User with ID ${userId} is now an admin`);
  };

  const handleDeleteUser = (userId: string) => {
    toast.success(`User with ID ${userId} has been deleted`);
  };

  const handleEditUser = (userId: string) => {
    toast.info(`Editing user with ID ${userId}`);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold">User Management</h2>
            <p className="text-gray-600 mt-1">
              Manage your application users
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
                <DropdownMenuItem onClick={() => setFilter("admins")}>Admins Only</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("active")}>Active Users</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("inactive")}>Inactive Users</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button className="bg-pickleball-purple hover:bg-pickleball-purple/90">
              <UserPlus size={18} className="mr-2" />
              Add User
            </Button>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{user.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-pickleball-purple border-pickleball-purple" 
                        onClick={() => handleEditUser(user.id)}
                      >
                        <Edit size={14} className="mr-1" />
                        Edit
                      </Button>
                      {user.role !== 'admin' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-blue-600 border-blue-600" 
                          onClick={() => handleMakeAdmin(user.id)}
                        >
                          <Shield size={14} className="mr-1" />
                          Make Admin
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-red-600 border-red-600" 
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash size={14} className="mr-1" />
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserManagementPanel;
