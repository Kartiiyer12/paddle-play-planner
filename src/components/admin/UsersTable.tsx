
import { BookingUser } from "@/models/types";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

interface UsersTableProps {
  users: BookingUser[];
  onEditUser: (userId: string, name: string, coins: number) => void;
  isLoading: boolean;
}

const UsersTable = ({ users, onEditUser, isLoading }: UsersTableProps) => {
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Bookings</TableHead>
            <TableHead>Last Booking</TableHead>
            <TableHead>Slot Coins</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length > 0 ? (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="font-medium text-gray-900">{user.name}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-gray-500">{user.bookingsCount} bookings</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-gray-500">
                    {user.lastBookingDate ? format(new Date(user.lastBookingDate), 'MMM d, yyyy') : 'N/A'}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-gray-500">
                    {user.slotCoins || 0}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-pickleball-purple border-pickleball-purple"
                      onClick={() => onEditUser(user.id, user.name, user.slotCoins || 0)}
                    >
                      <Edit size={14} className="mr-1" />
                      Edit Coins
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                No users found with booking history.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default UsersTable;
