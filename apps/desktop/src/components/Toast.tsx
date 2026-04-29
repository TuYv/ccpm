import { useUiStore } from "../stores";
import { Banner } from "./ui";

export default function Toast() {
  const { toasts, removeToast } = useUiStore();
  if (toasts.length === 0) return null;
  return (
    <div
      style={{
        position: "fixed",
        bottom: 18,
        right: 18,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        zIndex: 60,
      }}
    >
      {toasts.map((t) => (
        <div key={t.id} style={{ maxWidth: 360 }}>
          <Banner
            tone={t.kind === "success" ? "green" : "red"}
            dot
            onClick={() => removeToast(t.id)}
          >
            {t.message}
          </Banner>
        </div>
      ))}
    </div>
  );
}
