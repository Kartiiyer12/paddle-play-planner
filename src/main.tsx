import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Import test function for debugging (remove in production)
import { testBookingConfirmationEmail } from "./utils/testEmailNotification";
(window as any).testBookingEmail = testBookingConfirmationEmail;

createRoot(document.getElementById("root")!).render(<App />);
