import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CalendarDateTime } from "@/components/ui/calendar-datetime";
import { useToast } from "@/hooks/use-toast";
import { Check, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

interface CampaignEditFormProps {
  campaign: {
    id: string;
    name: string;
    description: string | null;
    status: string;
    starts_at: string;
    ends_at: string;
  };
  onCancel: () => void;
  onSave: () => void;
}

export function CampaignEditForm({ campaign, onCancel, onSave }: CampaignEditFormProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [editedName, setEditedName] = useState(campaign.name);
  const [editedDescription, setEditedDescription] = useState(campaign.description || "");
  const [editedStatus, setEditedStatus] = useState(campaign.status);
  const [editedStartsAt, setEditedStartsAt] = useState(
    campaign.starts_at ? new Date(campaign.starts_at) : new Date()
  );
  const [editedEndsAt, setEditedEndsAt] = useState(
    campaign.ends_at ? new Date(campaign.ends_at) : new Date()
  );

  const handleSave = async () => {
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
      
      onSave();
      navigate(`/admin/surveys/campaigns/${campaign.id}`);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update campaign. Please try again.",
      });
    }
  };

  return (
    <div className="space-y-2">
      <Input
        value={editedName}
        onChange={(e) => setEditedName(e.target.value)}
        className="text-2xl font-bold"
        placeholder="Campaign name"
      />
      <Textarea
        value={editedDescription}
        onChange={(e) => setEditedDescription(e.target.value)}
        className="min-h-[100px]"
        placeholder="Campaign description"
      />
      <div className="flex gap-2">
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
      </div>
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
      <div className="flex gap-2 justify-end">
        <Button onClick={onCancel} variant="outline" size="sm">
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
        <Button onClick={handleSave} size="sm">
          <Check className="mr-2 h-4 w-4" />
          Save
        </Button>
      </div>
    </div>
  );
}