
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
    venue: {
      id: booking.venues.id,
      name: booking.venues.name,
      address: booking.venues.address,
      city: booking.venues.city,
      state: booking.venues.state,
      zip: booking.venues.zip || '',
      description: booking.venues.description || '',
      courtCount: booking.venues.court_count,
      imageUrl: booking.venues.image_url || '',
      createdAt: booking.venues.created_at,
      updatedAt: booking.venues.updated_at
    },
    slot: {
      id: booking.slots.id,
      venueId: booking.slots.venue_id,
      date: booking.slots.date,
      dayOfWeek: booking.slots.day_of_week || '',
      startTime: booking.slots.start_time,
      endTime: booking.slots.end_time,
      maxPlayers: booking.slots.max_players,
      currentPlayers: booking.slots.current_players,
      createdAt: booking.slots.created_at,
      updatedAt: booking.slots.updated_at
    }
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
  
  return {
    id: data[0].id,
    userId: data[0].user_id,
    slotId: data[0].slot_id,
    venueId: data[0].venue_id,
    status: data[0].status,
    createdAt: data[0].created_at
  } as Booking;
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
