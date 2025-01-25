import { useNavigate } from "react-router-dom";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { User } from "../../types";

export interface UserActionsProps {
  user: User;
  onDelete: (userId: string) => void;
  onPasswordChange: (userId: string) => void;
  onEdit: (user: User) => void;
}

const UserActions = ({ user, onDelete, onPasswordChange, onEdit }: UserActionsProps) => {
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(user)}>
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onPasswordChange(user.id)}>
          Change Password
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDelete(user.id)}>
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserActions;