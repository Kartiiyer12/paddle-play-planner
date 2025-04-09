
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Venue } from "@/models/types";
import { createVenue, updateVenue } from "@/services/venueService";
import { toast } from "sonner";

interface VenueFormProps {
  venue?: Venue;
  onSuccess: () => void;
}

const VenueForm = ({ venue, onSuccess }: VenueFormProps) => {
  const [formData, setFormData] = useState<Partial<Venue>>({
    name: venue?.name || "",
    address: venue?.address || "",
    city: venue?.city || "",
    state: venue?.state || "",
    zip: venue?.zip || "",
    description: venue?.description || "",
    courtCount: venue?.courtCount || 1,
    imageUrl: venue?.imageUrl || "https://images.unsplash.com/photo-1627903258426-b8c5608419b4?q=80&w=1000&auto=format&fit=crop"
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseInt(value) : value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (venue?.id) {
        // Update existing venue
        await updateVenue(venue.id, formData);
        toast.success("Venue updated successfully!");
      } else {
        // Create new venue
        await createVenue(formData as Omit<Venue, "id" | "createdAt">);
        toast.success("Venue added successfully!");
        
        // Reset form
        setFormData({
          name: "",
          address: "",
          city: "",
          state: "",
          zip: "",
          description: "",
          courtCount: 1,
          imageUrl: "https://images.unsplash.com/photo-1627903258426-b8c5608419b4?q=80&w=1000&auto=format&fit=crop"
        });
      }
      
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Failed to save venue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Venue Name*</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address*</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City*</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State*</Label>
              <Input
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zip">ZIP Code</Label>
              <Input
                id="zip"
                name="zip"
                value={formData.zip}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="courtCount">Number of Courts*</Label>
              <Input
                id="courtCount"
                name="courtCount"
                type="number"
                min="1"
                value={formData.courtCount}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                rows={3}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              className="bg-pickleball-purple hover:bg-pickleball-purple/90"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : venue?.id ? "Update Venue" : "Add Venue"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default VenueForm;
