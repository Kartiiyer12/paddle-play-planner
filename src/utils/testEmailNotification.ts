import { supabase } from "@/integrations/supabase/client";

/**
 * Test function to verify email notifications are working
 * This can be called from browser console for testing
 */
export const testBookingConfirmationEmail = async (userEmail?: string) => {
  try {
    console.log("Testing booking confirmation email...");
    
    // Test data
    const testEmailData = {
      booking_id: "test-booking-123",
      user_email: userEmail || "your-email@example.com", // Replace with your actual email
      user_name: "Test User",
      venue_name: "Test Venue",
      slot_date: "2025-08-01",
      slot_start_time: "10:00",
      slot_end_time: "11:00",
      booking_created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.functions.invoke('send-booking-confirmation', {
      body: { booking_data: testEmailData }
    });

    if (error) {
      console.error("❌ Email test failed:", error);
      return { success: false, error };
    }

    console.log("✅ Email test successful:", data);
    return { success: true, data };

  } catch (error) {
    console.error("❌ Email test error:", error);
    return { success: false, error };
  }
};

// Make it available globally for testing
(window as any).testBookingEmail = testBookingConfirmationEmail;