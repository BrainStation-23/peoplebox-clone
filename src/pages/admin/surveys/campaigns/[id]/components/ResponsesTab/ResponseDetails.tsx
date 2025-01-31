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
  const formatAnswer = (value: any) => {
    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }
    if (Array.isArray(value)) {
      return (
        <ul className="list-disc pl-4">
          {value.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      );
    }
    if (typeof value === "number") {
      return value.toString();
    }
    return value;
  };

  const getPrimarySBU = (response: Response) => {
    const primarySBU = response.user.user_sbus.find(us => us.is_primary);
    return primarySBU?.sbu.name || "N/A";
  };

  const getPrimarySupervisor = (response: Response) => {
    const primarySupervisor = response.user.user_supervisors.find(us => us.is_primary);
    if (!primarySupervisor) return "N/A";
    const { first_name, last_name } = primarySupervisor.supervisor;
    return first_name && last_name ? `${first_name} ${last_name}` : "N/A";
  };

  return (
    <Sheet open={!!response} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
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
                {response.assignment.campaign.anonymous
                  ? "Anonymous"
                  : response.user.first_name && response.user.last_name
                  ? `${response.user.first_name} ${response.user.last_name}`
                  : response.user.email}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Primary SBU
              </h3>
              <p>{getPrimarySBU(response)}</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Primary Manager
              </h3>
              <p>{getPrimarySupervisor(response)}</p>
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

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                Responses
              </h3>
              <div className="border rounded-lg divide-y">
                {Object.entries(response.response_data).map(([question, answer]) => (
                  <div key={question} className="p-4">
                    <div className="font-medium mb-2">{question}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatAnswer(answer)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}