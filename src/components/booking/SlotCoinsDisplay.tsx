
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SlotCoinsDisplayProps {
  slotCoins: number;
}

const SlotCoinsDisplay = ({ slotCoins }: SlotCoinsDisplayProps) => {
  const navigate = useNavigate();
  
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-medium text-gray-900">Your Slot Coins</h3>
            <div className="flex items-center mt-1">
              <Coins className="h-5 w-5 text-pickleball-purple mr-2" />
              <p className="text-xl font-bold text-pickleball-purple">{slotCoins} Coins</p>
            </div>
          </div>
          <Button 
            className="bg-pickleball-purple hover:bg-pickleball-purple/90"
            onClick={() => navigate("/payment")}
          >
            Buy More
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SlotCoinsDisplay;
