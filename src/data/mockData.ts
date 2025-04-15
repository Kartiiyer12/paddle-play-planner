import { Booking, Slot, User, Venue } from "@/models/types";

export const mockUsers: User[] = [
  {
    id: "1",
    email: "john.doe@example.com",
    name: "John Doe",
    isVerified: true,
    role: "user",
    createdAt: "2023-04-15T10:30:00Z",
  },
  {
    id: "2",
    email: "jane.smith@example.com",
    name: "Jane Smith",
    isVerified: false,
    role: "admin",
    createdAt: "2023-04-10T14:00:00Z",
  },
];

export const mockVenues: Venue[] = [
  {
    id: "1",
    name: "Pickleball Paradise",
    address: "123 Main St",
    city: "Anytown",
    state: "CA",
    zip: "91234",
    description: "The best pickleball venue in town!",
    courtCount: 4,
    imageUrl: "https://example.com/images/venue1.jpg",
  },
  {
    id: "2",
    name: "Ace Arena",
    address: "456 Elm St",
    city: "Springfield",
    state: "IL",
    zip: "62704",
    description: "A premier sports venue with top-notch pickleball courts.",
    courtCount: 6,
    imageUrl: "https://example.com/images/venue2.jpg",
  },
];

export const mockSlots: Slot[] = [
  {
    id: "1",
    venueId: "1",
    date: "2023-04-20",
    dayOfWeek: "Thursday",
    startTime: "18:00",
    endTime: "20:00",
    maxPlayers: 8,
    currentPlayers: 4,
  },
  {
    id: "2",
    venueId: "2",
    date: "2023-04-21",
    dayOfWeek: "Friday",
    startTime: "19:00",
    endTime: "21:00",
    maxPlayers: 10,
    currentPlayers: 7,
  },
];

export const mockBookings: Booking[] = [
  {
    id: "1",
    userId: "1",
    slotId: "1",
    venueId: "1",
    createdAt: "2023-04-15T10:30:00Z",
    status: "confirmed",
    checkedIn: false,
    userName: "John Doe"
  },
  {
    id: "2",
    userId: "1",
    slotId: "2",
    venueId: "2",
    createdAt: "2023-04-16T14:00:00Z",
    status: "confirmed",
    checkedIn: true,
    userName: "John Doe"
  },
];
