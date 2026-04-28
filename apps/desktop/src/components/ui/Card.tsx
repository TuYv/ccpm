interface CardProps {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export function Card({ children, active, onClick, className = "" }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-xl border transition-all duration-150 ${
        active
          ? "bg-app-cardActive border-app-accent"
          : "bg-app-card border-app-border hover:bg-app-cardHover hover:border-app-border/70"
      } ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
