
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Users, Search, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getVenues } from "@/services/venueService";
import { Venue, Slot } from "@/models/types";
import { getPastSlots } from "@/services/slotService";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PlayerCheckInDialog from "@/components/admin/PlayerCheckInDialog";
import { useIsMobile } from "@/hooks/use-mobile";

const OldSlotsPanel = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading: isLoadingAuth } = useAuth();
  const isMobile = useIsMobile();

  const [venues, setVenues] = useState<Venue[]>([]);
  const [pastSlots, setPastSlots] = useState<Slot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [isPlayerDialogOpen, setIsPlayerDialogOpen] = useState(false);

  useEffect(() => {
    if (!isLoadingAuth) {
      if (!user) {
        toast.error("You must be logged in to access this page");
        navigate("/login");
        return;
      }

      if (!isAdmin) {
        toast.error("You do not have permission to access this page");
        navigate("/book-slot");
        return;
      }
    }
  }, [navigate, user, isAdmin, isLoadingAuth]);

  useEffect(() => {
    const loadVenues = async () => {
      try {
        const venueData = await getVenues();
        setVenues(venueData);
        setIsLoading(false);
      } catch (error) {
        toast.error("Failed to load venues");
        setIsLoading(false);
      }
    };

    loadVenues();
  }, []);

  const fetchPastSlots = async () => {
    if (!selectedDate) return;

    setIsLoading(true);
    try {
      const slots = await getPastSlots(selectedDate, selectedVenue);
      setPastSlots(slots);
    } catch (error) {
      toast.error("Failed to load past slots");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      fetchPastSlots();
    }
  }, [selectedDate, selectedVenue]);

  const handleViewPlayers = (slot: Slot) => {
    setSelectedSlot(slot);
    setIsPlayerDialogOpen(true);
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-grow pt-24 pb-24 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="flex items-center mb-6 flex-wrap">
            <Button
              variant="ghost"
              onClick={() => navigate("/admin/slots")}
              className="mr-4 mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Slots
            </Button>
            <h1 className="text-2xl font-bold">Past Slots</h1>
          </div>

          <Card className="mb-6">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Filter Past Slots</h2>
              <div className={`grid grid-cols-1 ${isMobile ? "" : "md:grid-cols-3"} gap-4`}>
                <div>
                  <Label htmlFor="venue">Venue</Label>
                  <Select
                    value={selectedVenue || ""}
                    onValueChange={(value) => setSelectedVenue(value === "all" ? null : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select venue" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Venues</SelectItem>
                      {venues.map((venue) => (
                        <SelectItem key={venue.id} value={venue.id}>
                          {venue.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div className="flex items-end">
                  <Button 
                    onClick={fetchPastSlots}
                    className="bg-pickleball-purple hover:bg-pickleball-purple/90 w-full"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Past Slots</h2>
              
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <p>Loading slots...</p>
                </div>
              ) : pastSlots.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Venue</TableHead>
                        <TableHead>Date</TableHead>
                        {!isMobile && <TableHead>Day</TableHead>}
                        <TableHead>Time</TableHead>
                        <TableHead>Attendance</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pastSlots.map((slot) => {
                        const venue = venues.find(v => v.id === slot.venueId);
                        return (
                          <TableRow key={slot.id}>
                            <TableCell>{venue?.name || "Unknown Venue"}</TableCell>
                            <TableCell>{slot.date}</TableCell>
                            {!isMobile && <TableCell>{slot.dayOfWeek}</TableCell>}
                            <TableCell>{`${slot.startTime} - ${slot.endTime}`}</TableCell>
                            <TableCell>{`${slot.currentPlayers}/${slot.maxPlayers}`}</TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-blue-500 text-blue-500 w-full"
                                onClick={() => handleViewPlayers(slot)}
                              >
                                <Users className="h-4 w-4 mr-1" />
                                View Players
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-gray-300" />
                  <p className="mt-2 text-gray-500">No past slots found for the selected date and venue.</p>
                  <p className="text-sm text-gray-400">Try selecting a different date or venue.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />

      <Dialog open={isPlayerDialogOpen} onOpenChange={setIsPlayerDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Player Attendance</DialogTitle>
          </DialogHeader>
          {selectedSlot && (
            <PlayerCheckInDialog 
              slotId={selectedSlot.id} 
              venueId={selectedSlot.venueId} 
              onClose={() => setIsPlayerDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OldSlotsPanel;
