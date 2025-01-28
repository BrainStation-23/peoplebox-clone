import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Upload, Download, UserPlus, FileInput } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { exportUsers } from "../../utils/exportUsers";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { User, GenderType, ProfileStatus, UserRole } from "../../types";

interface BulkUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateComplete: () => void;
}

interface SearchUsersResponse {
  profile: {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    profile_image_url: string | null;
    level: string | null;
    org_id: string | null;
    gender: GenderType | null;
    date_of_birth: string | null;
    designation: string | null;
    location: string | null;
    employment_type: string | null;
    employee_role: string | null;
    employee_type: string | null;
    status: ProfileStatus;
    user_roles: {
      role: UserRole;
    };
    user_sbus: Array<{
      id: string;
      user_id: string;
      sbu_id: string;
      is_primary: boolean;
      sbu: {
        id: string;
        name: string;
      };
    }>;
  };
  total_count: number;
}

export function BulkUpdateDialog({ open, onOpenChange, onUpdateComplete }: BulkUpdateDialogProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleExportAll = async () => {
    try {
      setIsExporting(true);
      const { data, error } = await supabase.rpc('search_users', {
        search_text: '',
        page_number: 1,
        page_size: 10000,
        sbu_filter: null,
        level_filter: null,
        location_filter: null,
        employment_type_filter: null,
        employee_role_filter: null,
        employee_type_filter: null
      });

      if (error) throw error;

      if (data) {
        const users: User[] = (data as SearchUsersResponse[]).map(item => ({
          id: item.profile.id,
          email: item.profile.email,
          first_name: item.profile.first_name,
          last_name: item.profile.last_name,
          profile_image_url: item.profile.profile_image_url,
          level: item.profile.level,
          org_id: item.profile.org_id,
          gender: item.profile.gender,
          date_of_birth: item.profile.date_of_birth,
          designation: item.profile.designation,
          location: item.profile.location,
          employment_type: item.profile.employment_type,
          employee_role: item.profile.employee_role,
          employee_type: item.profile.employee_type,
          status: item.profile.status,
          user_roles: item.profile.user_roles,
          user_sbus: item.profile.user_sbus
        }));

        await exportUsers(users);
        toast.success("Users exported successfully");
      }
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export users");
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async (action: 'create' | 'update') => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result;
        if (typeof text !== 'string') return;

        const rows = text.split('\n').map(row => row.split(','));
        // Process the CSV data here
        // This is a placeholder - implement the actual CSV processing logic
        toast.success(`File processed for ${action}`);
      };
      reader.readAsText(selectedFile);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(`Failed to ${action} users`);
    } finally {
      setIsProcessing(false);
      setSelectedFile(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Bulk User Management</DialogTitle>
          <DialogDescription>
            Export all users, or upload a CSV file to create or update users in bulk.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handleExportAll}
              disabled={isExporting}
              className="flex items-center gap-2"
            >
              {isExporting ? (
                <LoadingSpinner className="w-4 h-4" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Export Template
            </Button>
          </div>

          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-gray-500" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">CSV file only</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept=".csv"
                onChange={handleFileChange}
              />
            </label>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              onClick={() => handleUpload('create')}
              disabled={!selectedFile || isProcessing}
              className="flex items-center gap-2"
            >
              {isProcessing ? (
                <LoadingSpinner className="w-4 h-4" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              Bulk Create Users
            </Button>
            <Button
              onClick={() => handleUpload('update')}
              disabled={!selectedFile || isProcessing}
              className="flex items-center gap-2"
            >
              {isProcessing ? (
                <LoadingSpinner className="w-4 h-4" />
              ) : (
                <FileInput className="w-4 h-4" />
              )}
              Bulk Update Users
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}