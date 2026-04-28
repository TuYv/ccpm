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
          ? "bg-app-accent text-white"
          : "text-app-secondary hover:border-app-border hover:bg-app-rowHover hover:text-app-text"
      }`}
    >
      {icon}
    </button>
  );
}
