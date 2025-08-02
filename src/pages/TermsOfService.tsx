import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-pickleball-purple/5 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6">
          <Button variant="outline" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Terms of Service</CardTitle>
            <p className="text-center text-gray-600 mt-2">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
                <p className="text-gray-700 leading-relaxed">
                  Welcome to Paddle Play Planner. By accessing or using our platform, you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our services. These Terms apply to all users of the platform, including visitors, registered users, and venue operators.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
                <p className="text-gray-700 leading-relaxed">
                  Paddle Play Planner is a booking platform that connects players with paddle/pickleball venues. Our service allows users to discover venues, book time slots, manage reservations, and make payments. We facilitate these connections but are not responsible for the actual paddle/pickleball services provided by venues.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">3. User Accounts</h2>
                <div className="space-y-3">
                  <h3 className="text-lg font-medium">Registration</h3>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>You must be at least 13 years old to create an account</li>
                    <li>You must provide accurate and complete information</li>
                    <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                    <li>You are responsible for all activities that occur under your account</li>
                  </ul>
                  
                  <h3 className="text-lg font-medium mt-4">Account Responsibilities</h3>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>Notify us immediately of any unauthorized use of your account</li>
                    <li>Keep your account information up to date</li>
                    <li>Use your account only for lawful purposes</li>
                    <li>Not share your account with others</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">4. Booking and Payments</h2>
                <div className="space-y-3">
                  <h3 className="text-lg font-medium">Booking Policy</h3>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>All bookings are subject to venue availability and approval</li>
                    <li>Booking confirmation does not guarantee court/facility availability</li>
                    <li>Venues reserve the right to cancel bookings due to maintenance or other factors</li>
                    <li>Users must arrive on time for their reserved slots</li>
                  </ul>
                  
                  <h3 className="text-lg font-medium mt-4">Payment Terms</h3>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>Payment is required at the time of booking</li>
                    <li>All payments are processed securely through third-party providers</li>
                    <li>Prices are subject to change without notice</li>
                    <li>Currency conversions may apply additional fees</li>
                  </ul>
                  
                  <h3 className="text-lg font-medium mt-4">Coin System</h3>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>Some venues may use a coin-based booking system</li>
                    <li>Coins have no monetary value and cannot be exchanged for cash</li>
                    <li>Unused coins may expire according to venue policies</li>
                    <li>Coin balances are non-transferable between users</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">5. Cancellation and Refund Policy</h2>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>Cancellation policies vary by venue and are displayed during booking</li>
                  <li>Refunds are subject to individual venue policies</li>
                  <li>No-shows may result in forfeiture of booking fees</li>
                  <li>We reserve the right to charge cancellation fees for repeated no-shows</li>
                  <li>Refunds, when applicable, will be processed within 5-10 business days</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">6. User Conduct</h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  You agree not to:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>Use the platform for any illegal or unauthorized purpose</li>
                  <li>Violate any laws, regulations, or third-party rights</li>
                  <li>Transmit harmful, offensive, or inappropriate content</li>
                  <li>Interfere with or disrupt the platform's functionality</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Create multiple accounts to circumvent booking limits</li>
                  <li>Engage in fraudulent or deceptive practices</li>
                  <li>Harass or intimidate other users or venue staff</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">7. Venue Responsibilities</h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Venue operators using our platform agree to:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>Provide accurate information about facilities and availability</li>
                  <li>Honor confirmed bookings unless extraordinary circumstances arise</li>
                  <li>Maintain safe and clean facilities</li>
                  <li>Comply with local health and safety regulations</li>
                  <li>Treat all users fairly and without discrimination</li>
                  <li>Respond promptly to booking inquiries and issues</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">8. Intellectual Property</h2>
                <p className="text-gray-700 leading-relaxed">
                  The platform, including its design, functionality, content, and trademarks, is owned by Paddle Play Planner and protected by intellectual property laws. You may not copy, modify, distribute, or create derivative works without our express written permission.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">9. Privacy and Data Protection</h2>
                <p className="text-gray-700 leading-relaxed">
                  Your privacy is important to us. Please review our Privacy Policy, which explains how we collect, use, and protect your personal information. By using our platform, you consent to the collection and use of your information as described in our Privacy Policy.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">10. Disclaimers and Limitation of Liability</h2>
                <div className="space-y-3">
                  <h3 className="text-lg font-medium">Service Availability</h3>
                  <p className="text-gray-700 leading-relaxed">
                    We strive to maintain platform availability but cannot guarantee uninterrupted service. We reserve the right to modify, suspend, or discontinue services at any time.
                  </p>
                  
                  <h3 className="text-lg font-medium mt-4">Limitation of Liability</h3>
                  <p className="text-gray-700 leading-relaxed">
                    To the maximum extent permitted by law, Paddle Play Planner shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform. Our total liability shall not exceed the amount you paid for services in the 12 months preceding the claim.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">11. Indemnification</h2>
                <p className="text-gray-700 leading-relaxed">
                  You agree to indemnify and hold harmless Paddle Play Planner from any claims, damages, or expenses arising from your use of the platform, violation of these Terms, or infringement of any third-party rights.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">12. Termination</h2>
                <p className="text-gray-700 leading-relaxed">
                  We may terminate or suspend your account immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties. You may terminate your account at any time by contacting us.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">13. Governing Law and Disputes</h2>
                <p className="text-gray-700 leading-relaxed">
                  These Terms are governed by the laws of [Your Jurisdiction]. Any disputes arising from these Terms or your use of the platform will be resolved through binding arbitration, except where prohibited by law.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">14. Changes to Terms</h2>
                <p className="text-gray-700 leading-relaxed">
                  We reserve the right to modify these Terms at any time. We will notify users of material changes by posting the updated Terms on our platform and updating the "Last updated" date. Continued use of the platform after changes constitutes acceptance of the new Terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">15. Contact Information</h2>
                <p className="text-gray-700 leading-relaxed">
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg mt-3">
                  <p className="font-medium">Paddle Play Planner</p>
                  <p>Email: legal@paddleplayplanner.com</p>
                  <p>Address: [Your Business Address]</p>
                  <p>Phone: [Your Contact Number]</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">16. Severability</h2>
                <p className="text-gray-700 leading-relaxed">
                  If any provision of these Terms is found to be unenforceable or invalid, the remaining provisions will continue in full force and effect. The invalid provision will be replaced with a valid provision that most closely matches the intent of the original provision.
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsOfService;