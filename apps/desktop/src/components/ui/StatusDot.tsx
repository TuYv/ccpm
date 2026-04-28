type StatusTone = "neutral" | "success" | "warning" | "danger" | "info";

const toneClass: Record<StatusTone, string> = {
  neutral: "bg-app-muted",
  success: "bg-app-green",
  warning: "bg-app-orange",
  danger: "bg-app-red",
  info: "bg-app-accent",
};

export function StatusDot({ tone = "neutral" }: { tone?: StatusTone }) {
  return <span className={`inline-block h-2 w-2 rounded-full ${toneClass[tone]}`} />;
}
