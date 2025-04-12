
import { supabase } from "@/integrations/supabase/client";

export type UserProfile = {
  id: string;
  name: string;
  age?: number;
  sex?: 'male' | 'female' | 'other';
  skillLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'legendary';
  preferredVenues?: string[];
  createdAt?: string;
  updatedAt?: string;
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  // Direct SQL query to get profile data since the profiles table is new
  // and not yet in the TypeScript types
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }

  if (!data) return null;

  return {
    id: data.id,
    name: data.name || '',
    age: data.age,
    sex: data.sex as 'male' | 'female' | 'other',
    skillLevel: data.skill_level as 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'legendary',
    preferredVenues: data.preferred_venues || [],
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};

export const saveUserProfile = async (userId: string, profile: Partial<UserProfile>): Promise<UserProfile> => {
  // Check if profile exists
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  const profileData = {
    id: userId,
    name: profile.name,
    age: profile.age,
    sex: profile.sex,
    skill_level: profile.skillLevel,
    preferred_venues: profile.preferredVenues,
    updated_at: new Date().toISOString()
  };

  let result;

  if (existingProfile) {
    // Update existing profile
    const { data, error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
    result = data;
  } else {
    // Insert new profile
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        ...profileData,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating profile:", error);
      throw error;
    }
    result = data;
  }

  return {
    id: result.id,
    name: result.name || '',
    age: result.age,
    sex: result.sex as 'male' | 'female' | 'other',
    skillLevel: result.skill_level,
    preferredVenues: result.preferred_venues || [],
    createdAt: result.created_at,
    updatedAt: result.updated_at
  };
};
