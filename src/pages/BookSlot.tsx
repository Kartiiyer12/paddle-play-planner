
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackButton from "@/components/navigation/BackButton";
import { Slot, Venue } from "@/models/types";
import { getVenues } from "@/services/venueService";
import { getSlotsByVenue } from "@/services/slotService";
import { bookSlot } from "@/services/userBookingService";
import { useAuth } from "@/context/AuthContext";

// Import refactored components
import VenueSelector from "@/components/booking/VenueSelector";
import DateSelector from "@/components/booking/DateSelector";
import AvailableSlots from "@/components/booking/AvailableSlots";

const BookSlot = () => {
  const navigate = useNavigate();
  const { user, isLoading: isLoadingAuth } = useAuth();
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    if (!isLoadingAuth) {
      if (!user) {
        toast.error("You must be logged in to book slots");
        navigate("/login");
        return;
      }

      loadVenues();
    }
  }, [navigate, user, isLoadingAuth]);

  const loadVenues = async () => {
    setIsLoading(true);
    try {
      const data = await getVenues();
      setVenues(data);
      
      if (data.length > 0 && !selectedVenue) {
        setSelectedVenue(data[0].id);
      }
    } catch (error) {
      toast.error("Failed to load venues");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedVenue && selectedDate) {
      loadSlots();
    } else {
      setAvailableSlots([]);
    }
  }, [selectedVenue, selectedDate]);

  const loadSlots = async () => {
    if (!selectedVenue || !selectedDate) return;
    
    try {
      const dateString = format(selectedDate, "yyyy-MM-dd");
      const data = await getSlotsByVenue(selectedVenue);
      
      const filteredSlots = data.filter(slot => slot.date === dateString);
      setAvailableSlots(filteredSlots);
    } catch (error) {
      toast.error("Failed to load available slots");
    }
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
              Find and book available pickleball slots at your preferred venue and time
            </p>
          </div>

          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <VenueSelector
                  venues={venues}
                  selectedVenue={selectedVenue}
                  onVenueChange={setSelectedVenue}
                  isLoading={isLoading}
                />

                <DateSelector
                  selectedDate={selectedDate}
                  onDateChange={setSelectedDate}
                  isLoading={isLoading}
                />

                <div className="flex items-end">
                  <Button 
                    className="w-full bg-pickleball-purple hover:bg-pickleball-purple/90"
                    onClick={loadSlots}
                    disabled={!selectedVenue || !selectedDate}
                  >
                    Search Available Slots
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <AvailableSlots
            availableSlots={availableSlots}
            venues={venues}
            selectedVenue={selectedVenue}
            selectedDate={selectedDate}
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
