
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
    return {
      id: booking.id,
      userId: booking.user_id,
      slotId: booking.slot_id,
      venueId: booking.venue_id,
      status: booking.status,
      createdAt: booking.created_at,
      checkedIn: booking.checked_in || false,
      userName: booking.user_name || profileData.name || 'Unknown Player',
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

export const bookSlot = async (slotId: string, venueId: string) => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  
  if (userError || !userData.user) {
    throw userError || new Error("User not authenticated");
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", userData.user.id)
    .single();

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
  
  // Fix the type conversion error
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
