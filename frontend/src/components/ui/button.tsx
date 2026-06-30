import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // 实心黑底 — 主操作
        default:
          "bg-ink text-bone hover:bg-[#2a2a2a] border border-ink",
        // 骨白底 + 灰边框 — 次要操作
        outline:
          "bg-bone text-ink border border-concrete hover:border-ink hover:bg-bone-dark",
        // 红字/红框 — 危险/强调操作，取自品牌 stamp
        stamp:
          "bg-stamp text-white border border-stamp hover:bg-[#b82a2a]",
        // 无边框 — 极简
        ghost:
          "text-ink/70 hover:text-ink hover:bg-bone-dark border border-transparent",
        // 高亮黄 — CTA / 强调
        highlight:
          "bg-highlight text-ink border border-highlight hover:bg-[#e0b822]",
        // 链接样式
        link:
          "text-stamp underline-offset-4 hover:underline border-none bg-transparent",
      },
      size: {
        default: "h-9 gap-1.5 px-4 text-sm rounded-lg",
        sm: "h-7 gap-1 px-3 text-xs rounded-md",
        lg: "h-11 gap-2 px-6 text-sm rounded-xl",
        xl: "h-12 gap-2 px-8 text-base rounded-xl font-semibold",
        icon: "size-9 rounded-lg",
        "icon-sm": "size-7 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
