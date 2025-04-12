
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackButton from "@/components/navigation/BackButton";
import { Coins, CreditCard } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

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
  const { user } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState<CoinPackage | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSelectPackage = (pkg: CoinPackage) => {
    setSelectedPackage(pkg);
  };

  const handlePayment = async () => {
    if (!selectedPackage) {
      toast.error("Please select a coin package");
      return;
    }

    setIsProcessing(true);
    
    try {
      // Mock payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success(`Successfully purchased ${selectedPackage.coins} slot coins!`);
      navigate("/my-bookings");
    } catch (error) {
      toast.error("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

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
                      <p className="mt-4 text-2xl font-bold">${pkg.price}</p>
                      <p className="text-sm text-gray-500 mt-1">${(pkg.price / pkg.coins).toFixed(2)} per coin</p>
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
                    >
                      <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google Pay" className="h-5 w-5 mr-2" />
                      Google Pay
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start border-2 border-gray-200"
                    >
                      <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" alt="Apple Pay" className="h-5 w-5 mr-2" />
                      Apple Pay
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start border-2 border-gray-200"
                    >
                      <CreditCard className="h-5 w-5 mr-2" />
                      Credit Card
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
                          <span>${selectedPackage.price}</span>
                        </div>
                        
                        <Button 
                          className="w-full bg-pickleball-purple hover:bg-pickleball-purple/90 mt-4"
                          onClick={handlePayment}
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
