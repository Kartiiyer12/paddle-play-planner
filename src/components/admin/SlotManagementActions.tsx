
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash, CalendarClock, Users } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import SlotPlayersListDialog from "./SlotPlayersListDialog";

interface SlotManagementActionsProps {
  slotId: string;
  venueId: string;
  onEdit: () => void;
  onDelete: () => void;
  venueName: string;
  date: string;
  startTime: string;
  endTime: string;
  dayOfWeek: string;
}

const SlotManagementActions = ({
  slotId,
  venueId,
  onEdit,
  onDelete,
  venueName,
  date,
  startTime,
  endTime,
  dayOfWeek
}: SlotManagementActionsProps) => {
  const [playersDialogOpen, setPlayersDialogOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setPlayersDialogOpen(true)}>
            <Users className="mr-2 h-4 w-4" />
            <span>Players</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onEdit}>
            <Edit className="mr-2 h-4 w-4" />
            <span>Edit</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDelete}>
            <Trash className="mr-2 h-4 w-4" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SlotPlayersListDialog
        slotId={slotId}
        venueId={venueId}
        open={playersDialogOpen}
        onOpenChange={setPlayersDialogOpen}
        venueName={venueName}
        date={date}
        startTime={startTime}
        endTime={endTime}
        dayOfWeek={dayOfWeek}
      />
    </>
  );
};

export default SlotManagementActions;
