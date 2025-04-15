
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackButton from "@/components/navigation/BackButton";
import { Calendar, Clock, MapPin, Check, X } from "lucide-react";
import { BookingWithDetails } from "@/models/types";
import { useAuth } from "@/context/AuthContext";
import { getUserBookings, cancelBooking } from "@/services/userBookingService";
import { updateBookingCheckInStatus } from "@/services/checkInService";
import { Badge } from "@/components/ui/badge";

const MyBookings = () => {
  const navigate = useNavigate();
  const { user, isLoading: isLoadingAuth } = useAuth();
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  useEffect(() => {
    if (!isLoadingAuth) {
      if (!user) {
        toast.error("You must be logged in to view your bookings");
        navigate("/login");
        return;
      }

      loadBookings();
    }
  }, [user, isLoadingAuth, navigate]);

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      const bookingsData = await getUserBookings();
      bookingsData.sort((a, b) => new Date(b.slot.date).getTime() - new Date(a.slot.date).getTime());
      setBookings(bookingsData);
    } catch (error) {
      toast.error("Failed to load bookings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    setIsCancelling(true);
    try {
      await cancelBooking(bookingId);
      toast.success("Booking cancelled successfully!");
      
      await loadBookings();
    } catch (error: any) {
      toast.error(error.message || "Failed to cancel booking");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleCheckIn = async (bookingId: string, isCheckedIn: boolean) => {
    setIsCheckingIn(true);
    try {
      await updateBookingCheckInStatus(bookingId, !isCheckedIn);
      toast.success(isCheckedIn ? "Check-in removed successfully" : "Checked in successfully!");
      
      // Update local state to reflect the change
      setBookings(bookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, checkedIn: !isCheckedIn } 
          : booking
      ));
    } catch (error: any) {
      toast.error(error.message || "Failed to update check-in status");
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleBookNow = () => {
    navigate("/book-slot");
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
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
            <h1 className="text-3xl font-bold text-gray-900 mt-4">My Bookings</h1>
            <p className="text-gray-600 mt-2">
              View and manage your upcoming pickleball games
            </p>
          </div>

          <div className="mb-8">
            <Card className="w-full">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Find Available Slots</h3>
                  <p className="text-sm text-gray-600">Browse and book new games</p>
                </div>
                <Button 
                  className="bg-pickleball-purple hover:bg-pickleball-purple/90"
                  onClick={handleBookNow}
                >
                  Book Now
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mb-4">
            <h2 className="text-xl font-semibold">Your Upcoming Games</h2>
          </div>

          {bookings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bookings.map((booking) => (
                <Card key={booking.id} className="overflow-hidden">
                  <div className="h-40 overflow-hidden">
                    <img
                      src={booking.venue.imageUrl || "https://images.unsplash.com/photo-1627903258426-b8c5608419b4?q=80&w=1000&auto=format&fit=crop"}
                      alt={booking.venue.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle>{booking.venue.name}</CardTitle>
                    <CardDescription>
                      <div className="flex items-center mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="text-sm">{booking.venue.city}, {booking.venue.state}</span>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-pickleball-purple" />
                        <span>{formatDate(booking.slot.date)}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-pickleball-purple" />
                        <span>
                          {booking.slot.startTime} - {booking.slot.endTime}
                        </span>
                      </div>

                      <div className="flex items-center mt-2">
                        <span className="text-sm font-medium">
                          Status: 
                        </span>
                        {booking.checkedIn ? (
                          <Badge className="ml-2 bg-green-500">
                            <Check className="h-3 w-3 mr-1" />
                            Checked In
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="ml-2">
                            <X className="h-3 w-3 mr-1" />
                            Not Checked In
                          </Badge>
                        )}
                      </div>

                      <div className="flex justify-between items-center mt-4">
                        <span className="text-sm font-medium">
                          {booking.slot.currentPlayers}/{booking.slot.maxPlayers} Players
                        </span>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm"
                            variant={booking.checkedIn ? "outline" : "default"}
                            className={booking.checkedIn ? "border-green-500 text-green-500" : "bg-green-500 hover:bg-green-600"}
                            onClick={() => handleCheckIn(booking.id, booking.checkedIn)}
                            disabled={isCheckingIn}
                          >
                            {booking.checkedIn ? "Remove Check-in" : "Check In"}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-red-500 text-red-500"
                            onClick={() => handleCancelBooking(booking.id)}
                            disabled={isCancelling}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-600 mb-4">You don't have any upcoming games scheduled.</p>
                <Button 
                  className="bg-pickleball-purple hover:bg-pickleball-purple/90"
                  onClick={handleBookNow}
                >
                  Book a Game
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MyBookings;
