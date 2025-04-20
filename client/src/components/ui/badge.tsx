import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground",
        outline:
          "text-foreground",
        available:
          "border-transparent bg-green-100 text-green-800",
        occupied:
          "border-transparent bg-red-100 text-red-800",
        pending:
          "border-transparent bg-yellow-100 text-yellow-800",
        approved:
          "border-transparent bg-green-100 text-green-800",
        rejected:
          "border-transparent bg-red-100 text-red-800",
        classroom:
          "border-transparent bg-blue-100 text-blue-800",
        meeting_hall:
          "border-transparent bg-purple-100 text-purple-800",
        auditorium:
          "border-transparent bg-orange-100 text-orange-800",
        computer_science:
          "border-transparent bg-sky-100 text-sky-800",
        electrical_engineering:
          "border-transparent bg-indigo-100 text-indigo-800",
        all:
          "border-transparent bg-gray-100 text-gray-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
