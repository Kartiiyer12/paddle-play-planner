
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BookingUser } from "@/models/types";
import { toast } from "sonner";

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
      
      if (!isAdmin) {
        throw new Error("Only admins can access user data");
      }

      // Get all bookings
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('user_id, user_name, created_at, checked_in');
        
      if (bookingsError) throw bookingsError;
      
      if (!bookings) {
        setUsers([]);
        return;
      }

      // Group by user_id and count bookings
      const userMap = new Map<string, {
        id: string;
        name: string | null;
        bookingsCount: number;
        lastBookingDate?: string;
      }>();
      
      bookings.forEach(booking => {
        if (!booking) return;
        
        const userId = booking.user_id;
        const userName = booking.user_name;
        const existingUser = userMap.get(userId);
        
        if (existingUser) {
          existingUser.bookingsCount += 1;
          
          // Update last booking date if this booking is newer
          if (!existingUser.lastBookingDate || 
              new Date(booking.created_at) > new Date(existingUser.lastBookingDate)) {
            existingUser.lastBookingDate = booking.created_at;
          }
          
        } else {
          userMap.set(userId, {
            id: userId,
            name: userName || null,
            bookingsCount: 1,
            lastBookingDate: booking.created_at
          });
        }
      });
      
      // Convert map to array and fetch any missing user details
      const userArray = Array.from(userMap.values());
      
      // Fetch email addresses for users without names
      const usersWithoutNames = userArray.filter(u => !u.name).map(u => u.id);
      
      if (usersWithoutNames.length > 0) {
        // This requires admin privileges or proper RLS setup
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name, email')
          .in('id', usersWithoutNames);
          
        if (!profilesError && profiles) {
          profiles.forEach(profile => {
            if (!profile) return;
            
            const user = userMap.get(profile.id);
            if (user) {
              user.name = profile.name || 'Unknown User';
            }
          });
        }
      }
      
      const formattedUsers: BookingUser[] = Array.from(userMap.values()).map(user => ({
        id: user.id,
        name: user.name || 'Unknown User',
        email: '', // Email might not be available without extra permissions
        bookingsCount: user.bookingsCount,
        lastBookingDate: user.lastBookingDate
      }));
      
      setUsers(formattedUsers);
      
    } catch (err: any) {
      setError(err.message || "Failed to fetch booking users");
      toast.error(err.message || "Failed to fetch booking users");
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchBookingUsers();
  }, []);
  
  return { users, isLoading, error, refreshUsers: fetchBookingUsers };
};
