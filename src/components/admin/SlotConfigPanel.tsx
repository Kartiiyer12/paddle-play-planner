
import { Card, CardContent } from "@/components/ui/card";
import SlotConfigForm from "./SlotConfigForm";
import { Tag } from "lucide-react";

const SlotConfigPanel = () => {
  return (
    <>
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-semibold">Slot Configuration</h2>
              <p className="text-gray-600 mt-1">
                Configure automatic slot creation and pricing
              </p>
            </div>
            <Tag className="h-8 w-8 text-pickleball-purple" />
          </div>
        </CardContent>
      </Card>

      <SlotConfigForm />
    </>
  );
};

export default SlotConfigPanel;
