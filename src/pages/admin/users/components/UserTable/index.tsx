import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Table, TableBody } from "@/components/ui/table";
import { User } from "../../types";
import { SearchFilters } from "./SearchFilters";
import { UsersTableHeader } from "./TableHeader";
import { UserRow } from "./UserRow";
import { TablePagination } from "./TablePagination";
import EditUserDialog from "../EditUserDialog";
import { ExportProgress } from "./ExportProgress";
import { ImportDialog } from "../ImportDialog";
import { exportUsers, downloadCSV } from "../../utils/exportUsers";
import { PasswordDialog } from "./PasswordDialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSBUs } from "../../hooks/useSBUs";

interface UserTableProps {
  users: User[];
  isLoading: boolean;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onDelete: (userId: string) => void;
}

export default function UserTable({
  users,
  isLoading,
  page,
  pageSize,
  total,
  onPageChange,
  onDelete,
}: UserTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSBU, setSelectedSBU] = useState("all");
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [newPassword, setNewPassword] = useState("");
  const { toast } = useToast();
  
  const { data: sbus = [] } = useSBUs();

  const [exportProgress, setExportProgress] = useState({
    isOpen: false,
    processed: 0,
    total: 0,
    error: "",
    isComplete: false,
  });

  const queryClient = useQueryClient();
  const totalPages = Math.ceil(total / pageSize);

  const handlePasswordChange = async (userId: string) => {
    setSelectedUserId(userId);
    setIsPasswordDialogOpen(true);
  };

  const handlePasswordSave = async () => {
    try {
      const { error } = await supabase.functions.invoke('update-user-password', {
        body: { 
          user_id: selectedUserId,
          new_password: newPassword
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Password updated successfully",
      });
      
      setIsPasswordDialogOpen(false);
      setNewPassword("");
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update password",
      });
    }
  };

  // Filter users based on search term and selected SBU
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      searchTerm === "" ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${user.first_name} ${user.last_name}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesSBU =
      selectedSBU === "all" ||
      user.user_sbus?.some(
        (sbu) => sbu.is_primary && sbu.sbu.id === selectedSBU
      );

    return matchesSearch && matchesSBU;
  });

  const handleExport = async () => {
    setExportProgress({
      isOpen: true,
      processed: 0,
      total: 0,
      error: "",
      isComplete: false,
    });

    try {
      const allRows: string[][] = [];
      for await (const batch of exportUsers((progress) => {
        setExportProgress((prev) => ({
          ...prev,
          processed: progress.processed,
          total: progress.total,
          error: progress.error || "",
        }));
      })) {
        allRows.push(...batch);
      }

      if (allRows.length > 0) {
        downloadCSV(allRows, `users-export-${new Date().toISOString()}.csv`);
        setExportProgress((prev) => ({ ...prev, isComplete: true }));
      }
    } catch (error: any) {
      setExportProgress((prev) => ({
        ...prev,
        error: error.message || "Export failed",
      }));
    }
  };

  const handleImport = () => {
    setIsImportDialogOpen(true);
  };

  const handleImportComplete = () => {
    queryClient.invalidateQueries({ queryKey: ["users"] });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <SearchFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedSBU={selectedSBU}
        setSelectedSBU={setSelectedSBU}
        onExport={handleExport}
        onImport={handleImport}
        sbus={sbus}
      />

      <Table>
        <UsersTableHeader />
        <TableBody>
          {filteredUsers.map((user) => (
            <UserRow
              key={user.id}
              user={user}
              onEdit={setUserToEdit}
              onDelete={onDelete}
              onPasswordChange={handlePasswordChange}
            />
          ))}
        </TableBody>
      </Table>

      <ImportDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onImportComplete={handleImportComplete}
      />

      <PasswordDialog
        isOpen={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
        newPassword={newPassword}
        onPasswordChange={setNewPassword}
        onSave={handlePasswordSave}
      />

      <ExportProgress
        open={exportProgress.isOpen}
        onOpenChange={(open) =>
          setExportProgress((prev) => ({ ...prev, isOpen: open }))
        }
        progress={exportProgress.processed}
        total={exportProgress.total}
        error={exportProgress.error}
        isComplete={exportProgress.isComplete}
      />

      <TablePagination
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />

      <EditUserDialog
        user={userToEdit}
        open={!!userToEdit}
        onOpenChange={(open) => !open && setUserToEdit(null)}
      />
    </div>
  );
}