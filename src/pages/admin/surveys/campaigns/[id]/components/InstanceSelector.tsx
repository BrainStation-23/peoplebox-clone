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
      const { data, error } = await supabase
        .from("campaign_instances")
        .select("*")
        .eq("campaign_id", campaignId)
        .order("period_number", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <div>Loading instances...</div>;

  return (
    <Select value={selectedInstanceId} onValueChange={onInstanceSelect}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select instance" />
      </SelectTrigger>
      <SelectContent>
        {instances?.map((instance) => (
          <SelectItem key={instance.id} value={instance.id}>
            Period {instance.period_number} ({format(new Date(instance.starts_at), "MMM d")} - {format(new Date(instance.ends_at), "MMM d")})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}