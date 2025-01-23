import { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import { Model } from "survey-core";
import { Survey } from "survey-react-ui";
import { LayeredDarkPanelless } from "survey-core/themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import "survey-core/defaultV2.min.css";

interface SurveyBuilderProps {
  onSubmit: (jsonData: any) => void;
  defaultValue?: string;
}

export function SurveyBuilder({ onSubmit, defaultValue }: SurveyBuilderProps) {
  const [jsonContent, setJsonContent] = useState(defaultValue || "{}");
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [survey, setSurvey] = useState<Model | null>(null);

  useEffect(() => {
    try {
      const parsedJson = JSON.parse(jsonContent);
      const surveyModel = new Model(parsedJson);
      surveyModel.applyTheme(LayeredDarkPanelless);
      setSurvey(surveyModel);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      setSurvey(null);
    }
  }, [jsonContent]);

  const handleEditorChange = (value: string = "") => {
    setJsonContent(value);
  };

  const handleSave = () => {
    try {
      const parsedJson = JSON.parse(jsonContent);
      onSubmit(parsedJson);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Survey Builder</h3>
          <p className="text-sm text-muted-foreground">
            Design your survey using the JSON editor below
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
          >
            {isPreviewMode ? "Edit" : "Preview"}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              window.open("https://surveyjs.io/create-survey", "_blank");
            }}
          >
            Open Survey.js Creator
          </Button>
        </div>
      </div>

      <div className={cn("min-h-[500px]", isPreviewMode ? "hidden" : "block")}>
        <Editor
          height="500px"
          defaultLanguage="json"
          value={jsonContent}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            formatOnPaste: true,
            formatOnType: true,
          }}
        />
      </div>

      <div className={cn("min-h-[500px]", !isPreviewMode ? "hidden" : "block")}>
        {survey && <Survey model={survey} />}
      </div>

      {error && (
        <p className="text-sm text-destructive">
          Invalid JSON format: {error}
        </p>
      )}

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => window.history.back()}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!!error}>
          Save Survey
        </Button>
      </div>
    </div>
  );
}