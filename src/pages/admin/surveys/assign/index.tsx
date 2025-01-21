import { AssignSurveyDialog } from "../components/AssignSurvey";

export default function AssignSurveyPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Assign Survey</h1>
      <AssignSurveyDialog surveyId="" onAssigned={() => {}} />
    </div>
  );
}