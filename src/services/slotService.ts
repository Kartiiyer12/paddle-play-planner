import { supabase } from "@/integrations/supabase/client";
import { Slot } from "@/models/types";
import { isAfter, parseISO, startOfDay } from "date-fns";

// Helper function to get allowed venue IDs for the current admin
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

export const getSlots = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  let query = supabase.from("slots").select("*");

  if (user && user.user_metadata?.role === 'admin') {
    const allowedVenueIds = await getAllowedVenueIdsForAdmin(user.id);
    if (allowedVenueIds.length === 0) return []; // Admin owns no venues, so no slots
    query = query.in('venue_id', allowedVenueIds);
  }
  // Non-admins see all slots

  const { data, error } = await query
    .order("date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) {
    console.error("Error fetching slots:", error);
    throw error;
  }

  return data.map(slot => ({
    id: slot.id,
    venueId: slot.venue_id,
    date: slot.date,
    dayOfWeek: slot.day_of_week,
    startTime: slot.start_time,
    endTime: slot.end_time,
    maxPlayers: slot.max_players,
    currentPlayers: slot.current_players,
    createdAt: slot.created_at,
    updatedAt: slot.updated_at
  })) as Slot[];
};

export const getSlotsByVenue = async (venueId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  // Check if the user is an admin and if they own this specific venue
  if (user && user.user_metadata?.role === 'admin') {
    const allowedVenueIds = await getAllowedVenueIdsForAdmin(user.id);
    if (!allowedVenueIds.includes(venueId)) {
        console.warn(`Admin ${user.id} attempted to fetch slots for venue ${venueId} which they do not own.`);
        return []; // Return empty if admin doesn't own the requested venue
    }
  }
  // Non-admins can fetch slots for any specific venue

  const { data, error } = await supabase
    .from("slots")
    .select("*")
    .eq("venue_id", venueId)
    .order("date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) {
    console.error(`Error fetching slots for venue ${venueId}:`, error);
    throw error;
  }

  return data.map(slot => ({
    id: slot.id,
    venueId: slot.venue_id,
    date: slot.date,
    dayOfWeek: slot.day_of_week,
    startTime: slot.start_time,
    endTime: slot.end_time,
    maxPlayers: slot.max_players,
    currentPlayers: slot.current_players,
    createdAt: slot.created_at,
    updatedAt: slot.updated_at
  })) as Slot[];
};

export const getSlotsByDate = async (date: string, venueId?: string | null) => {
  const { data: { user } } = await supabase.auth.getUser();
  let finalVenueIds: string[] | null = null;
  
  if (user && user.user_metadata?.role === 'admin') {
      const allowedVenueIds = await getAllowedVenueIdsForAdmin(user.id);
      if (allowedVenueIds.length === 0) return []; // Admin owns no venues
      
      if (venueId) { // Admin specified a venue
          if (!allowedVenueIds.includes(venueId)) {
              console.warn(`Admin ${user.id} requested slots for date ${date} and venue ${venueId} which they do not own.`);
              return []; // Admin doesn't own the specified venue
          }
          finalVenueIds = [venueId]; // Filter by the single owned venue
      } else {
          finalVenueIds = allowedVenueIds; // Filter by all owned venues
      }
  } else if (venueId) {
      finalVenueIds = [venueId]; // Non-admin specified a venue
  }
  // If non-admin and no venueId, finalVenueIds remains null (fetch all)

  let query = supabase
    .from("slots")
    .select("*")
    .eq("date", date);

  if (finalVenueIds) {
    query = query.in("venue_id", finalVenueIds);
  }

  const { data, error } = await query.order("start_time", { ascending: true });

  if (error) {
    console.error(`Error fetching slots for date ${date}:`, error);
    throw error;
  }

  return data.map(slot => ({
    id: slot.id,
    venueId: slot.venue_id,
    date: slot.date,
    dayOfWeek: slot.day_of_week,
    startTime: slot.start_time,
    endTime: slot.end_time,
    maxPlayers: slot.max_players,
    currentPlayers: slot.current_players,
    createdAt: slot.created_at,
    updatedAt: slot.updated_at
  })) as Slot[];
};

