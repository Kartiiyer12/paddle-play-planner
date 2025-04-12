
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Euro } from "lucide-react";

interface SlotConfigFormProps {
  onSuccess?: () => void;
}

const SlotConfigForm = ({ onSuccess }: SlotConfigFormProps) => {
  const [autoCreateSlots, setAutoCreateSlots] = useState(false);
  const [slotCoinPrice, setSlotCoinPrice] = useState("5");
  const [slotPackages, setSlotPackages] = useState([
    { coins: 5, price: 20, discount: 0 },
    { coins: 10, price: 35, discount: 12.5 },
    { coins: 20, price: 60, discount: 25 }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handlePackageChange = (index: number, field: 'coins' | 'price', value: string) => {
    const newPackages = [...slotPackages];
    const numberValue = parseInt(value) || 0;
    
    newPackages[index][field] = numberValue;
    
    // Calculate discount
    if (field === 'price' && newPackages[index].coins > 0) {
      const singleCoinPrice = parseFloat(slotCoinPrice);
      const regularPrice = newPackages[index].coins * singleCoinPrice;
      const actualPrice = numberValue;
      const discountPercentage = ((regularPrice - actualPrice) / regularPrice) * 100;
      newPackages[index].discount = Math.round(discountPercentage * 10) / 10;
    }
    
    setSlotPackages(newPackages);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Here you would save the slot configuration to your backend
      // For now we'll just simulate a successful save
      setTimeout(() => {
        toast.success("Slot configuration updated successfully");
        if (onSuccess) onSuccess();
        setIsLoading(false);
      }, 1000);
    } catch (error: any) {
      toast.error(error.message || "Failed to save slot configuration");
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-create">Auto-Create Weekly Slots</Label>
              <p className="text-sm text-gray-500">Automatically create slots for the next week</p>
            </div>
            <Switch
              id="auto-create"
              checked={autoCreateSlots}
              onCheckedChange={setAutoCreateSlots}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center mb-1">
              <Euro className="h-5 w-5 text-pickleball-purple mr-2" />
              <Label htmlFor="slot-price">Single Slot Coin Price (€)</Label>
            </div>
            <div className="flex items-center">
              <Input
                id="slot-price"
                type="number"
                min="1"
                step="0.5"
                value={slotCoinPrice}
                onChange={(e) => setSlotCoinPrice(e.target.value)}
                className="w-32"
              />
              <span className="ml-2 text-sm text-gray-500">euros per coin</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium">Slot Coin Packages</h3>
            
            {slotPackages.map((pkg, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor={`coins-${index}`}>Coins</Label>
                    <Input
                      id={`coins-${index}`}
                      type="number"
                      min="1"
                      value={pkg.coins}
                      onChange={(e) => handlePackageChange(index, 'coins', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`price-${index}`}>Package Price (€)</Label>
                    <Input
                      id={`price-${index}`}
                      type="number"
                      min="0"
                      step="0.5"
                      value={pkg.price}
                      onChange={(e) => handlePackageChange(index, 'price', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Savings</Label>
                    <div className="h-10 flex items-center px-3 bg-white border border-gray-200 rounded-md">
                      <span className="text-green-600 font-medium">
                        {pkg.discount > 0 ? `${pkg.discount}%` : 'No discount'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              className="bg-pickleball-purple hover:bg-pickleball-purple/90"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save Configuration"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SlotConfigForm;
