
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Venue } from "@/models/types";

interface VenueSelectorProps {
  venues: Venue[];
  selectedVenue: string | null;
  onVenueChange: (venueId: string) => void;
  isLoading: boolean;
}

const VenueSelector = ({ 
  venues, 
  selectedVenue, 
  onVenueChange, 
  isLoading 
}: VenueSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700">Select Venue</Label>
      <Select 
        value={selectedVenue || ""} 
        onValueChange={onVenueChange}
        disabled={isLoading}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a venue" />
        </SelectTrigger>
        <SelectContent>
          {venues.length > 0 ? (
            venues.map((venue) => (
              <SelectItem key={venue.id} value={venue.id}>
                {venue.name} - {venue.city}, {venue.state}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="no-results" disabled>
              No venues found
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default VenueSelector;
