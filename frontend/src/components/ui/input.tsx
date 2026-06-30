import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-lg border bg-bone/50 px-3 py-1.5 text-sm text-ink transition-colors outline-none",
        "border-concrete/50 placeholder:text-concrete-dark/60",
        "focus-visible:border-ink focus-visible:bg-bone",
        "file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-stamp aria-invalid:ring-3 aria-invalid:ring-stamp/20",
        className
      )}
      {...props}
    />
  )
}

export { Input }
