
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import PaymentConfigForm from "./PaymentConfigForm";
import { Euro } from "lucide-react";

const PaymentSetupPanel = () => {
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
    </>
  );
};

export default PaymentSetupPanel;
