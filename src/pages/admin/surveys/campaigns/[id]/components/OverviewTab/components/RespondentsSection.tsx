import { PendingRespondents } from "../PendingRespondents";
import { RecentActivityList } from "../RecentActivityList";

type Activity = {
  created_at: string;
  user: {
    first_name: string | null;
    last_name: string | null;
    email: string;
  };
};

type RespondentsSectionProps = {
  campaignId: string;
  selectedInstanceId?: string;
  recentActivity: Activity[] | undefined;
};

export function RespondentsSection({ 
  campaignId, 
  selectedInstanceId,
  recentActivity 
}: RespondentsSectionProps) {
  return (
    <>
      <PendingRespondents 
        campaignId={campaignId} 
        instanceId={selectedInstanceId} 
      />
      <RecentActivityList activities={recentActivity || []} />
    </>
  );
}