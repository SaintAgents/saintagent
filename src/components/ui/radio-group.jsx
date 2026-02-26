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
        "aspect-square h-5 w-5 rounded-full border-2 text-primary shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      style={{
        borderColor: '#00ff88',
        boxShadow: '0 0 8px rgba(0, 255, 136, 0.5), 0 0 0 2px rgba(0, 255, 136, 0.2)',
        backgroundColor: 'transparent'
      }}
      {...props}>
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className="h-2.5 w-2.5 fill-[#00ff88] text-[#00ff88]" />
      </RadioGroupPrimitive.Indicator>
      <style>{`
        [role="radio"] {
          border-color: #00ff88 !important;
          box-shadow: 0 0 8px rgba(0, 255, 136, 0.5), 0 0 0 2px rgba(0, 255, 136, 0.2) !important;
          background-color: transparent !important;
        }
        [role="radio"]:hover {
          border-color: #00ff88 !important;
          box-shadow: 0 0 12px rgba(0, 255, 136, 0.7), 0 0 0 3px rgba(0, 255, 136, 0.3) !important;
        }
        [role="radio"][data-state="checked"] {
          border-color: #00ff88 !important;
          box-shadow: 0 0 12px rgba(0, 255, 136, 0.8), 0 0 0 3px rgba(0, 255, 136, 0.4) !important;
          background-color: rgba(0, 255, 136, 0.1) !important;
        }
        [role="radio"][data-state="checked"] svg {
          fill: #00ff88 !important;
          color: #00ff88 !important;
        }
        [data-theme='dark'] [role="radio"],
        [data-theme='hacker'] [role="radio"] {
          border-color: #00ff88 !important;
          box-shadow: 0 0 10px rgba(0, 255, 136, 0.6), 0 0 0 3px rgba(0, 255, 136, 0.25) !important;
        }
        [data-theme='dark'] [role="radio"][data-state="checked"],
        [data-theme='hacker'] [role="radio"][data-state="checked"] {
          border-color: #00ff88 !important;
          box-shadow: 0 0 15px rgba(0, 255, 136, 0.9), 0 0 0 4px rgba(0, 255, 136, 0.35) !important;
        }
        [data-theme='hacker'] [role="radio"] {
          border-color: #00ff00 !important;
          box-shadow: 0 0 10px rgba(0, 255, 0, 0.6), 0 0 0 3px rgba(0, 255, 0, 0.25) !important;
        }
        [data-theme='hacker'] [role="radio"][data-state="checked"] {
          border-color: #00ff00 !important;
          box-shadow: 0 0 15px rgba(0, 255, 0, 0.9), 0 0 0 4px rgba(0, 255, 0, 0.35) !important;
        }
        [data-theme='hacker'] [role="radio"][data-state="checked"] svg {
          fill: #00ff00 !important;
          color: #00ff00 !important;
        }
      `}</style>
    </RadioGroupPrimitive.Item>)
  );
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export { RadioGroup, RadioGroupItem }