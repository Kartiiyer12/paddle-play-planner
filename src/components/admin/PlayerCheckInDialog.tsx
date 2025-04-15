
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { BookingWithDetails } from "@/models/types";
import { getSlotBookings } from "@/services/adminBookingService";
import { updateBookingCheckIn } from "@/services/checkInService";
import { toast } from "sonner";
import { BadgeCheck, Clock, CalendarClock, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PlayerCheckInDialogProps {
  slotId: string;
  venueId: string;
  onClose?: () => void;
}

const PlayerCheckInDialog = ({ slotId, venueId, onClose }: PlayerCheckInDialogProps) => {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      await updateBookingCheckIn(bookingId, isCheckedIn);
      
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

  if (isLoading) {
    return <div className="p-4 text-center">Loading player bookings...</div>;
  }

  return (
    <div className="space-y-4">
      {bookings.length > 0 ? (
        <div className="divide-y">
          {bookings.map((booking) => (
            <div key={booking.id} className="py-4 flex items-center justify-between">
              <div>
                <div className="font-medium">{booking.userName || 'Unknown Player'}</div>
                <div className="text-sm text-gray-500 mt-1">
                  <div className="flex items-center space-x-2">
                    <User className="w-3.5 h-3.5" />
                    <span>Player ID: {booking.userId.substring(0, 8)}...</span>
                  </div>
                </div>
                <div className="mt-2 flex items-center space-x-2">
                  <Badge variant={booking.checkedIn ? "success" : "outline"}>
                    {booking.checkedIn ? "Checked In" : "Not Checked In"}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id={`checkin-${booking.id}`}
                    checked={booking.checkedIn}
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
              </div>
            </div>
          ))}
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
