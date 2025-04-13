
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackButton from "@/components/navigation/BackButton";
import { Coins, CreditCard } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface CoinPackage {
  id: string;
  name: string;
  coins: number;
  price: number;
  popular?: boolean;
}

const coinPackages: CoinPackage[] = [
  {
    id: "package-1",
    name: "Starter",
    coins: 5,
    price: 10
  },
  {
    id: "package-2",
    name: "Standard",
    coins: 10,
    price: 18,
    popular: true
  },
  {
    id: "package-3",
    name: "Pro",
    coins: 20,
    price: 32
  },
  {
    id: "package-4",
    name: "Elite",
    coins: 50,
    price: 75
  }
];

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState<CoinPackage | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSelectPackage = (pkg: CoinPackage) => {
    setSelectedPackage(pkg);
  };

  const handlePayment = async (method: string) => {
    if (!selectedPackage) {
      toast.error("Please select a coin package");
      return;
    }

    if (!user) {
      toast.error("You must be logged in to make a purchase");
      navigate("/login");
      return;
    }

    setIsProcessing(true);
    
    try {
      // Call our Supabase Edge Function to create a Stripe checkout session
      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: {
          packageId: selectedPackage.id,
          coins: selectedPackage.coins,
          price: selectedPackage.price
        }
      });

      if (error) {
        throw new Error(error.message || "Failed to create checkout session");
      }

      // Redirect to Stripe Checkout
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(error.message || "Payment processing failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Check for canceled payment
  const isCanceled = location.search.includes("canceled=true");
  if (isCanceled) {
    toast.error("Payment was canceled");
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-grow pt-24 pb-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="mb-6">
            <BackButton />
            <h1 className="text-3xl font-bold text-gray-900 mt-4">Buy Slot Coins</h1>
            <p className="text-gray-600 mt-2">
              Purchase slot coins to book pickleball games at your favorite venues
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Select a Package</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {coinPackages.map((pkg) => (
                  <Card 
                    key={pkg.id}
                    className={`cursor-pointer overflow-hidden relative ${
                      selectedPackage?.id === pkg.id 
                        ? "border-2 border-pickleball-purple" 
                        : "hover:border-pickleball-purple/50"
                    }`}
                    onClick={() => handleSelectPackage(pkg)}
                  >
                    {pkg.popular && (
                      <div className="absolute top-0 right-0 bg-pickleball-purple text-white text-xs px-2 py-1">
                        Popular
                      </div>
                    )}
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg">{pkg.name}</h3>
                      <div className="flex items-center mt-2">
                        <Coins className="h-5 w-5 text-pickleball-purple mr-2" />
                        <span className="text-xl font-bold">{pkg.coins} Coins</span>
                      </div>
                      <p className="mt-4 text-2xl font-bold">€{pkg.price}</p>
                      <p className="text-sm text-gray-500 mt-1">€{(pkg.price / pkg.coins).toFixed(2)} per coin</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    <span>Payment Methods</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start border-2 border-gray-200"
                      onClick={() => handlePayment('card')}
                      disabled={!selectedPackage || isProcessing}
                    >
                      <CreditCard className="h-5 w-5 mr-2" />
                      Credit / Debit Card
                    </Button>
                    
                    {selectedPackage ? (
                      <div className="mt-8 space-y-4">
                        <div className="flex justify-between">
                          <span>Package:</span>
                          <span>{selectedPackage.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Coins:</span>
                          <span>{selectedPackage.coins}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg">
                          <span>Total:</span>
                          <span>€{selectedPackage.price}</span>
                        </div>
                        
                        <Button 
                          className="w-full bg-pickleball-purple hover:bg-pickleball-purple/90 mt-4"
                          onClick={() => handlePayment('card')}
                          disabled={isProcessing}
                        >
                          {isProcessing ? "Processing..." : "Complete Purchase"}
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        Select a coin package to continue
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Payment;
