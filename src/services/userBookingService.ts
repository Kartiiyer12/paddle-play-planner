import { supabase } from "@/integrations/supabase/client";
import { Booking, BookingWithDetails } from "@/models/types";
import { isAfter, parseISO, startOfDay } from "date-fns";
import { getVenueBookingPolicy } from "./adminSettingsService";
import { getUserSlotCoins } from "./profileService";

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

  // Get user's slot coins directly with the dedicated function
  const slotCoins = await getUserSlotCoins(userData.user.id);
  
  // Get user's name for the booking
  const { data: profileData } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", userData.user.id)
    .single();

  if (!profileData) {
    throw new Error("User profile not found");
  }

  // Get venue booking policy
  const policy = await getVenueBookingPolicy(venueId);
  const allowBookingWithoutCoins = policy.allow_booking_without_coins;

  // Check if user has enough coins or if booking without coins is allowed
  if (slotCoins <= 0 && !allowBookingWithoutCoins) {
    throw new Error("Not enough coins to book this slot");
  }

  // Call the stored procedure to book the slot and handle coin deduction
  const { data, error } = await supabase.rpc(
    'book_slot_with_coin',
    {
      slot_id_param: slotId,
      venue_id_param: venueId,
      allow_booking_without_coins_param: allowBookingWithoutCoins,
      user_name_param: profileData?.name || null
    }
  );
  
  if (error) {
    throw error;
  }
  
  // Add type check to ensure data isn't null before accessing properties
  if (!data) {
    throw new Error("Failed to book slot: No data returned");
  }
  
  // Type assertion to access properties safely
  const bookingData = data as {
    id: string;
    user_id: string;
    slot_id: string;
    venue_id: string;
    status: string;
    created_at: string;
    checked_in: boolean | null;
    user_name: string | null;
  };
  
  return {
    id: bookingData.id,
    userId: bookingData.user_id,
    slotId: bookingData.slot_id,
    venueId: bookingData.venue_id,
    status: bookingData.status,
    createdAt: bookingData.created_at,
    checkedIn: bookingData.checked_in || false,
    userName: bookingData.user_name || ''
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
  
  // Get the booking details to check if the slot is in the future
  const { data: bookingData, error: bookingError } = await supabase
    .from("bookings")
    .select("*, slots:slot_id(date)")
    .eq("id", bookingId)
    .single();
    
  if (bookingError || !bookingData) {
    throw new Error("Booking not found");
  }
  
  if (!isAdmin && bookingData.user_id !== userData.user.id) {
    throw new Error("You can only cancel your own bookings");
  }
  
  // Check if the slot is in the future or today to determine if we should refund the coin
  const slotDate = parseISO(bookingData.slots.date);
  const currentDate = startOfDay(new Date());
  const shouldRefundCoin = isAfter(slotDate, currentDate) || slotDate.toDateString() === currentDate.toDateString();

  // Call the function to cancel booking and possibly refund coin
  const { data, error } = await supabase.rpc(
    'cancel_booking_with_refund',
    {
      booking_id_param: bookingId,
      refund_coin: shouldRefundCoin
    }
  );
  
  if (error) {
    throw error;
  }
  
  return true;
};
