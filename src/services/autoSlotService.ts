
import { supabase } from "@/integrations/supabase/client";
import { createSlot } from "./slotService";
import { getVenues } from "./venueService";
import { format, addDays, parseISO, getDay } from "date-fns";

// Define proper interface for RPC parameters
interface GetSettingParams {
  setting_key: string;
}

interface SetSettingParams {
  setting_key: string;
  setting_value: string;
}

/**
 * Checks if auto-creation of slots is enabled in the database.
 * @returns A promise that resolves to a boolean indicating whether auto-creation of slots is enabled.
 */
export const getAutoCreateSlotsEnabled = async (): Promise<boolean> => {
  try {
    // Check if we have the settings table already by trying to query it
    let settingsTableExists = false;
    let enabled = false;
    
    // Try to query the settings
    try {
      const { data, error } = await supabase.rpc('get_setting', { 
        setting_key: 'auto_create_slots' 
      } as GetSettingParams);
      
      if (!error && data) {
        settingsTableExists = true;
        enabled = data === 'true';
      }
    } catch (e) {
      console.error("Error checking auto_create_slots setting:", e);
      // Table or function might not exist yet
    }
    
    return enabled;
  } catch (error) {
    console.error("Error checking auto slot settings:", error);
    return false;
  }
};

/**
 * Updates the auto-create slots setting in the database.
 * @param enabled Boolean indicating whether auto-creation of slots is enabled
 */
export const setAutoCreateSlotsEnabled = async (enabled: boolean): Promise<void> => {
  try {
    const { error } = await supabase.rpc('set_setting', { 
      setting_key: 'auto_create_slots', 
      setting_value: enabled ? 'true' : 'false'
    } as SetSettingParams);
    
    if (error) {
      console.error("Error updating auto-create slots setting:", error);
      throw error;
    }
    
    console.log(`Auto-create slots setting updated to: ${enabled}`);
  } catch (error) {
    console.error("Error updating auto-create slots setting:", error);
    throw error;
  }
};

/**
 * Alias for getAutoCreateSlotsEnabled to match naming in SlotManagementPanel.tsx
 */
export const isAutoCreateSlotsEnabled = getAutoCreateSlotsEnabled;

/**
 * Creates slots for the next 7 days based on venue settings
 */
export const createSlotsForNext7Days = async (): Promise<void> => {
  try {
    // Get only venues where the current user is the admin
    const venues = await getVenues();
    const today = new Date();
    
    // Process each venue
    for (const venue of venues) {
      // For demo purposes, create one slot per day for the next 7 days
      for (let i = 1; i <= 7; i++) {
        const date = addDays(today, i);
        const formattedDate = format(date, 'yyyy-MM-dd');
        const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][getDay(date)];
        
        // Create a slot for this venue on this day (mid-day time slot for demo)
        await createSlot({
          venueId: venue.id,
          date: formattedDate,
          startTime: '10:00:00',
          endTime: '12:00:00',
          maxPlayers: 4,
          updatedAt: new Date().toISOString()
        });
        
        console.log(`Created auto slot for venue ${venue.name} on ${formattedDate}`);
      }
    }
    
    console.log("Successfully created slots for the next 7 days");
  } catch (error) {
    console.error("Error creating slots for next 7 days:", error);
    throw error;
  }
};
