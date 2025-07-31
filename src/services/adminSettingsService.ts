
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AdminSettings {
  id: string;
  venue_id: string;
  admin_id: string;
  allow_booking_without_coins: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Get admin settings for a venue (for admin management)
 */
export const getAdminSettings = async (venueId: string): Promise<AdminSettings | null> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  
  if (userError || !userData.user) {
    throw userError || new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("admin_settings")
    .select("*")
    .eq("venue_id", venueId)
    .eq("admin_id", userData.user.id)
    .maybeSingle();
  
  if (error) {
    console.error("Error fetching admin settings:", error);
    return null;
  }
  
  return data as AdminSettings | null;
};

/**
 * Get venue booking policy (for all users including non-admins)
 */
export const getVenueBookingPolicy = async (venueId: string): Promise<{ allow_booking_without_coins: boolean }> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  
  if (userError || !userData.user) {
    throw userError || new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("admin_settings")
    .select("allow_booking_without_coins")
    .eq("venue_id", venueId)
    .maybeSingle();
  
  if (error) {
    console.error("Error fetching venue booking policy:", error);
    // Default to requiring coins if we can't fetch settings
    return { allow_booking_without_coins: false };
  }
  
  // If no admin settings exist for this venue, default to requiring coins
  return data ? data : { allow_booking_without_coins: false };
};

/**
 * Create or update admin settings for a venue
 */
export const upsertAdminSettings = async (
  venueId: string, 
  settings: { allow_booking_without_coins: boolean }
): Promise<AdminSettings | null> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  
  if (userError || !userData.user) {
    throw userError || new Error("User not authenticated");
  }

  // First check if settings exist
  const existingSettings = await getAdminSettings(venueId);
  
  // Prepare upsert data
  const upsertData = {
    venue_id: venueId,
    admin_id: userData.user.id,
    allow_booking_without_coins: settings.allow_booking_without_coins
  };
  
  let response;
  if (existingSettings) {
    // Update
    response = await supabase
      .from("admin_settings")
      .update(upsertData)
      .eq("id", existingSettings.id)
      .select()
      .single();
  } else {
    // Insert
    response = await supabase
      .from("admin_settings")
      .insert(upsertData)
      .select()
      .single();
  }
  
  const { data, error } = response;
  
  if (error) {
    console.error("Error updating admin settings:", error);
    toast.error("Failed to update settings");
    return null;
  }
  
  toast.success("Settings updated successfully");
  return data as AdminSettings;
};
