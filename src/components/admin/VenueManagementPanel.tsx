
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MapPin, Plus, Edit, Trash } from "lucide-react";
import { toast } from "sonner";
import VenueForm from "./VenueForm";
import { Venue } from "@/models/types";
import { getVenues, deleteVenue } from "@/services/venueService";

const VenueManagementPanel = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [isVenueDialogOpen, setIsVenueDialogOpen] = useState(false);
  const [isDeleteVenueDialogOpen, setIsDeleteVenueDialogOpen] = useState(false);
  const [venueToDelete, setVenueToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadVenues();
  }, []);

  const loadVenues = async () => {
    setIsLoading(true);
    try {
      const venueData = await getVenues();
      setVenues(venueData);
    } catch (error) {
      toast.error("Failed to load venues");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenVenueDialog = (venue?: Venue) => {
    setSelectedVenue(venue || null);
    setIsVenueDialogOpen(true);
  };

  const handleConfirmDeleteVenue = (venueId: string) => {
    setVenueToDelete(venueId);
    setIsDeleteVenueDialogOpen(true);
  };

  const handleDeleteVenue = async () => {
    if (!venueToDelete) return;
    
    try {
      await deleteVenue(venueToDelete);
      toast.success("Venue deleted successfully");
      setVenues(venues.filter(venue => venue.id !== venueToDelete));
      setIsDeleteVenueDialogOpen(false);
      setVenueToDelete(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete venue");
    }
  };

  const handleVenueSuccess = () => {
    setIsVenueDialogOpen(false);
    loadVenues();
  };

  return (
    <>
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Add New Venue</h2>
            <Button 
              onClick={() => handleOpenVenueDialog()}
              className="bg-pickleball-purple hover:bg-pickleball-purple/90"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Venue
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Existing Venues</h2>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading venues...</p>
            </div>
          ) : venues.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {venues.map((venue) => (
                <Card key={venue.id} className="overflow-hidden">
                  <div className="h-40 overflow-hidden">
                    <img
                      src={venue.imageUrl || "/lovable-uploads/021553a3-f52a-4d73-b0f9-75f2a94711cb.png"}
                      alt={venue.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/lovable-uploads/021553a3-f52a-4d73-b0f9-75f2a94711cb.png";
                      }}
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">{venue.name}</h3>
                    <div className="flex items-center text-sm mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{venue.city}, {venue.state}</span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                      {venue.description || "No description provided"}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs">{venue.courtCount} Courts</span>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-pickleball-purple border-pickleball-purple"
                          onClick={() => handleOpenVenueDialog(venue)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-red-500 border-red-500"
                          onClick={() => handleConfirmDeleteVenue(venue.id)}
                        >
                          <Trash className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No venues found. Add your first venue to get started!</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isVenueDialogOpen} onOpenChange={setIsVenueDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedVenue ? "Edit Venue" : "Add New Venue"}</DialogTitle>
            <DialogDescription>
              {selectedVenue ? "Update venue information" : "Create a new venue for pickleball games"}
            </DialogDescription>
          </DialogHeader>
          <VenueForm venue={selectedVenue || undefined} onSuccess={handleVenueSuccess} />
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteVenueDialogOpen} onOpenChange={setIsDeleteVenueDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Venue</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this venue? This will also delete all slots associated with this venue.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 mt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteVenueDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteVenue}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VenueManagementPanel;
