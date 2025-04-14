
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { Slot, Venue } from "@/models/types";
import { createSlot, updateSlot } from "@/services/slotService";
import { getVenues } from "@/services/venueService";
import { toast } from "sonner";

interface SlotFormProps {
  slot?: Slot;
  onSuccess: () => void;
  onCancel?: () => void;
}

const SlotForm = ({ slot, onSuccess, onCancel }: SlotFormProps) => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [formData, setFormData] = useState({
    venueId: slot?.venueId || "",
    date: slot?.date ? new Date(slot.date) : new Date(),
    startTime: slot?.startTime || "09:00",
    endTime: slot?.endTime || "10:00",
    maxPlayers: slot?.maxPlayers || 4
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingVenues, setIsLoadingVenues] = useState(true);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  useEffect(() => {
    const loadVenues = async () => {
      try {
        const data = await getVenues();
        setVenues(data);
        
        // If this is a new slot form and we have venues, select the first one by default
        if (!slot?.venueId && data.length > 0) {
          setFormData(prev => ({
            ...prev,
            venueId: data[0].id
          }));
        }
      } catch (error) {
        toast.error("Failed to load venues");
      } finally {
        setIsLoadingVenues(false);
      }
    };

    loadVenues();
  }, [slot?.venueId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const dateString = format(formData.date, "yyyy-MM-dd");
      
      if (slot?.id) {
        // Update existing slot
        await updateSlot(slot.id, {
          venueId: formData.venueId,
          date: dateString,
          startTime: formData.startTime,
          endTime: formData.endTime,
          maxPlayers: formData.maxPlayers
        });
        toast.success("Slot updated successfully!");
      } else {
        // Create new slot
        await createSlot({
          venueId: formData.venueId,
          date: dateString,
          startTime: formData.startTime,
          endTime: formData.endTime,
          maxPlayers: formData.maxPlayers
        });
        toast.success("Slot added successfully!");
        
        // Reset form times but keep the same date and venue
        setFormData(prev => ({
          ...prev,
          startTime: "09:00",
          endTime: "10:00",
          maxPlayers: 4
        }));
      }
      
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Failed to save slot");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({ ...prev, date }));
      setIsDatePickerOpen(false);
    }
  };

  if (isLoadingVenues) {
    return <div>Loading venues...</div>;
  }

  if (venues.length === 0) {
    return <div>Please add at least one venue before creating slots</div>;
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="venue">Venue*</Label>
              <Select 
                value={formData.venueId}
                onValueChange={(value) => setFormData({...formData, venueId: value})}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a venue" />
                </SelectTrigger>
                <SelectContent>
                  {venues.map((venue) => (
                    <SelectItem key={venue.id} value={venue.id}>
                      {venue.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Date*</Label>
              <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    type="button"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(formData.date, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 pointer-events-auto">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={handleDateSelect}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time*</Label>
              <Input
                id="startTime"
                name="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time*</Label>
              <Input
                id="endTime"
                name="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maxPlayers">Maximum Players*</Label>
              <Input
                id="maxPlayers"
                name="maxPlayers"
                type="number"
                min="1"
                max="20"
                value={formData.maxPlayers}
                onChange={(e) => setFormData({...formData, maxPlayers: parseInt(e.target.value)})}
                required
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex items-center"
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-pickleball-purple hover:bg-pickleball-purple/90"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : slot?.id ? "Update Slot" : "Add Slot"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SlotForm;
