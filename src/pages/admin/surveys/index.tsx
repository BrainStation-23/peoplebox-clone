import { useQuery } from "@tanstack/react-query";
import { Edit, Eye, Plus, Search, Tags, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Survey } from "./types";
import { Model } from "survey-core";
import { Survey as SurveyComponent } from "survey-react-ui";
import "survey-core/defaultV2.min.css";

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
      .update({ status: 'archived' })
      .eq('id', surveyId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to archive survey",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Survey archived successfully",
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
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search surveys..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9"
            />
          </div>
          <div className="flex gap-2">
            {allTags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => {
                  setSelectedTags(prev =>
                    prev.includes(tag)
                      ? prev.filter(t => t !== tag)
                      : [...prev, tag]
                  );
                }}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div>Loading...</div>
        ) : filteredSurveys?.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold">No surveys found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSurveys?.map((survey) => (
                <TableRow key={survey.id}>
                  <TableCell className="font-medium">{survey.name}</TableCell>
                  <TableCell>{survey.description}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {survey.tags?.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          <Tags className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        survey.status === "published"
                          ? "default"
                          : survey.status === "archived"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {survey.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setPreviewSurvey(survey)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                      >
                        <Link to={`/admin/surveys/${survey.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(survey.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={!!previewSurvey} onOpenChange={() => setPreviewSurvey(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{previewSurvey?.name}</DialogTitle>
            <DialogDescription>
              {previewSurvey?.description}
            </DialogDescription>
          </DialogHeader>
          {previewSurvey && (
            <div className="mt-4">
              <SurveyComponent model={new Model(previewSurvey.json_data)} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}