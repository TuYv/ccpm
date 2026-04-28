import { useUiStore } from "../stores";

export default function Toast() {
  const { toasts, removeToast } = useUiStore();
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-5 right-5 flex flex-col gap-2 z-50">
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => removeToast(t.id)}
          className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl text-sm cursor-pointer border backdrop-blur-sm transition-all ${
            t.kind === "success"
              ? "bg-app-green/15 border-app-green/25 text-app-green"
              : "bg-app-red/15 border-app-red/25 text-app-red"
          }`}
        >
          <span className="text-base">{t.kind === "success" ? "✓" : "✕"}</span>
          {t.message}
        </div>
      ))}
    </div>
  );
}
