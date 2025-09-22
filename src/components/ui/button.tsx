import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-tn-primary text-white hover:brightness-110 active:brightness-95 focus-visible:ring-tn-focus",
        secondary: "border border-tn-primary text-tn-primary bg-white hover:bg-tn-subtle active:bg-[#E6F6F4] focus-visible:ring-tn-focus",
        ghost: "text-tn-primary hover:bg-tn-subtle focus-visible:ring-tn-focus",
        destructive: "bg-[#DC2626] text-white hover:brightness-110 focus-visible:ring-[#DC2626]",
        outline: "border border-tn-border bg-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-tn-focus",
        link: "text-tn-primary underline-offset-4 hover:underline focus-visible:ring-tn-focus",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-xl px-3",
        lg: "h-11 rounded-xl px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
