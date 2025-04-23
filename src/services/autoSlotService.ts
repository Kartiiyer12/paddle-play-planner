import { supabase } from "@/integrations/supabase/client";

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
      // Call the get_setting RPC function with the correct parameter
      const { data, error } = await supabase.rpc('get_setting', { 
        setting_key: 'auto_create_slots' 
      });
      
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
    // Call the set_setting RPC function with correct parameters
    const { error } = await supabase.rpc('set_setting', { 
      setting_key: 'auto_create_slots', 
      setting_value: enabled ? 'true' : 'false'
    });
    
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
