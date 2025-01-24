import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface BasicInfoTabProps {
  firstName: string;
  setFirstName: (value: string) => void;
  lastName: string;
  setLastName: (value: string) => void;
  profileImageUrl: string;
  setProfileImageUrl: (value: string) => void;
  orgId: string;
  setOrgId: (value: string) => void;
  gender: string;
  setGender: (value: string) => void;
  dateOfBirth: Date | undefined;
  setDateOfBirth: (value: Date | undefined) => void;
}

export function BasicInfoTab({
  firstName,
  setFirstName,
  lastName,
  setLastName,
  profileImageUrl,
  setProfileImageUrl,
  orgId,
  setOrgId,
  gender,
  setGender,
  dateOfBirth,
  setDateOfBirth,
}: BasicInfoTabProps) {
  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={profileImageUrl} />
          <AvatarFallback>
            {firstName?.charAt(0)}{lastName?.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="grid gap-2">
          <Label htmlFor="profileImage">Profile Image URL</Label>
          <Input
            id="profileImage"
            value={profileImageUrl}
            onChange={(e) => setProfileImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
        </div>
      </div>

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
        <Label htmlFor="orgId">Organization ID</Label>
        <Input
          id="orgId"
          value={orgId}
          onChange={(e) => setOrgId(e.target.value)}
          placeholder="Enter organization ID"
        />
      </div>

      <div className="grid gap-2">
        <Label>Gender</Label>
        <RadioGroup
          value={gender}
          onValueChange={setGender}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="male" id="male" />
            <Label htmlFor="male">Male</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="female" id="female" />
            <Label htmlFor="female">Female</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="other" id="other" />
            <Label htmlFor="other">Other</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="grid gap-2">
        <Label>Date of Birth</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !dateOfBirth && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateOfBirth ? format(dateOfBirth, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateOfBirth}
              onSelect={setDateOfBirth}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}