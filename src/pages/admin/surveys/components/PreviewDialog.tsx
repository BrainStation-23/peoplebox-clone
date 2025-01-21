import { Survey as SurveyComponent } from "survey-react-ui";
import { Model } from "survey-core";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Survey } from "../types";

interface PreviewDialogProps {
  survey: Survey | null;
  onOpenChange: (open: boolean) => void;
}

export function PreviewDialog({ survey, onOpenChange }: PreviewDialogProps) {
  return (
    <Dialog open={!!survey} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{survey?.name}</DialogTitle>
          <DialogDescription>{survey?.description}</DialogDescription>
        </DialogHeader>
        {survey && (
          <div className="mt-4">
            <SurveyComponent model={new Model(survey.json_data)} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}