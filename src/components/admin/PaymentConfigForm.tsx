
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
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus } from "lucide-react";

const PaymentConfigForm = () => {
  const [slotCount, setSlotCount] = useState<number>(1);
  const [amount, setAmount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { venues, isLoading, selectedVenue, setSelectedVenue } = useVenues();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedVenue) {
      toast({
        title: "Error",
        description: "Please select a venue first",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('payment_configs')
        .insert({
          slot_count: slotCount,
          amount: amount,
          venue_id: selectedVenue
        });
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Payment configuration added successfully",
      });
      
      // Reset form
      setSlotCount(1);
      setAmount(0);
      
    } catch (error) {
      console.error("Error adding payment config:", error);
      toast({
        title: "Error",
        description: "Failed to add payment configuration",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
            <Label htmlFor="venue">Venue</Label>
            <select
              id="venue"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              value={selectedVenue || ""}
              onChange={(e) => setSelectedVenue(e.target.value)}
              disabled={isLoading}
              required
            >
              <option value="">Select a venue</option>
              {venues.map((venue) => (
                <option key={venue.id} value={venue.id}>
                  {venue.name}
                </option>
              ))}
            </select>
          </div>
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
          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting || !selectedVenue}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Configuration
          </Button>
        </CardContent>
      </Card>
    </form>
  );
};

export default PaymentConfigForm;
