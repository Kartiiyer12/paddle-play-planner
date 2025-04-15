
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { format, addDays } from "date-fns";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackButton from "@/components/navigation/BackButton";
import { Slot, Venue } from "@/models/types";
import { getVenues } from "@/services/venueService";
import { getSlotsByVenue } from "@/services/slotService";
import { bookSlot, getUserBookings } from "@/services/userBookingService";
import { useAuth } from "@/context/AuthContext";

// Import refactored components
import VenueSelector from "@/components/booking/VenueSelector";
import AvailableSlots from "@/components/booking/AvailableSlots";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const BookSlot = () => {
  const navigate = useNavigate();
  const { user, isLoading: isLoadingAuth } = useAuth();
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [bookedSlotIds, setBookedSlotIds] = useState<string[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);

  // Create an array of the next 7 days
  const nextSevenDays = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

  useEffect(() => {
    if (!isLoadingAuth) {
      if (!user) {
        toast.error("You must be logged in to book slots");
        navigate("/login");
        return;
      }

      loadInitialData();
    }
  }, [navigate, user, isLoadingAuth]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [venuesData, userBookings] = await Promise.all([
        getVenues(),
        getUserBookings()
      ]);
      
      setVenues(venuesData);
      setBookedSlotIds(userBookings.map(booking => booking.slotId));

      // Get user's preferred venue from profile or use first venue
      if (venuesData.length > 0) {
        // Try to get preferred venue
        const userPreferredVenues = user?.preferredVenues || [];
        let preferredVenueId = null;
        
        if (userPreferredVenues.length > 0) {
          // Check if any of the preferred venues exists in the venues list
          for (const venueId of userPreferredVenues) {
            if (venuesData.some(v => v.id === venueId)) {
              preferredVenueId = venueId;
              break;
            }
          }
        }
        
        // If preferred venue is not found, use the first venue
        setSelectedVenue(preferredVenueId || venuesData[0].id);
      }
    } catch (error) {
      toast.error("Failed to load venues");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedVenue) {
      loadAllSlots();
    } else {
      setAvailableSlots([]);
    }
  }, [selectedVenue]);

  useEffect(() => {
    // Filter slots based on selected date when date tab changes
    filterSlotsByDate();
  }, [selectedDateIndex]);

  const loadAllSlots = async () => {
    if (!selectedVenue) return;
    
    try {
      const data = await getSlotsByVenue(selectedVenue);
      setAvailableSlots(data);
      // Initial filtering based on the default selected date
      filterSlotsByDate();
    } catch (error) {
      toast.error("Failed to load available slots");
    }
  };

  const filterSlotsByDate = () => {
    // This function filters the available slots based on the selected date
    const selectedDate = nextSevenDays[selectedDateIndex];
    const dateString = format(selectedDate, "yyyy-MM-dd");
    
    // We're not fetching from API again, just filtering local state
    const filteredSlots = availableSlots.filter(slot => slot.date === dateString);
    setAvailableSlots(filteredSlots);
  };

  const handleBookSlot = async (slotId: string, venueId: string) => {
    if (!user) {
      toast.error("You must be logged in to book slots");
      navigate("/login");
      return;
    }

    setIsBooking(true);
    try {
      await bookSlot(slotId, venueId);
      toast.success("Slot booked successfully!");
      navigate("/my-bookings");
    } catch (error: any) {
      console.error("Booking error:", error);
      toast.error(error.message || "Failed to book slot");
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoadingAuth || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-grow pt-24 pb-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="mb-6">
            <BackButton to="/" />
            <h1 className="text-3xl font-bold text-gray-900 mt-4">Book a Slot</h1>
            <p className="text-gray-600 mt-2">
              Find and book available pickleball slots at your preferred venue
            </p>
          </div>

          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 gap-6">
                {/* Simplified venue selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Select Venue</label>
                  <select 
                    value={selectedVenue || ""}
                    onChange={(e) => setSelectedVenue(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    disabled={isLoading}
                  >
                    {venues.map((venue) => (
                      <option key={venue.id} value={venue.id}>
                        {venue.name} - {venue.city}, {venue.state}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-3">Available Days</h3>
                  <Tabs 
                    value={selectedDateIndex.toString()} 
                    onValueChange={(value) => setSelectedDateIndex(parseInt(value))}
                    className="w-full"
                  >
                    <TabsList className="grid grid-cols-7 w-full">
                      {nextSevenDays.map((day, index) => (
                        <TabsTrigger 
                          key={index} 
                          value={index.toString()}
                          className="text-xs sm:text-sm flex flex-col py-2"
                        >
                          <span className="font-medium">
                            {format(day, 'EEE')}
                          </span>
                          <span>
                            {format(day, 'MMM d')}
                          </span>
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>
              </div>
            </CardContent>
          </Card>

          <AvailableSlots
            availableSlots={availableSlots.filter(slot => !bookedSlotIds.includes(slot.id))}
            venues={venues}
            selectedVenue={selectedVenue}
            selectedDate={nextSevenDays[selectedDateIndex]}
            onBookSlot={handleBookSlot}
            isBooking={isBooking}
            slotCoins={1} // Assume user has enough coins to book
          />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BookSlot;
