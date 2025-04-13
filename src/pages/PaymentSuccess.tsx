
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CheckCircle, Coins } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Extract the session ID from the URL
    const params = new URLSearchParams(location.search);
    const session = params.get("session_id");
    setSessionId(session);

    if (session) {
      // Here you would verify the payment with your backend
      // For now, we'll just simulate success
      setTimeout(() => {
        setIsLoading(false);
      }, 1500);
    } else {
      toast.error("Invalid payment session");
      navigate("/payment");
    }
  }, [location.search, navigate]);

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-grow pt-24 pb-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-2xl">
          <Card className="overflow-hidden">
            {isLoading ? (
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pickleball-purple mx-auto"></div>
                </div>
                <h2 className="text-xl font-semibold mb-2">Processing your payment</h2>
                <p className="text-gray-600">Please wait while we verify your payment...</p>
              </CardContent>
            ) : (
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                </div>
                <h2 className="text-2xl font-semibold mb-2">Payment Successful!</h2>
                <p className="text-gray-600 mb-6">
                  Your slot coins have been added to your account.
                </p>
                <div className="flex items-center justify-center mb-8">
                  <Coins className="h-6 w-6 text-pickleball-purple mr-2" />
                  <span className="text-xl font-bold">Your coins are ready to use</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    className="bg-pickleball-purple hover:bg-pickleball-purple/90"
                    onClick={() => navigate("/book-slot")}
                  >
                    Book a Slot
                  </Button>
                  <Button 
                    variant="outline"
                    className="border-pickleball-purple text-pickleball-purple hover:bg-pickleball-purple/10"
                    onClick={() => navigate("/my-bookings")}
                  >
                    View My Bookings
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PaymentSuccess;
