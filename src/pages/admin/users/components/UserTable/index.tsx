import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { User } from "../../types";
import { TableContainer } from "./TableContainer";
import { TablePagination } from "./TablePagination";
import EditUserDialog from "../EditUserDialog";
import { ExportProgress } from "./ExportProgress";
import { ImportDialog } from "../ImportDialog";
import { useUserFilters } from "../../hooks/useUserFilters";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UserTableProps {
  users: User[];
  isLoading: boolean;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onDelete: (userId: string) => void;
  onPasswordChange: (userId: string) => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedSBU: string;
  onPageSizeChange: (size: number) => void;
}

export default function UserTable({
  users,
  isLoading,
  page,
  pageSize,
  total,
  onPageChange,
  onDelete,
  onPasswordChange,
  searchTerm,
  setSearchTerm,
  selectedSBU,
  onPageSizeChange,
}: UserTableProps) {
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { filteredUsers } = useUserFilters(users, selectedSBU);

  const handleImportComplete = () => {
    queryClient.invalidateQueries({ queryKey: ["users"] });
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-4">
        <Select value={pageSize.toString()} onValueChange={(value) => onPageSizeChange(Number(value))}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select page size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5 per page</SelectItem>
            <SelectItem value="10">10 per page</SelectItem>
            <SelectItem value="20">20 per page</SelectItem>
            <SelectItem value="50">50 per page</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="relative min-h-[400px]">
        <TableContainer
          users={filteredUsers}
          onEdit={setUserToEdit}
          onDelete={onDelete}
          onPasswordChange={onPasswordChange}
          isLoading={isLoading}
        />
      </div>

      <ImportDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onImportComplete={handleImportComplete}
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