import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn("relative flex w-full touch-none select-none items-center h-8", className)}
    {...props}>
    {/* Soft rectangle track with dots for visual grip */}
    <SliderPrimitive.Track
      className="relative h-6 w-full grow overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-inner">
      {/* Decorative dots for drag invitation */}
      <div className="absolute inset-0 flex items-center justify-between px-3 pointer-events-none">
        <div className="flex gap-1.5">
          <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
          <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
          <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
        </div>
        <div className="flex gap-1.5">
          <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
          <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
          <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
        </div>
      </div>
      {/* Volume tracer / fill behind thumb */}
      <SliderPrimitive.Range className="absolute h-full bg-gradient-to-r from-violet-500/80 to-violet-400/60 dark:from-violet-600/80 dark:to-violet-500/60" />
    </SliderPrimitive.Track>
    {/* Slider thumb control */}
    <SliderPrimitive.Thumb
      className="block h-5 w-5 rounded-md border-2 border-violet-500 bg-white dark:bg-slate-900 shadow-lg cursor-grab active:cursor-grabbing transition-all hover:scale-110 hover:border-violet-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
      {/* Grip lines on thumb */}
      <div className="flex flex-col items-center justify-center h-full gap-0.5">
        <div className="w-2 h-px bg-violet-400" />
        <div className="w-2 h-px bg-violet-400" />
        <div className="w-2 h-px bg-violet-400" />
      </div>
    </SliderPrimitive.Thumb>
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }