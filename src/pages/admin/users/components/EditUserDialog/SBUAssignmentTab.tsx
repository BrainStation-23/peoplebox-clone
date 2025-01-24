import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Plus, Minus, Search } from "lucide-react";
import { User } from "../../types";
import { useSBUManagement } from "../../hooks/useSBUManagement";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface SBUAssignmentTabProps {
  user: User;
}

export function SBUAssignmentTab({ user }: SBUAssignmentTabProps) {
  const {
    sbus,
    sbuSearch,
    setSbuSearch,
    selectedSBUs,
    primarySBU,
    handleSBUChange,
    handlePrimarySBUChange,
  } = useSBUManagement(user);

  const availableSBUs = sbus?.filter(sbu => !selectedSBUs.has(sbu.id)) || [];
  const assignedSBUs = sbus?.filter(sbu => selectedSBUs.has(sbu.id)) || [];

  return (
    <div className="flex gap-6 h-[600px]">
      {/* Left Column - Available SBUs */}
      <div className="w-5/12 flex flex-col">
        <div className="mb-4">
          <Label className="text-lg font-semibold">Available SBUs</Label>
          <div className="relative mt-2">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search SBUs..."
              value={sbuSearch}
              onChange={(e) => setSbuSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <ScrollArea className="flex-1 border rounded-lg">
          <div className="p-4 space-y-3">
            {availableSBUs.map((sbu) => (
              <Card key={sbu.id} className="p-3 hover:bg-accent transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{sbu.name}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleSBUChange(sbu.id, true)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
            {availableSBUs.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No available SBUs found
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Vertical Divider */}
      <Separator orientation="vertical" className="h-full" />

      {/* Right Column - Assigned SBUs */}
      <div className="w-7/12 flex flex-col">
        <Label className="text-lg font-semibold mb-4">
          Assigned SBUs ({assignedSBUs.length})
        </Label>
        <ScrollArea className="flex-1 border rounded-lg">
          <div className="p-4">
            <RadioGroup
              value={primarySBU}
              onValueChange={handlePrimarySBUChange}
              className="space-y-3"
            >
              {assignedSBUs.map((sbu) => (
                <Card
                  key={sbu.id}
                  className={`p-4 transition-colors ${
                    primarySBU === sbu.id ? "border-primary" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <RadioGroupItem value={sbu.id} id={`primary-${sbu.id}`} />
                      <div className="flex flex-col">
                        <Label htmlFor={`primary-${sbu.id}`} className="font-medium">
                          {sbu.name}
                        </Label>
                        {primarySBU === sbu.id && (
                          <span className="text-sm text-muted-foreground">
                            Primary SBU
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleSBUChange(sbu.id, false)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
              {assignedSBUs.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  No SBUs assigned yet
                </div>
              )}
            </RadioGroup>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}