import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { ResponseGroup } from "./ResponseGroup";
import type { FilterOptions, Response } from "./types";

interface ResponsesTabProps {
  instanceId?: string;
}

export function ResponsesTab({ instanceId }: ResponsesTabProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    search: "",
    sortBy: "date",
    sortDirection: "desc",
  });

  const { data: responses, isLoading } = useQuery({
    queryKey: ["campaign-responses", instanceId],
    queryFn: async () => {
      console.log("Fetching responses for instance:", instanceId);
      const query = supabase
        .from("survey_responses")
        .select(`
          id,
          response_data,
          submitted_at,
          created_at,
          updated_at,
          campaign_instance_id,
          assignment_id,
          user_id,
          user:profiles!survey_responses_user_id_fkey (
            id,
            first_name,
            last_name,
            email
          ),
          assignment:survey_assignments!survey_responses_assignment_id_fkey (
            id,
            campaign_id,
            survey:surveys!survey_assignments_survey_id_fkey (
              id,
              json_data
            )
          )
        `);

      if (instanceId) {
        query.eq("campaign_instance_id", instanceId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching responses:", error);
        throw error;
      }
      console.log("Fetched responses:", data);
      return data as Response[];
    },
    enabled: !!instanceId,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-12 w-full animate-pulse bg-muted rounded" />
        <div className="h-32 w-full animate-pulse bg-muted rounded" />
      </div>
    );
  }

  // Filter responses
  const filteredResponses = responses?.filter((response) => {
    if (!filters.search) return true;
    const searchTerm = filters.search.toLowerCase();
    const userName = `${response.user.first_name || ''} ${response.user.last_name || ''} ${response.user.email}`.toLowerCase();
    return userName.includes(searchTerm);
  }) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search respondents..."
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          className="flex-1"
        />
        <Select
          value={filters.sortBy}
          onValueChange={(value) => setFilters(prev => ({ 
            ...prev, 
            sortBy: value as FilterOptions["sortBy"]
          }))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Date</SelectItem>
            <SelectItem value="name">Name</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.sortDirection}
          onValueChange={(value) => setFilters(prev => ({ 
            ...prev, 
            sortDirection: value as FilterOptions["sortDirection"] 
          }))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort direction" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Ascending</SelectItem>
            <SelectItem value="desc">Descending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ResponseGroup responses={filteredResponses} />
    </div>
  );
}