
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
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Profile not found
      return null;
    }
    throw error;
  }

  return {
    id: data.id,
    name: data.name || '',
    age: data.age,
    sex: data.sex,
    skillLevel: data.skill_level,
    preferredVenues: data.preferred_venues || [],
    createdAt: data.created_at,
    updatedAt: data.updated_at
  } as UserProfile;
};

export const saveUserProfile = async (userId: string, profile: Partial<UserProfile>): Promise<UserProfile> => {
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single();

  const profileData = {
    name: profile.name,
    age: profile.age,
    sex: profile.sex,
    skill_level: profile.skillLevel,
    preferred_venues: profile.preferredVenues,
    updated_at: new Date().toISOString()
  };

  let result;

  if (existingProfile) {
    const { data, error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    result = data;
  } else {
    const { data, error } = await supabase
      .from('profiles')
      .insert([{
        id: userId,
        ...profileData,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    result = data;
  }

  return {
    id: result.id,
    name: result.name || '',
    age: result.age,
    sex: result.sex,
    skillLevel: result.skill_level,
    preferredVenues: result.preferred_venues || [],
    createdAt: result.created_at,
    updatedAt: result.updated_at
  } as UserProfile;
};
