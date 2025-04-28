
import { useState, useEffect } from 'react';
import { Venue } from '@/models/types';
import { getVenues } from '@/services/venueService';

export const useVenues = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadVenues = async () => {
      try {
        const data = await getVenues();
        setVenues(data);
      } catch (err) {
        setError('Failed to load venues');
        console.error('Error loading venues:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadVenues();
  }, []);

  return { venues, isLoading, error };
};
