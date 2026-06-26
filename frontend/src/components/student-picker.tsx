"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown, Search } from "lucide-react";

type StudentResult = { user_id: string; name: string };

export function StudentPicker({
  value,
  onSelect,
  placeholder = "Search student by name...",
  className,
}: {
  value: StudentResult | null;
  onSelect: (student: StudentResult) => void;
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: results = [], isFetching } = useQuery({
    queryKey: ["search-students", debounced],
    queryFn: async () => {
      const res = await api.get(`/discipline/search-students/${encodeURIComponent(debounced)}`);
      return Array.isArray(res.data) ? (res.data as StudentResult[]) : [];
    },
    enabled: debounced.length > 0,
  });

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
            {isFetching && <div className="py-6 text-center text-sm text-muted-foreground">Searching...</div>}
            {!isFetching && debounced.length === 0 && (
              <div className="py-6 text-center text-sm text-muted-foreground flex flex-col items-center gap-1.5">
                <Search className="h-4 w-4 opacity-40" />
                Start typing a name
              </div>
            )}
            {!isFetching && debounced.length > 0 && <CommandEmpty>No students found</CommandEmpty>}
            <CommandGroup>
              {results.map((s) => (
                <CommandItem
                  key={s.user_id}
                  value={s.user_id}
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
