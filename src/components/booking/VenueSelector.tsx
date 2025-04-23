
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin } from "lucide-react";
import { getAllVenuesForBooking } from "@/services/venueService";
import { Venue } from "@/models/types";

interface VenueSelectorProps {
  selectedVenueId: string | null;
  onVenueSelect: (venueId: string) => void;
}

const VenueSelector = ({ selectedVenueId, onVenueSelect }: VenueSelectorProps) => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadVenues = async () => {
      try {
        // Use getAllVenuesForBooking instead of getVenues to show all venues
        const venueData = await getAllVenuesForBooking();
        setVenues(venueData);
        
        // If no venue is selected and we have venues, select the first one
        if (!selectedVenueId && venueData.length > 0) {
          onVenueSelect(venueData[0].id);
        }
      } catch (error) {
        console.error("Error loading venues:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadVenues();
  }, [selectedVenueId, onVenueSelect]);

  // Display selected venue details
  const selectedVenue = venues.find(venue => venue.id === selectedVenueId);

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="mb-4">
          <Label htmlFor="venue-select">Select a Venue</Label>
          {isLoading ? (
            <Skeleton className="h-10 w-full mt-2" />
          ) : venues.length > 0 ? (
            <Select 
              value={selectedVenueId || undefined} 
              onValueChange={onVenueSelect}
            >
              <SelectTrigger id="venue-select" className="mt-2">
                <SelectValue placeholder="Select a venue" />
              </SelectTrigger>
              <SelectContent>
                {venues.map((venue) => (
                  <SelectItem key={venue.id} value={venue.id}>
                    {venue.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="text-gray-500 mt-2">No venues available</p>
          )}
        </div>

        {selectedVenue && (
          <div className="mt-4 border-t pt-4">
            <h3 className="font-medium mb-2">{selectedVenue.name}</h3>
            <div className="flex items-start text-sm text-gray-600">
              <MapPin className="h-4 w-4 mt-0.5 mr-1 flex-shrink-0" />
              <p>
                {selectedVenue.address}, {selectedVenue.city}, {selectedVenue.state}
                {selectedVenue.zip && `, ${selectedVenue.zip}`}
              </p>
            </div>
            {selectedVenue.description && (
              <p className="mt-2 text-sm text-gray-600">{selectedVenue.description}</p>
            )}
            <div className="mt-2 text-sm">
              <span className="text-pickleball-purple font-medium">{selectedVenue.courtCount}</span> 
              <span className="text-gray-600"> {selectedVenue.courtCount === 1 ? 'court' : 'courts'} available</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VenueSelector;
