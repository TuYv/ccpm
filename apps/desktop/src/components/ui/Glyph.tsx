// src/components/ui/Glyph.tsx
const HUES = [28, 200, 145, 260, 75, 320, 12, 180];

function glyphHue(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return HUES[Math.abs(h) % HUES.length];
}

function initials(name: string): string {
  const parts = name.split(/[\s\-_/.]+/).filter(Boolean).slice(0, 2);
  const ini = parts.map((s) => s[0]).join("").toUpperCase();
  return ini || "··";
}

export function Glyph({
  name, size = "md",
}: {
  name: string;
  size?: "sm" | "md" | "lg";
}) {
  const hue = glyphHue(name);
  const sizeClass = size === "lg" ? "lg" : size === "sm" ? "sm" : "";
  return (
    <div
      className={`glyph ${sizeClass}`.trim()}
      style={{
        background: `oklch(0.62 0.13 ${hue})`,
        boxShadow: `inset 0 0 0 1px oklch(0.55 0.13 ${hue})`,
      }}
    >
      {initials(name)}
    </div>
  );
}
