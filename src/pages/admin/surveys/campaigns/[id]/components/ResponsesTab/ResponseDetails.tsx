import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { format } from "date-fns";
import type { Response, SurveyElement } from "./types";

interface ResponseDetailsProps {
  response: Response | null;
  onClose: () => void;
}

export function ResponseDetails({ response, onClose }: ResponseDetailsProps) {
  const formatAnswer = (value: any, questionData: SurveyElement | null) => {
    if (!value) return "No response";

    // Handle rating questions
    if (questionData?.type === "rating") {
      const rateMax = questionData.rateMax || 5; // Default to 5 if not specified
      return `${value} out of ${rateMax}`;
    }

    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }
    if (Array.isArray(value)) {
      return (
        <ul className="list-disc pl-4">
          {value.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      );
    }
    if (typeof value === "number") {
      return value.toString();
    }
    return value;
  };

  // Get the survey structure from the assignment
  const surveyJson = response?.assignment?.survey?.json_data;

  // Function to find question title from survey structure
  const getQuestionTitle = (questionName: string) => {
    if (!surveyJson?.pages) return questionName;

    for (const page of surveyJson.pages) {
      for (const element of page.elements) {
        if (element.name === questionName) {
          return element.title || element.name;
        }
      }
    }
    return questionName;
  };

  // Function to get question data from survey structure
  const getQuestionData = (questionName: string): SurveyElement | null => {
    if (!surveyJson?.pages) return null;

    for (const page of surveyJson.pages) {
      for (const element of page.elements) {
        if (element.name === questionName) {
          return element;
        }
      }
    }
    return null;
  };

  return (
    <Sheet open={!!response} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Response Details</SheetTitle>
        </SheetHeader>

        {response && (
          <div className="mt-6 space-y-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Respondent
              </h3>
              <p>
                {response.user.first_name && response.user.last_name
                  ? `${response.user.first_name} ${response.user.last_name}`
                  : response.user.email}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Submitted At
              </h3>
              <p>
                {response.submitted_at
                  ? format(new Date(response.submitted_at), "PPp")
                  : "Not submitted"}
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                Responses
              </h3>
              <div className="border rounded-lg divide-y">
                {Object.entries(response.response_data).map(([questionName, answer]) => {
                  const questionData = getQuestionData(questionName);
                  return (
                    <div key={questionName} className="p-4">
                      <div className="font-medium mb-2">
                        {getQuestionTitle(questionName)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatAnswer(answer, questionData)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}