
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash, Calendar, CalendarClock, Users } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import SlotForm from "./SlotForm";
import { Slot, Venue } from "@/models/types";
import { getSlots, deleteSlot } from "@/services/slotService";
import { getVenues } from "@/services/venueService";
import PlayerCheckInDialog from "./PlayerCheckInDialog";

const SlotManagementPanel = () => {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [isSlotDialogOpen, setIsSlotDialogOpen] = useState(false);
  const [isDeleteSlotDialogOpen, setIsDeleteSlotDialogOpen] = useState(false);
  const [slotToDelete, setSlotToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [autoCreateSlots, setAutoCreateSlots] = useState(false);
  const [isPlayerCheckInDialogOpen, setIsPlayerCheckInDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [venueData, slotData] = await Promise.all([
        getVenues(),
        getSlots()
      ]);
      setVenues(venueData);
      setSlots(slotData);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenSlotDialog = (slot?: Slot) => {
    setSelectedSlot(slot || null);
    setIsSlotDialogOpen(true);
  };

  const handleCloseSlotDialog = () => {
    setIsSlotDialogOpen(false);
  };

  const handleOpenPlayerCheckIn = (slot: Slot) => {
    setSelectedSlot(slot);
    setIsPlayerCheckInDialogOpen(true);
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

  const handleSlotSuccess = () => {
    setIsSlotDialogOpen(false);
    loadData();
  };

  const toggleAutoCreateSlots = (enabled: boolean) => {
    setAutoCreateSlots(enabled);
    toast.success(enabled 
      ? "Automatic slot creation enabled. New slots will be created weekly."
      : "Automatic slot creation disabled."
    );
    // In a real implementation, we would save this setting to the database
  };

  return (
    <>
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-semibold">Slot Management</h2>
              <p className="text-gray-500 text-sm mt-1">Create and manage time slots for venues</p>
            </div>
            <Button 
              onClick={() => handleOpenSlotDialog()}
              className="bg-pickleball-purple hover:bg-pickleball-purple/90"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Slot
            </Button>
          </div>
          
          <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
            <div className="flex items-center">
              <CalendarClock className="h-5 w-5 text-pickleball-purple mr-2" />
              <div>
                <h3 className="font-medium">Auto-Create Weekly Slots</h3>
                <p className="text-sm text-gray-500">Automatically create slots weekly based on template</p>
              </div>
            </div>
            <Switch 
              checked={autoCreateSlots} 
              onCheckedChange={toggleAutoCreateSlots}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Existing Slots</h2>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading slots...</p>
            </div>
          ) : slots.length > 0 ? (
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
                              className="border-blue-500 text-blue-500"
                              onClick={() => handleOpenPlayerCheckIn(slot)}
                            >
                              <Users className="h-4 w-4 mr-1" />
                              Players
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

      <Dialog open={isSlotDialogOpen} onOpenChange={setIsSlotDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedSlot ? "Edit Slot" : "Add New Slot"}</DialogTitle>
            <DialogDescription>
              {selectedSlot ? "Update slot information" : "Create a new time slot for a venue"}
            </DialogDescription>
          </DialogHeader>
          <SlotForm 
            slot={selectedSlot || undefined} 
            onSuccess={handleSlotSuccess} 
            onCancel={handleCloseSlotDialog}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteSlotDialogOpen} onOpenChange={setIsDeleteSlotDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Slot</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this time slot? This will cancel any existing bookings for this slot.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 mt-4">
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
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isPlayerCheckInDialogOpen} onOpenChange={setIsPlayerCheckInDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Player Check-In</DialogTitle>
            <DialogDescription>
              Manage player attendance for this slot
            </DialogDescription>
          </DialogHeader>
          {selectedSlot && (
            <PlayerCheckInDialog 
              slotId={selectedSlot.id} 
              venueId={selectedSlot.venueId} 
              onClose={() => setIsPlayerCheckInDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SlotManagementPanel;
