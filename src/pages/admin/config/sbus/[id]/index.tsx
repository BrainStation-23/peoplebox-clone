import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DetailsTab from "./components/DetailsTab";
import EmployeesTab from "./components/EmployeesTab";

export default function SBUDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  return (
    <div>
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Strategic Business Unit Details</h1>
      </div>

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          <DetailsTab sbuId={id} />
        </TabsContent>
        <TabsContent value="employees">
          <EmployeesTab sbuId={id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}