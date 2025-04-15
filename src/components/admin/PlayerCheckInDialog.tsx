
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { getSlotBookings } from "@/services/adminBookingService";
import { updateBookingCheckInStatus } from "@/services/checkInService";
import { cancelBooking } from "@/services/userBookingService";
import { BookingWithDetails } from "@/models/types";
import { UserCheck, X, Check } from "lucide-react";
import { getSlotById } from "@/services/slotService";
import { Badge } from "@/components/ui/badge";

interface PlayerCheckInDialogProps {
  slotId: string;
  venueId: string;
  onClose: () => void;
}

const PlayerCheckInDialog = ({ slotId, venueId, onClose }: PlayerCheckInDialogProps) => {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [slotDetails, setSlotDetails] = useState<{date: string, startTime: string, venueName: string}>({
    date: '', 
    startTime: '',
    venueName: ''
  });

  useEffect(() => {
    loadBookings();
  }, [slotId, venueId]);

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      const [bookingsData, slotData] = await Promise.all([
        getSlotBookings(slotId),
        getSlotById(slotId)
      ]);
      setBookings(bookingsData);
      setSlotDetails({
        date: slotData.date,
        startTime: slotData.startTime,
        venueName: bookingsData[0]?.venue.name || 'Unknown Venue'
      });
    } catch (error) {
      toast.error("Failed to load bookings");
      console.error("Error loading bookings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckInToggle = async (bookingId: string, isCheckedIn: boolean) => {
    try {
      await updateBookingCheckInStatus(bookingId, isCheckedIn);
      
      setBookings(bookings.map(booking => {
        if (booking.id === bookingId) {
          return { ...booking, checkedIn: isCheckedIn };
        }
        return booking;
      }));
      
      toast.success(isCheckedIn ? "Player checked in" : "Player check-in removed");
    } catch (error) {
      toast.error("Failed to update check-in status");
      console.error("Error updating check-in status:", error);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    setIsCancelling(true);
    try {
      await cancelBooking(bookingId);
      toast.success("Booking cancelled successfully");
      // Remove the cancelled booking from the list
      setBookings(bookings.filter(booking => booking.id !== bookingId));
    } catch (error: any) {
      toast.error(error.message || "Failed to cancel booking");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="space-y-4">
      {!isLoading && (
        <div className="mb-4">
          <h3 className="font-medium text-lg">{slotDetails.venueName}</h3>
          <p className="text-gray-600">
            {slotDetails.date} • {slotDetails.startTime}
          </p>
        </div>
      )}
      
      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading player data...</p>
        </div>
      ) : bookings.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Player</TableHead>
              <TableHead>Booking Time</TableHead>
              <TableHead className="text-center">Check-In Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>
                  {booking.userName || "Player"}
                </TableCell>
                <TableCell>
                  {new Date(booking.createdAt).toLocaleString()}
                </TableCell>
                <TableCell className="text-center">
                  {booking.checkedIn ? (
                    <Badge variant="success" className="inline-flex items-center bg-green-100 text-green-800 px-2 py-1 rounded-md">
                      <Check className="h-3.5 w-3.5 mr-1" />
                      Checked In
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="inline-flex items-center px-2 py-1 rounded-md">
                      <X className="h-3.5 w-3.5 mr-1" />
                      Not checked in
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      size="sm"
                      variant={booking.checkedIn ? "outline" : "default"}
                      className={booking.checkedIn ? "border-green-500 text-green-500" : "bg-green-500 hover:bg-green-600"}
                      onClick={() => handleCheckInToggle(booking.id, !booking.checkedIn)}
                    >
                      {booking.checkedIn ? "Remove Check-in" : "Check In"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-500 text-red-500"
                      onClick={() => handleCancelBooking(booking.id)}
                      disabled={isCancelling}
                    >
                      Cancel
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No players have booked this slot yet.</p>
        </div>
      )}
      
      <div className="flex justify-end mt-6">
        <Button variant="outline" onClick={onClose}>Close</Button>
      </div>
    </div>
  );
};

export default PlayerCheckInDialog;
