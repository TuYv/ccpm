import { Octokit } from "@octokit/rest";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { fetchRepoMeta, type RepoMeta } from "./skills-scanner.js";

export interface McpSource {
  repo: string;
  url: string;
  path: string;
  branch: string;
  discovered_at: string;
  stars?: number;
  language?: string | null;
  pushed_at?: string;
  readme?: string | null;
}

export interface McpRequiredEnv {
  key: string;
  hint?: string;
  description?: string;
}

export interface McpEntry {
  id: string;
  name: string;
  description: string;
  category: string;
  command: string;
  args: string[];
  required_env: McpRequiredEnv[];
  optional_env: McpRequiredEnv[];
  source: McpSource;
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

/**
 * Curated community MCPs that aren't in the official servers repo.
 * These are popular, well-maintained third-party MCP servers.
 */
const CURATED_COMMUNITY_MCPS: McpEntry[] = [
  {
    id: "github",
    name: "GitHub",
    description: "Read/write GitHub issues, PRs, code, and repos via the GitHub REST API.",
    category: "开发工具",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-github"],
    required_env: [
      { key: "GITHUB_PERSONAL_ACCESS_TOKEN", hint: "ghp_xxx", description: "GitHub Personal Access Token" },
    ],
    optional_env: [],
    source: {
      repo: "github/github-mcp-server",
      url: "https://github.com/github/github-mcp-server",
      path: "",
      branch: "main",
      discovered_at: new Date().toISOString(),
    },
  },
  {
    id: "postgres",
    name: "PostgreSQL",
    description: "Read-only database access for PostgreSQL with schema inspection.",
    category: "数据库",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-postgres"],
    required_env: [
      { key: "POSTGRES_CONNECTION_STRING", hint: "postgresql://user:pass@host/db" },
    ],
    optional_env: [],
    source: {
      repo: "modelcontextprotocol/servers-archived",
      url: "https://github.com/modelcontextprotocol/servers-archived/tree/main/src/postgres",
      path: "src/postgres",
      branch: "main",
      discovered_at: new Date().toISOString(),
    },
  },
  {
    id: "sqlite",
    name: "SQLite",
    description: "Local SQLite database access with schema inspection and query execution.",
    category: "数据库",
    command: "uvx",
    args: ["mcp-server-sqlite", "--db-path", "./local.db"],
    required_env: [],
    optional_env: [],
    source: {
      repo: "modelcontextprotocol/servers-archived",
      url: "https://github.com/modelcontextprotocol/servers-archived/tree/main/src/sqlite",
      path: "src/sqlite",
      branch: "main",
      discovered_at: new Date().toISOString(),
    },
  },
  {
    id: "fetch",
    name: "Fetch",
    description: "Retrieve URL contents with HTML-to-Markdown conversion for use as context.",
    category: "网络",
    command: "uvx",
    args: ["mcp-server-fetch"],
    required_env: [],
    optional_env: [],
    source: {
      repo: "modelcontextprotocol/servers-archived",
      url: "https://github.com/modelcontextprotocol/servers-archived/tree/main/src/fetch",
      path: "src/fetch",
      branch: "main",
      discovered_at: new Date().toISOString(),
    },
  },
  {
    id: "git",
    name: "Git",
    description: "Read, search, and manipulate local Git repositories.",
    category: "开发工具",
    command: "uvx",
    args: ["mcp-server-git", "--repository", "."],
    required_env: [],
    optional_env: [],
    source: {
      repo: "modelcontextprotocol/servers-archived",
      url: "https://github.com/modelcontextprotocol/servers-archived/tree/main/src/git",
      path: "src/git",
      branch: "main",
      discovered_at: new Date().toISOString(),
    },
  },
  {
    id: "brave-search",
    name: "Brave Search",
    description: "Web and local search via the Brave Search API.",
    category: "网络",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-brave-search"],
    required_env: [
      { key: "BRAVE_API_KEY", description: "Brave Search API key" },
    ],
    optional_env: [],
    source: {
      repo: "modelcontextprotocol/servers-archived",
      url: "https://github.com/modelcontextprotocol/servers-archived/tree/main/src/brave-search",
      path: "src/brave-search",
      branch: "main",
      discovered_at: new Date().toISOString(),
    },
  },
  {
    id: "puppeteer",
    name: "Puppeteer",
    description: "Browser automation: navigate pages, take screenshots, click elements, run JS.",
    category: "网络",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-puppeteer"],
    required_env: [],
    optional_env: [],
    source: {
      repo: "modelcontextprotocol/servers-archived",
      url: "https://github.com/modelcontextprotocol/servers-archived/tree/main/src/puppeteer",
      path: "src/puppeteer",
      branch: "main",
      discovered_at: new Date().toISOString(),
    },
  },
  {
    id: "slack",
    name: "Slack",
    description: "Read channels, post messages, and manage Slack workspace via the Slack API.",
    category: "通讯",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-slack"],
    required_env: [
      { key: "SLACK_BOT_TOKEN", hint: "xoxb-...", description: "Slack Bot User OAuth Token" },
      { key: "SLACK_TEAM_ID", description: "Slack workspace team ID" },
    ],
    optional_env: [],
    source: {
      repo: "modelcontextprotocol/servers-archived",
      url: "https://github.com/modelcontextprotocol/servers-archived/tree/main/src/slack",
      path: "src/slack",
      branch: "main",
      discovered_at: new Date().toISOString(),
    },
  },
  {
    id: "google-drive",
    name: "Google Drive",
    description: "Search and read files in Google Drive (Docs, Sheets, Slides) via OAuth.",
    category: "云存储",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-gdrive"],
    required_env: [
      { key: "GDRIVE_CLIENT_ID", description: "Google OAuth client ID" },
      { key: "GDRIVE_CLIENT_SECRET", description: "Google OAuth client secret" },
    ],
    optional_env: [],
    source: {
      repo: "modelcontextprotocol/servers-archived",
      url: "https://github.com/modelcontextprotocol/servers-archived/tree/main/src/gdrive",
      path: "src/gdrive",
      branch: "main",
      discovered_at: new Date().toISOString(),
    },
  },
  {
    id: "time",
    name: "Time",
    description: "Time and timezone utilities (current time, conversions, business-hours math).",
    category: "工具",
    command: "uvx",
    args: ["mcp-server-time"],
    required_env: [],
    optional_env: [],
    source: {
      repo: "modelcontextprotocol/servers-archived",
      url: "https://github.com/modelcontextprotocol/servers-archived/tree/main/src/time",
      path: "src/time",
      branch: "main",
      discovered_at: new Date().toISOString(),
    },
  },
];

/**
 * Scan the official Anthropic-maintained MCP servers reference list at
 * `modelcontextprotocol/servers`. Each server lives under `src/<name>/`
 * with a package.json declaring its `bin`.
 */
export async function discoverMcps(
  octokit: Octokit,
  registryDir: string,
): Promise<McpEntry[]> {
  const mcpsDir = join(registryDir, "mcps");
  const all: McpEntry[] = [];

  const REPO = { owner: "modelcontextprotocol", name: "servers", branch: "main" };

  console.log(`[mcps] scanning ${REPO.owner}/${REPO.name}@${REPO.branch}…`);
  let tree;
  try {
    const r = await octokit.git.getTree({
      owner: REPO.owner,
      repo: REPO.name,
      tree_sha: REPO.branch,
      recursive: "1",
    });
    tree = r.data.tree;
  } catch (e) {
    console.warn(`[mcps] failed to read tree: ${e}`);
    tree = null;
  }

  const serverDirs = new Set<string>();
  for (const t of tree ?? []) {
    const m = t.path?.match(/^src\/([^/]+)\/package\.json$/);
    if (m) serverDirs.add(m[1]);
  }
  console.log(`[mcps]   found ${serverDirs.size} reference servers`);

  for (const name of serverDirs) {
    try {
      const pkgPath = `src/${name}/package.json`;
      const pkgRaw = await octokit.repos.getContent({
        owner: REPO.owner,
        repo: REPO.name,
        ref: REPO.branch,
        path: pkgPath,
      });
      if (Array.isArray(pkgRaw.data) || pkgRaw.data.type !== "file") continue;
      const pkgContent = Buffer.from(
        (pkgRaw.data as { content: string }).content,
        "base64",
      ).toString("utf-8");
      const pkg = JSON.parse(pkgContent);

      // Resolve command/args. Reference servers publish as
      // `@modelcontextprotocol/server-<name>` and run via `npx -y`.
      const pkgName: string = pkg.name ?? `@modelcontextprotocol/server-${name}`;
      const command = "npx";
      const args = ["-y", pkgName];

      // Try to read README to extract a description sentence (best effort)
      let description = pkg.description ?? `${name} MCP server`;
      try {
        const readme = await octokit.repos.getContent({
          owner: REPO.owner,
          repo: REPO.name,
          ref: REPO.branch,
          path: `src/${name}/README.md`,
        });
        if (!Array.isArray(readme.data) && readme.data.type === "file") {
          const text = Buffer.from(
            (readme.data as { content: string }).content,
            "base64",
          ).toString("utf-8");
          // Reject heading, link/badge bullets, table rows, HTML, lone bold/markup tokens.
          const looksLikeProse = (l: string): boolean => {
            if (!l || l.length < 30) return false;
            if (/^[#>|\-*]/.test(l)) return false;
            if (l.startsWith("[") || l.startsWith("!")) return false;
            if (l.startsWith("<")) return false;
            // Reject lines that are dominated by markdown link syntax.
            if (/^\*+\[/.test(l) || /^\[.*]\(/.test(l)) return false;
            // Need at least 4 alphabetic words to be considered prose.
            const words = l.split(/\s+/).filter((w) => /[A-Za-z一-鿿]/.test(w));
            return words.length >= 4;
          };
          const firstSentence = text
            .split(/\r?\n/)
            .map((l) => l.trim())
            .find(looksLikeProse);
          if (firstSentence) {
            // Trim at end of first sentence (".") if shorter than full line.
            const dot = firstSentence.indexOf(". ");
            description = (dot > 30 ? firstSentence.slice(0, dot + 1) : firstSentence).slice(
              0,
              300,
            );
          }
        }
      } catch {
        // README missing → keep package.json description
      }

      const id = slugify(name);
      const meta: RepoMeta = await fetchRepoMeta(octokit, `${REPO.owner}/${REPO.name}`);
      const entry: McpEntry = {
        id,
        name,
        description,
        category: "官方 Anthropic",
        command,
        args,
        required_env: [],
        optional_env: [],
        source: {
          repo: `${REPO.owner}/${REPO.name}`,
          url: `https://github.com/${REPO.owner}/${REPO.name}/tree/${REPO.branch}/src/${name}`,
          path: `src/${name}`,
          branch: REPO.branch,
          discovered_at: new Date().toISOString(),
          stars: meta.stars,
          language: meta.language,
          pushed_at: meta.pushed_at,
          readme: meta.readme,
        },
      };
      all.push(entry);

      const outDir = join(mcpsDir, id);
      await mkdir(outDir, { recursive: true });
      await writeFile(join(outDir, "mcp.json"), JSON.stringify(entry, null, 2));
    } catch (e) {
      console.warn(`[mcps]   skipped ${name}: ${e}`);
    }
  }

  // Seed curated community MCPs (only writes if not already on disk so manual
  // edits to mcp.json are preserved).
  console.log(`[mcps] seeding ${CURATED_COMMUNITY_MCPS.length} curated community MCPs…`);
  for (const entry of CURATED_COMMUNITY_MCPS) {
    // Enrich source metadata regardless of whether the file already exists.
    const curatedMeta: RepoMeta = await fetchRepoMeta(octokit, entry.source.repo);
    entry.source.stars = curatedMeta.stars;
    entry.source.language = curatedMeta.language;
    entry.source.pushed_at = curatedMeta.pushed_at;
    entry.source.readme = curatedMeta.readme;

    const outDir = join(mcpsDir, entry.id);
    const mcpJson = join(outDir, "mcp.json");
    if (existsSync(mcpJson)) continue; // do not clobber manual / scanner edits
    await mkdir(outDir, { recursive: true });
    await writeFile(mcpJson, JSON.stringify(entry, null, 2));
    all.push(entry);
  }

  // Build mcps/index.json by walking the mcps dir.
  const indexEntries: McpEntry[] = [];
  if (existsSync(mcpsDir)) {
    for (const dirent of await readdir(mcpsDir, { withFileTypes: true })) {
      if (!dirent.isDirectory()) continue;
      const mcpJson = join(mcpsDir, dirent.name, "mcp.json");
      if (!existsSync(mcpJson)) continue;
      try {
        indexEntries.push(JSON.parse(await readFile(mcpJson, "utf8")));
      } catch {
        // Skip bad files
      }
    }
  }
  indexEntries.sort(
    (a, b) =>
      a.category.localeCompare(b.category) || a.name.localeCompare(b.name),
  );

  await mkdir(mcpsDir, { recursive: true });
  await writeFile(
    join(mcpsDir, "index.json"),
    JSON.stringify(
      { version: "1", updated_at: new Date().toISOString(), mcps: indexEntries },
      null,
      2,
    ),
  );
  console.log(
    `[mcps] index now has ${indexEntries.length} entries (this run added ${all.length})`,
  );
  return all;
}
