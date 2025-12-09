import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
    value: number[]
    onValueChange: (value: number[]) => void
    max?: number
    min?: number
    step?: number
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
    ({ className, value, onValueChange, max = 100, min = 0, step = 1, ...props }, ref) => {
        const val = value[0] ?? min

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            onValueChange([parseFloat(e.target.value)])
        }

        return (
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={val}
                onChange={handleChange}
                className={cn(
                    "w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary",
                    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Slider.displayName = "Slider"

export { Slider }
