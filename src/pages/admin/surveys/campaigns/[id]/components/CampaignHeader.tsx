import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Edit2 } from "lucide-react";
import { format } from "date-fns";
import { CampaignEditForm } from "./CampaignEditForm";
import { ExportButton } from "./ExportButton";

interface CampaignHeaderProps {
  campaign: {
    id: string;
    name: string;
    description: string | null;
    status: string;
    created_at: string;
    starts_at: string;
    ends_at: string;
  } | undefined;
  isLoading: boolean;
}

export function CampaignHeader({ campaign, isLoading }: CampaignHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-4 w-[300px]" />
        <div className="flex gap-4">
          <Skeleton className="h-10 w-[100px]" />
          <Skeleton className="h-10 w-[150px]" />
        </div>
      </div>
    );
  }

  if (!campaign) return null;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-2 flex-1">
          {isEditing ? (
            <CampaignEditForm
              campaign={campaign}
              onCancel={() => setIsEditing(false)}
              onSave={() => setIsEditing(false)}
            />
          ) : (
            <>
              <h1 className="text-2xl font-bold">{campaign.name}</h1>
              {campaign.description && (
                <p className="text-muted-foreground">{campaign.description}</p>
              )}
            </>
          )}
        </div>
        <div className="flex gap-2">
          {!isEditing && (
            <>
              <ExportButton campaign={campaign} />
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                size="sm"
              >
                <Edit2 className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </>
          )}
        </div>
      </div>

      {!isEditing && (
        <>
          <div className="flex items-center gap-4">
            <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
              {campaign.status}
            </Badge>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {format(new Date(campaign.created_at), 'MMM d, yyyy')}
            </div>
          </div>

          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>Starts: {format(new Date(campaign.starts_at), 'MMM d, yyyy HH:mm')}</span>
            <span>Ends: {format(new Date(campaign.ends_at), 'MMM d, yyyy HH:mm')}</span>
          </div>
        </>
      )}
    </div>
  );
}