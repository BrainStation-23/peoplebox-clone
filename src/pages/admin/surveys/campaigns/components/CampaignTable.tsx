import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Survey</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
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
              {campaign.is_recurring
                ? `Recurring (${campaign.recurring_frequency})`
                : "One-time"}
            </TableCell>
            <TableCell>{campaign.status}</TableCell>
            <TableCell>
              <Button variant="ghost" size="icon" asChild>
                <Link to={`/admin/surveys/campaigns/${campaign.id}`}>
                  <ChevronDown className="h-4 w-4" />
                </Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}