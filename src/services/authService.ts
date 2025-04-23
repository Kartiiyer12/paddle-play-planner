
import { User } from '@/models/types';
import { supabase } from '@/integrations/supabase/client';
import { getProfile, updateProfile } from './profileService';

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
    
    // Try to fetch profile data to get preferred venues
    let preferredVenues: string[] = [];
    try {
      const profileData = await getProfile(user.id);
      if (profileData && profileData.preferred_venues) {
        preferredVenues = profileData.preferred_venues;
      }
    } catch (error) {
      console.error("Error fetching profile in getCurrentUser:", error);
    }
    
    // Map Supabase user to our User model
    return {
      id: user.id,
      email: user.email || '',
      name: metadata?.full_name || user.email?.split('@')[0] || 'User',
      isVerified: user.email_confirmed_at !== null,
      role: metadata?.role || 'user',
      createdAt: user.created_at || new Date().toISOString(),
      preferredVenues
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
  
  // Check if user has completed their profile
  let preferredVenues: string[] = [];
  let isNewUser = false;
  
  try {
    const profileData = await getProfile(data.user.id);
    if (profileData && profileData.preferred_venues) {
      preferredVenues = profileData.preferred_venues;
    }
    
    // Check if this might be a first-time login (no profile data)
    isNewUser = !profileData || (!profileData.name && !profileData.skill_level);
  } catch (error) {
    console.error("Error fetching profile in loginUser:", error);
    isNewUser = true;
  }
  
  // Store whether this is likely a new user in session storage
  if (isNewUser) {
    sessionStorage.setItem('newUser', 'true');
  }
  
  // Map Supabase user to our User model
  return {
    id: data.user.id,
    email: data.user.email || '',
    name: metadata?.full_name || data.user.email?.split('@')[0] || 'User',
    isVerified: data.user.email_confirmed_at !== null,
    role: metadata?.role || 'user',
    createdAt: data.user.created_at || new Date().toISOString(),
    preferredVenues
  };
};

// Register a new user
export const registerUser = async (email: string, password: string, name?: string, isAdmin: boolean = false) => {
  // Prepare metadata with user information
  const metadata = {
    full_name: name,
    role: isAdmin ? 'admin' : 'user'  // Set role based on isAdmin parameter
  };
  
  console.log("Registering user with metadata:", metadata);
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata
    }
  });
  
  if (error) {
    throw error;
  }
  
  // Set a flag that this is a new user
  sessionStorage.setItem('newUser', 'true');
  
  // If user registration is successful and we have a name, create their profile
  if (data.user && name) {
    try {
      console.log("Creating initial profile for new user with name:", name);
      await updateProfile(data.user.id, { name });
    } catch (profileError) {
      console.error("Error creating initial profile:", profileError);
      // Continue anyway since the user was created successfully
    }
  }
  
  return data;
};

// Log out the current user
export const logoutUser = async () => {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    throw error;
  }
  
  // Clear any session flags
  sessionStorage.removeItem('newUser');
  
  return true;
};
