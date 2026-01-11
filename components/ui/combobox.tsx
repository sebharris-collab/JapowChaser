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
    onSelect: (resortId: string) => void
    filterRegion?: string
    selectedResorts: string[]
}

export function ResortCombobox({ onSelect, filterRegion, selectedResorts }: ComboboxProps) {
    const [open, setOpen] = React.useState(false)

    const [query, setQuery] = React.useState("")

    const filteredResorts = JAPANESE_RESORTS.filter(r => {
        if (filterRegion && filterRegion !== "ALL" && r.region !== filterRegion) {
            return false
        }

        return r.name.toLowerCase().includes(query.toLowerCase())
    })


    return (
        <Popover open={open} onOpenChange={setOpen} modal={false}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[200px] justify-between text-foreground"
                >
                    Add Resort...
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-[200px] p-0" collisionPadding={10} >
                <Command shouldFilter={false}>
                    <CommandInput

                        placeholder="Search resort..."
                        value={query}
                        onValueChange={setQuery}
                    />

                    <CommandList>
                        {filteredResorts.length === 0 && (
                            <CommandEmpty>No resort found.</CommandEmpty>
                        )}

                        <CommandGroup>
                            {filteredResorts.map((resort) => {
                                const isSelected = selectedResorts.includes(resort.id)

                                return (
                                    <div
                                        key={resort.id}
                                        role="option"
                                        className={cn(
                                            "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                                            "hover:bg-accent hover:text-accent-foreground"
                                        )}
                                        onClick={() => onSelect(resort.id)}
                                    >
                                        {/* Checkmark slot */}
                                        <span className="mr-2 h-4 w-4 flex items-center justify-center">
                                            {isSelected && (
                                                <Check className="h-4 w-4 text-primary" />
                                            )}
                                        </span>

                                        {resort.name}
                                    </div>
                                )
                            })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
