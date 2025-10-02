-- =============================================
-- Add missing updated_at column to bookings table
-- =============================================

-- Add updated_at column if it doesn't exist
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- The trigger update_bookings_updated_at already exists from 001_initial_schema.sql
-- but it was referencing a column that didn't exist. Now that we've added the column,
-- the trigger should work correctly.

-- =============================================
-- Update cancel_booking_with_refund function to mark as cancelled instead of deleting
-- =============================================

CREATE OR REPLACE FUNCTION public.cancel_booking_with_refund(
  booking_id_param UUID,
  refund_coin BOOLEAN
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_booking_user_id UUID;
  v_slot_id UUID;
  v_venue_id UUID;
  v_booking_used_coin BOOLEAN;
BEGIN
  -- Get the current user ID
  v_user_id := auth.uid();

  -- Check if user exists
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Check if the booking exists and get its details including coin usage
  SELECT user_id, slot_id, venue_id, used_coin
  INTO v_booking_user_id, v_slot_id, v_venue_id, v_booking_used_coin
  FROM public.bookings
  WHERE id = booking_id_param;

  IF v_booking_user_id IS NULL THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;

  -- Check if the current user is the booking owner or an admin
  IF v_user_id <> v_booking_user_id AND
     NOT EXISTS (
       SELECT 1 FROM auth.users
       WHERE id = v_user_id
       AND raw_user_meta_data->>'role' = 'admin'
     ) THEN
    RAISE EXCEPTION 'You can only cancel your own bookings';
  END IF;

  -- For legacy bookings without used_coin data, assume no coin was used
  -- This is safer than risking negative balances
  IF v_booking_used_coin IS NULL THEN
    v_booking_used_coin := false;
  END IF;

  -- Mark the booking as cancelled instead of deleting
  UPDATE public.bookings
  SET status = 'cancelled'
  WHERE id = booking_id_param;

  -- Refund coin if needed and if we should refund
  -- Only refund if the booking actually used a coin and refund is requested
  IF refund_coin AND v_booking_used_coin THEN
    -- Use safe coin balance function to prevent race conditions
    PERFORM safe_update_coin_balance(v_booking_user_id, 1, 'refund');
  END IF;

  RETURN true;
END;
$$;

-- =============================================
-- Update unique constraint to allow rebooking cancelled slots
-- =============================================

-- Drop the old unique constraint if it exists
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS unique_user_slot;

-- Drop the old unique index if it exists
DROP INDEX IF EXISTS public.unique_user_slot;

-- Create a new partial unique index that only applies to confirmed bookings
-- This allows users to rebook a slot after they've cancelled it
CREATE UNIQUE INDEX unique_user_slot_confirmed
ON public.bookings (user_id, slot_id)
WHERE status = 'confirmed';

-- Add a comment explaining the constraint
COMMENT ON INDEX public.unique_user_slot_confirmed IS
'Ensures a user can only have one confirmed booking per slot, but allows rebooking after cancellation';

-- =============================================
-- Update book_slot_with_coin to reuse cancelled bookings
-- =============================================

-- Drop the old function signature to avoid conflicts
DROP FUNCTION IF EXISTS public.book_slot_with_coin(UUID, UUID, BOOLEAN, TEXT);

CREATE OR REPLACE FUNCTION public.book_slot_with_coin(
  slot_id_param UUID,
  venue_id_param UUID,
  allow_booking_without_coins_param BOOLEAN,
  user_name_param TEXT,
  user_id_param UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_authenticated_user_id UUID;
  v_is_admin BOOLEAN;
  v_slot_coins INT;
  v_booking_id UUID;
  v_result RECORD;
  v_venue_settings RECORD;
  v_will_use_coin BOOLEAN;
BEGIN
  -- Get the authenticated user (the one making the request)
  v_authenticated_user_id := auth.uid();

  -- Check if authenticated user exists
  IF v_authenticated_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Check if the authenticated user is an admin
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = v_authenticated_user_id
    AND raw_user_meta_data->>'role' = 'admin'
  ) INTO v_is_admin;

  -- Determine which user to book for
  IF user_id_param IS NOT NULL AND v_is_admin THEN
    -- Admin is booking for another user
    v_user_id := user_id_param;
  ELSIF user_id_param IS NOT NULL AND NOT v_is_admin THEN
    -- Non-admin trying to book for someone else
    RAISE EXCEPTION 'Only admins can book for other users';
  ELSE
    -- Regular user booking for themselves
    v_user_id := v_authenticated_user_id;
  END IF;

  -- Validate input parameters
  IF slot_id_param IS NULL OR venue_id_param IS NULL THEN
    RAISE EXCEPTION 'Slot ID and Venue ID are required';
  END IF;

  -- Check if slot exists and belongs to the venue
  IF NOT EXISTS (
    SELECT 1 FROM public.slots
    WHERE id = slot_id_param AND venue_id = venue_id_param
  ) THEN
    RAISE EXCEPTION 'Invalid slot or venue combination';
  END IF;

  -- Check if user already has a confirmed booking for this slot
  IF EXISTS (
    SELECT 1 FROM public.bookings
    WHERE user_id = v_user_id AND slot_id = slot_id_param AND status = 'confirmed'
  ) THEN
    RAISE EXCEPTION 'User already has a booking for this slot';
  END IF;

  -- Get the user's slot coins
  SELECT slot_coins INTO v_slot_coins
  FROM public.profiles
  WHERE id = v_user_id;

  -- Get venue settings
  SELECT allow_booking_without_coins INTO v_venue_settings
  FROM public.admin_settings
  WHERE venue_id = venue_id_param
  LIMIT 1;

  -- Use venue settings if available, otherwise use the parameter
  IF v_venue_settings IS NOT NULL THEN
    allow_booking_without_coins_param := v_venue_settings.allow_booking_without_coins;
  END IF;

  -- Check if user has enough coins or if booking without coins is allowed
  IF v_slot_coins <= 0 AND NOT allow_booking_without_coins_param THEN
    RAISE EXCEPTION 'Not enough coins to book this slot';
  END IF;

  -- Determine if we will actually use a coin for this booking
  -- We use a coin only when: setting is OFF (coins required) AND user has coins
  v_will_use_coin := NOT allow_booking_without_coins_param AND v_slot_coins > 0;

  -- Check if there's an existing cancelled booking to reactivate
  SELECT id INTO v_booking_id
  FROM public.bookings
  WHERE user_id = v_user_id
    AND slot_id = slot_id_param
    AND status = 'cancelled'
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_booking_id IS NOT NULL THEN
    -- Reactivate the cancelled booking
    UPDATE public.bookings
    SET status = 'confirmed',
        user_name = user_name_param,
        checked_in = false,
        used_coin = v_will_use_coin
    WHERE id = v_booking_id;
  ELSE
    -- Create a new booking
    INSERT INTO public.bookings (
      user_id,
      slot_id,
      venue_id,
      status,
      user_name,
      checked_in,
      used_coin
    )
    VALUES (
      v_user_id,
      slot_id_param,
      venue_id_param,
      'confirmed',
      user_name_param,
      false,
      v_will_use_coin
    )
    RETURNING id INTO v_booking_id;
  END IF;

  -- Deduct coin if we determined we should use one
  IF v_will_use_coin THEN
    -- Use safe coin balance function to prevent race conditions and negative balances
    PERFORM safe_update_coin_balance(v_user_id, -1, 'deduct');
  END IF;

  -- Return the booking details
  SELECT * INTO v_result
  FROM public.bookings
  WHERE id = v_booking_id;

  RETURN row_to_json(v_result);
END;
$$;
