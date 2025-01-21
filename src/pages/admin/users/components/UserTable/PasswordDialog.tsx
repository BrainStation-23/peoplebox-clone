import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PasswordDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newPassword: string;
  onPasswordChange: (value: string) => void;
  onSave: () => void;
}

export function PasswordDialog({
  isOpen,
  onOpenChange,
  newPassword,
  onPasswordChange,
  onSave,
}: PasswordDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
              value={newPassword}
              onChange={(e) => onPasswordChange(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onSave}>Save Password</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}