import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

interface InstanceSelectorProps {
  campaignId: string;
  selectedInstanceId?: string;
  onInstanceSelect: (instanceId: string) => void;
}

export function InstanceSelector({
  campaignId,
  selectedInstanceId,
  onInstanceSelect,
}: InstanceSelectorProps) {
  const { data: instances, isLoading } = useQuery({
    queryKey: ["campaign-instances", campaignId],
    queryFn: async () => {
      console.log("Fetching instances for campaign:", campaignId);
      const { data, error } = await supabase
        .from("campaign_instances")
        .select("*")
        .eq("campaign_id", campaignId)
        .order("period_number", { ascending: false });

      if (error) {
        console.error("Error fetching instances:", error);
        throw error;
      }
      console.log("Fetched instances:", data);
      return data;
    },
    enabled: !!campaignId,
  });

  // Set default instance when instances are loaded
  useEffect(() => {
    if (instances?.length && !selectedInstanceId) {
      // Find active instance
      const activeInstance = instances.find(
        (instance) => instance.status === "active"
      );
      // If no active instance, use most recent
      const defaultInstance = activeInstance || instances[0];
      if (defaultInstance) {
        console.log("Setting default instance:", defaultInstance.id);
        onInstanceSelect(defaultInstance.id);
      }
    }
  }, [instances, selectedInstanceId, onInstanceSelect]);

  if (isLoading) return <div>Loading instances...</div>;

  if (!instances?.length) {
    return <div className="text-sm text-muted-foreground">No instances available</div>;
  }

  return (
    <Select value={selectedInstanceId} onValueChange={onInstanceSelect}>
      <SelectTrigger className="w-[280px]">
        <SelectValue placeholder="Select instance" />
      </SelectTrigger>
      <SelectContent>
        {instances.map((instance) => (
          <SelectItem key={instance.id} value={instance.id}>
            Period {instance.period_number} ({format(new Date(instance.starts_at), "MMM d")} - {format(new Date(instance.ends_at), "MMM d")})
            {instance.status === "active" && " (Active)"}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}