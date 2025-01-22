import { UseFormReturn } from "react-hook-form";
import { CampaignFormData } from "./CampaignForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface CampaignReviewProps {
  form: UseFormReturn<CampaignFormData>;
}

export function CampaignReview({ form }: CampaignReviewProps) {
  const values = form.getValues();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Campaign Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium">Name</h4>
            <p className="text-muted-foreground">{values.name}</p>
          </div>
          
          {values.description && (
            <div>
              <h4 className="font-medium">Description</h4>
              <p className="text-muted-foreground">{values.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium">Start Date</h4>
            <p className="text-muted-foreground">
              {format(values.starts_at, "PPP")}
            </p>
          </div>

          {values.is_recurring ? (
            <>
              <div>
                <h4 className="font-medium">Recurring Pattern</h4>
                <p className="text-muted-foreground capitalize">
                  {values.recurring_frequency}
                </p>
              </div>

              {values.recurring_ends_at && (
                <div>
                  <h4 className="font-medium">Ends On</h4>
                  <p className="text-muted-foreground">
                    {format(values.recurring_ends_at, "PPP")}
                  </p>
                </div>
              )}

              <div>
                <h4 className="font-medium">Instance Duration</h4>
                <p className="text-muted-foreground">
                  {values.instance_duration_days} days
                </p>
              </div>
            </>
          ) : (
            values.ends_at && (
              <div>
                <h4 className="font-medium">End Date</h4>
                <p className="text-muted-foreground">
                  {format(values.ends_at, "PPP")}
                </p>
              </div>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
}