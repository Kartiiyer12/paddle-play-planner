
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

// Local state for feature flags/settings
const featureFlags = {
  autoCreateSlots: false
};

/**
 * Checks if the auto-create slots feature is enabled
 */
export const isAutoCreateSlotsEnabled = async (): Promise<boolean> => {
  try {
    // We'll use local storage for a simpler approach
    const storedValue = localStorage.getItem('auto_create_slots');
    if (storedValue !== null) {
      featureFlags.autoCreateSlots = storedValue === 'true';
    }
    return featureFlags.autoCreateSlots;
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
    // Update local storage
    localStorage.setItem('auto_create_slots', enabled ? 'true' : 'false');
    featureFlags.autoCreateSlots = enabled;
    console.log(`Auto-create slots set to: ${enabled}`);
  } catch (error) {
    console.error("Error updating auto-create slots setting:", error);
    throw error;
  }
};
