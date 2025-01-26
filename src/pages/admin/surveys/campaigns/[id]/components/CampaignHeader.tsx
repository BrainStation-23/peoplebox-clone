import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDateTime } from "@/components/ui/calendar-datetime";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Check, Edit2, Play, X } from "lucide-react";
import { format, isValid } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

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
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(campaign?.name || "");
  const [editedDescription, setEditedDescription] = useState(campaign?.description || "");
  const [editedStatus, setEditedStatus] = useState(campaign?.status || "");
  const [editedStartsAt, setEditedStartsAt] = useState(
    campaign?.starts_at ? new Date(campaign.starts_at) : new Date()
  );
  const [editedEndsAt, setEditedEndsAt] = useState(
    campaign?.ends_at ? new Date(campaign.ends_at) : new Date()
  );

  const handleSave = async () => {
    if (!campaign) return;

    try {
      const { error } = await supabase
        .from("survey_campaigns")
        .update({
          name: editedName,
          description: editedDescription,
          status: editedStatus,
          starts_at: editedStartsAt.toISOString(),
          ends_at: editedEndsAt.toISOString(),
        })
        .eq("id", campaign.id);

      if (error) throw error;

      toast({
        title: "Campaign updated",
        description: "Your changes have been saved successfully.",
      });
      
      setIsEditing(false);
      navigate(`/admin/surveys/campaigns/${id}`);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update campaign. Please try again.",
      });
    }
  };

  const handleCancel = () => {
    setEditedName(campaign?.name || "");
    setEditedDescription(campaign?.description || "");
    setEditedStatus(campaign?.status || "");
    setEditedStartsAt(campaign?.starts_at ? new Date(campaign.starts_at) : new Date());
    setEditedEndsAt(campaign?.ends_at ? new Date(campaign.ends_at) : new Date());
    setIsEditing(false);
    navigate(`/admin/surveys/campaigns/${id}`);
  };

  const handlePresent = () => {
    navigate(`/admin/surveys/campaigns/${id}/present?instance=${selectedInstanceId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return isValid(date) ? format(date, 'MMM d, yyyy HH:mm') : 'Invalid date';
  };

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
            <div className="space-y-2">
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="text-2xl font-bold"
                placeholder="Campaign name"
              />
              <Textarea
                value={editedDescription || ""}
                onChange={(e) => setEditedDescription(e.target.value)}
                className="min-h-[100px]"
                placeholder="Campaign description"
              />
            </div>
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
          <Button
            onClick={handlePresent}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Play className="h-4 w-4" />
            Present
          </Button>
          {isEditing ? (
            <>
              <Button onClick={handleCancel} variant="outline" size="sm">
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleSave} size="sm">
                <Check className="mr-2 h-4 w-4" />
                Save
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              size="sm"
            >
              <Edit2 className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {isEditing ? (
          <Select
            value={editedStatus}
            onValueChange={setEditedStatus}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
            {campaign.status}
          </Badge>
        )}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {formatDate(campaign.created_at)}
        </div>
      </div>

      <div className="space-y-2">
        {isEditing ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Start Date & Time</label>
              <CalendarDateTime
                value={editedStartsAt}
                onChange={setEditedStartsAt}
              />
            </div>
            <div>
              <label className="text-sm font-medium">End Date & Time</label>
              <CalendarDateTime
                value={editedEndsAt}
                onChange={setEditedEndsAt}
              />
            </div>
          </div>
        ) : (
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>Starts: {formatDate(campaign.starts_at)}</span>
            <span>Ends: {formatDate(campaign.ends_at)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
