
import { supabase } from "@/integrations/supabase/client";
import { Booking, BookingWithDetails } from "@/models/types";

export const getUserBookings = async () => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  
  if (userError || !userData.user) {
    throw userError || new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("bookings")
    .select(`
      *,
      venues:venue_id (*),
      slots:slot_id (*)
    `)
    .eq("user_id", userData.user.id)
    .eq("status", "confirmed")
    .order("created_at", { ascending: false });
  
  if (error) {
    throw error;
  }
  
  return data.map(booking => ({
    id: booking.id,
    userId: booking.user_id,
    slotId: booking.slot_id,
    venueId: booking.venue_id,
    status: booking.status,
    createdAt: booking.created_at,
    venue: booking.venues,
    slot: booking.slots
  })) as BookingWithDetails[];
};

export const bookSlot = async (slotId: string, venueId: string) => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  
  if (userError || !userData.user) {
    throw userError || new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("bookings")
    .insert([{
      user_id: userData.user.id,
      slot_id: slotId,
      venue_id: venueId,
      status: "confirmed"
    }])
    .select();
  
  if (error) {
    throw error;
  }
  
  return data[0] as Booking;
};

export const cancelBooking = async (bookingId: string) => {
  const { error } = await supabase
    .from("bookings")
    .delete()
    .eq("id", bookingId);
  
  if (error) {
    throw error;
  }
  
  return true;
};
