import { Edit, Eye, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { Survey } from "../types";

interface SurveyTableProps {
  surveys: Survey[];
  onPreview: (survey: Survey) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: 'draft' | 'published' | 'archived') => void;
}

export function SurveyTable({ surveys, onPreview, onDelete, onStatusChange }: SurveyTableProps) {
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
              <div className="flex gap-1">
                {survey.tags?.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </TableCell>
            <TableCell>
              <Badge
                variant={
                  survey.status === "published"
                    ? "default"
                    : survey.status === "archived"
                    ? "destructive"
                    : "secondary"
                }
              >
                {survey.status}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onPreview(survey)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                >
                  <Link to={`/admin/surveys/${survey.id}/edit`}>
                    <Edit className="h-4 w-4" />
                  </Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
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
                    {survey.status === 'archived' && (
                      <DropdownMenuItem onClick={() => onStatusChange(survey.id, 'draft')}>
                        Unarchive
                      </DropdownMenuItem>
                    )}
                    {survey.status !== 'archived' && (
                      <DropdownMenuItem onClick={() => onStatusChange(survey.id, 'archived')}>
                        Archive
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => onDelete(survey.id)}
                    >
                      Delete Permanently
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