const PALETTE = [
  "#0a84ff", "#34c759", "#af52de", "#ff375f",
  "#ff9500", "#5ac8fa", "#ff2d55", "#30d158",
];

function hashColor(name: string): string {
  let h = 0;
  for (const c of name) h = (((h << 5) - h) + c.charCodeAt(0)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

interface AvatarProps {
  name: string;
  size?: number;
}

export function Avatar({ name, size = 36 }: AvatarProps) {
  return (
    <div
      style={{ width: size, height: size, backgroundColor: hashColor(name), flexShrink: 0 }}
      className="rounded-full flex items-center justify-center text-white font-semibold text-sm select-none"
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
