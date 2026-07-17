/**
 * Topic classification for skills.
 *
 * The previous `category` was provenance (which source repo a skill came from),
 * which carries little signal for browsing. This derives a topic category from
 * the skill's name + description + readme so the UI filter is actually useful.
 *
 * Rules are ordered by specificity: the first matching bucket wins. The dominant
 * data shape is Composio's "*-automation" SaaS connectors, so that pattern is
 * matched first and explicitly.
 */

export const SKILL_CATEGORIES = [
  "自动化集成",
  "开发编程",
  "设计创意",
  "文档写作",
  "测试调试",
  "数据分析",
  "浏览器自动化",
  "通用其他",
] as const;

export type SkillCategory = (typeof SKILL_CATEGORIES)[number];

export interface ClassifyInput {
  name?: string | null;
  description?: string | null;
  summary_zh?: string | null;
  readme?: string | null;
}

function has(haystack: string, words: string[]): boolean {
  return words.some((w) => haystack.includes(w));
}

export function classifySkill(input: ClassifyInput): SkillCategory {
  const name = (input.name ?? "").toLowerCase();
  // Keep the haystack concise but high-signal: name + description + zh summary,
  // plus a slice of the readme for recall without drowning in boilerplate.
  const hay = [
    name,
    (input.description ?? "").toLowerCase(),
    (input.summary_zh ?? "").toLowerCase(),
    (input.readme ?? "").slice(0, 800).toLowerCase(),
  ].join("  ");
  return classifyFrom(name, hay);
}

export interface BundleClassifyInput {
  name?: string | null;
  summary_zh?: string | null;
  readme?: string | null;
}

/**
 * 合集定分类：用合集自身的描述（合集名 + 中文摘要 + README）跑关键词规则得到唯一分类，
 * 成员 skill 继承此分类，不再单独判定。
 *
 * 用合集摘要而非汇总所有成员文本：后者会让大合集里任一成员提到 browser/test 就把
 * 整个合集吸进靠前的桶；合集摘要是对整包主题的一句话概括，噪声小得多。
 */
export function classifyBundle(input: BundleClassifyInput): SkillCategory {
  const name = (input.name ?? "").toLowerCase();
  const hay = [
    name,
    (input.summary_zh ?? "").toLowerCase(),
    (input.readme ?? "").slice(0, 1200).toLowerCase(),
  ].join("  ");
  return classifyFrom(name, hay);
}

function classifyFrom(name: string, hay: string): SkillCategory {
  // 1) Composio / Rube MCP SaaS connectors — the "*-automation" bulk.
  if (
    /-automation$/.test(name) ||
    has(hay, ["rube mcp", "rube (composio)", "composio", "via rube"])
  ) {
    return "自动化集成";
  }

  // 2) Browser automation — more specific than generic automation.
  if (
    has(hay, [
      "browser",
      "playwright",
      "puppeteer",
      "selenium",
      "scrape",
      "scraping",
      "crawl",
      "headless",
      "浏览器",
      "网页自动化",
      "抓取",
      "爬虫",
    ])
  ) {
    return "浏览器自动化";
  }

  // 3) Testing / debugging.
  if (
    has(hay, [
      "test",
      "testing",
      "debug",
      "debugging",
      "lint",
      "linter",
      " qa ",
      "unit test",
      "e2e",
      "断言",
      "测试",
      "调试",
      "排错",
    ])
  ) {
    return "测试调试";
  }

  // 4) Design / creative.
  if (
    has(hay, [
      "design",
      "art ",
      "canvas",
      "ui/ux",
      " ux",
      "theme",
      "logo",
      "poster",
      "color palette",
      "p5.js",
      "svg",
      "illustration",
      "图标",
      "设计",
      "美化",
      "海报",
      "创意",
      "视觉",
      "排版",
      "样式",
    ])
  ) {
    return "设计创意";
  }

  // 5) Docs / writing.
  if (
    has(hay, [
      "markdown",
      "writing",
      "blog",
      "translate",
      "translation",
      "summarize",
      "summary",
      "format",
      "docx",
      "pptx",
      "slides",
      "powerpoint",
      "文档",
      "写作",
      "翻译",
      "格式化",
      "总结",
      "公众号",
      "文案",
      "笔记",
    ])
  ) {
    return "文档写作";
  }

  // 6) Data / analytics.
  if (
    has(hay, [
      "data ",
      "dataset",
      "analytics",
      "analysis",
      " sql",
      "csv",
      "excel",
      "spreadsheet",
      "chart",
      "etl",
      "数据",
      "分析",
      "报表",
      "可视化",
      "统计",
    ])
  ) {
    return "数据分析";
  }

  // 7) Dev / coding.
  if (
    has(hay, [
      "code",
      "coding",
      "develop",
      "git ",
      "github",
      "refactor",
      "compile",
      "deploy",
      "devops",
      "frontend",
      "backend",
      "react",
      "typescript",
      "python",
      "rust",
      "编程",
      "开发",
      "代码",
      "重构",
      "部署",
      "脚手架",
    ])
  ) {
    return "开发编程";
  }

  // 8) Generic automation / integration that didn't match a connector pattern.
  if (
    has(hay, [
      "automation",
      "automate",
      "integration",
      "connector",
      "webhook",
      "zapier",
      "workflow",
      "自动化",
      "集成",
      "连接器",
      "工作流",
    ])
  ) {
    return "自动化集成";
  }

  return "通用其他";
}
