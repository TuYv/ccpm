import type { SearchHit } from "./searcher.js";

const SHARING_KEYWORDS = [
  "claude code",
  "claude.md",
  "claude-code",
  "claude_code",
  "claude md",
  "agent skill",
  "agent skills",
  "claude skill",
  "prompt",
  "preset",
  "cursor rules",
  ".claude",
  "agent.md",
];

const SECOND_PERSON_PATTERNS = [
  /\binstall(?:ation)?\b/i,
  /\badd (?:this|to your)\b/i,
  /\buse this\b/i,
  /\bdrop[- ]in\b/i,
  /\bcopy (?:this|the) file\b/i,
  /\bdownload\b/i,
  /\bgetting started\b/i,
];

const PROJECT_SELF_DESC = /^\s*(?:#\s*[^\n]*\n+)?\s*(?:this (?:project|repository|repo|codebase) (?:is|uses|contains)|welcome to)\b/i;

// Patterns that strongly indicate the CLAUDE.md is *meant to be installed by someone else*.
// Tightened to avoid headings/incidental phrases — must imply packaging or distribution.
const SHARING_INTRO_PATTERNS = [
  /\b(?:library|collection|set|catalog) of (?:skills|prompts|presets|rules|agents?|sub[- ]?agents?)\b/i,
  /\bskill (?:pack|library|collection)\b/i,
  /\bdesigned (?:for|to be used by) (?:claude code|ai (?:agents?|coding agents?))/i,
  /\b(?:drop[- ]in|installable|reusable) (?:claude|skill|preset|prompt|rule)\b/i,
  /\bcopy (?:this|the) (?:file|repo) (?:into|to) (?:your|the) (?:\.claude|~\/\.claude|claude)/i,
  /\bclone (?:this )?(?:repo|repository) into (?:your )?\.claude\b/i,
  /\bcurated (?:collection|list) of (?:skills|prompts|presets|claude)/i,
];

export interface ShareSignals {
  is_markdown_lang: boolean;
  desc_keyword_hit: boolean;
  has_claude_plugin: boolean;
  has_skills_dir: boolean;
  readme_second_person: boolean;
  not_project_self_desc: boolean;
  sharing_intro_match: boolean;
  multi_list_endorsement: number; // 0..N count
}

export function detectShareSignals(
  hit: SearchHit,
  content: string,
  readme: string | null,
): ShareSignals {
  const desc = (hit.description ?? "").toLowerCase();
  const topicHay = (hit.topics ?? []).join(" ").toLowerCase();
  const hay = `${desc} ${topicHay}`;
  const sharingHay = `${content}\n${readme ?? ""}`;
  return {
    is_markdown_lang: (hit.language ?? "").toLowerCase() === "markdown",
    desc_keyword_hit: SHARING_KEYWORDS.some((k) => hay.includes(k)),
    has_claude_plugin: hit.signals?.has_claude_plugin ?? false,
    has_skills_dir: hit.signals?.has_skills_dir ?? false,
    readme_second_person: !!readme && SECOND_PERSON_PATTERNS.some((p) => p.test(readme)),
    not_project_self_desc: !PROJECT_SELF_DESC.test(content),
    sharing_intro_match: SHARING_INTRO_PATTERNS.some((p) => p.test(sharingHay)),
    multi_list_endorsement: hit.curated_by?.length ?? 0,
  };
}

export function isSharingRepo(signals: ShareSignals): boolean {
  // Strong-signal shortcut: any of these alone is enough.
  if (signals.is_markdown_lang) return true;
  if (signals.has_claude_plugin) return true;
  if (signals.has_skills_dir) return true;
  if (signals.multi_list_endorsement >= 2) return true;
  // Weak signals — need >=4 total weight to pass.
  let weak = 0;
  if (signals.sharing_intro_match) weak += 2;
  if (signals.desc_keyword_hit) weak += 2;
  if (signals.readme_second_person) weak += 1;
  if (signals.not_project_self_desc) weak += 1;
  if (signals.multi_list_endorsement >= 1) weak += 1;
  return weak >= 4;
}

export interface ScoreResult {
  score: number;
  is_sharing: boolean;
  signals: ShareSignals;
}

export function scoreHit(
  hit: SearchHit,
  content: string,
  readme: string | null = null,
): ScoreResult {
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

  const base = stars * 0.3 + recency * 0.2 + qual * 0.2;
  const signals = detectShareSignals(hit, content, readme);
  const is_sharing = isSharingRepo(signals);
  // Sharing repos get a 0.3 boost; non-sharing repos are capped at base only.
  const score = is_sharing ? Math.min(1, base + 0.3) : base;
  return { score, is_sharing, signals };
}
