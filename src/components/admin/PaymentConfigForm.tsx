
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useVenues } from "@/hooks/useVenues";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Euro, Loader2 } from "lucide-react";

interface PaymentConfig {
  id: string;
  venueId: string;
  slotCount: number;
  amount: number;
}

interface FormValues {
  venueId: string;
  slotCount: number;
  amount: number;
}

const PaymentConfigForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [configs, setConfigs] = useState<PaymentConfig[]>([]);
  const { venues, isLoading: isLoadingVenues } = useVenues();
  const form = useForm<FormValues>();

  const loadConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from("payment_configs")
        .select("*")
        .order("slot_count", { ascending: true });

      if (error) throw error;
      setConfigs(data.map(config => ({
        id: config.id,
        venueId: config.venue_id,
        slotCount: config.slot_count,
        amount: config.amount,
      })));
    } catch (error) {
      console.error("Error loading payment configs:", error);
      toast.error("Failed to load payment configurations");
    }
  };

  useEffect(() => {
    loadConfigs();
  }, []);

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("payment_configs")
        .insert({
          venue_id: values.venueId,
          slot_count: values.slotCount,
          amount: values.amount,
        });

      if (error) throw error;

      toast.success("Payment configuration added successfully");
      form.reset();
      loadConfigs();
    } catch (error) {
      console.error("Error adding payment config:", error);
      toast.error("Failed to add payment configuration");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (configId: string) => {
    try {
      const { error } = await supabase
        .from("payment_configs")
        .delete()
        .eq("id", configId);

      if (error) throw error;

      toast.success("Payment configuration deleted successfully");
      loadConfigs();
    } catch (error) {
      console.error("Error deleting payment config:", error);
      toast.error("Failed to delete payment configuration");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Add New Configuration</h3>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="venueId"
              rules={{ required: "Venue is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Venue</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a venue" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {venues.map((venue) => (
                        <SelectItem key={venue.id} value={venue.id}>
                          {venue.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slotCount"
              rules={{ 
                required: "Number of slots is required",
                min: { value: 1, message: "Must be at least 1 slot" }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Slots</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              rules={{ 
                required: "Amount is required",
                min: { value: 0, message: "Amount cannot be negative" }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (€)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding Configuration...
                </>
              ) : (
                "Add Configuration"
              )}
            </Button>
          </form>
        </Form>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Existing Configurations</h3>
        <div className="space-y-4">
          {configs.map((config) => (
            <div
              key={config.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div>
                <p className="font-medium">
                  {venues.find(v => v.id === config.venueId)?.name}
                </p>
                <p className="text-sm text-gray-600">
                  {config.slotCount} slots for €{config.amount}
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(config.id)}
              >
                Delete
              </Button>
            </div>
          ))}
          {configs.length === 0 && (
            <p className="text-gray-500 text-center">
              No payment configurations yet
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default PaymentConfigForm;
