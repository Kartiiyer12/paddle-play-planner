-- =============================================
-- COMPREHENSIVE DATABASE SETUP FOR PADDLE PLAY PLANNER
-- =============================================
-- This file contains all database schema, indexes, RLS policies, and functions
-- Run this to set up the complete database structure
-- Updated: 2025-08-23

-- =============================================
-- Enable Required Extensions
-- =============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- Create 'profiles' table
-- =============================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT,
    phone TEXT,
    skill_level TEXT,
    preferred_venues TEXT[],
    coins INTEGER DEFAULT 0,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- Create 'venues' table
-- =============================================
CREATE TABLE IF NOT EXISTS public.venues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- Create 'slots' table
-- =============================================
CREATE TABLE IF NOT EXISTS public.slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    max_players INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    coin_price INTEGER DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'available',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_time_range CHECK (end_time > start_time),
    CONSTRAINT valid_max_players CHECK (max_players > 0),
    CONSTRAINT valid_price CHECK (price >= 0),
    CONSTRAINT valid_coin_price CHECK (coin_price >= 0)
);

-- =============================================
-- Create 'bookings' table
-- =============================================
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slot_id UUID NOT NULL REFERENCES public.slots(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending',
    payment_method TEXT DEFAULT 'coins',
    coins_used INTEGER DEFAULT 0,
    amount_paid DECIMAL(10,2) DEFAULT 0,
    checked_in BOOLEAN DEFAULT FALSE,
    checked_in_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- Create 'payment_configs' table
-- =============================================
CREATE TABLE IF NOT EXISTS public.payment_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
    stripe_price_id TEXT NOT NULL,
    coin_amount INTEGER NOT NULL,
    price_amount DECIMAL(10,2) NOT NULL,
    display_name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_coin_amount CHECK (coin_amount > 0),
    CONSTRAINT valid_price_amount CHECK (price_amount > 0)
);

-- =============================================
-- Create 'user_transactions' table
-- =============================================
CREATE TABLE IF NOT EXISTS public.user_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL, -- 'purchase', 'booking', 'refund'
    coins_change INTEGER NOT NULL,
    coins_balance_after INTEGER NOT NULL,
    booking_id UUID REFERENCES public.bookings(id),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- Create 'admin_settings' table
-- =============================================
CREATE TABLE IF NOT EXISTS public.admin_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key TEXT NOT NULL UNIQUE,
    setting_value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- Create indexes for better performance
