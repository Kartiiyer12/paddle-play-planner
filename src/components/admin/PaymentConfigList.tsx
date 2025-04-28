
import { useState } from "react";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PaymentConfig, usePaymentConfigs } from "@/hooks/usePaymentConfigs";
import { Edit, Save, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PaymentConfigListProps {
  venueId: string | null;
}

const PaymentConfigList = ({ venueId }: PaymentConfigListProps) => {
  const { configs, isLoading, deleteConfig, updateConfig } = usePaymentConfigs(venueId);
  const [editingConfig, setEditingConfig] = useState<PaymentConfig | null>(null);
  const [editSlotCount, setEditSlotCount] = useState(0);
  const [editAmount, setEditAmount] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleEditClick = (config: PaymentConfig) => {
    setEditingConfig(config);
    setEditSlotCount(config.slot_count);
    setEditAmount(config.amount);
    setIsDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingConfig) return;
    
    const success = await updateConfig(editingConfig.id, {
      slot_count: editSlotCount,
      amount: editAmount
    });
    
    if (success) {
      setIsDialogOpen(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="mt-6">
        <CardContent className="pt-6">
          <p className="text-center">Loading payment configurations...</p>
        </CardContent>
      </Card>
    );
  }

  if (!venueId) {
    return (
      <Card className="mt-6">
        <CardContent className="pt-6">
          <p className="text-center">Please select a venue to view payment configurations.</p>
        </CardContent>
      </Card>
    );
  }

  if (configs.length === 0) {
    return (
      <Card className="mt-6">
        <CardContent className="pt-6">
          <p className="text-center">No payment configurations found for this venue.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Current Payment Configurations</CardTitle>
          <CardDescription>
            Manage your slot package pricing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Slots</TableHead>
                <TableHead>Price (€)</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {configs.map((config) => (
                <TableRow key={config.id}>
                  <TableCell>{config.slot_count}</TableCell>
                  <TableCell>€{config.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleEditClick(config)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-red-500 hover:text-red-700"
                        onClick={() => deleteConfig(config.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Payment Configuration</DialogTitle>
            <DialogDescription>
              Update the slot count and amount for this payment configuration.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="editSlotCount" className="text-right">
                Slots
              </label>
              <Input
                id="editSlotCount"
                type="number"
                min="1"
                value={editSlotCount}
                onChange={(e) => setEditSlotCount(parseInt(e.target.value))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="editAmount" className="text-right">
                Price (€)
              </label>
              <Input
                id="editAmount"
                type="number"
                min="0"
                step="0.01"
                value={editAmount}
                onChange={(e) => setEditAmount(parseFloat(e.target.value))}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              <Save className="mr-2 h-4 w-4" /> Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PaymentConfigList;
