import { Card } from "@/components/ui/card";
import { ReactNode } from "react";

interface CampaignFormLayoutProps {
  leftPanel: ReactNode;
  rightPanel: ReactNode;
  actions: ReactNode;
}

export function CampaignFormLayout({ leftPanel, rightPanel, actions }: CampaignFormLayoutProps) {
  return (
    <div className="container max-w-7xl mx-auto py-6 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">{leftPanel}</div>
        <div className="lg:col-span-2">
          <div className="sticky top-6 space-y-6">
            <Card className="p-6">{rightPanel}</Card>
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-4">{actions}</div>
    </div>
  );
}