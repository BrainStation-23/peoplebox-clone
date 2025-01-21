import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Mail } from "lucide-react";

interface EmployeeCardProps {
  employee: {
    first_name: string | null;
    last_name: string | null;
    email: string;
    profile_image_url: string | null;
    level: {
      name: string;
    } | null;
    user_roles: {
      role: "admin" | "user";
    }[];
    user_supervisors: {
      supervisor: {
        id: string;
        first_name: string | null;
        last_name: string | null;
      };
      is_primary: boolean | null;
    }[];
    user_sbus?: {
      sbu: {
        id: string;
        name: string;
      };
      is_primary: boolean | null;
    }[];
  };
  isPrimarySBU: boolean | null;
}

export default function EmployeeCard({ employee, isPrimarySBU }: EmployeeCardProps) {
  const fullName = `${employee.first_name || ""} ${employee.last_name || ""}`.trim();
  const role = employee.user_roles[0]?.role;
  const primarySupervisor = employee.user_supervisors?.find(
    (s) => s.is_primary
  )?.supervisor;
  const otherSupervisors = employee.user_supervisors
    ?.filter((s) => !s.is_primary)
    .map((s) => s.supervisor) || [];
  const otherSBUs = employee.user_sbus
    ?.filter((sbu) => !sbu.is_primary)
    .map((sbu) => sbu.sbu) || [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar>
          <AvatarImage src={employee.profile_image_url || ""} />
          <AvatarFallback>
            {fullName
              ? fullName.substring(0, 2).toUpperCase()
              : employee.email.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{fullName || employee.email}</h3>
            {isPrimarySBU && (
              <Badge variant="secondary" className="ml-2">
                Primary
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span>{employee.email}</span>
          </div>
          <div className="flex gap-2 mt-2">
            {role && (
              <Badge variant={role === "admin" ? "destructive" : "default"}>
                {role}
              </Badge>
            )}
            {employee.level && <Badge variant="outline">{employee.level.name}</Badge>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {primarySupervisor && (
          <>
            <div>
              <h4 className="text-sm font-semibold mb-1">Primary Supervisor</h4>
              <p className="text-sm">
                {`${primarySupervisor.first_name || ""} ${
                  primarySupervisor.last_name || ""
                }`.trim()}
              </p>
            </div>
            <Separator />
          </>
        )}
        
        {otherSupervisors.length > 0 && (
          <>
            <div>
              <h4 className="text-sm font-semibold mb-1">Other Supervisors</h4>
              <ul className="text-sm space-y-1">
                {otherSupervisors.map((supervisor) => (
                  <li key={supervisor.id}>
                    {`${supervisor.first_name || ""} ${
                      supervisor.last_name || ""
                    }`.trim()}
                  </li>
                ))}
              </ul>
            </div>
            <Separator />
          </>
        )}

        {otherSBUs.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-1">Other SBUs</h4>
            <ul className="text-sm space-y-1">
              {otherSBUs.map((sbu) => (
                <li key={sbu.id}>{sbu.name}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}