
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { User, Venue } from "@/models/types";
import { mockUsers, mockVenues, mockSlots } from "@/data/mockData";
import { CheckCircle, MapPin, Plus, XCircle } from "lucide-react";

const AdminPanel = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [venues, setVenues] = useState<Venue[]>(mockVenues);
  const [newVenue, setNewVenue] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    description: "",
    courtCount: 1,
    imageUrl: "https://images.unsplash.com/photo-1627903258426-b8c5608419b4?q=80&w=1000&auto=format&fit=crop",
  });

  useEffect(() => {
    // Check if user is logged in and is admin
    const userData = localStorage.getItem("currentUser");
    if (!userData) {
      toast.error("You must be logged in to access this page");
      navigate("/login");
      return;
    }

    // Parse user data
    const parsedUser: User = JSON.parse(userData);
    if (parsedUser.role !== "admin") {
      toast.error("You do not have permission to access this page");
      navigate("/dashboard");
      return;
    }

    setUser(parsedUser);
    setIsLoading(false);
  }, [navigate]);

  const handleVerifyUser = (userId: string) => {
    // Update local users state
    setUsers(
      users.map((u) => (u.id === userId ? { ...u, isVerified: true } : u))
    );
    toast.success("User verified successfully!");
  };

  const handleVenueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewVenue({ ...newVenue, [name]: value });
  };

  const handleAddVenue = () => {
    // Validate form
    if (!newVenue.name || !newVenue.address || !newVenue.city || !newVenue.state) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Create new venue with unique ID
    const newVenueWithId = {
      ...newVenue,
      id: (venues.length + 1).toString(),
    };

    // Add venue to state
    setVenues([...venues, newVenueWithId]);
    toast.success("Venue added successfully!");

    // Reset form
    setNewVenue({
      name: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      description: "",
      courtCount: 1,
      imageUrl: "https://images.unsplash.com/photo-1627903258426-b8c5608419b4?q=80&w=1000&auto=format&fit=crop",
    });
  };

  if (isLoading) {
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
          <Tabs defaultValue="users">
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
                    Review and approve new users after verification
                  </p>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell className="capitalize">{user.role}</TableCell>
                          <TableCell>
                            {user.isVerified ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Pending
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {!user.isVerified && (
                              <Button
                                size="sm"
                                className="bg-pickleball-purple hover:bg-pickleball-purple/90"
                                onClick={() => handleVerifyUser(user.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Verify
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Venues Tab */}
            <TabsContent value="venues">
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Add New Venue</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Venue Name*</Label>
                      <Input
                        id="name"
                        name="name"
                        value={newVenue.name}
                        onChange={handleVenueChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address*</Label>
                      <Input
                        id="address"
                        name="address"
                        value={newVenue.address}
                        onChange={handleVenueChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City*</Label>
                      <Input
                        id="city"
                        name="city"
                        value={newVenue.city}
                        onChange={handleVenueChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State*</Label>
                      <Input
                        id="state"
                        name="state"
                        value={newVenue.state}
                        onChange={handleVenueChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zip">ZIP Code</Label>
                      <Input
                        id="zip"
                        name="zip"
                        value={newVenue.zip}
                        onChange={handleVenueChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="courtCount">Number of Courts*</Label>
                      <Input
                        id="courtCount"
                        name="courtCount"
                        type="number"
                        value={newVenue.courtCount}
                        onChange={handleVenueChange}
                        min="1"
                        required
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        name="description"
                        value={newVenue.description}
                        onChange={handleVenueChange}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="imageUrl">Image URL</Label>
                      <Input
                        id="imageUrl"
                        name="imageUrl"
                        value={newVenue.imageUrl}
                        onChange={handleVenueChange}
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <Button
                      className="bg-pickleball-purple hover:bg-pickleball-purple/90"
                      onClick={handleAddVenue}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Venue
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Existing Venues</h2>
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
                            {venue.description}
                          </p>
                          <div className="flex justify-between items-center">
                            <span className="text-xs">{venue.courtCount} Courts</span>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline" className="text-pickleball-purple border-pickleball-purple">
                                  Edit
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Edit Venue</DialogTitle>
                                  <DialogDescription>
                                    Make changes to this venue's information
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  {/* Venue edit form would go here */}
                                  <p className="text-sm text-gray-600">Edit form implementation in future update</p>
                                </div>
                                <DialogFooter>
                                  <Button className="bg-pickleball-purple hover:bg-pickleball-purple/90">
                                    Save changes
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Slots Tab */}
            <TabsContent value="slots">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Slot Management</h2>
                  <p className="text-gray-600 mb-6">
                    Set time slots and manage slot availability for venues
                  </p>

                  {/* Add New Slot Button */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="mb-6 bg-pickleball-purple hover:bg-pickleball-purple/90">
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Slot
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Slot</DialogTitle>
                        <DialogDescription>
                          Set up a new time slot for a selected venue
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        {/* Slot creation form would go here */}
                        <p className="text-sm text-gray-600">Slot creation form in future update</p>
                      </div>
                      <DialogFooter>
                        <Button className="bg-pickleball-purple hover:bg-pickleball-purple/90">
                          Create Slot
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {/* Slots Table */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Venue</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Players</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockSlots.slice(0, 10).map((slot) => {
                        const venue = mockVenues.find(v => v.id === slot.venueId);
                        return (
                          <TableRow key={slot.id}>
                            <TableCell>{venue?.name}</TableCell>
                            <TableCell>{slot.date}</TableCell>
                            <TableCell>{`${slot.startTime} - ${slot.endTime}`}</TableCell>
                            <TableCell>{`${slot.currentPlayers}/${slot.maxPlayers}`}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-pickleball-purple text-pickleball-purple"
                                >
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-red-500 text-red-500"
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Cancel
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>

                  {/* Pagination would go here */}
                  <div className="mt-4 flex justify-center">
                    <p className="text-sm text-gray-600">
                      Showing 10 of {mockSlots.length} slots
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AdminPanel;
