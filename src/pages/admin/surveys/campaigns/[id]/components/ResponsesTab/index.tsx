import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ResponseGroup } from "./ResponseGroup";
import { unparse } from "papaparse";
import type { Response } from "./types";

interface ResponsesTabProps {
  instanceId?: string;
}

export function ResponsesTab({ instanceId }: ResponsesTabProps) {
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
            email,
            user_sbus (
              is_primary,
              sbu:sbus(
                id,
                name
              )
            ),
            user_supervisors!user_supervisors_user_id_fkey (
              is_primary,
              supervisor:profiles!user_supervisors_supervisor_id_fkey(
                id,
                first_name,
                last_name,
                email
              )
            )
          ),
          assignment:survey_assignments!survey_responses_assignment_id_fkey (
            id,
            campaign_id,
            campaign:survey_campaigns(
              id,
              anonymous,
              name
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

  const handleExport = () => {
    if (!responses?.length) return;

    const isAnonymous = responses[0].assignment.campaign.anonymous;
    
    const csvData = responses.map(response => {
      const baseData = {
        "Submission Date": response.submitted_at ? new Date(response.submitted_at).toLocaleString() : "Not submitted",
        "Primary SBU": response.user.user_sbus.find(us => us.is_primary)?.sbu.name || "N/A",
        "Primary Manager": (() => {
          const primarySupervisor = response.user.user_supervisors.find(us => us.is_primary);
          if (!primarySupervisor) return "N/A";
          const { first_name, last_name } = primarySupervisor.supervisor;
          return first_name && last_name ? `${first_name} ${last_name}` : "N/A";
        })(),
      };

      // Add respondent info only if not anonymous
      if (!isAnonymous) {
        Object.assign(baseData, {
          "Respondent Name": response.user.first_name && response.user.last_name
            ? `${response.user.first_name} ${response.user.last_name}`
            : "N/A",
          "Respondent Email": response.user.email,
        });
      }

      // Add response data
      const responseData = response.response_data as Record<string, any>;
      Object.entries(responseData).forEach(([key, value]) => {
        baseData[key] = typeof value === 'object' ? JSON.stringify(value) : value;
      });

      return baseData;
    });

    const csv = unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const campaignName = responses[0].assignment.campaign.name.toLowerCase().replace(/\s+/g, '-');
    
    link.href = window.URL.createObjectURL(blob);
    link.download = `${campaignName}-responses${instanceId ? `-period-${instanceId}` : ''}.csv`;
    link.click();
    window.URL.revokeObjectURL(link.href);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-12 w-full animate-pulse bg-muted rounded" />
        <div className="h-32 w-full animate-pulse bg-muted rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={handleExport}
          disabled={!responses?.length}
        >
          <Download className="mr-2 h-4 w-4" />
          Export Responses
        </Button>
      </div>

      <ResponseGroup responses={responses || []} />
    </div>
  );
}