
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { useState } from "react";
import { profileService } from "@/services/profileService";
import { toast } from "sonner";

interface UserEditCoinsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: { id: string; name: string; coins: number } | null;
  onSave: () => void;
}

const UserEditCoinsDialog = ({
  isOpen,
  onOpenChange,
  user,
  onSave
}: UserEditCoinsDialogProps) => {
  const [slotCoins, setSlotCoins] = useState(0);
  
  // Update slot coins state when user changes
  useState(() => {
    if (user) {
      setSlotCoins(user.coins);
    }
  });
  
  const handleSaveCoins = async () => {
    if (!user) return;
    
    try {
      await profileService.updateProfile(user.id, {
        slot_coins: slotCoins
      });
      
      toast.success(`Updated slot coins for ${user.name}`);
      onOpenChange(false);
      onSave(); // Notify parent to refetch data
    } catch (error) {
      console.error("Error updating slot coins:", error);
      toast.error("Failed to update slot coins");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Slot Coins</DialogTitle>
          <DialogDescription>
            {user && `Update slot coins for ${user.name}`}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="slotCoins" className="text-right">
              Slot Coins
            </label>
            <Input
              id="slotCoins"
              type="number"
              min="0"
              value={slotCoins}
              onChange={(e) => setSlotCoins(parseInt(e.target.value) || 0)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveCoins}>
            <Save className="mr-2 h-4 w-4" /> Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserEditCoinsDialog;
