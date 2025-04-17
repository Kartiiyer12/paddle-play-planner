
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Venue } from "@/models/types";

interface VenueSelectorProps {
  venues: Venue[];
  selectedVenue: string | null;
  onVenueChange: (venueId: string) => void;
  isLoading: boolean;
  preferredVenues?: string[];
}

const VenueSelector = ({ 
  venues, 
  selectedVenue, 
  onVenueChange, 
  isLoading,
  preferredVenues = []
}: VenueSelectorProps) => {
  // Separate venues into preferred and other venues
  const preferredVenueObjects = venues.filter(venue => 
    preferredVenues.includes(venue.id)
  );
  
  const otherVenueObjects = venues.filter(venue => 
    !preferredVenues.includes(venue.id)
  );

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
          {preferredVenueObjects.length > 0 && (
            <SelectGroup>
              <SelectLabel>Preferred Venues</SelectLabel>
              {preferredVenueObjects.map((venue) => (
                <SelectItem key={venue.id} value={venue.id}>
                  {venue.name} - {venue.city}, {venue.state}
                </SelectItem>
              ))}
            </SelectGroup>
          )}

          {otherVenueObjects.length > 0 && (
            <SelectGroup>
              <SelectLabel>Other Venues</SelectLabel>
              {otherVenueObjects.map((venue) => (
                <SelectItem key={venue.id} value={venue.id}>
                  {venue.name} - {venue.city}, {venue.state}
                </SelectItem>
              ))}
            </SelectGroup>
          )}
          
          {venues.length === 0 && (
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
