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
import type { LocationFormValues } from "../types";

const locationFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  google_maps_url: z.string().url().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
});

interface LocationFormProps {
  onSubmit: (values: LocationFormValues) => void;
  initialValues?: LocationFormValues;
  submitLabel?: string;
}

export function LocationForm({ onSubmit, initialValues, submitLabel = "Create Location" }: LocationFormProps) {
  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationFormSchema),
    defaultValues: initialValues || {
      name: "",
      google_maps_url: "",
      address: "",
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
          name="google_maps_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Google Maps URL (Optional)</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address (Optional)</FormLabel>
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