
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Calendar, Clock, MapPin } from "lucide-react";
import { User, BookingWithDetails } from "@/models/types";
import { getBookingsWithDetails, mockSlots, mockVenues } from "@/data/mockData";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("currentUser");
    if (!userData) {
      toast.error("You must be logged in to view this page");
      navigate("/login");
      return;
    }

    // Parse user data
    const parsedUser: User = JSON.parse(userData);
    setUser(parsedUser);

    // Get user bookings
    const userBookings = getBookingsWithDetails(parsedUser.id);
    setBookings(userBookings);
    
    setIsLoading(false);
  }, [navigate]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
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
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome, {user?.name}!
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your pickleball bookings and find new games to join.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Find Available Slots</h3>
                  <p className="text-sm text-gray-600">Browse and book new games</p>
                </div>
                <Link to="/book-slot">
                  <Button className="bg-pickleball-purple hover:bg-pickleball-purple/90">
                    Book Now
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">My Bookings</h3>
                  <p className="text-sm text-gray-600">You have {bookings.length} upcoming games</p>
                </div>
                <Button variant="outline" className="border-pickleball-purple text-pickleball-purple">
                  View All
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">My Profile</h3>
                  <p className="text-sm text-gray-600">Update your information</p>
                </div>
                <Button variant="outline" className="border-gray-300">
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="upcoming">
            <TabsList className="grid w-full grid-cols-3 max-w-md mb-8">
              <TabsTrigger value="upcoming">Upcoming Games</TabsTrigger>
              <TabsTrigger value="venues">Browse Venues</TabsTrigger>
              <TabsTrigger value="availability">Today's Slots</TabsTrigger>
            </TabsList>

            {/* Upcoming Games Tab */}
            <TabsContent value="upcoming">
              <div className="mb-4 flex justify-between items-center">
                <h2 className="text-xl font-semibold">Your Upcoming Games</h2>
              </div>

              {bookings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {bookings.map((booking) => (
                    <Card key={booking.id} className="overflow-hidden">
                      <div className="h-40 overflow-hidden">
                        <img
                          src={booking.venue.imageUrl}
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
                          <div className="flex justify-between items-center mt-4">
                            <span className="text-sm font-medium">
                              {booking.slot.currentPlayers}/{booking.slot.maxPlayers} Players
                            </span>
                            <Button variant="outline" size="sm" className="border-red-500 text-red-500">
                              Cancel
                            </Button>
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
                    <Link to="/book-slot">
                      <Button className="bg-pickleball-purple hover:bg-pickleball-purple/90">
                        Book a Game
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Venues Tab */}
            <TabsContent value="venues">
              <div className="mb-4">
                <h2 className="text-xl font-semibold">Available Venues</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockVenues.map((venue) => (
                  <Card key={venue.id} className="overflow-hidden">
                    <div className="h-40 overflow-hidden">
                      <img
                        src={venue.imageUrl}
                        alt={venue.name}
                        className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                      />
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle>{venue.name}</CardTitle>
                      <CardDescription>
                        <div className="flex items-center mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span className="text-sm">{venue.city}, {venue.state}</span>
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4 line-clamp-2">{venue.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{venue.courtCount} Courts</span>
                        <Link to="/book-slot">
                          <Button className="bg-pickleball-purple hover:bg-pickleball-purple/90">
                            View Slots
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Today's Availability Tab */}
            <TabsContent value="availability">
              <div className="mb-4">
                <h2 className="text-xl font-semibold">Today's Available Slots</h2>
              </div>

              {/* Get today's date */}
              {(() => {
                const today = new Date().toISOString().split('T')[0];
                const todaySlots = mockSlots.filter(slot => slot.date === today);

                return todaySlots.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {todaySlots.map((slot) => {
                      const venue = mockVenues.find(v => v.id === slot.venueId);
                      return (
                        <Card key={slot.id}>
                          <CardHeader className="pb-2">
                            <CardTitle>{venue?.name}</CardTitle>
                            <CardDescription>
                              <div className="flex items-center mt-1">
                                <MapPin className="h-4 w-4 mr-1" />
                                <span className="text-sm">{venue?.city}, {venue?.state}</span>
                              </div>
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-2 text-pickleball-purple" />
                                <span>
                                  {slot.startTime} - {slot.endTime}
                                </span>
                              </div>
                              <div className="flex justify-between items-center mt-4">
                                <span className="text-sm font-medium">
                                  {slot.currentPlayers}/{slot.maxPlayers} Players
                                </span>
                                <Link to="/book-slot">
                                  <Button className="bg-pickleball-purple hover:bg-pickleball-purple/90">
                                    Book Now
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <p className="text-gray-600 mb-4">No slots available for today.</p>
                      <Link to="/book-slot">
                        <Button className="bg-pickleball-purple hover:bg-pickleball-purple/90">
                          Check Other Days
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })()}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
