import { Link } from "react-router-dom";
import { Eye, MoreVertical, Pencil } from "lucide-react";
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
import { format } from "date-fns";

interface Campaign {
  id: string;
  name: string;
  description: string | null;
  status: string;
  campaign_type: string;
  is_recurring: boolean;
  recurring_frequency: string | null;
  recurring_ends_at: string | null;
  created_at: string;
  survey: { name: string };
  created_by: { email: string };
}

interface CampaignTableProps {
  campaigns: Campaign[];
}

export function CampaignTable({ campaigns }: CampaignTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'secondary';
      case 'completed':
        return 'default';
      case 'draft':
        return 'outline';
      default:
        return 'destructive';
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Survey</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="w-[100px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {campaigns.map((campaign) => (
          <TableRow key={campaign.id}>
            <TableCell className="font-medium">
              {campaign.name}
              {campaign.description && (
                <p className="text-sm text-muted-foreground">{campaign.description}</p>
              )}
            </TableCell>
            <TableCell>{campaign.survey.name}</TableCell>
            <TableCell>
              <Badge variant="outline">
                {campaign.is_recurring ? `Recurring (${campaign.recurring_frequency})` : 'One-time'}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant={getStatusColor(campaign.status)}>{campaign.status}</Badge>
            </TableCell>
            <TableCell>{format(new Date(campaign.created_at), 'MMM d, yyyy')}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" asChild>
                  <Link to={`/admin/surveys/campaigns/${campaign.id}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <Link to={`/admin/surveys/campaigns/${campaign.id}`}>
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
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>View Responses</DropdownMenuItem>
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