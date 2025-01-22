import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Database } from "@/integrations/supabase/types";

type AssignmentStatus = Database["public"]["Enums"]["assignment_status"];

interface Assignment {
  id: string;
  status: AssignmentStatus;
  due_date: string | null;
  instance_number: number | null;
  user: {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
  };
  sbu_assignments: {
    sbu: {
      id: string;
      name: string;
    };
  }[];
}

interface AssignmentInstanceListProps {
  assignments: Assignment[];
  isLoading: boolean;
}

export function AssignmentInstanceList({ assignments, isLoading }: AssignmentInstanceListProps) {
  if (isLoading) {
    return <div>Loading assignments...</div>;
  }

  if (assignments.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold">No assignments found</h3>
        <p className="text-muted-foreground">
          Create new assignments using the "New Assignment" tab.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Assignee</TableHead>
          <TableHead>SBU</TableHead>
          <TableHead>Due Date</TableHead>
          <TableHead>Instance</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {assignments.map((assignment) => (
          <TableRow key={assignment.id}>
            <TableCell>
              {assignment.user.first_name && assignment.user.last_name ? (
                <>
                  {assignment.user.first_name} {assignment.user.last_name}
                  <div className="text-sm text-muted-foreground">
                    {assignment.user.email}
                  </div>
                </>
              ) : (
                assignment.user.email
              )}
            </TableCell>
            <TableCell>
              {assignment.sbu_assignments.map(({ sbu }) => (
                <Badge key={sbu.id} variant="outline" className="mr-1">
                  {sbu.name}
                </Badge>
              ))}
            </TableCell>
            <TableCell>
              {assignment.due_date ? (
                format(new Date(assignment.due_date), 'PPP')
              ) : (
                'No due date'
              )}
            </TableCell>
            <TableCell>
              {assignment.instance_number || 'One-time'}
            </TableCell>
            <TableCell>
              <Badge
                variant={assignment.status === 'completed' ? 'default' : 'secondary'}
              >
                {assignment.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}