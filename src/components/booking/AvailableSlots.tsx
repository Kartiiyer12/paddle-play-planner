
import { Slot, Venue } from "@/models/types";
import SlotCard from "./SlotCard";
import { groupBy, sortBy } from "lodash";
import { format, parseISO } from "date-fns";

interface AvailableSlotsProps {
  availableSlots: Slot[];
  venues: Venue[];
  selectedVenue: string | null;
  onBookSlot: (slotId: string, venueId: string) => void;
  isBooking: boolean;
  userBookedSlotIds: string[];
}

const AvailableSlots = ({ 
  availableSlots, 
  venues, 
  selectedVenue,
  onBookSlot,
  isBooking,
  userBookedSlotIds
}: AvailableSlotsProps) => {
  // Group slots by date
  const slotsByDate = groupBy(availableSlots, 'date');
  
  // Get sorted dates
  const sortedDates = sortBy(Object.keys(slotsByDate));

  // Filter slots by selected venue if any
  const filteredSlotsByDate = { ...slotsByDate };
  if (selectedVenue) {
    for (const date of sortedDates) {
      filteredSlotsByDate[date] = slotsByDate[date].filter(
        slot => slot.venueId === selectedVenue
      );
    }
  }

  // Get venue details
  const getVenueName = (venueId: string) => {
    const venue = venues.find(v => v.id === venueId);
    return venue ? venue.name : 'Unknown Venue';
  };

  // Return message if no slots available
  if (sortedDates.length === 0) {
    return (
      <div className="bg-white p-10 rounded-lg shadow-sm text-center border">
        <p className="text-lg text-gray-600">No available slots found</p>
        <p className="mt-2 text-sm text-gray-500">
          {selectedVenue 
            ? "Try selecting a different venue or check back later" 
            : "Please select a venue to see available slots"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {sortedDates.map(date => {
        const slots = filteredSlotsByDate[date];
        if (slots.length === 0) return null;

        return (
          <div key={date} className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold mb-4">
              {format(parseISO(date), 'EEEE, MMMM d, yyyy')}
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortBy(slots, ['startTime']).map(slot => (
                <SlotCard
                  key={slot.id}
                  slot={slot}
                  venueName={getVenueName(slot.venueId)}
                  onBookSlot={onBookSlot}
                  isBooking={isBooking}
                  canBook={true}
                  isBooked={userBookedSlotIds.includes(slot.id)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AvailableSlots;
