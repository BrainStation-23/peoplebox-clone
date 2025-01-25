import { useResponseProcessing } from "./hooks/useResponseProcessing";

interface ReportsTabProps {
  campaignId: string;
}

export function ReportsTab({ campaignId }: ReportsTabProps) {
  const { data: processedResponses, isLoading } = useResponseProcessing(campaignId);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <pre>{JSON.stringify(processedResponses, null, 2)}</pre>
    </div>
  );
}