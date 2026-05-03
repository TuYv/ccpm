import { open as shellOpen } from "@tauri-apps/plugin-shell";

export async function openExternal(url: string): Promise<void> {
  try {
    await shellOpen(url);
  } catch (e) {
    console.error("openExternal failed:", e);
    window.open(url, "_blank", "noopener,noreferrer");
  }
}