-- =============================================
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin);
CREATE INDEX IF NOT EXISTS idx_venues_admin_id ON public.venues(admin_id);
CREATE INDEX IF NOT EXISTS idx_slots_venue_id ON public.slots(venue_id);
CREATE INDEX IF NOT EXISTS idx_slots_start_time ON public.slots(start_time);
CREATE INDEX IF NOT EXISTS idx_slots_status ON public.slots(status);
CREATE INDEX IF NOT EXISTS idx_bookings_slot_id ON public.bookings(slot_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_venue_id ON public.bookings(venue_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_payment_configs_venue_id ON public.payment_configs(venue_id);
CREATE INDEX IF NOT EXISTS idx_user_transactions_user_id ON public.user_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_transactions_booking_id ON public.user_transactions(booking_id);

-- =============================================
-- Create updated_at trigger function
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =============================================
-- Create triggers for updated_at
-- =============================================
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_venues_updated_at
    BEFORE UPDATE ON public.venues
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_slots_updated_at
    BEFORE UPDATE ON public.slots
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_configs_updated_at
    BEFORE UPDATE ON public.payment_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_settings_updated_at
    BEFORE UPDATE ON public.admin_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- Enable Row Level Security
-- =============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- =============================================
-- Drop existing policies (if any)
-- =============================================
DROP POLICY IF EXISTS "Users can manage their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view venues" ON public.venues;
DROP POLICY IF EXISTS "Venue owners can manage their venues" ON public.venues;
DROP POLICY IF EXISTS "Authenticated users can view slots" ON public.slots;
DROP POLICY IF EXISTS "Venue owners can manage slots for their venues" ON public.slots;
DROP POLICY IF EXISTS "Users can manage their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Venue owners can manage bookings for their venues" ON public.bookings;
DROP POLICY IF EXISTS "Admins can view all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Venue owners can manage payment configs" ON public.payment_configs;
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.user_transactions;
DROP POLICY IF EXISTS "Admins can manage settings" ON public.admin_settings;

-- =============================================
-- Create RLS Policies
-- =============================================

-- Profiles policies
CREATE POLICY "Users can manage their own profile" ON public.profiles
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Venues policies
CREATE POLICY "Authenticated users can view venues" ON public.venues
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Venue owners can manage their venues" ON public.venues
    FOR ALL USING (admin_id = auth.uid());

-- Slots policies
CREATE POLICY "Authenticated users can view slots" ON public.slots
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Venue owners can manage slots for their venues" ON public.slots
    FOR ALL USING (
        venue_id IN (SELECT id FROM public.venues WHERE admin_id = auth.uid())
    );

-- Bookings policies
CREATE POLICY "Users can manage their own bookings" ON public.bookings
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Venue owners can manage bookings for their venues" ON public.bookings
    FOR ALL USING (
        venue_id IN (SELECT id FROM public.venues WHERE admin_id = auth.uid())
    );

CREATE POLICY "Admins can view all bookings" ON public.bookings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Payment configs policies
CREATE POLICY "Venue owners can manage payment configs" ON public.payment_configs
    FOR ALL USING (
        venue_id IN (SELECT id FROM public.venues WHERE admin_id = auth.uid())
    );

CREATE POLICY "Authenticated users can view active payment configs" ON public.payment_configs
    FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);

-- User transactions policies
CREATE POLICY "Users can view their own transactions" ON public.user_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions" ON public.user_transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Admin settings policies
CREATE POLICY "Admins can manage settings" ON public.admin_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- =============================================
-- Create Functions for Business Logic
-- =============================================

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name, is_admin)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        COALESCE((NEW.raw_user_meta_data->>'role')::text = 'admin', false)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to book slot with coins
CREATE OR REPLACE FUNCTION public.book_slot_with_coin(
    p_slot_id UUID,
    p_user_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_slot_record RECORD;
    v_user_coins INTEGER;
    v_booking_id UUID;
    v_result JSONB;
BEGIN
    -- Lock the slot to prevent double booking
    SELECT * INTO v_slot_record 
    FROM public.slots 
    WHERE id = p_slot_id 
    FOR UPDATE;
    
    -- Check if slot exists and is available
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Slot not found');
    END IF;
    
    IF v_slot_record.status != 'available' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Slot is not available');
    END IF;
    
    -- Check user's coin balance
    SELECT coins INTO v_user_coins 
    FROM public.profiles 
    WHERE id = p_user_id;
    
    IF v_user_coins < v_slot_record.coin_price THEN
        RETURN jsonb_build_object('success', false, 'error', 'Insufficient coins');
    END IF;
    
    -- Create the booking
    INSERT INTO public.bookings (slot_id, user_id, venue_id, status, payment_method, coins_used)
    VALUES (p_slot_id, p_user_id, v_slot_record.venue_id, 'confirmed', 'coins', v_slot_record.coin_price)
    RETURNING id INTO v_booking_id;
    
    -- Update slot status
    UPDATE public.slots 
    SET status = 'booked' 
    WHERE id = p_slot_id;
    
    -- Deduct coins from user
    UPDATE public.profiles 
    SET coins = coins - v_slot_record.coin_price
    WHERE id = p_user_id;
    
    -- Record transaction
    INSERT INTO public.user_transactions (
        user_id, 
        transaction_type, 
        coins_change, 
        coins_balance_after, 
        booking_id, 
        description
    )
    VALUES (
        p_user_id,
        'booking',
        -v_slot_record.coin_price,
        v_user_coins - v_slot_record.coin_price,
        v_booking_id,
        'Booked slot for ' || v_slot_record.coin_price || ' coins'
    );
    
    RETURN jsonb_build_object(
        'success', true, 
        'booking_id', v_booking_id,
        'coins_used', v_slot_record.coin_price
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cancel booking with refund
CREATE OR REPLACE FUNCTION public.cancel_booking_with_refund(
    p_booking_id UUID,
    p_user_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_booking_record RECORD;
    v_user_coins INTEGER;
BEGIN
    -- Get booking details
    SELECT b.*, s.coin_price, s.start_time
    INTO v_booking_record
    FROM public.bookings b
    JOIN public.slots s ON b.slot_id = s.id
    WHERE b.id = p_booking_id AND b.user_id = p_user_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Booking not found');
    END IF;
    
    IF v_booking_record.status = 'cancelled' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Booking already cancelled');
    END IF;
    
    -- Check if cancellation is allowed (e.g., not too close to start time)
    IF v_booking_record.start_time <= NOW() + INTERVAL '1 hour' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Cannot cancel booking less than 1 hour before start time');
    END IF;
    
    -- Get current user coins
    SELECT coins INTO v_user_coins FROM public.profiles WHERE id = p_user_id;
    
    -- Cancel the booking
    UPDATE public.bookings 
    SET status = 'cancelled' 
    WHERE id = p_booking_id;
    
    -- Make slot available again
    UPDATE public.slots 
    SET status = 'available' 
    WHERE id = v_booking_record.slot_id;
    
    -- Refund coins if paid with coins
    IF v_booking_record.payment_method = 'coins' AND v_booking_record.coins_used > 0 THEN
        UPDATE public.profiles 
        SET coins = coins + v_booking_record.coins_used
        WHERE id = p_user_id;
        
        -- Record refund transaction
        INSERT INTO public.user_transactions (
            user_id, 
            transaction_type, 
            coins_change, 
            coins_balance_after, 
            booking_id, 
            description
        )
        VALUES (
            p_user_id,
            'refund',
            v_booking_record.coins_used,
            v_user_coins + v_booking_record.coins_used,
            p_booking_id,
            'Refund for cancelled booking'
        );
    END IF;
    
    RETURN jsonb_build_object(
        'success', true,
        'refunded_coins', COALESCE(v_booking_record.coins_used, 0)
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Insert default admin settings
-- =============================================
INSERT INTO public.admin_settings (setting_key, setting_value) 
VALUES 
    ('booking_without_coins_enabled', 'false'::jsonb),
    ('default_coin_price', '1'::jsonb),
    ('cancellation_policy_hours', '1'::jsonb)
ON CONFLICT (setting_key) DO NOTHING;

-- =============================================
-- Database setup complete
-- =============================================
-- This file creates all necessary tables, indexes, RLS policies, 
-- functions, and triggers for the Paddle Play Planner application
-- =============================================