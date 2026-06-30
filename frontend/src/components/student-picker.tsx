"use client";

import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown } from "lucide-react";

export type StudentOption = { id: string; name: string };

export function StudentPicker({
  students,
  value,
  onSelect,
  placeholder = "Search student by name...",
  className,
}: {
  students: StudentOption[];
  value: StudentOption | null;
  onSelect: (student: StudentOption) => void;
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const results = query.trim()
    ? students.filter((s) => s.name.toLowerCase().includes(query.trim().toLowerCase()))
    : students;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={<Button type="button" variant="outline" role="combobox" aria-expanded={open} className={`w-full justify-between font-normal ${className ?? ""}`} />}
      >
        <span className="truncate">{value ? value.name : placeholder}</span>
        <ChevronsUpDown className="h-4 w-4 opacity-50 flex-shrink-0" />
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <Command shouldFilter={false}>
          <CommandInput value={query} onValueChange={setQuery} placeholder="Type a student's name..." />
          <CommandList>
            {results.length === 0 && <CommandEmpty>No students found</CommandEmpty>}
            <CommandGroup>
              {results.map((s) => (
                <CommandItem
                  key={s.id}
                  value={s.id}
                  onSelect={() => {
                    onSelect(s);
                    setOpen(false);
                  }}
                >
                  {s.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
