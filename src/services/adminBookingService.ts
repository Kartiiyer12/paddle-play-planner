
import { supabase } from "@/integrations/supabase/client";
import { Booking, BookingWithDetails } from "@/models/types";

/**
 * Gets all bookings (admin only)
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

  const { data, error } = await supabase
    .from("bookings")
    .select(`
      *,
      venues:venue_id (*),
      slots:slot_id (*)
    `)
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
 * Gets bookings for a specific slot (admin only)
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

  const { data, error } = await supabase
    .from("bookings")
    .select(`
      *,
      profiles:user_id (name),
      venues:venue_id (*),
      slots:slot_id (*)
    `)
    .eq("slot_id", slotId)
    .eq("status", "confirmed")
    .order("created_at");
  
  if (error) {
    throw error;
  }
  
  if (!data) return [];
  
  return data.map(booking => {
    const profileData = booking.profiles || { name: 'Unknown Player' };
    // Safely handle the profile data whether it's an error or actual data
    const userName = booking.user_name || 
                    (profileData && typeof profileData === 'object' && 'name' in profileData ? 
                      profileData.name : 'Unknown Player');
    
    return {
      id: booking.id,
      userId: booking.user_id,
      slotId: booking.slot_id,
      venueId: booking.venue_id,
      status: booking.status,
      createdAt: booking.created_at,
      checkedIn: booking.checked_in || false,
      userName: userName,
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
    };
  }) as BookingWithDetails[];
};

/**
 * Updates the status of a booking (admin only)
 */
export const updateBookingStatus = async (bookingId: string, status: 'confirmed' | 'cancelled') => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  
  if (userError || !userData.user) {
    throw userError || new Error("User not authenticated");
  }
  
  // Check if user is admin
  const isAdmin = userData.user.user_metadata?.role === 'admin';
  
  if (!isAdmin) {
    // Only admins can change status other than cancellation
    throw new Error("Only admins can update booking status");
  }
  
  const { data, error } = await supabase
    .from("bookings")
    .update({ status })
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
