
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { getSlotBookings, updateBookingCheckInStatus } from "@/services/bookingService";
import { BookingWithDetails } from "@/models/types";
import { UserCheck } from "lucide-react";
import { getSlotById } from "@/services/slotService";

interface PlayerCheckInDialogProps {
  slotId: string;
  venueId: string;
  onClose: () => void;
}

const PlayerCheckInDialog = ({ slotId, venueId, onClose }: PlayerCheckInDialogProps) => {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-100 text-green-800">
                      <UserCheck className="h-4 w-4 mr-1" />
                      Checked In
                    </span>
                  ) : (
                    <span className="text-gray-500">Not checked in</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end">
                    <span className="mr-2">Check-in:</span>
                    <Checkbox 
                      checked={booking.checkedIn} 
                      onCheckedChange={(isChecked) => {
                        handleCheckInToggle(booking.id, !!isChecked);
                      }}
                    />
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
