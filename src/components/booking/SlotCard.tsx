import { Button } from "@/components/ui/button";
import { Slot } from "@/models/types";
import { format } from "date-fns";
import { CalendarCheck, Clock, Users, Check, X, Coins } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SlotCardProps {
  slot: Slot;
  venueName: string;
  onBookSlot: (slotId: string, venueId: string) => void;
  isBooking: boolean;
  canBook: boolean;
  isBooked: boolean;
  userSlotCoins?: number;
  allowBookingWithoutCoins?: boolean;
}

const SlotCard = ({ 
  slot, 
  venueName, 
  onBookSlot, 
  isBooking,
  canBook,
  isBooked,
  userSlotCoins = 0,
  allowBookingWithoutCoins = false
}: SlotCardProps) => {
  
  // Format times for display
  const startTime = format(new Date(`2000-01-01T${slot.startTime}`), 'h:mm a');
  const endTime = format(new Date(`2000-01-01T${slot.endTime}`), 'h:mm a');
  
  // Available spots
  const availableSpots = slot.maxPlayers - slot.currentPlayers;
  
  // Check if slot is full
  const isFull = availableSpots <= 0;
  
  // Check if user has enough coins when coins are required
  const hasNoCoins = !allowBookingWithoutCoins && userSlotCoins <= 0;
  
  // Determine if booking is allowed
  // If allowBookingWithoutCoins is true, always allow booking (regardless of coin balance)
  // If allowBookingWithoutCoins is false, only allow if user has coins
  const canBookSlot = canBook && !isFull && !isBooked && (allowBookingWithoutCoins || userSlotCoins > 0);
  
  // Determine button label
  let buttonLabel = "Book Slot";
  if (isBooked) buttonLabel = "Already Booked";
  else if (isFull) buttonLabel = "Fully Booked";
  else if (isBooking) buttonLabel = "Booking...";
  else if (hasNoCoins) buttonLabel = "Not Enough Coins";
  
  return (
    <div className={`border rounded-lg overflow-hidden ${isFull ? 'bg-gray-50' : 'bg-white'}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-gray-900">{venueName}</h3>
          {isFull && (
            <Badge variant="destructive" className="text-xs flex items-center gap-1">
              <X className="h-3 w-3" /> Full
            </Badge>
          )}
          {isBooked && (
            <Badge variant="secondary" className="text-xs flex items-center gap-1">
              <Check className="h-3 w-3" /> Booked
            </Badge>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-2" />
            <span>{startTime} - {endTime}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <CalendarCheck className="h-4 w-4 mr-2" />
            <span>{format(new Date(slot.date), 'MMM d, yyyy')}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 mr-2" />
            <span className={isFull ? "font-medium text-red-600" : ""}>
              {slot.currentPlayers} / {slot.maxPlayers} players
              {isFull ? " (No spots left)" : availableSpots === 1 ? " (Last spot!)" : ""}
            </span>
          </div>
          
          {/* Only show 'No coins available' if booking without coins is NOT allowed */}
          {hasNoCoins && (
            <div className="flex items-center text-sm text-red-600">
              <Coins className="h-4 w-4 mr-2" />
              <span>No coins available</span>
            </div>
          )}
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Button
                    onClick={() => onBookSlot(slot.id, slot.venueId)}
                    className={`w-full ${
                      canBookSlot ? 
                      "bg-pickleball-purple hover:bg-pickleball-purple/90" : 
                      "bg-gray-400 hover:bg-gray-400 cursor-not-allowed"
                    }`}
                    disabled={isBooking || !canBookSlot}
                  >
                    {buttonLabel}
                  </Button>
                </div>
              </TooltipTrigger>
              {/* Only show tooltip if booking without coins is NOT allowed and user has no coins */}
              {hasNoCoins && (
                <TooltipContent>
                  <p>You need at least 1 coin to book a slot</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
};

export default SlotCard;
