import * as React from "react"
import * as TogglePrimitive from "@radix-ui/react-toggle"
import { type VariantProps } from "class-variance-authority" // cva removed

import { cn } from "@/lib/utils"
import { toggleVariants, ToggleVariantsProps } from "./toggle-variants" // Import variants and props type

// const toggleVariants = cva(...) // Moved

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> &
    ToggleVariantsProps // Use imported props type
>(({ className, variant, size, ...props }, ref) => (
  <TogglePrimitive.Root
    ref={ref}
    className={cn(toggleVariants({ variant, size, className }))}
    {...props}
  />
))

Toggle.displayName = TogglePrimitive.Root.displayName

export { Toggle } // Export only the component
