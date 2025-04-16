
import { User } from '@/models/types';
import { supabase } from '@/integrations/supabase/client';

// Get the current authenticated user from Supabase auth
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    // Get user session from Supabase auth
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return null;
    }
    
    // Extract metadata from user object
    const metadata = user.user_metadata;
    
    // Map Supabase user to our User model
    return {
      id: user.id,
      email: user.email || '',
      name: metadata?.full_name || user.email?.split('@')[0] || 'User',
      isVerified: user.email_confirmed_at !== null,
      role: metadata?.role || 'user',
      createdAt: user.created_at || new Date().toISOString(),
      preferredVenues: [] // This will be populated from profiles table in AuthContext
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Log in a user with email and password
export const loginUser = async (email: string, password: string): Promise<User | null> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) {
    throw error;
  }
  
  if (!data.user) {
    return null;
  }
  
  // Extract metadata from user object
  const metadata = data.user.user_metadata;
  
  // Map Supabase user to our User model
  return {
    id: data.user.id,
    email: data.user.email || '',
    name: metadata?.full_name || data.user.email?.split('@')[0] || 'User',
    isVerified: data.user.email_confirmed_at !== null,
    role: metadata?.role || 'user',
    createdAt: data.user.created_at || new Date().toISOString(),
    preferredVenues: [] // This will be populated from profiles table in AuthContext
  };
};

// Register a new user
export const registerUser = async (email: string, password: string, name?: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name
      }
    }
  });
  
  if (error) {
    throw error;
  }
  
  return data;
};

// Log out the current user
export const logoutUser = async () => {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    throw error;
  }
  
  return true;
};
