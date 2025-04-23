import { supabase } from "@/integrations/supabase/client";
import { Venue } from "@/models/types";

export const getVenues = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  let query = supabase.from("venues").select("*");

  // If the user is an admin, only fetch venues they own
  if (user && user.user_metadata?.role === 'admin') {
    console.log(`Admin user ${user.id} detected. Filtering venues by admin_id.`);
    query = query.eq('admin_id', user.id);
  } else {
    // Non-admins or logged-out users see all venues (adjust if needed)
    console.log("Non-admin user or no user. Fetching all venues.");
  }

  const { data, error } = await query.order("name");
  
  if (error) {
    console.error("Error fetching venues:", error);
    throw error;
  }
  
  console.log(`Fetched ${data?.length || 0} venues.`);
  
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
  const { data: { user } } = await supabase.auth.getUser();
  let query = supabase.from("venues").select("*").eq("id", id);

  // If the user is an admin, ensure they own the venue they are trying to fetch
  if (user && user.user_metadata?.role === 'admin') {
    query = query.eq('admin_id', user.id);
  } 
  // Non-admins can fetch any venue by ID (adjust if needed)

  const { data, error } = await query.single(); // Use single to expect one or zero
  
  if (error) {
    // If error code is PGRST116, it means no rows found (potentially because admin didn't own it)
    if (error.code === 'PGRST116') {
        console.warn(`Venue with ID ${id} not found or not owned by admin ${user?.id}.`);
        return null; // Return null instead of throwing error for "not found"
    }
    console.error(`Error fetching venue by ID ${id}:`, error);
    throw error;
  }
  
  if (!data) {
      return null; // Should be covered by single(), but good practice
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

export const createVenue = async (venue: Omit<Venue, "id" | "createdAt" | "updatedAt">) => {
  // Get current user to set as admin_id
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("User not authenticated");
  }

  // Ensure the user performing the action is an admin
  const metadata = user.user_metadata;
  if (metadata?.role !== 'admin') {
    throw new Error("Only admins can create venues.");
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
      admin_id: user.id // Set the admin_id to the current user's ID
    }])
    .select();
  
  if (error) {
    console.error("Error creating venue:", error);
    // Check for RLS violation error specifically (though user isn't using RLS here, keep for robustness)
    if (error.code === '42501') { 
        throw new Error("Permission denied creating venue (RLS error)."); // Less likely without RLS
    }
    throw error;
  }
  
  if (!data || data.length === 0) {
      throw new Error("Venue creation failed, no data returned.")
  }

  const newVenue = data[0];
  
  return {
    id: newVenue.id,
    name: newVenue.name,
    address: newVenue.address,
    city: newVenue.city,
    state: newVenue.state,
    zip: newVenue.zip,
    description: newVenue.description,
    courtCount: newVenue.court_count,
    imageUrl: newVenue.image_url,
    createdAt: newVenue.created_at,
    updatedAt: newVenue.updated_at
    // admin_id is not usually returned or needed in the Venue model for the frontend
  } as Venue;
};

export const updateVenue = async (id: string, venue: Partial<Omit<Venue, "id" | "createdAt" | "updatedAt">>) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");
  if (user.user_metadata?.role !== 'admin') throw new Error("Only admins can update venues.");

  // Since we are not using RLS, explicitly check ownership before updating
  const { data: existingVenue, error: fetchError } = await supabase
    .from('venues')
    .select('admin_id')
    .eq('id', id)
    .single();

  if (fetchError || !existingVenue) {
    console.error(`Error fetching venue ${id} for ownership check or venue not found:`, fetchError);
    throw new Error(`Venue not found or could not verify ownership.`);
  }

  if (existingVenue.admin_id !== user.id) {
    console.warn(`Admin ${user.id} attempted to update venue ${id} owned by ${existingVenue.admin_id}. Denying.`);
    throw new Error("Permission denied: You do not own this venue.");
  }

  // Prepare update data (excluding admin_id)
  const updateData: any = {};
  if (venue.name) updateData.name = venue.name;
  if (venue.address) updateData.address = venue.address;
  if (venue.city) updateData.city = venue.city;
  if (venue.state) updateData.state = venue.state;
  if (venue.zip) updateData.zip = venue.zip;
  if (venue.description) updateData.description = venue.description;
  if (venue.courtCount !== undefined) updateData.court_count = venue.courtCount;
  if (venue.imageUrl) updateData.image_url = venue.imageUrl;
  
  const { data, error } = await supabase
    .from("venues")
    .update(updateData)
    .eq("id", id)
    // We've already checked ownership, Supabase update will proceed
    .select();
  
  if (error) {
     console.error("Error updating venue:", error);
    // RLS error less likely here now
    if (error.code === '42501') {
        throw new Error("Permission denied updating venue (RLS error).");
    }
    throw error;
  }

  if (!data || data.length === 0) {
    throw new Error("Venue update failed, no data returned.")
  }
  
  const updatedVenue = data[0];
  return {
    id: updatedVenue.id,
    name: updatedVenue.name,
    address: updatedVenue.address,
    city: updatedVenue.city,
    state: updatedVenue.state,
    zip: updatedVenue.zip,
    description: updatedVenue.description,
    courtCount: updatedVenue.court_count,
    imageUrl: updatedVenue.image_url,
    createdAt: updatedVenue.created_at,
    updatedAt: updatedVenue.updated_at
  } as Venue;
};

export const deleteVenue = async (id: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");
  if (user.user_metadata?.role !== 'admin') throw new Error("Only admins can delete venues.");

  // Since we are not using RLS, explicitly check ownership before deleting
  const { data: existingVenue, error: fetchError } = await supabase
    .from('venues')
    .select('admin_id')
    .eq('id', id)
    .single();

  if (fetchError || !existingVenue) {
    console.error(`Error fetching venue ${id} for ownership check or venue not found:`, fetchError);
    throw new Error(`Venue not found or could not verify ownership.`);
  }

  if (existingVenue.admin_id !== user.id) {
    console.warn(`Admin ${user.id} attempted to delete venue ${id} owned by ${existingVenue.admin_id}. Denying.`);
    throw new Error("Permission denied: You do not own this venue.");
  }

  // Ownership confirmed, proceed with delete
  const { error } = await supabase
    .from("venues")
    .delete()
    .eq("id", id);
  
  if (error) {
    console.error(`Error deleting venue ${id}:`, error);
    // RLS error less likely here now
    if (error.code === '42501') {
        throw new Error("Permission denied deleting venue (RLS error).");
    }
    throw error;
  }
  
  console.log(`Venue ${id} deleted successfully by admin ${user.id}.`);
  return true;
};
