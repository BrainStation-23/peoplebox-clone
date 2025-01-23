import { useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  levels: { id: string; name: string }[];
  sbus: { id: string; name: string }[];
}

export default function ImportDialog({ 
  open, 
  onOpenChange,
  levels,
  sbus 
}: ImportDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv']
    },
    maxFiles: 1,
    disabled: isProcessing,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;

      setIsProcessing(true);
      setProgress(0);
      setErrors([]);

      try {
        const file = acceptedFiles[0];
        const text = await file.text();
        const rows = text.split('\n').map(row => row.split(',').map(cell => cell.trim()));
        const headers = rows[0];
        const users = rows.slice(1).map(row => {
          const user: Record<string, string> = {};
          headers.forEach((header, i) => {
            user[header] = row[i]?.replace(/^"|"$/g, '') || '';
          });
          return user;
        });

        // Validate each row
        const validationErrors: string[] = [];
        users.forEach((user, index) => {
          const rowNum = index + 2; // +2 because we skip header and 0-based index

          if (!user.email) {
            validationErrors.push(`Row ${rowNum}: Email is required`);
          }

          if (user.level && !levels.some(l => l.name === user.level)) {
            validationErrors.push(
              `Row ${rowNum}: "${user.level}" is not a valid level. Available levels are: ${levels.map(l => l.name).join(', ')}`
            );
          }

          if (user.primary_sbu && !sbus.some(s => s.name === user.primary_sbu)) {
            validationErrors.push(
              `Row ${rowNum}: "${user.primary_sbu}" is not a valid SBU. Available SBUs are: ${sbus.map(s => s.name).join(', ')}`
            );
          }
        });

        if (validationErrors.length > 0) {
          setErrors(validationErrors);
          toast.error("Validation failed. Please check the errors.");
          return;
        }

        // Process valid users
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/manage-users-bulk', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to process users');
        }

        toast.success("Users processed successfully");
        onOpenChange(false);
      } catch (error) {
        console.error("Import error:", error);
        toast.error(error.message || "Failed to process users");
      } finally {
        setIsProcessing(false);
      }
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Import Users</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div
            {...getRootProps()}
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
          >
            <input {...getInputProps()} />
            <p>Drag and drop a CSV file here, or click to select one</p>
            <p className="text-sm text-muted-foreground mt-2">
              Only CSV files are accepted
            </p>
          </div>

          {isProcessing && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-center">Processing users...</p>
            </div>
          )}

          {errors.length > 0 && (
            <div className="bg-destructive/10 p-4 rounded-lg space-y-2">
              <p className="font-semibold text-destructive">Validation Errors:</p>
              <ul className="list-disc pl-4 space-y-1">
                {errors.map((error, index) => (
                  <li key={index} className="text-sm text-destructive">
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            <p className="font-semibold">CSV Format:</p>
            <p>email, first_name, last_name, org_id, level, primary_sbu, is_admin, action</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}