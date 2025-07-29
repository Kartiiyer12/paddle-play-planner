
-- Create the function to book slot with coin deduction
CREATE OR REPLACE FUNCTION public.book_slot_with_coin(
  slot_id_param UUID,
  venue_id_param UUID,
  allow_booking_without_coins_param BOOLEAN,
  user_name_param TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_slot_coins INT;
  v_booking_id UUID;
  v_result RECORD;
  v_venue_settings RECORD;
  v_will_use_coin BOOLEAN;
BEGIN
  -- Get the current user ID
  v_user_id := auth.uid();
  
  -- Check if user exists
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
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
  
  -- Check if user already has a booking for this slot
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
  
  -- Create the booking with coin usage tracking
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
