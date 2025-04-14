
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, MapPin, UserCheck } from "lucide-react";
import { Slot, Venue } from "@/models/types";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { updateBookingCheckInStatus } from "@/services/bookingService";
import { toast } from "sonner";

interface SlotCardProps {
  slot: Slot;
  venue: Venue;
  isBooked?: boolean;
  bookingId?: string;
  isCheckedIn?: boolean;
  onBook?: () => void;
  disableBooking?: boolean;
}

const SlotCard = ({
  slot,
  venue,
  isBooked = false,
  bookingId,
  isCheckedIn = false,
  onBook,
  disableBooking = false
}: SlotCardProps) => {
  const { user } = useAuth();
  const [checkingIn, setCheckingIn] = useState(false);
  const isFull = slot.currentPlayers >= slot.maxPlayers;
  const isUpcoming = new Date(`${slot.date}T${slot.startTime}`) > new Date();
  const canCheckIn = isBooked && isUpcoming && !isCheckedIn;

  const handleCheckIn = async () => {
    if (!bookingId) return;
    
    try {
      setCheckingIn(true);
      await updateBookingCheckInStatus(bookingId, true);
      toast.success("You're checked in! Enjoy your game.");
    } catch (error: any) {
      toast.error(error.message || "Check-in failed");
    } finally {
      setCheckingIn(false);
    }
  };

  return (
    <Card className={cn(
      "border border-gray-200 transition-all duration-300",
      isBooked && "border-pickleball-purple/70",
      isFull && !isBooked && "opacity-60"
    )}>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between">
          <h3 className="font-medium">{venue.name}</h3>
          <div className={cn(
            "px-2 py-1 text-xs rounded",
            isFull ? "bg-gray-100 text-gray-600" : "bg-green-100 text-green-700"
          )}>
            {slot.currentPlayers}/{slot.maxPlayers} Players
          </div>
        </div>
        
        <div className="text-sm text-gray-500 space-y-1">
          <div className="flex items-center">
            <MapPin className="w-3.5 h-3.5 mr-1.5" />
            <span>{venue.city}, {venue.state}</span>
          </div>
          <div className="flex items-center">
            <CalendarDays className="w-3.5 h-3.5 mr-1.5" />
            <span>{slot.date} ({slot.dayOfWeek})</span>
          </div>
          <div className="flex items-center">
            <Clock className="w-3.5 h-3.5 mr-1.5" />
            <span>{slot.startTime} - {slot.endTime}</span>
          </div>
        </div>
        
        <div className="pt-2">
          {isBooked ? (
            <div className="space-y-2">
              <div className={cn(
                "text-xs px-2 py-1 rounded-full w-fit",
                "bg-pickleball-purple/20 text-pickleball-purple"
              )}>
                You're booked for this slot
              </div>
              
              {isCheckedIn ? (
                <div className="flex items-center text-sm text-green-600">
                  <UserCheck className="h-4 w-4 mr-1" /> 
                  Checked In
                </div>
              ) : canCheckIn ? (
                <Button 
                  size="sm" 
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={handleCheckIn}
                  disabled={checkingIn}
                >
                  <UserCheck className="h-4 w-4 mr-2" /> 
                  Check In
                </Button>
              ) : null}
            </div>
          ) : (
            <Button
              className="w-full bg-pickleball-purple hover:bg-pickleball-purple/90"
              size="sm"
              onClick={onBook}
              disabled={isFull || disableBooking || !user}
            >
              {isFull ? "Fully Booked" : "Book Now"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SlotCard;
