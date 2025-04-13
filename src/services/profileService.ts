
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
    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        ...profileData,
        updated_at: new Date().toISOString()
      })
      .eq("id", userId);
    
    if (error) throw error;
    
    return true;
  } catch (error: any) {
    console.error("Error updating profile:", error.message);
    throw new Error(error.message || "Failed to update profile");
  }
};

export const getProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error: any) {
    console.error("Error getting profile:", error.message);
    return null;
  }
};
