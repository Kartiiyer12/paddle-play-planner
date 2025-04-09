
export interface User {
  id: string;
  email: string;
  name: string;
  isVerified: boolean;
  role: "user" | "admin";
  createdAt: string;
}

export interface Venue {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  description: string;
  courtCount: number;
  imageUrl: string;
}

export interface Slot {
  id: string;
  venueId: string;
  date: string;
  startTime: string;
  endTime: string;
  maxPlayers: number;
  currentPlayers: number;
  createdAt: string;
}

export interface Booking {
  id: string;
  userId: string;
  slotId: string;
  venueId: string;
  createdAt: string;
  status: "confirmed" | "cancelled";
}

export interface BookingWithDetails extends Booking {
  venue: Venue;
  slot: Slot;
}
