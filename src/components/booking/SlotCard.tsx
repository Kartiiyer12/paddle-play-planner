
import { Slot, Venue } from "@/models/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, CalendarIcon, MapPin, Coins } from "lucide-react";
import { format } from "date-fns";

interface SlotCardProps {
  slot: Slot;
  venue: Venue | undefined;
  onBookSlot: (slotId: string, venueId: string) => Promise<void>;
  isBooking: boolean;
  selectedDate: Date | undefined;
  hasEnoughCoins: boolean;
}

const SlotCard = ({ 
  slot, 
  venue, 
  onBookSlot, 
  isBooking, 
  selectedDate, 
  hasEnoughCoins 
}: SlotCardProps) => {
  const isFull = slot.currentPlayers >= slot.maxPlayers;

  return (
    <Card key={slot.id}>
      <CardContent className="p-6">
        <h3 className="font-semibold text-lg mb-2">{venue?.name}</h3>
        <div className="space-y-3 mb-4">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2 text-pickleball-purple" />
            <span className="text-sm text-gray-600">
              {venue?.city}, {venue?.state}
            </span>
          </div>
          <div className="flex items-center">
            <CalendarIcon className="h-4 w-4 mr-2 text-pickleball-purple" />
            <span className="text-sm text-gray-600">
              {selectedDate ? format(selectedDate, "EEEE, MMMM d") : ""} ({slot.dayOfWeek})
            </span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-pickleball-purple" />
            <span className="text-sm text-gray-600">
              {slot.startTime} - {slot.endTime}
            </span>
          </div>
          <div className="flex items-center">
            <Coins className="h-4 w-4 mr-2 text-pickleball-purple" />
            <span className="text-sm text-gray-600">
              1 Slot Coin
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <span className="text-sm font-medium">
              {slot.currentPlayers}/{slot.maxPlayers} Players
            </span>
            {isFull && (
              <span className="ml-2 text-xs text-red-500 bg-red-50 px-2 py-1 rounded-full">
                Full
              </span>
            )}
          </div>
          <Button
            onClick={() => onBookSlot(slot.id, slot.venueId)}
            disabled={isFull || isBooking || !hasEnoughCoins}
            className={
              isFull 
                ? "bg-gray-300" 
                : !hasEnoughCoins 
                  ? "bg-gray-300" 
                  : "bg-pickleball-purple hover:bg-pickleball-purple/90"
            }
          >
            {isBooking ? "Booking..." : !hasEnoughCoins ? "Need Coins" : "Book Slot"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SlotCard;
