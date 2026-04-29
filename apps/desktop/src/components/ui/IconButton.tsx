interface IconButtonProps {
  icon: React.ReactNode;
  onClick?: () => void;
  title?: string;
  active?: boolean;
  disabled?: boolean;
}

export function IconButton({ icon, onClick, title, active, disabled }: IconButtonProps) {
  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`flex h-8 w-8 items-center justify-center rounded-control border border-transparent transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? "bg-accent text-white"
          : "text-ink-2 hover:border-hairline hover:bg-card-2 hover:text-ink"
      }`}
    >
      {icon}
    </button>
  );
}