export const getSlotsByDateRange = async (startDate: string, endDate: string, venueId?: string | null) => {
  const { data: { user } } = await supabase.auth.getUser();
  let finalVenueIds: string[] | null = null;
  
  if (user && user.user_metadata?.role === 'admin') {
      const allowedVenueIds = await getAllowedVenueIdsForAdmin(user.id);
      if (allowedVenueIds.length === 0) return []; // Admin owns no venues
      
      if (venueId) { // Admin specified a venue
          if (!allowedVenueIds.includes(venueId)) {
              console.warn(`Admin ${user.id} requested slots for range ${startDate}-${endDate} and venue ${venueId} which they do not own.`);
              return []; // Admin doesn't own the specified venue
          }
          finalVenueIds = [venueId]; // Filter by the single owned venue
      } else {
          finalVenueIds = allowedVenueIds; // Filter by all owned venues
      }
  } else if (venueId) {
      finalVenueIds = [venueId]; // Non-admin specified a venue
  }
  // If non-admin and no venueId, finalVenueIds remains null (fetch all)

  let query = supabase
    .from("slots")
    .select("*")
    .gte("date", startDate)
    .lte("date", endDate);
    
  if (finalVenueIds) {
      query = query.in("venue_id", finalVenueIds);
  }

  query = query.order("date", { ascending: true })
    .order("start_time", { ascending: true });

  const { data, error } = await query;

  if (error) {
    console.error(`Error fetching slots for range ${startDate}-${endDate}:`, error);
    throw error;
  }

  // Filter out past slots
  const now = new Date();
  const currentDate = now.toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
  const currentTime = now.toTimeString().split(' ')[0]; // Get current time in HH:MM:SS format

  return data
    .filter(slot => {
      // If the slot date is in the future, include it
      if (slot.date > currentDate) return true;
      
      // If the slot is today, check the time
      if (slot.date === currentDate) {
        return slot.end_time > currentTime; // Only include if end time hasn't passed
      }
      
      // Exclude past dates
      return false;
    })
    .map(slot => ({
      id: slot.id,
      venueId: slot.venue_id,
      date: slot.date,
      dayOfWeek: slot.day_of_week,
      startTime: slot.start_time,
      endTime: slot.end_time,
      maxPlayers: slot.max_players,
      currentPlayers: slot.current_players,
      createdAt: slot.created_at,
      updatedAt: slot.updated_at
    })) as Slot[];
};

export const getPastSlots = async (date: string, venueId?: string | null) => {
  let query = supabase
    .from("slots")
    .select("*")
    .lte("date", date)  // Less than or equal to the selected date
    .order("date", { ascending: false })  // Most recent first
    .order("start_time", { ascending: true });

  if (venueId) {
    query = query.eq("venue_id", venueId);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data.map(slot => ({
    id: slot.id,
    venueId: slot.venue_id,
    date: slot.date,
    dayOfWeek: slot.day_of_week,
    startTime: slot.start_time,
    endTime: slot.end_time,
    maxPlayers: slot.max_players,
    currentPlayers: slot.current_players,
    createdAt: slot.created_at,
    updatedAt: slot.updated_at
  })) as Slot[];
};

export const getSlotById = async (slotId: string) => {
  const { data, error } = await supabase
    .from("slots")
    .select("*")
    .eq("id", slotId)
    .single();

  if (error) {
    throw error;
  }

  return {
    id: data.id,
    venueId: data.venue_id,
    date: data.date,
    dayOfWeek: data.day_of_week,
    startTime: data.start_time,
    endTime: data.end_time,
    maxPlayers: data.max_players,
    currentPlayers: data.current_players,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  } as Slot;
};

export const createSlot = async (slot: Omit<Slot, "id" | "createdAt" | "currentPlayers" | "dayOfWeek">) => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  
  if (userError || !userData.user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("slots")
    .insert([{
      venue_id: slot.venueId,
      date: slot.date,
      start_time: slot.startTime,
      end_time: slot.endTime,
      max_players: slot.maxPlayers
    }])
    .select();
  
  if (error) {
    console.error("Slot creation error:", error);
    throw error;
  }
  
  return {
    id: data[0].id,
    venueId: data[0].venue_id,
    date: data[0].date,
    dayOfWeek: data[0].day_of_week,
    startTime: data[0].start_time,
    endTime: data[0].end_time,
    maxPlayers: data[0].max_players,
    currentPlayers: data[0].current_players,
    createdAt: data[0].created_at,
    updatedAt: data[0].updated_at
  } as Slot;
};

export const updateSlot = async (id: string, slot: Partial<Omit<Slot, "id" | "createdAt" | "dayOfWeek">>) => {
  const updateData: any = {};
  
  if (slot.venueId) updateData.venue_id = slot.venueId;
  if (slot.date) updateData.date = slot.date;
  if (slot.startTime) updateData.start_time = slot.startTime;
  if (slot.endTime) updateData.end_time = slot.endTime;
  if (slot.maxPlayers) updateData.max_players = slot.maxPlayers;
  if (slot.currentPlayers !== undefined) updateData.current_players = slot.currentPlayers;
  
  const { data, error } = await supabase
    .from("slots")
    .update(updateData)
    .eq("id", id)
    .select();
  
  if (error) {
    throw error;
  }
  
  return {
    id: data[0].id,
    venueId: data[0].venue_id,
    date: data[0].date,
    dayOfWeek: data[0].day_of_week,
    startTime: data[0].start_time,
    endTime: data[0].end_time,
    maxPlayers: data[0].max_players,
    currentPlayers: data[0].current_players,
    createdAt: data[0].created_at,
    updatedAt: data[0].updated_at
  } as Slot;
};

export const deleteSlot = async (id: string) => {
  const { error } = await supabase
    .from("slots")
    .delete()
    .eq("id", id);
  
  if (error) {
    throw error;
  }
  
  return true;
};
