
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { BookingWithDetails } from "@/models/types";
import { getSlotBookings } from "@/services/adminBookingService";
import { updateBookingCheckInStatus } from "@/services/checkInService";
import { cancelBooking } from "@/services/userBookingService";
import { toast } from "sonner";
import { BadgeCheck, Clock, CalendarClock, User, Mail, Plus, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface PlayerCheckInDialogProps {
  slotId: string;
  venueId: string;
  onClose?: () => void;
}

const PlayerCheckInDialog = ({ slotId, venueId, onClose }: PlayerCheckInDialogProps) => {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{id: string, email: string, name: string}>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);

  useEffect(() => {
    loadBookings();
  }, [slotId]);

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      console.log("Loading bookings for slot:", slotId);
      const data = await getSlotBookings(slotId);
      console.log("Retrieved bookings:", data);
      setBookings(data);
    } catch (error) {
      console.error("Error loading bookings:", error);
      toast.error("Failed to load player bookings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckInToggle = async (bookingId: string, isCheckedIn: boolean) => {
    try {
      await updateBookingCheckInStatus(bookingId, isCheckedIn);

      // Update the local state
      setBookings(bookings.map(booking =>
        booking.id === bookingId
          ? { ...booking, checkedIn: isCheckedIn }
          : booking
      ));

      toast.success(`Player ${isCheckedIn ? 'checked in' : 'check-in removed'}`);
    } catch (error) {
      console.error("Error updating check-in status:", error);
      toast.error("Failed to update check-in status");
    }
  };

  const handleSearchUsers = async (query: string) => {
    setSearchQuery(query);

    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, name")
        .or(`email.ilike.%${query}%,name.ilike.%${query}%`)
        .limit(5);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error("Error searching users:", error);
      toast.error("Failed to search users");
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddPlayer = async (userId: string, userName: string) => {
    setIsAddingPlayer(true);
    try {
      // Call the book_slot_with_coin function as admin for the selected user
      const { data, error } = await supabase.rpc('book_slot_with_coin', {
        slot_id_param: slotId,
        venue_id_param: venueId,
        allow_booking_without_coins_param: true, // Admin can book without coins
        user_name_param: userName,
        user_id_param: userId // Admin booking for this user
      });

      if (error) throw error;

      toast.success(`${userName} has been added to the slot`);
      setShowAddPlayer(false);
      setSearchQuery("");
      setSearchResults([]);

      // Reload bookings
      await loadBookings();
    } catch (error: any) {
      console.error("Error adding player:", error);
      toast.error(error.message || "Failed to add player");
    } finally {
      setIsAddingPlayer(false);
    }
  };

  const handleCancelBooking = async (bookingId: string, userName: string) => {
    if (!confirm(`Are you sure you want to cancel the booking for ${userName}?`)) {
      return;
    }

    try {
      await cancelBooking(bookingId);
      toast.success(`Booking for ${userName} has been cancelled`);

      // Reload bookings to show updated status
      await loadBookings();
    } catch (error: any) {
      console.error("Error cancelling booking:", error);
      toast.error(error.message || "Failed to cancel booking");
    }
  };

  if (isLoading) {
    return <div className="p-4 text-center">Loading player bookings...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Add Player Section */}
      <div className="border-b pb-4">
        {!showAddPlayer ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddPlayer(true)}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Player to Slot
          </Button>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Add Player</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowAddPlayer(false);
                  setSearchQuery("");
                  setSearchResults([]);
                }}
              >
                Cancel
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => handleSearchUsers(e.target.value)}
                className="pl-9"
              />
            </div>
            {isSearching && (
              <p className="text-sm text-gray-500">Searching...</p>
            )}
            {searchResults.length > 0 && (
              <div className="border rounded-md divide-y max-h-48 overflow-y-auto">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="p-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                    onClick={() => handleAddPlayer(user.id, user.name)}
                  >
                    <div>
                      <div className="font-medium text-sm">{user.name}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={isAddingPlayer}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            {searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
              <p className="text-sm text-gray-500">No users found</p>
            )}
          </div>
        )}
      </div>

      {/* Bookings List */}
      {bookings.length > 0 ? (
        <div>
          <div className="text-sm text-muted-foreground mb-3">
            Total Players: {bookings.length}
          </div>
          <ScrollArea className="h-[400px] w-full">
            <div className="divide-y pr-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="py-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{booking.userName || 'Unknown Player'}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-3.5 h-3.5" />
                        <span>{booking.userEmail || 'No email available'}</span>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center space-x-2">
                      <Badge variant={booking.status === 'cancelled' ? "destructive" : booking.checkedIn ? "success" : "outline"}>
                        {booking.status === 'cancelled' ? "Cancelled" : booking.checkedIn ? "Checked In" : "Not Checked In"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`checkin-${booking.id}`}
                        checked={booking.checkedIn}
                        disabled={booking.status === 'cancelled'}
                        onCheckedChange={(checked) =>
                          handleCheckInToggle(booking.id, checked as boolean)
                        }
                      />
                      <label
                        htmlFor={`checkin-${booking.id}`}
                        className="text-sm font-medium"
                      >
                        Check In
                      </label>
                    </div>
                    {booking.status !== 'cancelled' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancelBooking(booking.id, booking.userName || 'this player')}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      ) : (
        <div className="text-center p-6">
          <div className="mb-3 text-gray-400">
            <CalendarClock className="h-10 w-10 mx-auto" />
          </div>
          <h3 className="text-lg font-medium">No Bookings Yet</h3>
          <p className="text-gray-500 mt-1">
            There are no players booked for this slot yet.
          </p>
        </div>
      )}
      
      <div className="flex justify-end pt-4">
        <Button 
          variant="default" 
          onClick={onClose}
          className="bg-pickleball-purple hover:bg-pickleball-purple/90"
        >
          Close
        </Button>
      </div>
    </div>
  );
};

export default PlayerCheckInDialog;
