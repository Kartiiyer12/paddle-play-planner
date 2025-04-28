
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { Loader2 } from "lucide-react";

const BookingWithoutCoinsToggle = () => {
  const { settings, isLoading, updateSettings, allowBookingWithoutCoins } = useAdminSettings();
  const [isSaving, setIsSaving] = useState(false);

  const handleToggleChange = async (checked: boolean) => {
    setIsSaving(true);
    await updateSettings({ allow_booking_without_coins: checked });
    setIsSaving(false);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Booking Settings</h3>
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="allow-booking-without-coins">Allow Booking Without Coins</Label>
          <p className="text-sm text-gray-500">
            Let users book slots even if they don't have enough coins
          </p>
        </div>
        <div className="flex items-center">
          {(isLoading || isSaving) && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
          <Switch
            id="allow-booking-without-coins"
            checked={allowBookingWithoutCoins}
            onCheckedChange={handleToggleChange}
            disabled={isLoading || isSaving}
          />
        </div>
      </div>
    </div>
  );
};

export default BookingWithoutCoinsToggle;
