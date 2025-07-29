
-- Create the function to cancel booking with coin refund
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
  
  -- Delete the booking
  DELETE FROM public.bookings
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
