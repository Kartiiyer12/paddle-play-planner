
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
import { User, Slot, Venue } from "@/models/types";
import { mockSlots, mockVenues } from "@/data/mockData";

const BookSlot = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("currentUser");
    if (!userData) {
      toast.error("You must be logged in to book slots");
      navigate("/login");
      return;
    }

    // Parse user data
    const parsedUser: User = JSON.parse(userData);
    setUser(parsedUser);
    setIsLoading(false);
  }, [navigate]);

  useEffect(() => {
    if (selectedVenue && selectedDate) {
      // Filter slots by venue and date
      const dateString = format(selectedDate, "yyyy-MM-dd");
      const slots = mockSlots.filter(
        (slot) => slot.venueId === selectedVenue && slot.date === dateString
      );
      setAvailableSlots(slots);
    } else {
      setAvailableSlots([]);
    }
  }, [selectedVenue, selectedDate]);

  const handleBookSlot = (slotId: string) => {
    // In a real app, we would call the API to book the slot
    toast.success("Slot booked successfully!");
    navigate("/dashboard");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar isLoggedIn={true} />

      <div className="flex-grow pt-24 pb-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Book a Slot</h1>
            <p className="text-gray-600 mt-2">
              Find and book available pickleball slots at your preferred venue and time
            </p>
          </div>

          {/* Filters */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Venue Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Select Venue</label>
                  <Select onValueChange={setSelectedVenue}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a venue" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockVenues.map((venue) => (
                        <SelectItem key={venue.id} value={venue.id}>
                          {venue.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Filter */}
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

                {/* Search Button */}
                <div className="flex items-end">
                  <Button 
                    className="w-full bg-pickleball-purple hover:bg-pickleball-purple/90"
                    disabled={!selectedVenue || !selectedDate}
                  >
                    Search Available Slots
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Available Slots */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Available Slots</h2>

            {selectedVenue && selectedDate ? (
              availableSlots.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableSlots.map((slot) => {
                    const venue = mockVenues.find((v) => v.id === slot.venueId);
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
                                {selectedDate ? format(selectedDate, "EEEE, MMMM d") : ""}
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
                              onClick={() => handleBookSlot(slot.id)}
                              disabled={isFull}
                              className={isFull ? "bg-gray-300" : "bg-pickleball-purple hover:bg-pickleball-purple/90"}
                            >
                              Book Slot
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
