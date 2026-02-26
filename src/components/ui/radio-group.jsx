import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { Circle } from "lucide-react"

import { cn } from "@/lib/utils"

const RadioGroup = React.forwardRef(({ className, ...props }, ref) => {
  return (<RadioGroupPrimitive.Root className={cn("grid gap-2", className)} {...props} ref={ref} />);
})
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

const RadioGroupItem = React.forwardRef(({ className, ...props }, ref) => {
  return (
    (<RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "aspect-square h-4 w-4 rounded-full border-2 border-primary text-primary shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      style={{
        borderColor: 'var(--radio-border-color, hsl(var(--primary)))',
        boxShadow: 'var(--radio-glow, none)'
      }}
      {...props}>
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className="h-2.5 w-2.5 fill-current" />
      </RadioGroupPrimitive.Indicator>
      <style>{`
        [data-theme='dark'] [role="radio"] {
          --radio-border-color: rgba(0, 255, 136, 0.7) !important;
          --radio-glow: 0 0 6px rgba(0, 255, 136, 0.4) !important;
          border-color: rgba(0, 255, 136, 0.7) !important;
          box-shadow: 0 0 6px rgba(0, 255, 136, 0.4) !important;
        }
        [data-theme='dark'] [role="radio"][data-state="checked"] {
          border-color: #00ff88 !important;
          box-shadow: 0 0 10px rgba(0, 255, 136, 0.6) !important;
        }
        [data-theme='hacker'] [role="radio"] {
          --radio-border-color: rgba(0, 255, 0, 0.7) !important;
          --radio-glow: 0 0 6px rgba(0, 255, 0, 0.4) !important;
          border-color: rgba(0, 255, 0, 0.7) !important;
          box-shadow: 0 0 6px rgba(0, 255, 0, 0.4) !important;
        }
        [data-theme='hacker'] [role="radio"][data-state="checked"] {
          border-color: #00ff00 !important;
          box-shadow: 0 0 10px rgba(0, 255, 0, 0.6) !important;
        }
      `}</style>
    </RadioGroupPrimitive.Item>)
  );
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export { RadioGroup, RadioGroupItem }