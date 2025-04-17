
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
import { Venue } from "@/models/types";

interface ProfileVenueSelectorProps {
  venues: Venue[];
  selectedVenues: string[];
  onVenueToggle: (venueId: string) => void;
  disabled?: boolean;
}

const ProfileVenueSelector = ({
  venues,
  selectedVenues,
  onVenueToggle,
  disabled = false
}: ProfileVenueSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredVenues = venues.filter(venue => {
    if (!searchTerm) return true;
    
    const search = searchTerm.toLowerCase();
    // Enhanced search to include venue name, city, state, and address
    return (
      venue.name.toLowerCase().includes(search) ||
      venue.city.toLowerCase().includes(search) ||
      venue.state.toLowerCase().includes(search) ||
      (venue.address && venue.address.toLowerCase().includes(search))
    );
  });

  // First display selected venues, then unselected ones
  const sortedVenues = [...filteredVenues].sort((a, b) => {
    const aSelected = selectedVenues.includes(a.id);
    const bSelected = selectedVenues.includes(b.id);
    
    if (aSelected && !bSelected) return -1;
    if (!aSelected && bSelected) return 1;
    return 0;
  });

  return (
    <div className="space-y-4">
      <Label>Preferred Venues</Label>
      <div className="relative">
        <Input
          type="text"
          placeholder="Search venues by name, city, state or address..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pr-10"
          disabled={disabled}
        />
        <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedVenues.map((venue) => (
          <div
            key={venue.id}
            className={`border rounded-md p-4 cursor-pointer ${
              selectedVenues.includes(venue.id)
                ? "border-pickleball-purple bg-pickleball-purple/5"
                : "border-gray-200 hover:border-pickleball-purple/50"
            }`}
            onClick={() => onVenueToggle(venue.id)}
          >
            <h3 className="font-medium">{venue.name}</h3>
            <p className="text-sm text-gray-500">{venue.city}, {venue.state}</p>
            {venue.address && (
              <p className="text-xs text-gray-400 mt-1">{venue.address}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileVenueSelector;
