import { Link } from "react-router-dom";
import { Eye, MoreVertical, Pencil, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Survey } from "../types";

interface SurveyTableProps {
  surveys: Survey[];
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: 'draft' | 'published' | 'archived') => void;
}

export function SurveyTable({ surveys, onDelete, onStatusChange }: SurveyTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'success';
      case 'archived':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Tags</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-[100px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {surveys.map((survey) => (
          <TableRow key={survey.id}>
            <TableCell className="font-medium">{survey.name}</TableCell>
            <TableCell>{survey.description}</TableCell>
            <TableCell>
              <div className="flex gap-1 flex-wrap">
                {survey.tags?.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={getStatusColor(survey.status)}>{survey.status}</Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" asChild>
                  <Link to={`/admin/surveys/${survey.id}/preview`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <Link to={`/admin/surveys/${survey.id}/edit`}>
                    <Pencil className="h-4 w-4" />
                  </Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {survey.status === 'draft' && (
                      <DropdownMenuItem onClick={() => onStatusChange(survey.id, 'published')}>
                        Publish
                      </DropdownMenuItem>
                    )}
                    {survey.status === 'published' && (
                      <DropdownMenuItem onClick={() => onStatusChange(survey.id, 'draft')}>
                        Unpublish
                      </DropdownMenuItem>
                    )}
                    {survey.status !== 'archived' && (
                      <DropdownMenuItem onClick={() => onStatusChange(survey.id, 'archived')}>
                        Archive
                      </DropdownMenuItem>
                    )}
                    {survey.status === 'archived' && (
                      <DropdownMenuItem onClick={() => onStatusChange(survey.id, 'draft')}>
                        Unarchive
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => onDelete(survey.id)}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}