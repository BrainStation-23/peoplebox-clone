import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Survey } from "./types";
import { SearchBar } from "./components/SearchBar";
import { TagFilter } from "./components/TagFilter";
import { SurveyTable } from "./components/SurveyTable";
import { PreviewDialog } from "./components/PreviewDialog";

export default function SurveysPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [previewSurvey, setPreviewSurvey] = useState<Survey | null>(null);
  const { toast } = useToast();

  const { data: surveys, isLoading, refetch } = useQuery({
    queryKey: ['surveys'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('surveys')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Survey[];
    },
  });

  const handleDelete = async (surveyId: string) => {
    const { error } = await supabase
      .from('surveys')
      .delete()
      .eq('id', surveyId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete survey",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Survey deleted successfully",
      });
      refetch();
    }
  };

  const handleStatusChange = async (surveyId: string, status: 'draft' | 'published' | 'archived') => {
    const { error } = await supabase
      .from('surveys')
      .update({ status })
      .eq('id', surveyId);

    if (error) {
      toast({
        title: "Error",
        description: `Failed to ${status === 'published' ? 'publish' : status} survey`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Survey ${status === 'published' ? 'published' : status} successfully`,
      });
      refetch();
    }
  };

  const filteredSurveys = surveys?.filter(survey => {
    const matchesSearch = survey.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      survey.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTags = selectedTags.length === 0 ||
      selectedTags.every(tag => survey.tags?.includes(tag));

    return matchesSearch && matchesTags;
  });

  const allTags = Array.from(new Set(surveys?.flatMap(survey => survey.tags || []) || []));

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

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

      <div className="flex flex-col gap-4">
        <div className="flex gap-4">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <TagFilter
            tags={allTags}
            selectedTags={selectedTags}
            onTagToggle={handleTagToggle}
          />
        </div>

        {isLoading ? (
          <div>Loading...</div>
        ) : filteredSurveys?.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold">No surveys found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <SurveyTable
            surveys={filteredSurveys || []}
            onPreview={setPreviewSurvey}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
          />
        )}
      </div>

      <PreviewDialog
        survey={previewSurvey}
        onOpenChange={() => setPreviewSurvey(null)}
      />
    </div>
  );
}