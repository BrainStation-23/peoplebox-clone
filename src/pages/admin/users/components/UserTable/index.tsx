import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { User } from "../../types";
import { SearchFilters } from "./SearchFilters";
import { TableContainer } from "./TableContainer";
import { TablePagination } from "./TablePagination";
import EditUserDialog from "../EditUserDialog";
import { ExportProgress } from "./ExportProgress";
import { ImportDialog } from "../ImportDialog";
import { PasswordDialog } from "./PasswordDialog";
import { exportUsers, downloadCSV } from "../../utils/exportUsers";
import { usePasswordManagement } from "../../hooks/usePasswordManagement";
import { useUserFilters } from "../../hooks/useUserFilters";
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
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const { data: sbus = [] } = useSBUs();
  const queryClient = useQueryClient();

  const {
    isPasswordDialogOpen,
    setIsPasswordDialogOpen,
    newPassword,
    setNewPassword,
    handlePasswordChange,
    handlePasswordSave
  } = usePasswordManagement();

  const {
    searchTerm,
    setSearchTerm,
    selectedSBU,
    setSelectedSBU,
    filteredUsers
  } = useUserFilters(users);

  const [exportProgress, setExportProgress] = useState({
    isOpen: false,
    processed: 0,
    total: 0,
    error: "",
    isComplete: false,
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

  const totalPages = Math.ceil(total / pageSize);

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

      <TableContainer
        users={filteredUsers}
        onEdit={setUserToEdit}
        onDelete={onDelete}
        onPasswordChange={handlePasswordChange}
      />

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