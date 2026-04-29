// src/components/ui/Avatar.tsx
import { Glyph } from "./Glyph";

export function Avatar({ name, size }: { name: string; size?: number }) {
  const sz = !size || size <= 32 ? "sm" : size >= 48 ? "lg" : "md";
  return <Glyph name={name} size={sz} />;
}
