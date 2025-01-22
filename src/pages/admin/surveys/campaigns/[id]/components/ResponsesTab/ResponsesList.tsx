import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ResponseGroup } from "./ResponseGroup";
import type { Response } from "./types";

interface ResponsesListProps {
  groupedResponses: Record<number, Response[]>;
}

export function ResponsesList({ groupedResponses }: ResponsesListProps) {
  if (!groupedResponses || Object.keys(groupedResponses).length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No responses found for this campaign instance.
      </div>
    );
  }

  const instances = Object.keys(groupedResponses)
    .map(Number)
    .sort((a, b) => b - a); // Sort in descending order

  return (
    <Accordion type="single" collapsible className="w-full">
      {instances.map((instanceNumber) => (
        <AccordionItem key={instanceNumber} value={String(instanceNumber)}>
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-4">
              <span className="font-semibold">
                Period {instanceNumber}
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