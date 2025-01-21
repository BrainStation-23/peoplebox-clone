import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
  PaginationLink,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, Trash2, Key, Search } from "lucide-react";
import { User } from "../types";
import EditUserDialog from "./EditUserDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSBU, setSelectedSBU] = useState("");
  const [passwordDialog, setPasswordDialog] = useState<{
    isOpen: boolean;
    userId: string | null;
    newPassword: string;
  }>({
    isOpen: false,
    userId: null,
    newPassword: "",
  });
  const totalPages = Math.ceil(total / pageSize);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get unique SBUs from users
  const uniqueSBUs = Array.from(
    new Set(
      users
        .flatMap((user) => user.user_sbus || [])
        .filter((sbu) => sbu.is_primary)
        .map((sbu) => sbu.sbu.name)
    )
  );

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

  // Mutation for updating user role
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

  const handleDelete = async () => {
    if (userToDelete) {
      await onDelete(userToDelete);
      setUserToDelete(null);
    }
  };

  const handlePasswordUpdate = () => {
    if (passwordDialog.userId && passwordDialog.newPassword) {
      updatePasswordMutation.mutate({
        userId: passwordDialog.userId,
        newPassword: passwordDialog.newPassword,
      });
    }
  };

  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    const halfVisible = Math.floor(maxVisiblePages / 2);
    
    let startPage = Math.max(1, page - halfVisible);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <Button
            variant={i === page ? "outline" : "ghost"}
            onClick={() => onPageChange(i)}
            className="cursor-pointer"
          >
            <PaginationLink isActive={i === page}>
              {i}
            </PaginationLink>
          </Button>
        </PaginationItem>
      );
    }
    
    return items;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by email or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={selectedSBU} onValueChange={setSelectedSBU}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by Primary SBU" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All SBUs</SelectItem>
            {uniqueSBUs.map((sbu) => (
              <SelectItem key={sbu} value={sbu}>
                {sbu}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
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
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setUserToEdit(user)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setPasswordDialog({
                        isOpen: true,
                        userId: user.id,
                        newPassword: "",
                      })
                    }
                  >
                    <Key className="h-4 w-4" />
                  </Button>
                  <AlertDialog
                    open={userToDelete === user.id}
                    onOpenChange={(open) => !open && setUserToDelete(null)}
                  >
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setUserToDelete(user.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete User</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this user? This action
                          cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog
        open={passwordDialog.isOpen}
        onOpenChange={(open) =>
          setPasswordDialog({ isOpen: open, userId: null, newPassword: "" })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={passwordDialog.newPassword}
                onChange={(e) =>
                  setPasswordDialog((prev) => ({
                    ...prev,
                    newPassword: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handlePasswordUpdate}>Save Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EditUserDialog
        user={userToEdit}
        open={!!userToEdit}
        onOpenChange={(open) => !open && setUserToEdit(null)}
      />

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <Button
              variant="ghost"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="cursor-pointer"
            >
              <PaginationPrevious />
            </Button>
          </PaginationItem>
          {renderPaginationItems()}
          <PaginationItem>
            <Button
              variant="ghost"
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              className="cursor-pointer"
            >
              <PaginationNext />
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
