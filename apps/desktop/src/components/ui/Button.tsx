import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "subtle" | "danger";
type ButtonSize = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
}

const variantClass: Record<ButtonVariant, string> = {
  primary: "bg-accent text-white hover:bg-accent-hover border-transparent",
  secondary: "bg-card border-hairline text-ink-2 hover:text-ink hover:bg-card-2",
  subtle: "bg-transparent border-transparent text-ink-2 hover:text-ink hover:bg-card-2",
  danger: "bg-transparent border-hairline text-red hover:bg-red-soft",
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "h-7 px-2.5 text-xs",
  md: "h-8 px-3 text-sm",
};

export function Button({
  variant = "secondary",
  size = "md",
  icon,
  children,
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 rounded-control border transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${variantClass[variant]} ${sizeClass[size]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
