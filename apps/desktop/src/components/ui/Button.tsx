import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "subtle" | "danger";
type ButtonSize = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
}

const variantClass: Record<ButtonVariant, string> = {
  primary: "bg-app-accent text-white hover:bg-app-accentHover border-transparent",
  secondary: "bg-app-panel border-app-border text-app-secondary hover:text-app-text hover:bg-app-panelRaised",
  subtle: "bg-transparent border-transparent text-app-secondary hover:text-app-text hover:bg-app-rowHover",
  danger: "bg-transparent border-app-border text-app-red hover:bg-app-red/10",
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
      className={`inline-flex items-center justify-center gap-1.5 rounded-control border transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${variantClass[variant]} ${sizeClass[size]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
