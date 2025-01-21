import { ExternalLink, Eye, Pencil, Trash2, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface SBU {
  id: string;
  name: string;
  website?: string;
  head?: {
    first_name?: string;
    last_name?: string;
  };
}

interface SBUTableProps {
  sbus: SBU[];
  onEdit: (sbu: SBU) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export function SBUTable({ sbus, onEdit, onDelete, isLoading }: SBUTableProps) {
  const navigate = useNavigate();
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Head</TableHead>
            <TableHead>Website</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sbus?.map((sbu) => (
            <TableRow key={sbu.id}>
              <TableCell>{sbu.name}</TableCell>
              <TableCell>
                {sbu.head ? (
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    {sbu.head.first_name} {sbu.head.last_name}
                  </div>
                ) : (
                  <span className="text-muted-foreground">No head assigned</span>
                )}
              </TableCell>
              <TableCell>
                {sbu.website ? (
                  <a
                    href={sbu.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-500 hover:text-blue-700"
                  >
                    Visit website
                    <ExternalLink className="h-4 w-4 ml-1" />
                  </a>
                ) : (
                  <span className="text-muted-foreground">No website</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(`/admin/config/sbus/${sbu.id}`)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(sbu)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this SBU?")) {
                        onDelete(sbu.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {!isLoading && (!sbus || sbus.length === 0) && (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                No SBUs found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}