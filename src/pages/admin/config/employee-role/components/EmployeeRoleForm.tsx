import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const employeeRoleFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

type EmployeeRoleFormValues = z.infer<typeof employeeRoleFormSchema>;

interface EmployeeRoleFormProps {
  onSubmit: (values: EmployeeRoleFormValues) => void;
  initialValues?: EmployeeRoleFormValues;
  submitLabel?: string;
}

export function EmployeeRoleForm({ 
  onSubmit, 
  initialValues,
  submitLabel = "Create Employee Role" 
}: EmployeeRoleFormProps) {
  const form = useForm<EmployeeRoleFormValues>({
    resolver: zodResolver(employeeRoleFormSchema),
    defaultValues: initialValues || {
      name: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          {submitLabel}
        </Button>
      </form>
    </Form>
  );
}