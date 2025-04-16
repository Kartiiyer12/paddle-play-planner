
import { supabase } from "@/integrations/supabase/client";

export interface ProfileData {
  name?: string;
  age?: number;
  sex?: string;
  skill_level?: string;
  preferred_venues?: string[];
}

export const updateProfile = async (userId: string, profileData: ProfileData) => {
  try {
    // Add better logging to diagnose issues
    console.log("Updating profile for user:", userId, "with data:", profileData);
    
    // First check if the profile exists
    const { data: existingProfile, error: checkError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      // Error other than "no rows returned"
      console.error("Error checking profile existence:", checkError);
      throw checkError;
    }

    let result;
    
    if (!existingProfile) {
      // Profile doesn't exist, insert it
      console.log("Profile doesn't exist, creating new profile");
      result = await supabase
        .from("profiles")
        .insert({
          id: userId,
          ...profileData,
          updated_at: new Date().toISOString()
        });
    } else {
      // Profile exists, update it
      console.log("Profile exists, updating profile");
      result = await supabase
        .from("profiles")
        .update({
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .eq("id", userId);
    }
    
    if (result.error) {
      console.error("Supabase error updating profile:", result.error);
      throw result.error;
    }
    
    console.log("Profile updated successfully");
    return true;
  } catch (error: any) {
    console.error("Error updating profile:", error.message);
    throw new Error(error.message || "Failed to update profile");
  }
};

export const getProfile = async (userId: string) => {
  try {
    console.log("Getting profile for user:", userId);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    
    if (error) {
      console.error("Supabase error getting profile:", error);
      // Don't throw here, return null instead to allow profile creation
      return null;
    }
    
    console.log("Profile retrieved:", data);
    return data;
  } catch (error: any) {
    console.error("Error getting profile:", error.message);
    return null;
  }
};
