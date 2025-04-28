
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
AS $$
DECLARE
  v_user_id UUID;
  v_slot_coins INT;
  v_booking_id UUID;
  v_result RECORD;
BEGIN
  -- Get the current user ID
  v_user_id := auth.uid();
  
  -- Check if user exists
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Get the user's slot coins
  SELECT slot_coins INTO v_slot_coins
  FROM public.profiles
  WHERE id = v_user_id;
  
  -- Check if user has enough coins or if booking without coins is allowed
  IF v_slot_coins <= 0 AND NOT allow_booking_without_coins_param THEN
    RAISE EXCEPTION 'Not enough coins to book this slot';
  END IF;
  
  -- Create the booking
  INSERT INTO public.bookings (
    user_id,
    slot_id,
    venue_id,
    status,
    user_name,
    checked_in
  )
  VALUES (
    v_user_id,
    slot_id_param,
    venue_id_param,
    'confirmed',
    user_name_param,
    false
  )
  RETURNING id INTO v_booking_id;
  
  -- Deduct coin if needed (when not allowing booking without coins)
  IF NOT allow_booking_without_coins_param AND v_slot_coins > 0 THEN
    UPDATE public.profiles
    SET slot_coins = slot_coins - 1
    WHERE id = v_user_id;
  END IF;
  
  -- Return the booking details
  SELECT * INTO v_result 
  FROM public.bookings
  WHERE id = v_booking_id;
  
  RETURN row_to_json(v_result);
END;
$$;
