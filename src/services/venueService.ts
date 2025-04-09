
import { supabase } from "@/integrations/supabase/client";
import { Venue } from "@/models/types";

export const getVenues = async () => {
  const { data, error } = await supabase
    .from("venues")
    .select("*")
    .order("name");
  
  if (error) {
    throw error;
  }
  
  return data as Venue[];
};

export const getVenueById = async (id: string) => {
  const { data, error } = await supabase
    .from("venues")
    .select("*")
    .eq("id", id)
    .single();
  
  if (error) {
    throw error;
  }
  
  return data as Venue;
};

export const createVenue = async (venue: Omit<Venue, "id" | "createdAt">) => {
  const { data, error } = await supabase
    .from("venues")
    .insert([venue])
    .select();
  
  if (error) {
    throw error;
  }
  
  return data[0] as Venue;
};

export const updateVenue = async (id: string, venue: Partial<Venue>) => {
  const { data, error } = await supabase
    .from("venues")
    .update(venue)
    .eq("id", id)
    .select();
  
  if (error) {
    throw error;
  }
  
  return data[0] as Venue;
};

export const deleteVenue = async (id: string) => {
  const { error } = await supabase
    .from("venues")
    .delete()
    .eq("id", id);
  
  if (error) {
    throw error;
  }
  
  return true;
};
