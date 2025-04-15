import { supabase } from "@/integrations/supabase/client";
import { User } from "@/models/types";
import { getProfile } from "./profileService";

export const getCurrentUser = async (): Promise<User | null> => {
  const { data, error } = await supabase.auth.getUser();
  
  if (error || !data?.user) {
    console.error("Get current user error:", error);
    return null;
  }

  // Check if user has role in metadata, if not, assume 'user' role
  const role = data.user.user_metadata?.role || 'user';
  
  const user: User = {
    id: data.user.id,
    email: data.user.email || '',
    name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
    isVerified: data.user.email_confirmed_at !== null,
    role: role,
    createdAt: data.user.created_at || new Date().toISOString(),
    preferredVenues: [] // Initialize with empty array
  };
  
  // Try to get preferred venues from profile
  try {
    const profile = await getProfile(user.id);
    if (profile && profile.preferred_venues) {
      user.preferredVenues = profile.preferred_venues;
    }
  } catch (error) {
    console.error("Error getting user profile:", error);
  }
  
  return user;
};

export const loginUser = async (email: string, password: string): Promise<User | null> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) {
    console.error("Login error:", error);
    throw error;
  }
  
  if (!data.user) {
    return null;
  }
  
  // Check if user has role in metadata, if not, assume 'user' role
  const role = data.user.user_metadata?.role || 'user';
  
  const user: User = {
    id: data.user.id,
    email: data.user.email || '',
    name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
    isVerified: data.user.email_confirmed_at !== null,
    role: role,
    createdAt: data.user.created_at || new Date().toISOString()
  };
  
  return user;
};

export const logoutUser = async () => {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    throw error;
  }
  
  return true;
};

export const registerUser = async (email: string, password: string, name: string, role: 'user' | 'admin' = 'user') => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        role
      }
    }
  });
  
  if (error) {
    throw error;
  }
  
  return data;
};

export const isUserAdmin = async (): Promise<boolean> => {
  const user = await getCurrentUser();
  return user?.role === 'admin';
};
