-- =============================================
-- Add coin usage tracking to bookings table
-- =============================================

-- Add column to track if a coin was actually used for this booking
ALTER TABLE public.bookings ADD COLUMN used_coin BOOLEAN DEFAULT NULL;

-- Add comment explaining the field
COMMENT ON COLUMN public.bookings.used_coin IS 'Records whether a coin was actually deducted for this booking. NULL for bookings created before this feature.';

-- Create index for performance when querying by coin usage
CREATE INDEX IF NOT EXISTS idx_bookings_used_coin ON public.bookings(used_coin) WHERE used_coin IS NOT NULL;

-- Update existing bookings to set used_coin based on current admin settings
-- This is a best-effort migration - we assume bookings were made under current settings
DO $$
DECLARE
  booking_record RECORD;
  venue_setting BOOLEAN;
BEGIN
  FOR booking_record IN 
    SELECT b.id, b.venue_id 
    FROM public.bookings b 
    WHERE b.used_coin IS NULL
  LOOP
    -- Get current venue setting
    SELECT COALESCE(a.allow_booking_without_coins, false) INTO venue_setting
    FROM public.admin_settings a 
    WHERE a.venue_id = booking_record.venue_id;
    
    -- If no setting found, assume coins were required (default behavior)
    IF venue_setting IS NULL THEN
      venue_setting := false;
    END IF;
    
    -- Set used_coin based on whether coins were required when booking was made
    -- If allow_booking_without_coins was false, assume coin was used
    -- If allow_booking_without_coins was true, assume no coin was used
    UPDATE public.bookings 
    SET used_coin = NOT venue_setting
    WHERE id = booking_record.id;
  END LOOP;
END $$;