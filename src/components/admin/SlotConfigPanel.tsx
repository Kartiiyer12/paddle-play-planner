
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarClock } from "lucide-react";
import SlotConfigForm from "./SlotConfigForm";

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
            <CalendarClock className="h-8 w-8 text-pickleball-purple" />
          </div>
        </CardContent>
      </Card>

      <SlotConfigForm />
    </>
  );
};

export default SlotConfigPanel;
