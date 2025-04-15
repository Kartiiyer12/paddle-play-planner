
import { supabase } from "@/integrations/supabase/client";
import { Booking } from "@/models/types";

/**
 * Updates the check-in status of a booking
 */
export const updateBookingCheckInStatus = async (bookingId: string, checkedIn: boolean) => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  
  if (userError || !userData.user) {
    throw userError || new Error("User not authenticated");
  }
  
  // Get the booking to check if the user is the owner or admin
  const { data: bookingData, error: bookingError } = await supabase
    .from("bookings")
    .select("user_id")
    .eq("id", bookingId)
    .single();
  
  if (bookingError) {
    throw bookingError;
  }
  
  // Check if user is admin or the booking owner
  const isAdmin = userData.user.user_metadata?.role === 'admin';
  const isOwner = bookingData.user_id === userData.user.id;
  
  if (!isAdmin && !isOwner) {
    throw new Error("You can only check in yourself");
  }

  const { data, error } = await supabase
    .from("bookings")
    .update({ checked_in: checkedIn })
    .eq("id", bookingId)
    .select();
  
  if (error) {
    throw error;
  }
  
  return {
    id: data[0].id,
    userId: data[0].user_id,
    slotId: data[0].slot_id,
    venueId: data[0].venue_id,
    status: data[0].status,
    createdAt: data[0].created_at,
    checkedIn: data[0].checked_in || false,
    userName: data[0].user_name || ''
  } as Booking;
};
