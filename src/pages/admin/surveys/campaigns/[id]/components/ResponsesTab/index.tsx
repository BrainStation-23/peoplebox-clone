import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ResponsesList } from "./ResponsesList";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FilterOptions, Response } from "./types";

export function ResponsesTab() {
  const { id: campaignId } = useParams();
  const [filters, setFilters] = useState<FilterOptions>({
    search: "",
    sortBy: "date",
    sortDirection: "desc",
  });

  const { data: responses, isLoading } = useQuery({
    queryKey: ["campaign-responses", campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("survey_responses")
        .select(`
          id,
          response_data,
          submitted_at,
          created_at,
          updated_at,
          instance_number,
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
            campaign_id
          )
        `)
        .eq("assignment.campaign_id", campaignId)
        .order("instance_number", { ascending: true })
        .order("submitted_at", { ascending: false });

      if (error) throw error;
      return data as Response[];
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  // Filter and sort responses
  const filteredResponses = responses?.filter((response) => {
    if (!filters.search) return true;
    const searchTerm = filters.search.toLowerCase();
    const userName = `${response.user.first_name || ''} ${response.user.last_name || ''} ${response.user.email}`.toLowerCase();
    return userName.includes(searchTerm);
  });

  const sortedResponses = [...(filteredResponses || [])].sort((a, b) => {
    if (filters.sortBy === "date") {
      const dateA = new Date(a.submitted_at || a.created_at).getTime();
      const dateB = new Date(b.submitted_at || b.created_at).getTime();
      return filters.sortDirection === "desc" ? dateB - dateA : dateA - dateB;
    } else {
      const nameA = `${a.user.first_name || ''} ${a.user.last_name || ''}`.toLowerCase();
      const nameB = `${b.user.first_name || ''} ${b.user.last_name || ''}`.toLowerCase();
      return filters.sortDirection === "desc" 
        ? nameB.localeCompare(nameA)
        : nameA.localeCompare(nameB);
    }
  });

  // Group responses by instance number
  const groupedResponses = sortedResponses.reduce((acc, response) => {
    const instanceNumber = response.instance_number || 0;
    if (!acc[instanceNumber]) {
      acc[instanceNumber] = [];
    }
    acc[instanceNumber].push(response);
    return acc;
  }, {} as Record<number, Response[]>);

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

      <ResponsesList groupedResponses={groupedResponses} />
    </div>
  );
}