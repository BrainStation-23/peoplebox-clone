import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { format } from "date-fns";
import type { Response } from "./types";

interface ResponseDetailsProps {
  response: Response | null;
  onClose: () => void;
}

export function ResponseDetails({ response, onClose }: ResponseDetailsProps) {
  return (
    <Sheet open={!!response} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Response Details</SheetTitle>
        </SheetHeader>

        {response && (
          <div className="mt-6 space-y-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Respondent
              </h3>
              <p>
                {response.user.first_name && response.user.last_name
                  ? `${response.user.first_name} ${response.user.last_name}`
                  : response.user.email}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Submitted At
              </h3>
              <p>
                {response.submitted_at
                  ? format(new Date(response.submitted_at), "PPp")
                  : "Not submitted"}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Response Data
              </h3>
              <pre className="whitespace-pre-wrap text-sm">
                {JSON.stringify(response.response_data, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}