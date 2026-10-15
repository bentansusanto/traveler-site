"use client";

import * as React from "react";
import { format } from "date-fns";
import { enUS, id, tr } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useLocale } from "next-intl";

interface DatePickerProps {
  date?: Date;
  setDate: (date?: Date) => void;
  placeholder?: string;
  className?: string;
  disabled?: (date: Date) => boolean;
  captionLayout?: "label" | "dropdown";
  startMonth?: Date;
  endMonth?: Date;
  defaultMonth?: Date;
  dateFormat?: string;
  reverseYears?: boolean;
}

export function DatePicker({
  date,
  setDate,
  placeholder = "Pilih tanggal",
  className,
  disabled,
  captionLayout = "label",
  startMonth,
  endMonth,
  defaultMonth,
  dateFormat,
  reverseYears
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const currentLocale = useLocale();

  const getDateFnsLocale = () => {
    switch (currentLocale) {
      case "id":
        return id;
      case "tr":
        return tr;
      default:
        return enUS;
    }
  };

  const selectedLocale = getDateFnsLocale();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "h-12 w-full justify-start rounded-xl border-gray-200 px-4 text-left font-medium",
            !date && "text-muted-foreground",
            className
          )}>
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          {date ? (
            format(date, dateFormat || "PPP", { locale: selectedLocale })
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 z-[350] bg-white" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(selectedDate) => {
            setDate(selectedDate);
            if (selectedDate) {
              setOpen(false);
            }
          }}
          initialFocus
          locale={selectedLocale}
          disabled={disabled}
          captionLayout={captionLayout}
          startMonth={startMonth}
          endMonth={endMonth}
          defaultMonth={defaultMonth || date}
          reverseYears={reverseYears}
        />
      </PopoverContent>
    </Popover>
  );
}
