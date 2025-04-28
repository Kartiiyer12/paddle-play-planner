
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
  v_allow_booking_without_coins BOOLEAN;
BEGIN
  -- Get the current user ID
  v_user_id := auth.uid();
  
  -- Check if user exists
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  -- Check if the booking exists and belongs to the user
  SELECT user_id, slot_id, venue_id 
  INTO v_booking_user_id, v_slot_id, v_venue_id
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
  
  -- Check if booking was made with a coin
  SELECT allow_booking_without_coins 
  INTO v_allow_booking_without_coins
  FROM public.admin_settings
  WHERE venue_id = v_venue_id
  LIMIT 1;
  
  -- Default to false if no settings found
  IF v_allow_booking_without_coins IS NULL THEN
    v_allow_booking_without_coins := false;
  END IF;
  
  -- Delete the booking
  DELETE FROM public.bookings
  WHERE id = booking_id_param;
  
  -- Refund coin if needed and if we should refund
  IF refund_coin AND NOT v_allow_booking_without_coins THEN
    UPDATE public.profiles
    SET slot_coins = slot_coins + 1
    WHERE id = v_booking_user_id;
  END IF;
  
  RETURN true;
END;
$$;
