
import { supabase } from "@/integrations/supabase/client";

export interface ProfileData {
  name?: string;
  age?: number;
  sex?: string;
  skill_level?: string;
  preferred_venues?: string[];
  slot_coins?: number;
}

export const updateProfile = async (userId: string, profileData: ProfileData) => {
  try {
    // Check if user is authenticated
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    console.log("Current authenticated user:", currentUser?.id);
    console.log("Attempting to update profile for userId:", userId);

    if (!currentUser) {
      throw new Error("No authenticated user found");
    }

    // For admins updating slot coins of users, we need to bypass the user ID check
    // Only do this for slot_coins updates by admins
    const isAdmin = currentUser.user_metadata?.role === 'admin';
    const isOnlyUpdatingSlotCoins = Object.keys(profileData).length === 1 && 'slot_coins' in profileData;

    if (currentUser.id !== userId && !(isAdmin && isOnlyUpdatingSlotCoins)) {
      throw new Error("You can only update your own profile unless you're an admin updating slot coins");
    }

    // Add better logging to diagnose issues
    console.log("Updating profile for user:", userId, "with data:", profileData);
    
    // First check if the profile exists, but don't use single() as it throws error when no rows found
    const { data: existingProfiles, error: checkError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId);
    
    if (checkError) {
      console.error("Error checking profile existence:", checkError);
      throw checkError;
    }

    const existingProfile = existingProfiles && existingProfiles.length > 0 ? existingProfiles[0] : null;
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
        })
        .select();
    } else {
      // Profile exists, update it
      console.log("Profile exists, updating profile");
      result = await supabase
        .from("profiles")
        .update({
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .eq("id", userId)
        .select();
    }
    
    if (result.error) {
      console.error("Supabase error updating profile:", result.error);
      throw result.error;
    }
    
    console.log("Profile updated successfully", result.data);
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

export const profileService = {
  updateProfile,
  getProfile
};
