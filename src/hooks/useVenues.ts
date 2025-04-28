
import { useState, useEffect } from 'react';
import { Venue } from '@/models/types';
import { getVenues } from '@/services/venueService';

export const useVenues = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null);

  useEffect(() => {
    const loadVenues = async () => {
      try {
        const data = await getVenues();
        setVenues(data);
        
        // If we have venues and no venue is selected, select the first one
        if (data.length > 0 && !selectedVenue) {
          setSelectedVenue(data[0].id);
        }
      } catch (err) {
        setError('Failed to load venues');
        console.error('Error loading venues:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadVenues();
  }, [selectedVenue]);

  return { venues, isLoading, error, selectedVenue, setSelectedVenue };
};
