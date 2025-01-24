import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User } from "../../types";
import { SearchFilters } from "./SearchFilters";
import { UserActions } from "./UserActions";
import { TablePagination } from "./TablePagination";
import { PasswordDialog } from "./PasswordDialog";
import EditUserDialog from "../EditUserDialog";
import { ExportProgress } from "./ExportProgress";
import { exportUsers, downloadCSV } from "../../utils/exportUsers";

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
  total,
  page,
  pageSize,
  isLoading,
  onPageChange,
  onDelete,
}: UserTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSBU, setSelectedSBU] = useState("all");
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [exportProgress, setExportProgress] = useState({
    isOpen: false,
    processed: 0,
    total: 0,
    error: "",
    isComplete: false
  });
  const [passwordDialog, setPasswordDialog] = useState<{
    isOpen: boolean;
    userId: string | null;
    newPassword: string;
  }>({
    isOpen: false,
    userId: null,
    newPassword: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const totalPages = Math.ceil(total / pageSize);

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
        (sbu) => sbu.is_primary && sbu.sbu.name === selectedSBU
      );

    return matchesSearch && matchesSBU;
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, isAdmin }: { userId: string; isAdmin: boolean }) => {
      const { error } = await supabase
        .from("user_roles")
        .update({ role: isAdmin ? "admin" : "user" })
        .eq("user_id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Success",
        description: "User role updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
      console.error("Error updating user role:", error);
    },
  });

  // Mutation for updating password
  const updatePasswordMutation = useMutation({
    mutationFn: async ({ userId, newPassword }: { userId: string; newPassword: string }) => {
      const response = await fetch("/api/update-user-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: userId, new_password: newPassword }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      setPasswordDialog({ isOpen: false, userId: null, newPassword: "" });
      toast({
        title: "Success",
        description: "Password updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update password",
        variant: "destructive",
      });
      console.error("Error updating password:", error);
    },
  });

  const handlePasswordUpdate = () => {
    if (passwordDialog.userId && passwordDialog.newPassword) {
      updatePasswordMutation.mutate({
        userId: passwordDialog.userId,
        newPassword: passwordDialog.newPassword,
      });
    }
  };

  const handleExport = async () => {
    setExportProgress({
      isOpen: true,
      processed: 0,
      total: 0,
      error: "",
      isComplete: false
    });

    try {
      const rows: string[][] = [];
      for await (const batch of exportUsers((progress) => {
        setExportProgress(prev => ({
          ...prev,
          processed: progress.processed,
          total: progress.total,
          error: progress.error || ""
        }));
      })) {
        rows.push(...batch);
      }

      if (rows.length > 0) {
        downloadCSV(rows, `users-export-${new Date().toISOString()}.csv`);
        setExportProgress(prev => ({ ...prev, isComplete: true }));
      }
    } catch (error: any) {
      setExportProgress(prev => ({
        ...prev,
        error: error.message || "Export failed"
      }));
      toast({
        variant: "destructive",
        title: "Export failed",
        description: error.message || "Failed to export users",
      });
    }
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
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Org ID</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Primary SBU</TableHead>
            <TableHead className="w-[200px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                {user.first_name || user.last_name
                  ? `${user.first_name || ""} ${user.last_name || ""}`
                  : "N/A"}
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.org_id || "N/A"}</TableCell>
              <TableCell className="space-x-2">
                <Badge variant={user.user_roles.role === "admin" ? "default" : "secondary"}>
                  {user.user_roles.role}
                </Badge>
                <Switch
                  checked={user.user_roles.role === "admin"}
                  onCheckedChange={(checked) =>
                    updateRoleMutation.mutate({ userId: user.id, isAdmin: checked })
                  }
                />
              </TableCell>
              <TableCell>
                {user.user_sbus?.find((sbu) => sbu.is_primary)?.sbu.name || "N/A"}
              </TableCell>
              <TableCell>
                <UserActions
                  user={user}
                  onEdit={setUserToEdit}
                  onDelete={onDelete}
                  onPasswordChange={(userId) =>
                    setPasswordDialog({
                      isOpen: true,
                      userId,
                      newPassword: "",
                    })
                  }
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ExportProgress
        open={exportProgress.isOpen}
        onOpenChange={(open) => setExportProgress(prev => ({ ...prev, isOpen: open }))}
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

      <PasswordDialog
        isOpen={passwordDialog.isOpen}
        onOpenChange={(open) =>
          setPasswordDialog({ isOpen: open, userId: null, newPassword: "" })
        }
        newPassword={passwordDialog.newPassword}
        onPasswordChange={(value) =>
          setPasswordDialog((prev) => ({
            ...prev,
            newPassword: value,
          }))
        }
        onSave={handlePasswordUpdate}
      />

      <EditUserDialog
        user={userToEdit}
        open={!!userToEdit}
        onOpenChange={(open) => !open && setUserToEdit(null)}
      />
    </div>
  );
}
