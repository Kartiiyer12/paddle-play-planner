
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export type PaymentConfig = {
  id: string;
  slot_count: number;
  amount: number;
  venue_id: string;
  created_at: string;
};

export const usePaymentConfigs = (venueId: string | null) => {
  const [configs, setConfigs] = useState<PaymentConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfigs = async () => {
    if (!venueId) {
      setConfigs([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('payment_configs')
        .select('*')
        .eq('venue_id', venueId)
        .order('slot_count', { ascending: true });
        
      if (error) throw error;
      
      setConfigs(data as PaymentConfig[]);
    } catch (err) {
      console.error('Error loading payment configs:', err);
      setError('Failed to load payment configurations');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteConfig = async (id: string) => {
    try {
      const { error } = await supabase
        .from('payment_configs')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Remove from local state
      setConfigs(prevConfigs => prevConfigs.filter(config => config.id !== id));
      
      toast({
        title: "Success",
        description: "Payment configuration deleted successfully",
      });
    } catch (err) {
      console.error('Error deleting payment config:', err);
      toast({
        title: "Error",
        description: "Failed to delete payment configuration",
        variant: "destructive",
      });
    }
  };

  const updateConfig = async (id: string, data: { slot_count: number, amount: number }) => {
    try {
      const { error } = await supabase
        .from('payment_configs')
        .update(data)
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      setConfigs(prevConfigs => 
        prevConfigs.map(config => 
          config.id === id ? { ...config, ...data } : config
        )
      );
      
      toast({
        title: "Success",
        description: "Payment configuration updated successfully",
      });
      
      return true;
    } catch (err) {
      console.error('Error updating payment config:', err);
      toast({
        title: "Error",
        description: "Failed to update payment configuration",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, [venueId]);

  return { 
    configs, 
    isLoading, 
    error, 
    refresh: fetchConfigs, 
    deleteConfig,
    updateConfig
  };
};
