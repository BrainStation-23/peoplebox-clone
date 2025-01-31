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
import { ProfileSearchInput } from "./ProfileSearchInput";

const sbuFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  profile_image_url: z.string().url().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  head_id: z.string().uuid().optional(),
});

export type SBUFormValues = z.infer<typeof sbuFormSchema>;

interface SBUFormProps {
  onSubmit: (values: SBUFormValues) => void;
  initialValues?: SBUFormValues;
  submitLabel?: string;
}

export function SBUForm({ onSubmit, initialValues, submitLabel = "Create SBU" }: SBUFormProps) {
  const form = useForm<SBUFormValues>({
    resolver: zodResolver(sbuFormSchema),
    defaultValues: initialValues || {
      name: "",
      profile_image_url: "",
      website: "",
      head_id: undefined,
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
        <FormField
          control={form.control}
          name="profile_image_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profile Image URL (Optional)</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website (Optional)</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="head_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SBU Head (Optional)</FormLabel>
              <FormControl>
                <ProfileSearchInput
                  value={field.value}
                  onChange={field.onChange}
                />
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