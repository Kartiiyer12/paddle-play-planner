
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { User, Venue, Slot } from "@/models/types";
import { CheckCircle, MapPin, Plus, XCircle, Edit, Trash } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import VenueForm from "@/components/admin/VenueForm";
import SlotForm from "@/components/admin/SlotForm";
import { getVenues, deleteVenue } from "@/services/venueService";
import { getSlots, deleteSlot } from "@/services/slotService";
import { format } from "date-fns";

const AdminPanel = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading: isLoadingAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [isVenueDialogOpen, setIsVenueDialogOpen] = useState(false);
  const [isSlotDialogOpen, setIsSlotDialogOpen] = useState(false);
  const [isDeleteVenueDialogOpen, setIsDeleteVenueDialogOpen] = useState(false);
  const [isDeleteSlotDialogOpen, setIsDeleteSlotDialogOpen] = useState(false);
  const [venueToDelete, setVenueToDelete] = useState<string | null>(null);
  const [slotToDelete, setSlotToDelete] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is logged in and is admin
    if (!isLoadingAuth) {
      if (!user) {
        toast.error("You must be logged in to access this page");
        navigate("/login");
        return;
      }

      if (!isAdmin) {
        toast.error("You do not have permission to access this page");
        navigate("/dashboard");
        return;
      }

      loadData();
    }
  }, [navigate, user, isAdmin, isLoadingAuth]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const venueData = await getVenues();
      setVenues(venueData);
      
      const slotData = await getSlots();
      setSlots(slotData);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenVenueDialog = (venue?: Venue) => {
    setSelectedVenue(venue || null);
    setIsVenueDialogOpen(true);
  };

  const handleOpenSlotDialog = (slot?: Slot) => {
    setSelectedSlot(slot || null);
    setIsSlotDialogOpen(true);
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

  const handleConfirmDeleteSlot = (slotId: string) => {
    setSlotToDelete(slotId);
    setIsDeleteSlotDialogOpen(true);
  };

  const handleDeleteSlot = async () => {
    if (!slotToDelete) return;
    
    try {
      await deleteSlot(slotToDelete);
      toast.success("Slot deleted successfully");
      setSlots(slots.filter(slot => slot.id !== slotToDelete));
      setIsDeleteSlotDialogOpen(false);
      setSlotToDelete(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete slot");
    }
  };

  const handleVenueSuccess = () => {
    setIsVenueDialogOpen(false);
    loadData();
  };

  const handleSlotSuccess = () => {
    setIsSlotDialogOpen(false);
    loadData();
  };

  if (isLoadingAuth || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar isLoggedIn={true} />

      <div className="flex-grow pt-24 pb-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          {/* Admin Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Manage venues, game times, and users
            </p>
          </div>

          {/* Admin Tabs */}
          <Tabs defaultValue="venues">
            <TabsList className="grid w-full grid-cols-3 max-w-md mb-8">
              <TabsTrigger value="users">User Management</TabsTrigger>
              <TabsTrigger value="venues">Venue Management</TabsTrigger>
              <TabsTrigger value="slots">Slot Management</TabsTrigger>
            </TabsList>

            {/* Users Tab */}
            <TabsContent value="users">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">User Management</h2>
                  <p className="text-gray-600 mb-6">
                    User management coming soon. Currently, user authentication is handled through Supabase.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Venues Tab */}
            <TabsContent value="venues">
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
                  {venues.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {venues.map((venue) => (
                        <Card key={venue.id} className="overflow-hidden">
                          <div className="h-40 overflow-hidden">
                            <img
                              src={venue.imageUrl}
                              alt={venue.name}
                              className="w-full h-full object-cover"
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
            </TabsContent>

            {/* Slots Tab */}
            <TabsContent value="slots">
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Add New Slot</h2>
                    <Button 
                      onClick={() => handleOpenSlotDialog()}
                      className="bg-pickleball-purple hover:bg-pickleball-purple/90"
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add Slot
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Existing Slots</h2>
                  {slots.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Venue</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Day</TableHead>
                            <TableHead>Time</TableHead>
                            <TableHead>Players</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {slots.map((slot) => {
                            const venue = venues.find(v => v.id === slot.venueId);
                            return (
                              <TableRow key={slot.id}>
                                <TableCell>{venue?.name || "Unknown Venue"}</TableCell>
                                <TableCell>{slot.date}</TableCell>
                                <TableCell>{slot.dayOfWeek}</TableCell>
                                <TableCell>{`${slot.startTime} - ${slot.endTime}`}</TableCell>
                                <TableCell>{`${slot.currentPlayers}/${slot.maxPlayers}`}</TableCell>
                                <TableCell>
                                  <div className="flex space-x-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="border-pickleball-purple text-pickleball-purple"
                                      onClick={() => handleOpenSlotDialog(slot)}
                                    >
                                      <Edit className="h-4 w-4 mr-1" />
                                      Edit
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="border-red-500 text-red-500"
                                      onClick={() => handleConfirmDeleteSlot(slot.id)}
                                    >
                                      <Trash className="h-4 w-4 mr-1" />
                                      Delete
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No slots found. Add your first slot to get started!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Venue Form Dialog */}
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

      {/* Slot Form Dialog */}
      <Dialog open={isSlotDialogOpen} onOpenChange={setIsSlotDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedSlot ? "Edit Slot" : "Add New Slot"}</DialogTitle>
            <DialogDescription>
              {selectedSlot ? "Update slot information" : "Create a new time slot for a venue"}
            </DialogDescription>
          </DialogHeader>
          <SlotForm slot={selectedSlot || undefined} onSuccess={handleSlotSuccess} />
        </DialogContent>
      </Dialog>

      {/* Delete Venue Confirmation Dialog */}
      <Dialog open={isDeleteVenueDialogOpen} onOpenChange={setIsDeleteVenueDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Venue</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this venue? This will also delete all slots associated with this venue.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
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
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Slot Confirmation Dialog */}
      <Dialog open={isDeleteSlotDialogOpen} onOpenChange={setIsDeleteSlotDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Slot</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this time slot? This will cancel any existing bookings for this slot.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteSlotDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteSlot}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default AdminPanel;
