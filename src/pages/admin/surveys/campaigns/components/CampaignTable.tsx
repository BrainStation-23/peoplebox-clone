import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ChevronDown, ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Campaign {
  id: string;
  name: string;
  description: string | null;
  status: string;
  campaign_type: string;
  is_recurring: boolean;
  recurring_frequency: string | null;
  recurring_ends_at: string | null;
  starts_at: string;
  ends_at: string | null;
  created_at: string;
  survey: { name: string };
  created_by: { email: string };
}

interface CampaignTableProps {
  campaigns: Campaign[];
  onDelete: (id: string) => void;
  sortOrder: 'asc' | 'desc';
  sortBy: 'starts_at' | 'ends_at' | null;
  onSort: (field: 'starts_at' | 'ends_at') => void;
}

export function CampaignTable({ campaigns, onDelete, sortOrder, sortBy, onSort }: CampaignTableProps) {
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    try {
      await onDelete(id);
      toast({
        title: "Success",
        description: "Campaign deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete campaign",
        variant: "destructive",
      });
    }
  };

  const SortIcon = ({ field }: { field: 'starts_at' | 'ends_at' }) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Survey</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead 
            className="cursor-pointer"
            onClick={() => onSort('starts_at')}
          >
            Start Date
            <SortIcon field="starts_at" />
          </TableHead>
          <TableHead 
            className="cursor-pointer"
            onClick={() => onSort('ends_at')}
          >
            End Date
            <SortIcon field="ends_at" />
          </TableHead>
          <TableHead className="w-[140px]">Actions</TableHead>
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
            <TableCell>{format(new Date(campaign.starts_at), 'MMM d, yyyy')}</TableCell>
            <TableCell>
              {campaign.ends_at 
                ? format(new Date(campaign.ends_at), 'MMM d, yyyy')
                : '-'}
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" asChild>
                  <Link to={`/admin/surveys/campaigns/${campaign.id}`}>
                    <ChevronDown className="h-4 w-4" />
                  </Link>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this campaign? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(campaign.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}