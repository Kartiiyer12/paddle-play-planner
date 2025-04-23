
import { addDays, format, parseISO } from "date-fns";
import { getSlotsByDateRange, createSlot } from "./slotService";
import { getVenues } from "./venueService";
import { Slot } from "@/models/types";
import { supabase } from "@/integrations/supabase/client";

// Helper function to get date in YYYY-MM-DD format
const getFormattedDate = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

// Get weekday name (Monday, Tuesday, etc.) from a date
const getWeekdayName = (date: Date): string => {
  return format(date, 'EEEE');
};

/**
 * Creates slots for the next 7 days based on template slots
 * This should be run daily via a cron job or similar
 */
export const createSlotsForNext7Days = async (): Promise<void> => {
  try {
    // Get all venues
    const venues = await getVenues();
    
    // Get today's date and the date 7 days from now
    const today = new Date();
    const targetDate = addDays(today, 7);
    
    // Get the formatted dates for range query
    const todayFormatted = getFormattedDate(today);
    const targetDateFormatted = getFormattedDate(targetDate);
    
    // Get existing slots to avoid duplicates
    const existingSlots = await getSlotsByDateRange(todayFormatted, targetDateFormatted);
    
    // For each venue, create slots
    for (const venue of venues) {
      // For demonstration purposes, we'll create a morning and evening slot
      // In a real application, you would have template slots stored in a database
      const defaultSlotTimes = [
        { startTime: '09:00:00', endTime: '11:00:00', maxPlayers: 8 },
        { startTime: '18:00:00', endTime: '20:00:00', maxPlayers: 8 }
      ];
      
      // Create slots for the target date (7 days from today)
      const dateToCreate = targetDate;
      const dateFormatted = getFormattedDate(dateToCreate);
      const weekdayName = getWeekdayName(dateToCreate);
      
      for (const slotTime of defaultSlotTimes) {
        // Check if slot already exists to avoid duplicates
        const slotExists = existingSlots.some(
          existingSlot =>
            existingSlot.date === dateFormatted &&
            existingSlot.venueId === venue.id &&
            existingSlot.startTime === slotTime.startTime
        );
        
        if (!slotExists) {
          // Create new slot
          await createSlot({
            venueId: venue.id,
            date: dateFormatted,
            startTime: slotTime.startTime,
            endTime: slotTime.endTime,
            maxPlayers: slotTime.maxPlayers,
            updatedAt: new Date().toISOString()
          });
        }
      }
    }
    
    console.log(`Successfully created slots for ${targetDateFormatted}`);
    
  } catch (error) {
    console.error("Error creating slots for next 7 days:", error);
    throw error;
  }
};

/**
 * Checks if the auto-create slots feature is enabled
 */
export const isAutoCreateSlotsEnabled = async (): Promise<boolean> => {
  try {
    // First, check if the settings table exists by looking for the auto_create_slots setting
    let settingsTableExists = false;
    let settingValue = false;
    
    // Try to query the settings
    try {
      // Call the get_setting RPC function with the correct parameter type
      const { data, error } = await supabase.rpc('get_setting', { 
        setting_key: 'auto_create_slots' 
      });
      
      if (!error && data) {
        settingsTableExists = true;
        settingValue = data === 'true';
      }
    } catch (error) {
      console.log("Settings table likely doesn't exist yet, will assume false:", error);
      return false;
    }
    
    return settingValue;
  } catch (error) {
    console.error("Error checking auto-create slots setting:", error);
    return false;
  }
};

/**
 * Updates the auto-create slots setting
 */
export const setAutoCreateSlotsEnabled = async (enabled: boolean): Promise<void> => {
  try {
    // Call the set_setting RPC function with correct parameter types
    const { error } = await supabase.rpc('set_setting', { 
      setting_key: 'auto_create_slots', 
      setting_value: enabled ? 'true' : 'false'
    });
    
    if (error) {
      console.error("Error updating auto-create slots setting:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error updating auto-create slots setting:", error);
    throw error;
  }
};
