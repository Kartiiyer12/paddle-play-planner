
import { Card, CardContent } from "@/components/ui/card";
import { Euro } from "lucide-react";
import PaymentConfigForm from "./PaymentConfigForm";
import PaymentConfigList from "./PaymentConfigList";
import { useVenues } from "@/hooks/useVenues";

const PaymentSetupPanel = () => {
  const { selectedVenue } = useVenues();

  return (
    <>
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-semibold">Payment Configuration</h2>
              <p className="text-gray-600 mt-1">
                Configure your payment settings and prices
              </p>
            </div>
            <Euro className="h-8 w-8 text-pickleball-purple" />
          </div>
        </CardContent>
      </Card>

      <PaymentConfigForm />
      <PaymentConfigList venueId={selectedVenue} />
    </>
  );
};

export default PaymentSetupPanel;
