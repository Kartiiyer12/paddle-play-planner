import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CalendarCheck, Clock, MapPin } from "lucide-react";
import { Venue } from "@/models/types";
import { getVenues } from "@/services/venueService";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { getFrontImage } from "@/utils/imageUtils";

const LandingPage = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const venueData = await getVenues();
        setVenues(venueData);
      } catch (error) {
        console.error("Error fetching venues:", error);
        toast.error("Failed to load venues");
      } finally {
        setIsLoading(false);
      }
    };

    fetchVenues();
  }, []);

  const handleBookNow = () => {
    if (user) {
      navigate("/book-slot");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="hero-gradient pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
                Book Your Pickleball Games with Ease
              </h1>
              <p className="text-white/90 text-xl mb-6">
                Join our community-driven platform! Reserve courts, find games, and connect with players in your area.
              </p>
              <Button 
                size="lg" 
                className="bg-white text-pickleball-purple hover:bg-white/90 font-semibold px-8"
                onClick={handleBookNow}
              >
                Book Now
              </Button>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <img 
                  src={getFrontImage()} 
                  alt="Pickleball players" 
                  className="rounded-lg shadow-xl max-w-full h-auto animate-bounce-slow"
                  style={{ maxHeight: "400px" }}
             />

            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section - Keeping this for now but simplified */}
      <section id="how-it-works" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              PicklePlay makes it simple to find and book pickleball games at your favorite venues
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="bg-pickleball-purple/10 p-4 rounded-full mb-4">
                  <MapPin className="h-8 w-8 text-pickleball-purple" />
                </div>
                <h3 className="text-xl font-bold mb-2">Browse Venues</h3>
                <p className="text-gray-600">
                  Explore available venues and their amenities to find your perfect court
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="bg-pickleball-blue/10 p-4 rounded-full mb-4">
                  <Clock className="h-8 w-8 text-pickleball-blue" />
                </div>
                <h3 className="text-xl font-bold mb-2">Select Time Slots</h3>
                <p className="text-gray-600">
                  Choose from available time slots that work with your schedule
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="bg-green-100 p-4 rounded-full mb-4">
                  <CalendarCheck className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Book & Play</h3>
                <p className="text-gray-600">
                  Confirm your booking and get ready to hit the courts!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Venues Section - Now using real data */}
      <section id="venues" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Featured Venues</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover top pickleball venues in your area with premium courts and amenities
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <p>Loading venues...</p>
            </div>
          ) : venues.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {venues.map((venue) => (
                <Card key={venue.id} className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-shadow">
                  <div className="h-48 overflow-hidden">
                    <img
                      src={venue.imageUrl || "https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?q=80&w=1074&auto=format&fit=crop"}
                      alt={venue.name}
                      className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?q=80&w=1074&auto=format&fit=crop";
                      }}
                    />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-2">{venue.name}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{venue.description || "A wonderful pickleball venue"}</p>
                    <div className="flex items-center text-gray-500 mb-4">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="text-sm">{venue.city}, {venue.state}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{venue.courtCount} Courts</span>
                      <Button 
                        onClick={handleBookNow} 
                        className="bg-pickleball-purple hover:bg-pickleball-purple/90 text-white"
                      >
                        Book Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-600">No venues available at the moment.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-pickleball-purple">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Play Pickleball?
          </h2>
          <p className="text-white/90 text-xl mb-8 max-w-2xl mx-auto">
            Book your slot today and enjoy the game at your favorite venues!
          </p>
          <Button 
            size="lg" 
            className="bg-white text-pickleball-purple hover:bg-white/90 font-semibold px-8"
            onClick={handleBookNow}
          >
            Book Now
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
