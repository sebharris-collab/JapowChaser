"use strict"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { JAPANESE_RESORTS } from "@/lib/constants"

interface ComboboxProps {
    onSelect: (resortId: string) => void;
    filterRegion?: string;
}

export function ResortCombobox({ onSelect, filterRegion }: ComboboxProps) {
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState("")

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[200px] justify-between text-foreground"
                >
                    {value
                        ? JAPANESE_RESORTS.find((resort) => resort.id === value)?.name
                        : "Add Resort..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandInput placeholder="Search resort..." />
                    <CommandList>
                        <CommandEmpty>No resort found.</CommandEmpty>
                        <CommandGroup>
                            {JAPANESE_RESORTS
                                .filter(r => !filterRegion || filterRegion === "ALL" || r.region === filterRegion)
                                .map((resort) => (
                                    <CommandItem
                                        key={resort.id}
                                        value={resort.name}
                                        onSelect={(currentValue) => {
                                            // CommandItem value uses the name (label), so we find the ID
                                            const selectedResort = JAPANESE_RESORTS.find((r) => r.name.toLowerCase() === currentValue.toLowerCase());
                                            if (selectedResort) {
                                                setValue(selectedResort.id);
                                                onSelect(selectedResort.id);
                                            }
                                            setOpen(false)
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                value === resort.id ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {resort.name}
                                    </CommandItem>
                                ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
