import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "https://esm.sh/resend@3.2.0";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingEmailData {
  booking_id: string;
  user_email: string;
  user_name: string;
  venue_name: string;
  slot_date: string;
  slot_start_time: string;
  slot_end_time: string;
  booking_created_at: string;
}

const generateBookingConfirmationHTML = (data: BookingEmailData) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Booking Confirmation - Paddle Play Planner</title>
      <style>
        .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
        .header { background: #6366f1; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; background: #f9fafb; }
        .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
        .label { font-weight: bold; color: #374151; }
        .value { color: #6b7280; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        .button { 
          background: #6366f1; 
          color: white; 
          padding: 12px 24px; 
          text-decoration: none; 
          border-radius: 6px; 
          display: inline-block; 
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏓 Booking Confirmed!</h1>
          <p>Your pickleball slot has been successfully booked</p>
        </div>
        
        <div class="content">
          <p>Hi <strong>${data.user_name}</strong>,</p>
          <p>Great news! Your booking has been confirmed. Here are the details:</p>
          
          <div class="booking-details">
            <h3>📅 Booking Details</h3>
            <div class="detail-row">
              <span class="label">Venue:</span>
              <span class="value">${data.venue_name}</span>
            </div>
            <div class="detail-row">
              <span class="label">Date:</span>
              <span class="value">${new Date(data.slot_date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
            <div class="detail-row">
              <span class="label">Time:</span>
              <span class="value">${data.slot_start_time} - ${data.slot_end_time}</span>
            </div>
            <div class="detail-row">
              <span class="label">Booking ID:</span>
              <span class="value">${data.booking_id}</span>
            </div>
            <div class="detail-row">
              <span class="label">Booked on:</span>
              <span class="value">${new Date(data.booking_created_at).toLocaleString()}</span>
            </div>
          </div>
          
          <p><strong>What's next?</strong></p>
          <ul>
            <li>Arrive 10-15 minutes before your slot time</li>
            <li>Bring your own paddle and balls (or rent at venue)</li>
            <li>Check in with venue staff when you arrive</li>
            <li>Have fun playing pickleball! 🎾</li>
          </ul>
          
          <div style="text-align: center;">
            <a href="https://paddle-play-planner.lovable.app/my-bookings" class="button">
              View My Bookings
            </a>
          </div>
          
          <p><em>Need to cancel? You can cancel your booking from your dashboard up until the day of play.</em></p>
        </div>
        
        <div class="footer">
          <p>Thanks for using Paddle Play Planner!</p>
          <p>Questions? Contact us at support@paddleplayplanner.com</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Resend with API key
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    
    // Get request data
    const { booking_data } = await req.json() as { booking_data: BookingEmailData };
    
    if (!booking_data) {
      return new Response(
        JSON.stringify({ error: "Missing booking data" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate HTML email content
    const htmlContent = generateBookingConfirmationHTML(booking_data);
    
    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: "Paddle Play Planner <onboarding@resend.dev>",
      to: [booking_data.user_email],
      subject: `🏓 Booking Confirmed - ${booking_data.venue_name} on ${new Date(booking_data.slot_date).toLocaleDateString()}`,
      html: htmlContent,
    });

    if (error) {
      console.error("Error sending email:", error);
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: error }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Booking confirmation email sent successfully",
        email_id: data?.id 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});