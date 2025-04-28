
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useVenues } from "@/hooks/useVenues";

const PaymentConfigForm = () => {
  const [slotCount, setSlotCount] = useState<number>(1);
  const [amount, setAmount] = useState<number>(0);
  const { venues, isLoading } = useVenues();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement payment config submission
    console.log("Submit payment config:", { slotCount, amount });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Payment Configuration</CardTitle>
          <CardDescription>
            Set up pricing for different slot packages
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="slotCount">Number of Slots</Label>
            <Input
              id="slotCount"
              type="number"
              min="1"
              value={slotCount}
              onChange={(e) => setSlotCount(parseInt(e.target.value))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (€)</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value))}
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Add Configuration
          </Button>
        </CardContent>
      </Card>
    </form>
  );
};

export default PaymentConfigForm;
