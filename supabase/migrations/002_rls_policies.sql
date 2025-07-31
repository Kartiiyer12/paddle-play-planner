-- =============================================
-- RLS Policies for 'venues' table
-- =============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Venue owners can manage their venues" ON public.venues;
DROP POLICY IF EXISTS "Authenticated users can view venues" ON public.venues;

-- Allow venue owners to manage their venues
CREATE POLICY "Venue owners can manage their venues"
ON public.venues
FOR ALL
USING (admin_id = auth.uid())
WITH CHECK (admin_id = auth.uid());

-- Allow authenticated users to view venues
CREATE POLICY "Authenticated users can view venues"
ON public.venues
FOR SELECT
USING (auth.role() = 'authenticated'::text);

-- =============================================
-- RLS Policies for 'slots' table
-- =============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Venue owners can manage slots for their venues" ON public.slots;
DROP POLICY IF EXISTS "Authenticated users can view slots" ON public.slots;

-- Allow venue owners to manage slots for their venues
CREATE POLICY "Venue owners can manage slots for their venues"
ON public.slots
FOR ALL
USING (
  venue_id IN (SELECT id FROM public.venues WHERE admin_id = auth.uid())
)
WITH CHECK (
  venue_id IN (SELECT id FROM public.venues WHERE admin_id = auth.uid())
);

-- Allow authenticated users to view slots
CREATE POLICY "Authenticated users can view slots"
ON public.slots
FOR SELECT
USING (auth.role() = 'authenticated'::text);

-- =============================================
-- RLS Policies for 'bookings' table
-- =============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Venue owners can manage bookings for their venues" ON public.bookings;
DROP POLICY IF EXISTS "Users can manage their own bookings" ON public.bookings;

-- Allow venue owners to manage bookings for their venues
CREATE POLICY "Venue owners can manage bookings for their venues"
ON public.bookings
FOR ALL
USING (
  venue_id IN (SELECT id FROM public.venues WHERE admin_id = auth.uid())
)
WITH CHECK (
  venue_id IN (SELECT id FROM public.venues WHERE admin_id = auth.uid())
);

-- Allow users to manage their own bookings
CREATE POLICY "Users can manage their own bookings"
ON public.bookings
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- =============================================
-- RLS Policies for 'profiles' table
-- =============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can manage their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Venue owners can view user profiles" ON public.profiles;

-- Allow users to manage their own profile
CREATE POLICY "Users can manage their own profile"
ON public.profiles
FOR ALL
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow admins to view user profiles
CREATE POLICY "Admins can view user profiles"
ON public.profiles
FOR SELECT
USING (
  auth.jwt() ->> 'role' = 'admin'
); 