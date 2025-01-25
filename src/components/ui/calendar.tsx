import * as React from "react";
import { ChevronLeft, ChevronRight, ChevronsUpDown } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  // Get initial year safely from props.selected
  const getInitialYear = () => {
    if (!props.selected) return new Date().getFullYear();
    if (props.selected instanceof Date) return props.selected.getFullYear();
    if (Array.isArray(props.selected) && props.selected[0]) 
      return props.selected[0].getFullYear();
    return new Date().getFullYear();
  };

  const [selectedYear, setSelectedYear] = React.useState<number>(getInitialYear());
  const [isYearPickerOpen, setIsYearPickerOpen] = React.useState(false);

  // Generate century options for quick navigation
  const centuries = React.useMemo(() => {
    const result = [];
    for (let year = 1900; year <= 3000; year += 100) {
      result.push({
        start: year,
        end: year + 99,
        label: `${year}-${year + 99}`,
      });
    }
    return result;
  }, []);

  const handleYearInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const year = parseInt(e.target.value);
    if (!isNaN(year) && year >= 1900 && year <= 3000) {
      setSelectedYear(year);
    }
  };

  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    setIsYearPickerOpen(false);
  };

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center items-center pt-1 relative",
        caption_label: "hidden",
        caption_dropdowns: "flex gap-1",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        vhidden: "hidden",
        dropdown: "relative",
        dropdown_month: "text-sm rounded-md p-1 hover:bg-accent",
        dropdown_year: "w-[70px] text-sm rounded-md p-1",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
        Dropdown: ({ value, onChange, children, ...dropdownProps }) => {
          const isYearDropdown = dropdownProps.name === "year";

          if (!isYearDropdown) {
            return (
              <select
                value={value}
                onChange={onChange}
                className="text-sm rounded-md p-1 hover:bg-accent"
              >
                {children}
              </select>
            );
          }

          return (
            <div className="relative">
              <Popover open={isYearPickerOpen} onOpenChange={setIsYearPickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[100px] justify-between text-sm font-normal"
                  >
                    {selectedYear}
                    <ChevronsUpDown className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0" align="start">
                  <div className="flex flex-col gap-2 p-2">
                    <Input
                      type="number"
                      value={selectedYear}
                      onChange={handleYearInput}
                      min={1900}
                      max={3000}
                      className="text-sm"
                    />
                    <div className="max-h-[200px] overflow-y-auto">
                      {centuries.map((century) => (
                        <div key={century.start} className="mb-2">
                          <div className="text-sm font-semibold text-muted-foreground px-2 py-1">
                            {century.label}
                          </div>
                          <div className="grid grid-cols-5 gap-1">
                            {Array.from(
                              { length: 100 },
                              (_, i) => century.start + i
                            ).map((year) => (
                              <Button
                                key={year}
                                variant="ghost"
                                className="h-7 text-xs"
                                onClick={() => handleYearSelect(year)}
                              >
                                {year}
                              </Button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          );
        },
      }}
      captionLayout="dropdown"
      fromYear={1900}
      toYear={3000}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };