import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ResponseGroup } from "./ResponseGroup";
import type { Database } from "@/integrations/supabase/types";

type Response = Database["public"]["Tables"]["survey_responses"]["Row"] & {
  user: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
  };
  assignment: {
    id: string;
    campaign_id: string;
  };
};

interface ResponsesListProps {
  groupedResponses: Record<number, Response[]>;
}

export function ResponsesList({ groupedResponses }: ResponsesListProps) {
  const instances = Object.keys(groupedResponses)
    .map(Number)
    .sort((a, b) => a - b);

  if (instances.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No responses found for this campaign.
      </div>
    );
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      {instances.map((instanceNumber) => (
        <AccordionItem key={instanceNumber} value={String(instanceNumber)}>
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-4">
              <span className="font-semibold">
                Instance {instanceNumber}
              </span>
              <span className="text-sm text-muted-foreground">
                ({groupedResponses[instanceNumber].length} responses)
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <ResponseGroup responses={groupedResponses[instanceNumber]} />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}