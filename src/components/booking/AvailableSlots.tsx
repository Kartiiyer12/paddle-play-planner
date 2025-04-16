
import { Slot, Venue } from "@/models/types";
import { Card, CardContent } from "@/components/ui/card";
import SlotCard from "./SlotCard";
import { format } from "date-fns";

interface AvailableSlotsProps {
  availableSlots: Slot[];
  venues: Venue[];
  selectedVenue: string | null;
  onBookSlot: (slotId: string, venueId: string) => Promise<void>;
  isBooking: boolean;
  slotCoins: number;
}

const AvailableSlots = ({
  availableSlots,
  venues,
  selectedVenue,
  onBookSlot,
  isBooking,
  slotCoins
}: AvailableSlotsProps) => {
  // Group slots by date
  const slotsByDate = availableSlots.reduce((acc, slot) => {
    const date = format(new Date(slot.date), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(slot);
    return acc;
  }, {} as Record<string, Slot[]>);

  // Sort dates
  const sortedDates = Object.keys(slotsByDate).sort();

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Available Slots</h2>

      {selectedVenue ? (
        availableSlots.length > 0 ? (
          <div className="space-y-8">
            {sortedDates.map(dateStr => {
              const slots = slotsByDate[dateStr];
              const formattedDate = format(new Date(dateStr), 'EEEE, MMMM d');
              const isToday = new Date(dateStr).toDateString() === new Date().toDateString();
              
              return (
                <div key={dateStr} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-medium">{formattedDate}</h3>
                    {isToday && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Today</span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {slots.map((slot) => {
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
                </div>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-600 mb-4">No slots available for the selected venue.</p>
              <p className="text-gray-600">Try a different venue.</p>
            </CardContent>
          </Card>
        )
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-600">
              Select a venue to see available slots
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AvailableSlots;
