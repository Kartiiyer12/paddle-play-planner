
import { Button } from "@/components/ui/button";
import { Slot } from "@/models/types";
import { format } from "date-fns";
import { CalendarCheck, Clock, Users } from "lucide-react";

interface SlotCardProps {
  slot: Slot;
  venueName: string;
  onBookSlot: (slotId: string, venueId: string) => void;
  isBooking: boolean;
  canBook: boolean;
}

const SlotCard = ({ 
  slot, 
  venueName, 
  onBookSlot, 
  isBooking,
  canBook 
}: SlotCardProps) => {
  
  // Format times for display
  const startTime = format(new Date(`2000-01-01T${slot.startTime}`), 'h:mm a');
  const endTime = format(new Date(`2000-01-01T${slot.endTime}`), 'h:mm a');
  
  // Available spots
  const availableSpots = slot.maxPlayers - slot.currentPlayers;
  
  // Check if slot is full
  const isFull = availableSpots <= 0;
  
  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-gray-900">{venueName}</h3>
          {isFull && (
            <span className="text-xs font-medium bg-red-100 text-red-800 py-1 px-2 rounded">
              Full
            </span>
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
            <span>{slot.currentPlayers} / {slot.maxPlayers} players</span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <Button
            onClick={() => onBookSlot(slot.id, slot.venueId)}
            className="w-full bg-pickleball-purple hover:bg-pickleball-purple/90"
            disabled={isBooking || isFull || !canBook}
          >
            {isBooking ? "Booking..." : "Book Slot"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SlotCard;
