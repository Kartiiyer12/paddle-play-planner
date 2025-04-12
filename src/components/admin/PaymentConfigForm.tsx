
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Euro } from "lucide-react";

interface PaymentConfigFormProps {
  onSuccess?: () => void;
}

const PaymentConfigForm = ({ onSuccess }: PaymentConfigFormProps) => {
  const [stripeEnabled, setStripeEnabled] = useState(false);
  const [testMode, setTestMode] = useState(true);
  const [apiKey, setApiKey] = useState("");
  const [publishableKey, setPublishableKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Here you would save the payment configuration to your backend
      // For now we'll just simulate a successful save
      setTimeout(() => {
        toast.success("Payment configuration updated successfully");
        if (onSuccess) onSuccess();
        setIsLoading(false);
      }, 1000);
    } catch (error: any) {
      toast.error(error.message || "Failed to save payment configuration");
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="stripe-enabled">Enable Stripe Payments</Label>
              <p className="text-sm text-gray-500">Accept payments through Stripe</p>
            </div>
            <Switch
              id="stripe-enabled"
              checked={stripeEnabled}
              onCheckedChange={setStripeEnabled}
            />
          </div>
          
          {stripeEnabled && (
            <>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="test-mode">Test Mode</Label>
                  <p className="text-sm text-gray-500">Use Stripe test environment</p>
                </div>
                <Switch
                  id="test-mode"
                  checked={testMode}
                  onCheckedChange={setTestMode}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="api-key">{testMode ? "Test Secret Key" : "Live Secret Key"}</Label>
                <Input
                  id="api-key"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={`${testMode ? "sk_test_" : "sk_live_"}...`}
                />
                <p className="text-xs text-gray-500">
                  Your Stripe secret key (never share this)
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="publishable-key">{testMode ? "Test Publishable Key" : "Live Publishable Key"}</Label>
                <Input
                  id="publishable-key"
                  value={publishableKey}
                  onChange={(e) => setPublishableKey(e.target.value)}
                  placeholder={`${testMode ? "pk_test_" : "pk_live_"}...`}
                />
                <p className="text-xs text-gray-500">
                  Your Stripe publishable key
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <div className="flex items-center mb-2">
                  <Euro className="h-5 w-5 text-pickleball-purple mr-2" />
                  <h3 className="font-medium">Currency Settings</h3>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  The currency is set to <strong>Euro (€)</strong> for all transactions.
                </p>
                <p className="text-xs text-gray-500">
                  Make sure your Stripe account is configured to accept Euro payments.
                </p>
              </div>
            </>
          )}

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              className="bg-pickleball-purple hover:bg-pickleball-purple/90"
              disabled={isLoading || (stripeEnabled && (!apiKey || !publishableKey))}
            >
              {isLoading ? "Saving..." : "Save Configuration"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PaymentConfigForm;
