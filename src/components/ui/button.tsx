import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // Base styles - clean and simple
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // PRIMARY - Simple dark button
        default:
          "bg-[#26251E] text-white hover:bg-[#3B3A33] active:bg-[#1A1914]",

        // GLASS - Frosted glass secondary
        glass:
          "bg-white/60 backdrop-blur-md border border-white/40 text-neutral-900 hover:bg-white/80 active:bg-white/70",

        // OUTLINE - Simple border
        outline:
          "bg-transparent border border-neutral-300 text-neutral-900 hover:bg-neutral-100 active:bg-neutral-200",

        // GHOST - Minimal
        ghost:
          "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 active:bg-neutral-200",

        // LINK - Underline style
        link:
          "text-neutral-700 underline-offset-4 hover:underline hover:text-neutral-900",
      },
      size: {
        default: "h-11 px-6 py-2.5",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-14 rounded-xl px-8 text-base",
        xl: "h-16 rounded-2xl px-10 text-lg",
        icon: "h-10 w-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
