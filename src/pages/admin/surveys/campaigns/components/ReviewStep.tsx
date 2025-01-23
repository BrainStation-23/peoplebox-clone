import { UseFormReturn } from "react-hook-form";
import { CampaignFormData } from "./CampaignForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CampaignPreview } from "./CampaignPreview";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Calendar, CheckCircle, FileText, Users } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface ReviewStepProps {
  form: UseFormReturn<CampaignFormData>;
  surveys: { id: string; name: string; }[];
  isReadyToProceed: boolean;
  onReadyToProceedChange: (checked: boolean) => void;
}

export function ReviewStep({ form, surveys, isReadyToProceed, onReadyToProceedChange }: ReviewStepProps) {
  const values = form.getValues();
  const selectedSurvey = surveys.find(s => s.id === values.survey_id);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium">Campaign Name</h4>
              <p className="text-muted-foreground">{values.name}</p>
            </div>
            
            {values.description && (
              <div>
                <h4 className="font-medium">Description</h4>
                <p className="text-muted-foreground">{values.description}</p>
              </div>
            )}

            <div>
              <h4 className="font-medium">Selected Survey</h4>
              <p className="text-muted-foreground">{selectedSurvey?.name}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Schedule Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <h4 className="font-medium">Campaign Type:</h4>
              <Badge variant={values.is_recurring ? "default" : "secondary"}>
                {values.is_recurring ? "Recurring" : "One-time"}
              </Badge>
            </div>

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

                <div>
                  <h4 className="font-medium">Response Due Time</h4>
                  <p className="text-muted-foreground">
                    {values.instance_end_time}
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

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Please review all details carefully. Once created, some settings cannot be modified.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Campaign Timeline Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CampaignPreview form={form} />
        </CardContent>
      </Card>

      <div className="flex items-center space-x-2 border-t pt-6">
        <Checkbox
          id="ready-to-proceed"
          checked={isReadyToProceed}
          onCheckedChange={(checked) => onReadyToProceedChange(checked as boolean)}
        />
        <Label
          htmlFor="ready-to-proceed"
          className="text-sm text-muted-foreground font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
        >
          <CheckCircle className="h-4 w-4" />
          I have reviewed all details and I'm ready to proceed
        </Label>
      </div>
    </div>
  );
}