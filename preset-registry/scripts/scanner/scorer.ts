import type { SearchHit } from "./searcher.js";

export function scoreHit(hit: SearchHit, content: string): number {
  // Star score: 0..1 (capped at 50k stars)
  const stars = Math.min(hit.stars / 50000, 1);
  // Recency: pushed within 90 days = 1, decays linearly to 0 at 730 days
  const pushedAt = hit.pushed_at ? new Date(hit.pushed_at).getTime() : 0;
  const ageDays = pushedAt ? (Date.now() - pushedAt) / 86400000 : 9999;
  const recency = Math.max(0, Math.min(1, (730 - ageDays) / 640));
  // Content quality: prefer 500..3000 chars, has headings, no obvious secret patterns
  const len = content.length;
  let qual = 0.5;
  if (len >= 500 && len <= 3000) qual += 0.2;
  if (/^#+ /m.test(content)) qual += 0.15;
  if (!/(BEGIN [A-Z ]*PRIVATE KEY|api[_-]?key\s*[:=]\s*["'`][A-Za-z0-9]{20,}["'`])/i.test(content))
    qual += 0.15;
  qual = Math.min(1, qual);

  return stars * 0.4 + recency * 0.3 + qual * 0.3;
}
