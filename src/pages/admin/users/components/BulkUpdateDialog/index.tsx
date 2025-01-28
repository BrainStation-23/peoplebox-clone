import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Upload, Download } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { exportUsers } from "../../utils/exportUsers";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { User } from "../../types";

interface BulkUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateComplete: () => void;
}

export function BulkUpdateDialog({ open, onOpenChange, onUpdateComplete }: BulkUpdateDialogProps) {
  const [isExporting, setIsExporting] = useState(false);

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
        // Transform the data into User objects
        const users: User[] = data.map(item => ({
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Bulk Update Users</DialogTitle>
          <DialogDescription>
            Export all users or upload a CSV file to update users in bulk.
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
              Export All Users
            </Button>
          </div>

          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-gray-500" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">CSV file only (coming soon)</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept=".csv"
                disabled
                onChange={() => {}}
              />
            </label>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}