import { MapPin, ExternalLink } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LocationActions } from "./LocationActions";
import type { Location } from "../types";

interface LocationTableProps {
  locations: Location[] | null;
  isLoading: boolean;
  onEdit: (location: Location) => void;
  onDelete: (id: string) => void;
}

export function LocationTable({ locations, isLoading, onEdit, onDelete }: LocationTableProps) {
  if (isLoading) {
    return (
      <TableRow>
        <TableCell colSpan={4} className="text-center">
          Loading...
        </TableCell>
      </TableRow>
    );
  }

  if (!locations?.length) {
    return (
      <TableRow>
        <TableCell colSpan={4} className="text-center">
          No locations found
        </TableCell>
      </TableRow>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Address</TableHead>
          <TableHead>Google Maps</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {locations.map((location) => (
          <TableRow key={location.id}>
            <TableCell className="font-medium">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                {location.name}
              </div>
            </TableCell>
            <TableCell>{location.address || "—"}</TableCell>
            <TableCell>
              {location.google_maps_url ? (
                <a
                  href={location.google_maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-500 hover:text-blue-700"
                >
                  View on Maps
                  <ExternalLink className="h-4 w-4 ml-1" />
                </a>
              ) : (
                "—"
              )}
            </TableCell>
            <TableCell className="text-right">
              <LocationActions 
                location={location} 
                onEdit={() => onEdit(location)} 
                onDelete={() => onDelete(location.id)} 
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}