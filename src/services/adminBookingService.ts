import { supabase } from "@/integrations/supabase/client";
import { Booking, BookingWithDetails } from "@/models/types";

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

/**
 * Gets all bookings (admin only, filtered by owned venues)
 */
export const getAllBookings = async () => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  
  if (userError || !userData.user) {
    throw userError || new Error("User not authenticated");
  }
  
  // Check if user is admin
  const isAdmin = userData.user.user_metadata?.role === 'admin';
  
  if (!isAdmin) {
    throw new Error("Only admins can access all bookings");
  }

  // Fetch venues owned by this admin
  const allowedVenueIds = await getAllowedVenueIdsForAdmin(userData.user.id);
  if (allowedVenueIds.length === 0) {
      console.log(`Admin ${userData.user.id} owns no venues. Returning empty bookings list.`);
      return []; // Admin owns no venues, so no bookings to show
  }
  
  console.log(`Admin ${userData.user.id} fetching bookings for venues:`, allowedVenueIds);

  const { data, error } = await supabase
    .from("bookings")
    .select(`
      *,
      venues:venue_id (*),
      slots:slot_id (*)
    `)
    .in("venue_id", allowedVenueIds) // Filter by owned venues
    .order("created_at", { ascending: false });
  
  if (error) {
    console.error("Error fetching admin bookings:", error);
    throw error;
  }
  
  console.log(`Found ${data?.length || 0} bookings for admin ${userData.user.id}.`);
  
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
 * Gets bookings for a specific slot (admin only, checks ownership)
 */
export const getSlotBookings = async (slotId: string) => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  
  if (userError || !userData.user) {
    throw userError || new Error("User not authenticated");
  }
  
  // Check if user is admin
  const isAdmin = userData.user.user_metadata?.role === 'admin';
  
  if (!isAdmin) {
    throw new Error("Only admins can access slot bookings");
  }

  // First, get the venue_id for the requested slot
  const { data: slotData, error: slotFetchError } = await supabase
    .from('slots')
    .select('venue_id')
    .eq('id', slotId)
    .single();

  if (slotFetchError || !slotData) {
    console.error(`Error fetching slot ${slotId} or slot not found:`, slotFetchError);
    throw new Error(`Slot not found or could not be fetched.`);
  }

  // Now check if the admin owns the venue this slot belongs to
  const allowedVenueIds = await getAllowedVenueIdsForAdmin(userData.user.id);
  if (!allowedVenueIds.includes(slotData.venue_id)) {
      console.warn(`Admin ${userData.user.id} attempted to fetch bookings for slot ${slotId} in venue ${slotData.venue_id} which they do not own.`);
      return []; // Return empty if admin doesn't own the venue of the slot
  }

  console.log(`Admin ${userData.user.id} fetching bookings for owned slot ${slotId}.`);

  // Admin owns the venue, proceed to get bookings for this slot
  const { data: bookingsData, error: bookingsError } = await supabase
    .from("bookings")
    .select("*")
    .eq("slot_id", slotId)
    .eq("status", "confirmed");
  
  if (bookingsError) {
    console.error("Error fetching slot bookings:", bookingsError);
    throw bookingsError;
  }
  
  if (!bookingsData || bookingsData.length === 0) {
    console.log(`No confirmed bookings found for slot ${slotId}.`);
    return [];
  }
  
  // For each booking, fetch related details (venue, slot info is needed)
  const enhancedBookings: BookingWithDetails[] = [];
  
  // Fetch venue data once (since all bookings are for the same venue)
  const { data: venueData, error: venueError } = await supabase
      .from("venues")
      .select("*")
      .eq("id", slotData.venue_id)
      .single();
  
  // Fetch full slot data once
  const { data: fullSlotData, error: fullSlotError } = await supabase
      .from("slots")
      .select("*")
      .eq("id", slotId)
      .single();

  if (venueError || fullSlotError || !venueData || !fullSlotData) {
      console.error("Error fetching venue or full slot details for enhancement:", venueError, fullSlotError);
      // Decide how to handle: return partial data or throw? Returning partial for now.
      return []; 
  }

  for (const booking of bookingsData) {
    enhancedBookings.push({
      id: booking.id,
      userId: booking.user_id,
      slotId: booking.slot_id,
      venueId: booking.venue_id,
      status: booking.status as "confirmed" | "cancelled",
      createdAt: booking.created_at,
      checkedIn: booking.checked_in || false,
      userName: booking.user_name || 'Unknown Player',
      venue: {
        id: venueData.id,
        name: venueData.name,
        address: venueData.address,
        city: venueData.city,
        state: venueData.state,
        zip: venueData.zip || '',
        description: venueData.description || '',
        courtCount: venueData.court_count,
        imageUrl: venueData.image_url || '',
        createdAt: venueData.created_at,
        updatedAt: venueData.updated_at
      },
      slot: {
        id: fullSlotData.id,
        venueId: fullSlotData.venue_id,
        date: fullSlotData.date,
        dayOfWeek: fullSlotData.day_of_week || '',
        startTime: fullSlotData.start_time,
        endTime: fullSlotData.end_time,
        maxPlayers: fullSlotData.max_players,
        currentPlayers: fullSlotData.current_players,
        createdAt: fullSlotData.created_at,
        updatedAt: fullSlotData.updated_at
      }
    });
  }
  
  console.log(`Enhanced ${enhancedBookings.length} bookings for slot ${slotId}.`);
  return enhancedBookings;
};

/**
 * Updates the status of a booking (admin only, checks ownership)
 */
export const updateBookingStatus = async (bookingId: string, status: 'confirmed' | 'cancelled') => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  
  if (userError || !userData.user) {
    throw userError || new Error("User not authenticated");
  }
  
  // Check if user is admin
  const isAdmin = userData.user.user_metadata?.role === 'admin';
  
  if (!isAdmin) {
    throw new Error("Only admins can update booking status");
  }

  // Check if admin owns the venue associated with the booking
  const { data: bookingData, error: bookingFetchError } = await supabase
      .from('bookings')
      .select('venue_id')
      .eq('id', bookingId)
      .single();

  if (bookingFetchError || !bookingData) {
      console.error(`Error fetching booking ${bookingId} for ownership check:`, bookingFetchError);
      throw new Error(`Booking not found or could not verify ownership.`);
  }

  const allowedVenueIds = await getAllowedVenueIdsForAdmin(userData.user.id);
  if (!allowedVenueIds.includes(bookingData.venue_id)) {
      console.warn(`Admin ${userData.user.id} attempted to update status for booking ${bookingId} in venue ${bookingData.venue_id} which they do not own.`);
      throw new Error("Permission denied: You do not own the venue for this booking.");
  }
  
  // Ownership confirmed, proceed with update
  const { data, error } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", bookingId)
    .select();
  
  if (error) {
    console.error(`Error updating status for booking ${bookingId}:`, error);
    throw error;
  }
  
  if (!data || data.length === 0) {
      throw new Error("Booking status update failed, no data returned.");
  }

  return {
    id: data[0].id,
    userId: data[0].user_id,
    slotId: data[0].slot_id,
    venueId: data[0].venue_id,
    status: data[0].status as "confirmed" | "cancelled",
    createdAt: data[0].created_at,
    checkedIn: data[0].checked_in || false,
    userName: data[0].user_name || ''
  } as Booking;
};
