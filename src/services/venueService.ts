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
  
  return data.map(venue => ({
    id: venue.id,
    name: venue.name,
    address: venue.address,
    city: venue.city,
    state: venue.state,
    zip: venue.zip || '',
    description: venue.description || '',
    courtCount: venue.court_count,
    imageUrl: venue.image_url || '',
    createdAt: venue.created_at,
    updatedAt: venue.updated_at
  })) as Venue[];
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
  
  return {
    id: data.id,
    name: data.name,
    address: data.address,
    city: data.city,
    state: data.state,
    zip: data.zip || '',
    description: data.description || '',
    courtCount: data.court_count,
    imageUrl: data.image_url || '',
    createdAt: data.created_at,
    updatedAt: data.updated_at
  } as Venue;
};

export const createVenue = async (venue: Omit<Venue, "id" | "createdAt">) => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  
  if (userError || !userData.user) {
    throw new Error("User not authenticated");
  }
  
  const { data, error } = await supabase
    .from("venues")
    .insert([{
      name: venue.name,
      address: venue.address,
      city: venue.city,
      state: venue.state,
      zip: venue.zip,
      description: venue.description,
      court_count: venue.courtCount,
      image_url: venue.imageUrl,
      admin_id: userData.user.id
    }])
    .select();
  
  if (error) {
    throw error;
  }
  
  return {
    id: data[0].id,
    name: data[0].name,
    address: data[0].address,
    city: data[0].city,
    state: data[0].state,
    zip: data[0].zip || '',
    description: data[0].description || '',
    courtCount: data[0].court_count,
    imageUrl: data[0].image_url || '',
    createdAt: data[0].created_at,
    updatedAt: data[0].updated_at
  } as Venue;
};

export const updateVenue = async (id: string, venue: Partial<Venue>) => {
  const updateData: any = {};
  
  if (venue.name) updateData.name = venue.name;
  if (venue.address) updateData.address = venue.address;
  if (venue.city) updateData.city = venue.city;
  if (venue.state) updateData.state = venue.state;
  if (venue.zip) updateData.zip = venue.zip;
  if (venue.description !== undefined) updateData.description = venue.description;
  if (venue.courtCount) updateData.court_count = venue.courtCount;
  if (venue.imageUrl) updateData.image_url = venue.imageUrl;
  
  const { data, error } = await supabase
    .from("venues")
    .update(updateData)
    .eq("id", id)
    .select();
  
  if (error) {
    throw error;
  }
  
  return {
    id: data[0].id,
    name: data[0].name,
    address: data[0].address,
    city: data[0].city,
    state: data[0].state,
    zip: data[0].zip || '',
    description: data[0].description || '',
    courtCount: data[0].court_count,
    imageUrl: data[0].image_url || '',
    createdAt: data[0].created_at,
    updatedAt: data[0].updated_at
  } as Venue;
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
