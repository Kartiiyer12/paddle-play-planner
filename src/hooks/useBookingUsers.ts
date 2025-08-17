
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BookingUser } from "@/models/types";
import { toast } from "sonner";

// Helper function (can be shared or duplicated if needed)
const getAllowedVenueIdsForAdmin = async (userId: string): Promise<string[]> => {
  const { data: venueIds, error: venueError } = await supabase
    .from('venues')
    .select('id')
    .eq('admin_id', userId);

  if (venueError) {
    console.error("Error fetching allowed venue IDs for admin:", venueError);
    return []; // Return empty array on error
  }
  return venueIds.map(v => v.id);
};

export const useBookingUsers = () => {
  const [users, setUsers] = useState<BookingUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookingUsers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData.user) {
        throw userError || new Error("User not authenticated");
      }
      
      // Check if user is admin
      const isAdmin = userData.user.user_metadata?.role === 'admin';
      console.log("Current user metadata:", userData.user.user_metadata);
      console.log("Is user admin?", isAdmin);
      console.log("User JWT claims:", userData.user);
      
      if (!isAdmin) {
        // This hook is likely admin-only, but double-check usage if non-admins might call it
        throw new Error("Only admins can access user booking data");
      }

      console.log(`Admin ${userData.user.id} fetching all registered users`);

      // Show all registered users to admin (excluding admin profiles)
      console.log("Executing query for registered users...");
      const { data: nonAdminUsers, error: usersError } = await supabase
        .from('profiles')
        .select('id, name, email, slot_coins')
        .not('name', 'is', null); // Only get profiles with names (registered users)
        
      if (usersError) {
        console.error("Error fetching users:", usersError);
        throw usersError;
      }
      
      console.log("Non-admin users from database:", nonAdminUsers);
      
      // Debug: Try to fetch all profiles to see what we can access
      const { data: allProfiles, error: allError } = await supabase
        .from('profiles')
        .select('id, name, email');
      console.log("All profiles accessible to admin:", allProfiles);
      if (allError) console.error("Error fetching all profiles:", allError);

      // Get all bookings (for now, will add venue filtering later)
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('user_id, user_name, created_at, checked_in, venue_id');
        
      if (bookingsError) throw bookingsError;

      // Group by user_id and count bookings (from the filtered list)
      // Define the structure for the map including email and slot_coins
      type UserMapEntry = {
        id: string;
        name: string | null;
        email: string | null;
        bookingsCount: number;
        lastBookingDate?: string;
        slotCoins?: number;
      };
      const userMap = new Map<string, UserMapEntry>();
      
      // First, add all registered users (even if they haven't booked yet)
      nonAdminUsers?.forEach(user => {
        if (!user) return;
        
        userMap.set(user.id, {
          id: user.id,
          name: user.name || 'Unknown User',
          email: user.email || null,
          bookingsCount: 0, // Will be updated if they have bookings
          slotCoins: user.slot_coins || 0
        });
      });
      
      // Then, process bookings and update/add users from booking history
      bookings?.forEach(booking => {
        if (!booking) return;
        
        const userId = booking.user_id;
        const userName = booking.user_name;
        let existingUser = userMap.get(userId);
        
        if (existingUser) {
          existingUser.bookingsCount += 1;
          
          // Update last booking date if this booking is newer
          if (!existingUser.lastBookingDate || 
              new Date(booking.created_at) > new Date(existingUser.lastBookingDate)) {
            existingUser.lastBookingDate = booking.created_at;
          }
          
        } else {
            // Initialize new entry for users found only in bookings
            existingUser = {
                id: userId,
                name: userName || 'Unknown User', // Default to Unknown if name is null
                email: null, // Initialize email as null
                bookingsCount: 1,
                lastBookingDate: booking.created_at,
                slotCoins: 0
            };
            userMap.set(userId, existingUser);
        }
      });
      
      // Convert map to array
      const userArray = Array.from(userMap.values());
      
      // Fetch profile details for users who don't already have complete data
      // (mainly for users found only through bookings)
      const userIdsToFetch = userArray
        .filter(user => !user.email || user.slotCoins === undefined)
        .map(u => u.id);
      
      if (userIdsToFetch.length > 0) {
          console.log("Fetching missing profile details for users:", userIdsToFetch);
          const { data: profiles, error: profilesError } = await supabase
              .from('profiles')
              .select('id, name, email, slot_coins') // Select slot_coins as well
              .in('id', userIdsToFetch);
              
          if (!profilesError && profiles) {
              profiles.forEach(profile => {
                  if (!profile) return;
                  const user = userMap.get(profile.id);
                  if (user) {
                      // Update name, email, and slot_coins from profile if available
                      user.name = profile.name || user.name; 
                      user.email = profile.email || null;
                      user.slotCoins = profile.slot_coins || 0;
                  }
              });
          } else if (profilesError) {
              console.error("Error fetching profiles for user details:", profilesError);
          }
      }
      
      // Map final data to BookingUser[] type
      const finalUsers: BookingUser[] = Array.from(userMap.values()).map(u => ({
          ...u,
          name: u.name || 'Unknown User', // Ensure name is never null
          email: u.email || '', // Ensure email is never null
          slotCoins: u.slotCoins || 0 // Ensure slotCoins is never null
      }));

      console.log(`Found ${nonAdminUsers?.length || 0} non-admin users`);
      console.log(`Found ${finalUsers.length} users to display in admin panel`);
      
      setUsers(finalUsers);
      
    } catch (err: any) {
      console.error("Error in useBookingUsers hook:", err);
      setError(err.message || "Failed to fetch booking users");
      toast.error(err.message || "Failed to load user data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingUsers();
  }, []); // Fetch on initial mount

  return { users, isLoading, error, refetch: fetchBookingUsers };
};
