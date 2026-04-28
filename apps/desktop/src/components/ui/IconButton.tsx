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
      className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
        active
          ? "bg-app-accent text-white"
          : "text-app-secondary hover:text-app-text hover:bg-app-cardHover"
      }`}
    >
      {icon}
    </button>
  );
}
