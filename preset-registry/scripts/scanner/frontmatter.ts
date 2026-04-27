/**
 * Minimal YAML frontmatter parser for SKILL.md files.
 * Handles flat key: value pairs only (sufficient for skill metadata).
 */
export function parseFrontmatter(text: string): Record<string, string> {
  const out: Record<string, string> = {};
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return out;

  // Multi-line values continue with leading whitespace.
  const lines = m[1].split(/\r?\n/);
  let currentKey: string | null = null;
  let buf: string[] = [];

  const flush = () => {
    if (currentKey !== null) {
      out[currentKey] = buf.join(" ").trim();
    }
    currentKey = null;
    buf = [];
  };

  for (const raw of lines) {
    const isContinuation = /^\s+\S/.test(raw) && currentKey !== null;
    if (isContinuation) {
      buf.push(raw.trim());
      continue;
    }
    flush();
    const idx = raw.indexOf(":");
    if (idx <= 0) continue;
    currentKey = raw.slice(0, idx).trim();
    const v = raw.slice(idx + 1).trim();
    // Strip surrounding quotes
    const stripped = v.replace(/^["'](.+)["']$/, "$1");
    if (stripped) buf.push(stripped);
  }
  flush();
  return out;
}
