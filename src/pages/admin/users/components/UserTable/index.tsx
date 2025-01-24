import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { User } from "../../types";
import { TableContainer } from "./TableContainer";
import { TablePagination } from "./TablePagination";
import EditUserDialog from "../EditUserDialog";
import { ExportProgress } from "./ExportProgress";
import { ImportDialog } from "../ImportDialog";
import { PasswordDialog } from "./PasswordDialog";
import { exportUsers } from "../../utils/exportUsers";
import { usePasswordManagement } from "../../hooks/usePasswordManagement";
import { useUserFilters } from "../../hooks/useUserFilters";

interface UserTableProps {
  users: User[];
  isLoading: boolean;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onDelete: (userId: string) => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

export default function UserTable({
  users,
  isLoading,
  page,
  pageSize,
  total,
  onPageChange,
  onDelete,
  searchTerm,
  setSearchTerm,
}: UserTableProps) {
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
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

  const handleImportComplete = () => {
    queryClient.invalidateQueries({ queryKey: ["users"] });
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-4">
      <div className="relative min-h-[400px]">
        <TableContainer
          users={filteredUsers}
          onEdit={setUserToEdit}
          onDelete={onDelete}
          onPasswordChange={handlePasswordChange}
          isLoading={isLoading}
        />
      </div>

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