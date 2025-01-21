import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export default function SurveysPage() {
  const { data: surveys, isLoading } = useQuery({
    queryKey: ['surveys'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('surveys')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Surveys</h1>
        <Button asChild>
          <Link to="/admin/surveys/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Survey
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : surveys?.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold">No surveys yet</h3>
          <p className="text-muted-foreground">Get started by creating your first survey.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {surveys?.map((survey) => (
            <div
              key={survey.id}
              className="p-4 border rounded-lg hover:border-primary transition-colors"
            >
              <h3 className="font-semibold">{survey.name}</h3>
              {survey.description && (
                <p className="text-sm text-muted-foreground mt-1">{survey.description}</p>
              )}
              <div className="flex gap-2 mt-2">
                {survey.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}