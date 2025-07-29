-- =============================================
-- Add transaction safety and validation improvements
-- =============================================

-- Create function to safely update coin balance with validation
CREATE OR REPLACE FUNCTION safe_update_coin_balance(
  user_id_param UUID,
  amount_change INTEGER,
  transaction_type TEXT DEFAULT 'unknown'
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_balance INTEGER;
  new_balance INTEGER;
BEGIN
  -- Get current balance with row lock to prevent race conditions
  SELECT slot_coins INTO current_balance
  FROM public.profiles
  WHERE id = user_id_param
  FOR UPDATE;
  
  -- Check if profile exists
  IF current_balance IS NULL THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;
  
  -- Calculate new balance
  new_balance := current_balance + amount_change;
  
  -- Prevent negative balance
  IF new_balance < 0 THEN
    RAISE EXCEPTION 'Insufficient coins. Current balance: %, attempted change: %', current_balance, amount_change;
  END IF;
  
  -- Update balance
  UPDATE public.profiles
  SET slot_coins = new_balance
  WHERE id = user_id_param;
  
  RETURN new_balance;
END;
$$;

-- Add constraint to prevent negative coin balances at database level
ALTER TABLE public.profiles ADD CONSTRAINT positive_slot_coins CHECK (slot_coins >= 0);

-- Add constraint to ensure used_coin is properly set for new bookings
-- (Allow NULL for legacy bookings, but require boolean for new ones)
-- Note: This will be enforced in application logic rather than database constraint
-- to avoid issues with existing data

-- Create audit table for coin transactions (optional but recommended)
CREATE TABLE IF NOT EXISTS public.coin_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('deduct', 'refund', 'purchase', 'admin_adjustment')),
  amount INTEGER NOT NULL,
  balance_before INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on coin_transactions
ALTER TABLE public.coin_transactions ENABLE ROW LEVEL SECURITY;

-- RLS policy: Users can view their own transactions, admins can view all
CREATE POLICY "Users can view own coin transactions"
ON public.coin_transactions
FOR SELECT
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND raw_user_meta_data->>'role' = 'admin'
  )
);

-- RLS policy: Only system can insert coin transactions (via functions)
CREATE POLICY "System can insert coin transactions"
ON public.coin_transactions
FOR INSERT
WITH CHECK (false); -- Only allow inserts via SECURITY DEFINER functions

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_coin_transactions_user_id ON public.coin_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_booking_id ON public.coin_transactions(booking_id);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_created_at ON public.coin_transactions(created_at);