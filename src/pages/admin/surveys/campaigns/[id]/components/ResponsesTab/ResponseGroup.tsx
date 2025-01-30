import { useState } from "react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { ResponseDetails } from "./ResponseDetails";
import type { Response } from "./types";

interface ResponseGroupProps {
  responses: Response[];
}

export function ResponseGroup({ responses }: ResponseGroupProps) {
  const [selectedResponse, setSelectedResponse] = useState<Response | null>(null);

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

  const getRespondentName = (response: Response) => {
    if (response.assignment.campaign.anonymous) {
      return "Anonymous";
    }
    return response.user.first_name && response.user.last_name
      ? `${response.user.first_name} ${response.user.last_name}`
      : response.user.email;
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Respondent</TableHead>
            <TableHead>Primary SBU</TableHead>
            <TableHead>Primary Manager</TableHead>
            <TableHead>Submitted At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {responses.map((response) => (
            <TableRow key={response.id}>
              <TableCell>{getRespondentName(response)}</TableCell>
              <TableCell>{getPrimarySBU(response)}</TableCell>
              <TableCell>{getPrimarySupervisor(response)}</TableCell>
              <TableCell>
                {response.submitted_at
                  ? format(new Date(response.submitted_at), "PPp")
                  : "Not submitted"}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedResponse(response)}
                >
                  <FileText className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ResponseDetails
        response={selectedResponse}
        onClose={() => setSelectedResponse(null)}
      />
    </>
  );
}