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
          ? "bg-accent-soft border-accent"
          : "bg-card border-hairline hover:bg-card-2 hover:border-hairline/70"
      } ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
