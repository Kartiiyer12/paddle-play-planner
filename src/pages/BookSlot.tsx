import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Clock, MapPin } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Slot, Venue } from "@/models/types";
import { getVenues } from "@/services/venueService";
import { getSlotsByVenue } from "@/services/slotService";
import { bookSlot } from "@/services/bookingService";
import { useAuth } from "@/context/AuthContext";

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
      
      loadSlots();
    } catch (error: any) {
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Book a Slot</h1>
            <p className="text-gray-600 mt-2">
              Find and book available pickleball slots at your preferred venue and time
            </p>
          </div>

          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Select Venue</label>
                  <Select value={selectedVenue || ""} onValueChange={setSelectedVenue}>
                    <SelectTrigger>
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
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Select Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? (
                          format(selectedDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

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

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Available Slots</h2>

            {selectedVenue && selectedDate ? (
              availableSlots.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableSlots.map((slot) => {
                    const venue = venues.find((v) => v.id === slot.venueId);
                    const isFull = slot.currentPlayers >= slot.maxPlayers;

                    return (
                      <Card key={slot.id}>
                        <CardContent className="p-6">
                          <h3 className="font-semibold text-lg mb-2">{venue?.name}</h3>
                          <div className="space-y-3 mb-4">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-2 text-pickleball-purple" />
                              <span className="text-sm text-gray-600">
                                {venue?.city}, {venue?.state}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <CalendarIcon className="h-4 w-4 mr-2 text-pickleball-purple" />
                              <span className="text-sm text-gray-600">
                                {selectedDate ? format(selectedDate, "EEEE, MMMM d") : ""} ({slot.dayOfWeek})
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2 text-pickleball-purple" />
                              <span className="text-sm text-gray-600">
                                {slot.startTime} - {slot.endTime}
                              </span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center">
                            <div>
                              <span className="text-sm font-medium">
                                {slot.currentPlayers}/{slot.maxPlayers} Players
                              </span>
                              {isFull && (
                                <span className="ml-2 text-xs text-red-500 bg-red-50 px-2 py-1 rounded-full">
                                  Full
                                </span>
                              )}
                            </div>
                            <Button
                              onClick={() => handleBookSlot(slot.id, slot.venueId)}
                              disabled={isFull || isBooking}
                              className={isFull ? "bg-gray-300" : "bg-pickleball-purple hover:bg-pickleball-purple/90"}
                            >
                              {isBooking ? "Booking..." : "Book Slot"}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-gray-600 mb-4">No slots available for the selected venue and date.</p>
                    <p className="text-gray-600">Please try a different combination.</p>
                  </CardContent>
                </Card>
              )
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-gray-600">
                    Select a venue and date to see available slots
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BookSlot;
