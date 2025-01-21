import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from "../../types";
import { BasicInfoTab } from "./BasicInfoTab";
import { SBUAssignmentTab } from "./SBUAssignmentTab";
import { ManagementTab } from "./ManagementTab";
import { useProfileManagement } from "../../hooks/useProfileManagement";
import { useSBUManagement } from "../../hooks/useSBUManagement";
import { useSupervisorManagement } from "../../hooks/useSupervisorManagement";
import { toast } from "sonner";

interface EditUserDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditUserDialog({
  user,
  open,
  onOpenChange,
}: EditUserDialogProps) {
  const {
    firstName,
    setFirstName,
    lastName,
    setLastName,
    profileImageUrl,
    setProfileImageUrl,
    selectedLevel,
    setSelectedLevel,
    profileError,
    updateProfileMutation,
  } = useProfileManagement(user);

  const {
    sbus,
    sbuSearch,
    setSbuSearch,
    selectedSBUs,
    primarySBU,
    handleSBUChange,
    handlePrimarySBUChange,
  } = useSBUManagement(user);

  const {
    supervisors,
    handleSupervisorChange,
    handlePrimarySupervisorChange,
  } = useSupervisorManagement(user);

  useEffect(() => {
    if (profileError) {
      console.error("Profile fetch error:", profileError);
      toast.error("Failed to load profile data");
    }
  }, [profileError]);

  const handleSave = () => {
    console.log("Save button clicked with state:", {
      firstName,
      lastName,
      selectedLevel,
    });
    updateProfileMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Make changes to the user profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList>
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="sbus">SBU Assignment</TabsTrigger>
            <TabsTrigger value="management">Management</TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <BasicInfoTab
              firstName={firstName}
              setFirstName={setFirstName}
              lastName={lastName}
              setLastName={setLastName}
              profileImageUrl={profileImageUrl}
              setProfileImageUrl={setProfileImageUrl}
              selectedLevel={selectedLevel}
              setSelectedLevel={setSelectedLevel}
            />
          </TabsContent>

          <TabsContent value="sbus">
            <SBUAssignmentTab
              sbus={sbus}
              sbuSearch={sbuSearch}
              setSbuSearch={setSbuSearch}
              selectedSBUs={selectedSBUs}
              handleSBUChange={handleSBUChange}
              primarySBU={primarySBU}
              handlePrimarySBUChange={handlePrimarySBUChange}
            />
          </TabsContent>

          <TabsContent value="management">
            {user && (
              <ManagementTab
                user={user}
                supervisors={supervisors}
                onSupervisorChange={handleSupervisorChange}
                onPrimarySupervisorChange={handlePrimarySupervisorChange}
              />
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={updateProfileMutation.isPending}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}