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

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Respondent</TableHead>
            <TableHead>Submitted At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {responses.map((response) => (
            <TableRow key={response.id}>
              <TableCell>
                {response.user.first_name && response.user.last_name
                  ? `${response.user.first_name} ${response.user.last_name}`
                  : response.user.email}
              </TableCell>
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