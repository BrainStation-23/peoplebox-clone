import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDebounce } from "@/hooks/use-debounce";
import { useSearchProfiles } from "../hooks/useSearchProfiles";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
}

interface ProfileSearchInputProps {
  value?: string;
  onChange: (value: string | undefined) => void;
}

export function ProfileSearchInput({ value, onChange }: ProfileSearchInputProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const { data, isLoading } = useSearchProfiles(debouncedSearch);
  const profiles = (data?.data || []) as Profile[];

  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (value && !selectedProfile) {
      // Fetch initial profile if value exists
      const fetchProfile = async () => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, email, first_name, last_name")
          .eq("id", value)
          .single();
        
        if (profile) {
          setSelectedProfile(profile);
        }
      };
      fetchProfile();
    }
  }, [value]);

  const handleSelect = (profile: Profile) => {
    setSelectedProfile(profile);
    onChange(profile.id);
    setOpen(false);
  };

  const handleClear = () => {
    setSelectedProfile(null);
    onChange(undefined);
  };

  return (
    <div className="flex flex-col gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between"
          >
            {selectedProfile ? (
              <span>
                {selectedProfile.first_name} {selectedProfile.last_name} ({selectedProfile.email})
              </span>
            ) : (
              "Search for a user..."
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search by name, email, or ID..."
              value={search}
              onValueChange={setSearch}
            />
            {isLoading && (
              <CommandEmpty>Loading...</CommandEmpty>
            )}
            {!isLoading && profiles.length === 0 && (
              <CommandEmpty>No users found.</CommandEmpty>
            )}
            <CommandGroup>
              {profiles.map((profile: Profile) => (
                <CommandItem
                  key={profile.id}
                  value={profile.id}
                  onSelect={() => handleSelect(profile)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedProfile?.id === profile.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span>
                      {profile.first_name} {profile.last_name}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {profile.email}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      {selectedProfile && (
        <Button
          variant="ghost"
          size="sm"
          className="self-end"
          onClick={handleClear}
        >
          <X className="h-4 w-4 mr-2" />
          Clear selection
        </Button>
      )}
    </div>
  );
}