import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, UserSBU, Level } from "../types";

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
  const [sbuSearch, setSbuSearch] = useState("");
  const queryClient = useQueryClient();

  // Form state
  const [firstName, setFirstName] = useState(user?.first_name || "");
  const [lastName, setLastName] = useState(user?.last_name || "");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [selectedSBUs, setSelectedSBUs] = useState<Set<string>>(new Set());
  const [primarySBU, setPrimarySBU] = useState<string>("");

  // Fetch levels
  const { data: levels } = useQuery({
    queryKey: ["levels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("levels")
        .select("*")
        .eq("status", "active");
      
      if (error) throw error;
      return data as Level[];
    },
    enabled: open,
  });

  // Fetch SBUs
  const { data: sbus } = useQuery({
    queryKey: ["sbus", sbuSearch],
    queryFn: async () => {
      let query = supabase.from("sbus").select("*");
      
      if (sbuSearch) {
        query = query.ilike("name", `%${sbuSearch}%`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  // Fetch user's current SBUs
  const { data: userSBUs } = useQuery({
    queryKey: ["user_sbus", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_sbus")
        .select("*, sbu:sbus(id, name)")
        .eq("user_id", user?.id);
      
      if (error) throw error;
      return data as UserSBU[];
    },
    enabled: !!user?.id && open,
    onSuccess: (data) => {
      const sbuIds = new Set(data.map(us => us.sbu_id));
      setSelectedSBUs(sbuIds);
      const primary = data.find(us => us.is_primary);
      if (primary) {
        setPrimarySBU(primary.sbu_id);
      }
    }
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      if (!user) return;

      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          first_name: firstName,
          last_name: lastName,
          level_id: selectedLevel || null,
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Update SBU assignments
      const { error: sbuDeleteError } = await supabase
        .from("user_sbus")
        .delete()
        .eq("user_id", user.id);

      if (sbuDeleteError) throw sbuDeleteError;

      if (selectedSBUs.size > 0) {
        const sbuInserts = Array.from(selectedSBUs).map(sbuId => ({
          user_id: user.id,
          sbu_id: sbuId,
          is_primary: sbuId === primarySBU
        }));

        const { error: sbuInsertError } = await supabase
          .from("user_sbus")
          .insert(sbuInserts);

        if (sbuInsertError) throw sbuInsertError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user_sbus"] });
      toast.success("Profile updated successfully");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Failed to update profile");
      console.error("Error updating profile:", error);
    }
  });

  const handleSave = () => {
    updateProfileMutation.mutate();
  };

  const handleSBUChange = (sbuId: string, checked: boolean) => {
    const newSelectedSBUs = new Set(selectedSBUs);
    if (checked) {
      newSelectedSBUs.add(sbuId);
    } else {
      newSelectedSBUs.delete(sbuId);
      if (primarySBU === sbuId) {
        setPrimarySBU("");
      }
    }
    setSelectedSBUs(newSelectedSBUs);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList>
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="sbus">SBU Assignment</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="profileImage">Profile Image URL</Label>
                <Input
                  id="profileImage"
                  value={profileImageUrl}
                  onChange={(e) => setProfileImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="grid gap-2">
                <Label>Level</Label>
                <RadioGroup
                  value={selectedLevel}
                  onValueChange={setSelectedLevel}
                  className="flex flex-wrap gap-4"
                >
                  {levels?.map((level) => (
                    <div key={level.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={level.id} id={level.id} />
                      <Label htmlFor={level.id}>{level.name}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sbus" className="space-y-4">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search SBUs..."
                value={sbuSearch}
                onChange={(e) => setSbuSearch(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              {sbus?.map((sbu) => (
                <div key={sbu.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`sbu-${sbu.id}`}
                      checked={selectedSBUs.has(sbu.id)}
                      onCheckedChange={(checked) => handleSBUChange(sbu.id, checked as boolean)}
                    />
                    <Label htmlFor={`sbu-${sbu.id}`}>{sbu.name}</Label>
                  </div>
                  
                  {selectedSBUs.has(sbu.id) && (
                    <div className="flex items-center space-x-2">
                      <RadioGroup
                        value={primarySBU}
                        onValueChange={setPrimarySBU}
                        className="flex"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value={sbu.id} id={`primary-${sbu.id}`} />
                          <Label htmlFor={`primary-${sbu.id}`}>Primary</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateProfileMutation.isPending}
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}