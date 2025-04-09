
import { User, Venue, Slot, Booking, BookingWithDetails } from "../models/types";

export const mockUsers: User[] = [
  {
    id: "1",
    email: "admin@example.com",
    name: "Admin User",
    isVerified: true,
    role: "admin",
    createdAt: "2023-01-01T00:00:00Z",
  },
  {
    id: "2",
    email: "user@example.com",
    name: "Regular User",
    isVerified: true,
    role: "user",
    createdAt: "2023-01-02T00:00:00Z",
  },
  {
    id: "3",
    email: "newuser@example.com",
    name: "New User",
    isVerified: false,
    role: "user",
    createdAt: "2023-01-03T00:00:00Z",
  },
];

export const mockVenues: Venue[] = [
  {
    id: "1",
    name: "Downtown Pickleball Center",
    address: "123 Main St",
    city: "Austin",
    state: "TX",
    zip: "78701",
    description: "Premier indoor pickleball facility in the heart of downtown with 8 professional courts.",
    courtCount: 8,
    imageUrl: "https://images.unsplash.com/photo-1627903258426-b8c5608419b4?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: "2",
    name: "Westside Community Courts",
    address: "456 Oak Rd",
    city: "Austin",
    state: "TX",
    zip: "78735",
    description: "Public outdoor courts with beautiful views and recently resurfaced playing areas.",
    courtCount: 6,
    imageUrl: "https://images.unsplash.com/photo-1696560055990-e4c3e1a93028?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: "3",
    name: "Southpark Pickleball Club",
    address: "789 Pine Ave",
    city: "Austin",
    state: "TX",
    zip: "78745",
    description: "Members-only pickleball club with 12 courts, pro shop, and cafe.",
    courtCount: 12,
    imageUrl: "https://images.unsplash.com/photo-1624935872681-1f3aeb223bed?q=80&w=1000&auto=format&fit=crop",
  },
];

// Create slots for next 7 days for each venue
const createMockSlots = () => {
  const slots: Slot[] = [];
  const startDate = new Date();
  
  for (let venueId = 1; venueId <= 3; venueId++) {
    for (let day = 0; day < 7; day++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + day);
      const dateString = date.toISOString().split('T')[0];
      
      // Create 4 time slots for each day
      const times = [
        { start: "08:00", end: "10:00" },
        { start: "10:30", end: "12:30" },
        { start: "13:00", end: "15:00" },
        { start: "16:00", end: "18:00" }
      ];
      
      times.forEach((time, timeIndex) => {
        slots.push({
          id: `${venueId}-${day}-${timeIndex}`,
          venueId: venueId.toString(),
          date: dateString,
          startTime: time.start,
          endTime: time.end,
          maxPlayers: 16,
          currentPlayers: Math.floor(Math.random() * 10),
          createdAt: new Date().toISOString()
        });
      });
    }
  }
  
  return slots;
};

export const mockSlots: Slot[] = createMockSlots();

export const mockBookings: Booking[] = [
  {
    id: "1",
    userId: "2",
    slotId: "1-0-0",
    venueId: "1",
    createdAt: "2023-01-15T10:30:00Z",
    status: "confirmed"
  },
  {
    id: "2",
    userId: "2",
    slotId: "2-1-1",
    venueId: "2",
    createdAt: "2023-01-16T14:20:00Z",
    status: "confirmed"
  },
];

export const getBookingsWithDetails = (userId: string): BookingWithDetails[] => {
  return mockBookings
    .filter(booking => booking.userId === userId)
    .map(booking => {
      const venue = mockVenues.find(v => v.id === booking.venueId)!;
      const slot = mockSlots.find(s => s.id === booking.slotId)!;
      return { ...booking, venue, slot };
    });
};
