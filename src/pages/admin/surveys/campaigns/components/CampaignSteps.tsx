import { Check } from "lucide-react";

interface StepProps {
  currentStep: number;
  title: string;
  stepNumber: number;
  isCompleted: boolean;
}

function Step({ currentStep, title, stepNumber, isCompleted }: StepProps) {
  return (
    <div className="flex items-center">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${
          isCompleted
            ? "border-primary bg-primary text-primary-foreground"
            : currentStep === stepNumber
            ? "border-primary"
            : "border-muted"
        }`}
      >
        {isCompleted ? (
          <Check className="h-5 w-5" />
        ) : (
          <span className="text-sm font-medium">{stepNumber}</span>
        )}
      </div>
      <div className="ml-4 min-w-0 flex-1">
        <div className="text-sm font-medium text-foreground">{title}</div>
      </div>
    </div>
  );
}

interface CampaignStepsProps {
  currentStep: number;
  completedSteps: number[];
}

export function CampaignSteps({ currentStep, completedSteps }: CampaignStepsProps) {
  const steps = [
    { title: "Basic Information", number: 1 },
    { title: "Schedule Configuration", number: 2 },
    { title: "Review & Launch", number: 3 },
  ];

  return (
    <nav aria-label="Progress">
      <ol className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {steps.map((step) => (
          <li key={step.number} className="md:flex">
            <Step
              currentStep={currentStep}
              title={step.title}
              stepNumber={step.number}
              isCompleted={completedSteps.includes(step.number)}
            />
            {step.number !== steps.length && (
              <div className="hidden md:block md:h-0.5 md:w-full md:bg-muted md:my-5" />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}