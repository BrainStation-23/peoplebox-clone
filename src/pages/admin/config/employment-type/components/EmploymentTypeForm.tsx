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

const employmentTypeFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

type EmploymentTypeFormValues = z.infer<typeof employmentTypeFormSchema>;

interface EmploymentTypeFormProps {
  onSubmit: (values: EmploymentTypeFormValues) => void;
  initialValues?: EmploymentTypeFormValues;
  submitLabel?: string;
}

export function EmploymentTypeForm({ 
  onSubmit, 
  initialValues,
  submitLabel = "Create Employment Type" 
}: EmploymentTypeFormProps) {
  const form = useForm<EmploymentTypeFormValues>({
    resolver: zodResolver(employmentTypeFormSchema),
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