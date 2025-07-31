
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getVenues } from "@/services/venueService"; 
import { getSlotsByDateRange } from "@/services/slotService";
import { bookSlot, getUserBookedSlotIds } from "@/services/userBookingService";
import { Venue, Slot } from "@/models/types";
import { useAuth } from "@/context/AuthContext";
import VenueSelector from "@/components/booking/VenueSelector";
import AvailableSlots from "@/components/booking/AvailableSlots";
import { add, format } from "date-fns";
import { getVenueBookingPolicy } from "@/services/adminSettingsService";
import { Coins } from "lucide-react";
import { getUserSlotCoins } from "@/services/profileService";

const BookSlot = () => {
  const navigate = useNavigate();
  const { user, isLoading: isLoadingAuth } = useAuth();
  
  const [venues, setVenues] = useState<Venue[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [userBookedSlotIds, setUserBookedSlotIds] = useState<string[]>([]);
  const [allowBookingWithoutCoins, setAllowBookingWithoutCoins] = useState(false);
  const [userSlotCoins, setUserSlotCoins] = useState(0);
  
  useEffect(() => {
    if (!isLoadingAuth) {
      if (!user) {
        toast.error("You must be logged in to book slots");
        navigate("/login");
        return;
      }

      loadInitialData();
    }
  }, [user, isLoadingAuth, navigate]);

  useEffect(() => {
    if (selectedVenue && user?.id) {
      loadAdminSettings();
      loadUserCoins();
    }
  }, [selectedVenue, user?.id]);

  const loadUserCoins = async () => {
    if (!user?.id) return;
    
    try {
      // Use the dedicated function to fetch slot coins
      const coins = await getUserSlotCoins(user.id);
      setUserSlotCoins(coins);
    } catch (error) {
      console.error("Error loading user coins:", error);
      setUserSlotCoins(0);
    }
  };

  const loadAdminSettings = async () => {
    if (selectedVenue) {
      try {
        const policy = await getVenueBookingPolicy(selectedVenue);
        setAllowBookingWithoutCoins(policy.allow_booking_without_coins);
      } catch (error) {
        console.error("Error loading venue booking policy:", error);
        // Default to false if there's an error or no settings
        setAllowBookingWithoutCoins(false);
      }
    }
  };

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      // Load user's booked slot IDs first
      try {
        const bookedSlotIds = await getUserBookedSlotIds();
        setUserBookedSlotIds(bookedSlotIds);
      } catch (error) {
        console.error("Error loading booked slots:", error);
        // Continue with empty booked slots
      }
      
      // Load venues
      const venuesData = await getVenues();
      setVenues(venuesData);

      // Try to set default venue from user preferred venues
      if (user?.preferredVenues?.length) {
        setSelectedVenue(user.preferredVenues[0]);
      }

      // Load user coins
      await loadUserCoins();

      // Load slots for next 7 days
      await loadSlotsForNext7Days();
      
    } catch (error) {
      console.error("Error loading initial data:", error);
      toast.error("Failed to load venues and slots");
    } finally {
      setIsLoading(false);
    }
  };

  const loadSlotsForNext7Days = async (venueId?: string) => {
    try {
      const today = new Date();
      const nextWeek = add(today, { days: 7 });
      
      const startDate = format(today, 'yyyy-MM-dd');
      const endDate = format(nextWeek, 'yyyy-MM-dd');
      
      const slotsData = await getSlotsByDateRange(startDate, endDate, venueId || selectedVenue);
      
      setAvailableSlots(slotsData);
    } catch (error) {
      console.error("Error loading slots:", error);
      toast.error("Failed to load available slots");
    }
  };

  const handleVenueChange = async (venueId: string) => {
    setSelectedVenue(venueId);
    await loadSlotsForNext7Days(venueId);
    await loadAdminSettings();
  };

  const handleBookSlot = async (slotId: string, venueId: string) => {
    if (!user) {
      toast.error("You must be logged in to book slots");
      return;
    }

    // Check if booking is allowed based on coins
    if (!allowBookingWithoutCoins && userSlotCoins <= 0) {
      toast.error("Not enough coins to book this slot");
      return;
    }

    setIsBooking(true);
    try {
      await bookSlot(slotId, venueId);
      
      toast.success("Slot booked successfully!");
      
      // Update user's booked slot IDs
      setUserBookedSlotIds([...userBookedSlotIds, slotId]);
      
      // Update available slots
      await loadSlotsForNext7Days();
      
      // Refresh user coins after booking
      await loadUserCoins();
      
    } catch (error: any) {
      toast.error(error.message || "Failed to book slot");
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoadingAuth || (isLoading && !availableSlots.length)) {
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
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-3xl font-bold text-gray-900">Book a Slot</h1>
            
            {!allowBookingWithoutCoins && (
              <div className="flex items-center bg-white px-4 py-2 rounded-full border shadow-sm">
                <Coins className="h-5 w-5 text-yellow-500 mr-2" />
                <span className="font-medium">{userSlotCoins} Coins</span>
              </div>
            )}
          </div>
          
          <p className="text-gray-600 mb-8">
            Find and book available pickleball sessions
          </p>

          <div className="grid grid-cols-1 md:grid-cols-[300px,1fr] gap-8">
            <div className="space-y-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="space-y-6">
                  <VenueSelector
                    venues={venues}
                    selectedVenue={selectedVenue}
                    onVenueChange={handleVenueChange}
                    isLoading={isLoading}
                    preferredVenues={user?.preferredVenues || []}
                  />
                </div>
              </div>
            </div>

            <AvailableSlots
              availableSlots={availableSlots}
              venues={venues}
              selectedVenue={selectedVenue}
              onBookSlot={handleBookSlot}
              isBooking={isBooking}
              userBookedSlotIds={userBookedSlotIds}
              userSlotCoins={userSlotCoins}
              allowBookingWithoutCoins={allowBookingWithoutCoins}
            />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BookSlot;
