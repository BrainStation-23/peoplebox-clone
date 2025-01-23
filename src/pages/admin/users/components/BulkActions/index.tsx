import { useState } from "react";
import { Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ImportDialog from "./ImportDialog";

export function BulkActions() {
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Fetch levels and SBUs for validation
  const { data: levels } = useQuery({
    queryKey: ["levels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("levels")
        .select("id, name")
        .eq("status", "active");
      if (error) throw error;
      return data;
    },
  });

  const { data: sbus } = useQuery({
    queryKey: ["sbus"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sbus")
        .select("id, name");
      if (error) throw error;
      return data;
    },
  });

  const handleExport = async () => {
    try {
      const { data: users, error } = await supabase
        .from("profiles")
        .select(`
          id,
          email,
          first_name,
          last_name,
          org_id,
          levels (
            name
          ),
          user_roles (
            role
          ),
          user_sbus (
            is_primary,
            sbu:sbus (
              name
            )
          )
        `);

      if (error) throw error;

      const csvData = users.map((user) => {
        const primarySbu = user.user_sbus?.find(sbu => sbu.is_primary)?.sbu?.name || '';
        const role = user.user_roles?.[0]?.role || 'user';
        const level = user.levels?.name || '';

        return {
          email: user.email,
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          org_id: user.org_id || '',
          level,
          primary_sbu: primarySbu,
          is_admin: role === 'admin',
          action: 'update'
        };
      });

      const headers = ["email", "first_name", "last_name", "org_id", "level", "primary_sbu", "is_admin", "action"];
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users_export_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Users exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export users");
    }
  };

  return (
    <div className="flex gap-2 mb-4">
      <Button onClick={handleExport} variant="outline" size="sm">
        <Download className="w-4 h-4 mr-2" />
        Export Users
      </Button>
      <Button onClick={() => setIsImportOpen(true)} variant="outline" size="sm">
        <Upload className="w-4 h-4 mr-2" />
        Import Users
      </Button>

      <ImportDialog 
        open={isImportOpen} 
        onOpenChange={setIsImportOpen}
        levels={levels || []}
        sbus={sbus || []}
      />
    </div>
  );
}