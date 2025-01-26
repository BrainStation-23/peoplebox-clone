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

const employeeTypeFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

type EmployeeTypeFormValues = z.infer<typeof employeeTypeFormSchema>;

interface EmployeeTypeFormProps {
  onSubmit: (values: EmployeeTypeFormValues) => void;
  initialValues?: EmployeeTypeFormValues;
  submitLabel?: string;
}

export function EmployeeTypeForm({ 
  onSubmit, 
  initialValues,
  submitLabel = "Create Employee Type" 
}: EmployeeTypeFormProps) {
  const form = useForm<EmployeeTypeFormValues>({
    resolver: zodResolver(employeeTypeFormSchema),
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