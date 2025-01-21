import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface DetailsTabProps {
  sbuId: string | undefined;
}

export default function DetailsTab({ sbuId }: DetailsTabProps) {
  const { data: sbu, isLoading } = useQuery({
    queryKey: ["sbu", sbuId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sbus")
        .select(`
          *,
          head:profiles(
            id,
            first_name,
            last_name,
            email
          )
        `)
        .eq("id", sbuId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!sbuId,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!sbu) {
    return <div>SBU not found</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={sbu.profile_image_url || ""} />
          <AvatarFallback>{sbu.name.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-2xl font-bold">{sbu.name}</h2>
          {sbu.website && (
            <a
              href={sbu.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {sbu.website}
            </a>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold mb-1">Head</h3>
          <p>
            {sbu.head
              ? `${sbu.head.first_name} ${sbu.head.last_name}`
              : "No head assigned"}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold mb-1">Created</h3>
            <p>{format(new Date(sbu.created_at), "PPP")}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Last Updated</h3>
            <p>{format(new Date(sbu.updated_at), "PPP")}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}