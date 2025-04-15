
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BookingWithDetails } from "@/models/types";
import PlayerCheckInDialog from "./PlayerCheckInDialog";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, MapPin, Users } from "lucide-react";

interface SlotPlayersListDialogProps {
  slotId: string;
  venueId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  venueName: string;
  date: string;
  startTime: string;
  endTime: string;
  dayOfWeek: string;
}

const SlotPlayersListDialog = ({
  slotId,
  venueId,
  open,
  onOpenChange,
  venueName,
  date,
  startTime,
  endTime,
  dayOfWeek
}: SlotPlayersListDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Players for Slot</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-2">
          <div className="space-y-1">
            <div className="font-medium">{venueName}</div>
            <div className="flex items-center text-sm text-gray-500">
              <CalendarDays className="w-3.5 h-3.5 mr-1.5" />
              <span>{date} ({dayOfWeek})</span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="w-3.5 h-3.5 mr-1.5" />
              <span>{startTime} - {endTime}</span>
            </div>
          </div>
          
          <PlayerCheckInDialog 
            slotId={slotId} 
            venueId={venueId} 
            onClose={() => onOpenChange(false)} 
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SlotPlayersListDialog;
