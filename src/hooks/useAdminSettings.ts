import { useState, useEffect } from "react";
import { getAdminSettings, upsertAdminSettings, AdminSettings } from "@/services/adminSettingsService";
import { useVenues } from "@/hooks/useVenues";

export const useAdminSettings = () => {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { selectedVenue } = useVenues();

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      if (selectedVenue) {
        const data = await getAdminSettings(selectedVenue);
        setSettings(data);
      }
      setIsLoading(false);
    };
    
    fetchSettings();
  }, [selectedVenue]);

  const updateSettings = async (newSettings: { allow_booking_without_coins: boolean }) => {
    if (!selectedVenue) return null;
    
    setIsLoading(true);
    const updatedSettings = await upsertAdminSettings(selectedVenue, newSettings);
    setSettings(updatedSettings);
    setIsLoading(false);
    
    return updatedSettings;
  };

  return {
    settings,
    isLoading,
    updateSettings,
    allowBookingWithoutCoins: settings?.allow_booking_without_coins ?? false
  };
};
