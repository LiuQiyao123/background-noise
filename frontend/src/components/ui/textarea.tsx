import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-20 w-full rounded-lg border bg-bone/50 px-3 py-2 text-sm text-ink transition-colors outline-none",
        "border-concrete/50 placeholder:text-concrete-dark/60",
        "focus-visible:border-ink focus-visible:bg-bone",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-stamp aria-invalid:ring-3 aria-invalid:ring-stamp/20",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
