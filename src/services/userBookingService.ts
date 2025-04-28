
import { supabase } from "@/integrations/supabase/client";
import { Booking, BookingWithDetails } from "@/models/types";
import { isAfter, parseISO, startOfDay } from "date-fns";
import { getAdminSettings } from "./adminSettingsService";

/**
 * Gets the current user's bookings
 */
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
    checkedIn: booking.checked_in || false,
    userName: booking.user_name || '',
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

/**
 * Gets the IDs of slots booked by the current user
 */
export const getUserBookedSlotIds = async () => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  
  if (userError || !userData.user) {
    throw userError || new Error("User not authenticated");
  }

  // Get only future bookings
  const today = startOfDay(new Date()).toISOString();
  
  const { data, error } = await supabase
    .from("bookings")
    .select("slot_id, slots:slot_id(date)")
    .eq("user_id", userData.user.id)
    .eq("status", "confirmed");
  
  if (error) {
    throw error;
  }
  
  // Filter to only return slots in the future
  const currentDate = startOfDay(new Date());
  return data
    .filter(item => {
      const slotDate = parseISO(item.slots.date);
      return isAfter(slotDate, currentDate) || slotDate.toDateString() === currentDate.toDateString();
    })
    .map(item => item.slot_id);
};

/**
 * Books a slot for the current user
 */
export const bookSlot = async (slotId: string, venueId: string) => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  
  if (userError || !userData.user) {
    throw userError || new Error("User not authenticated");
  }

  // Check if user has coins or if booking without coins is allowed
  const { data: profileData } = await supabase
    .from("profiles")
    .select("name, slot_coins")
    .eq("id", userData.user.id)
    .single();

  if (!profileData) {
    throw new Error("User profile not found");
  }

  // Get admin settings for this venue
  const adminSettings = await getAdminSettings(venueId);
  const allowBookingWithoutCoins = adminSettings?.allow_booking_without_coins || false;

  // Check if user has enough coins or if booking without coins is allowed
  if (profileData.slot_coins <= 0 && !allowBookingWithoutCoins) {
    throw new Error("Not enough coins to book this slot");
  }

  const { data, error } = await supabase
    .from("bookings")
    .insert([{
      user_id: userData.user.id,
      slot_id: slotId,
      venue_id: venueId,
      status: "confirmed",
      user_name: profileData?.name || null,
      checked_in: false
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
    createdAt: data[0].created_at,
    checkedIn: data[0].checked_in || false,
    userName: data[0].user_name || ''
  } as Booking;
};

/**
 * Cancel a booking
 */
export const cancelBooking = async (bookingId: string) => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  
  if (userError || !userData.user) {
    throw userError || new Error("User not authenticated");
  }
  
  // First check if the booking belongs to the user or if user is admin
  const isAdmin = userData.user.user_metadata?.role === 'admin';
  
  if (!isAdmin) {
    // If not admin, verify the booking belongs to the user
    const { data: bookingData, error: bookingError } = await supabase
      .from("bookings")
      .select("user_id")
      .eq("id", bookingId)
      .single();
    
    if (bookingError || !bookingData || bookingData.user_id !== userData.user.id) {
      throw new Error("You can only cancel your own bookings");
    }
  }

  const { error } = await supabase
    .from("bookings")
    .delete()
    .eq("id", bookingId);
  
  if (error) {
    throw error;
  }
  
  return true;
};
