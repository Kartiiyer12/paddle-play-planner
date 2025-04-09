
import { supabase } from "@/integrations/supabase/client";
import { Slot } from "@/models/types";

export const getSlots = async () => {
  const { data, error } = await supabase
    .from("slots")
    .select("*")
    .order("date")
    .order("start_time");
  
  if (error) {
    throw error;
  }
  
  return data as Slot[];
};

export const getSlotsByVenue = async (venueId: string) => {
  const { data, error } = await supabase
    .from("slots")
    .select("*")
    .eq("venue_id", venueId)
    .order("date")
    .order("start_time");
  
  if (error) {
    throw error;
  }
  
  return data as Slot[];
};

export const getSlotsByDate = async (date: string) => {
  const { data, error } = await supabase
    .from("slots")
    .select("*")
    .eq("date", date)
    .order("start_time");
  
  if (error) {
    throw error;
  }
  
  return data as Slot[];
};

export const getSlotById = async (id: string) => {
  const { data, error } = await supabase
    .from("slots")
    .select("*")
    .eq("id", id)
    .single();
  
  if (error) {
    throw error;
  }
  
  return data as Slot;
};

export const createSlot = async (slot: Omit<Slot, "id" | "createdAt" | "currentPlayers" | "dayOfWeek">) => {
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
    throw error;
  }
  
  return data[0] as Slot;
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
  
  return data[0] as Slot;
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
