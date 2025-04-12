
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Venue } from "@/models/types";
import { Search } from "lucide-react";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredVenues, setFilteredVenues] = useState<Venue[]>(venues);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredVenues(venues);
      return;
    }

    const lowercaseSearch = searchTerm.toLowerCase();
    const filtered = venues.filter(venue => 
      venue.name.toLowerCase().includes(lowercaseSearch) || 
      venue.city.toLowerCase().includes(lowercaseSearch) || 
      venue.state.toLowerCase().includes(lowercaseSearch)
    );
    
    setFilteredVenues(filtered);
  }, [searchTerm, venues]);

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700">Select Venue</Label>
      <div className="space-y-2">
        <div className="relative">
          <Input
            placeholder="Search venues by name, city or county"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
            disabled={isLoading}
          />
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
        <Select 
          value={selectedVenue || ""} 
          onValueChange={onVenueChange}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a venue" />
          </SelectTrigger>
          <SelectContent>
            {filteredVenues.length > 0 ? (
              filteredVenues.map((venue) => (
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
    </div>
  );
};

export default VenueSelector;
