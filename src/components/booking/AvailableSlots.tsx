
import { Slot, Venue } from "@/models/types";
import { Card, CardContent } from "@/components/ui/card";
import SlotCard from "./SlotCard";

interface AvailableSlotsProps {
  availableSlots: Slot[];
  venues: Venue[];
  selectedVenue: string | null;
  selectedDate: Date | undefined;
  onBookSlot: (slotId: string, venueId: string) => Promise<void>;
  isBooking: boolean;
  slotCoins: number;
}

const AvailableSlots = ({
  availableSlots,
  venues,
  selectedVenue,
  selectedDate,
  onBookSlot,
  isBooking,
  slotCoins
}: AvailableSlotsProps) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Available Slots</h2>

      {selectedVenue && selectedDate ? (
        availableSlots.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableSlots.map((slot) => {
              const venue = venues.find((v) => v.id === slot.venueId) as Venue;
              
              return (
                <SlotCard
                  key={slot.id}
                  slot={slot}
                  venue={venue}
                  onBook={() => onBookSlot(slot.id, slot.venueId)}
                  disableBooking={isBooking || slotCoins <= 0}
                />
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-600 mb-4">No slots available for the selected venue and date.</p>
              <p className="text-gray-600">Try a different date or venue.</p>
            </CardContent>
          </Card>
        )
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-600">
              Select a venue and date to see available slots
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AvailableSlots;
