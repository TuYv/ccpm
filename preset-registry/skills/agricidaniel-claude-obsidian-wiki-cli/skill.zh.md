---
name: wiki-cli
description: "Default vault-mutation transport for claude-obsidian v1.7+. Wraps the Obsidian CLI (Obsidian 1.12+) as the preferred way to read, write, search, and modify vault notes from Claude — no MCP server, no REST API plugin, no TLS workarounds. Falls back to direct filesystem Read/Write/Edit when the CLI is unavailable. Triggers on: wiki-cli, obsidian cli, obsidian read, obsidian write, obsidian search, daily note, obsidian create, obsidian append, vault transport, which transport, transport detection, obsidian command line."
allowed-tools: Read Bash
---
# wiki-cli：默认传输层

claude-obsidian v1.7+ 将 **Obsidian CLI**（随 Obsidian 1.12 提供）标准化为桌面端所有仓库变更操作的首选传输方式。本技能是使用它的操作指南参考。

**底层实现偏好（v1.7+）**：本技能是一个自包含的后备方案。**优先使用 `kepano/obsidian-skills`**（由 Obsidian CEO Steph Ango 开发）作为权威底层实现——其中的 `obsidian-cli` 技能是所有 Agent-Skills 运行时的规范 CLI 参考。如果你看到一个不带 `claude-obsidian:` 命名空间的 `obsidian-cli` 技能，那就是 kepano 的版本：请使用它。提供以下操作指南是为了在未安装 kepano 市场时，claude-obsidian 仍能正常运行。安装 kepano：`claude plugin marketplace add kepano/obsidian-skills`。

---

## 为什么选择 CLI 而非 MCP

| 关注点 | MCP（选项 A/B） | Obsidian CLI |
|---|---|---|
| 安装 | Local REST API 插件 + MCP 服务器配置 | 内置于 Obsidian 1.12+ |
| 身份验证 | API 密钥 + TLS 绕过（`NODE_TLS_REJECT_UNAUTHORIZED=0`） | 无——直接使用子进程 |
| 延迟 | 每次调用都需要一次 HTTP 往返 | 进程内二进制程序 |
| 故障模式 | 插件被禁用 → 静默失效 | 二进制程序缺失 → `command -v` 明确失败 |
| 可重入性 | Claude 会话内的自 MCP 调用可能死锁 | 纯子进程，安全 |
| 移动端 / 无头环境 | 受限 | 受限（CLI 同样仅支持桌面端） |

CLI 恰好只在一个方面逊于 MCP：它只能在安装了 Obsidian 本身的机器上运行。对于无头服务器和移动端，请转至传输链中的下一种传输方式。

---

## 检测

在会话开始时（或设置仓库时）运行：

```bash
bash scripts/detect-transport.sh
```

这会写入符合以下模式的 `.vault-meta/transport.json`：

```json
{
  "preferred": "cli",
  "fallback_chain": ["cli", "filesystem"],
  "available": {
    "cli": {"present": true, "binary": "obsidian-cli", "version_string": "..."},
    "filesystem": {"present": true},
    "mcp_obsidian": {"present": null, "detection": "deferred"},
    "mcpvault": {"present": null, "detection": "deferred"}
  }
}
```

**在执行任何非简单的仓库变更操作之前，请读取此文件。** 需要读取或写入的技能应查阅 `preferred` 并选择对应的传输方式。决策树位于 `wiki/references/transport-fallback.md`。

安装或移除 Obsidian CLI 后，使用 `--force` 刷新检测结果：
```bash
bash scripts/detect-transport.sh --force
```

---

## 操作指南（CLI 优先；后备方案以内联方式注明）

每个操作指南都先展示 CLI 形式。如果根据检测快照发现 CLI 不可用，则转至注明的后备方案。变量替换：`$VAULT` 是仓库根目录的绝对路径；`$NOTE` 是类似 `wiki/concepts/Foo.md` 的仓库相对路径。

### 读取笔记
```bash
# CLI
obsidian-cli read "$VAULT" "$NOTE"

# Fallback: Claude's Read tool with absolute path
# Read $VAULT/$NOTE
```

### 创建或覆盖笔记
```bash
# CLI
obsidian-cli write "$VAULT" "$NOTE" < /path/to/content.md

# Fallback: Claude's Write tool with absolute path
# Write $VAULT/$NOTE with the desired content string
```

### 追加到笔记
```bash
# CLI
echo "additional content" | obsidian-cli append "$VAULT" "$NOTE"

# Fallback: Read $VAULT/$NOTE, append manually, Write back
```

### 搜索笔记内容（CLI 使用 Obsidian 自身的搜索排序）
```bash
# CLI
obsidian-cli search "$VAULT" "<query>"

# Fallback: ripgrep
rg --type=md "<query>" "$VAULT/wiki/"
```

### 今天的日记（如果已启用 Daily Notes 插件）
```bash
# CLI
obsidian-cli daily:today "$VAULT"
obsidian-cli daily:append "$VAULT" "captured at $(date)"

# Fallback: compute path manually
NOTE="$VAULT/wiki/daily/$(date +%Y-%m-%d).md"
```

### 修改 frontmatter 属性
```bash
# CLI
obsidian-cli property:set "$VAULT" "$NOTE" status "evergreen"

# Fallback: read frontmatter, parse, mutate, rewrite (use mcp__obsidian-vault__update_frontmatter if MCP is configured)
```

### 列出页面的反向链接
```bash
# CLI
obsidian-cli backlinks "$VAULT" "$NOTE"

# Fallback: ripgrep for wikilink references
rg --type=md "\[\[$(basename "$NOTE" .md)" "$VAULT/wiki/"
```

### 打开 Bases (.base) 文件解析后的视图
```bash
# CLI
obsidian-cli bases "$VAULT" "$NOTE"
# (returns the resolved row list; supplements obsidian-bases skill which handles the .base file's YAML)

# Fallback: read the .base file directly; no resolved-view available without Obsidian itself
```

### 标签和书签
```bash
obsidian-cli tags "$VAULT"
obsidian-cli bookmarks "$VAULT"
```

---

## 不适合使用 CLI 的情况

- **移动端（iOS Share 扩展）**：写入 `.raw/` 的文件系统操作是唯一途径；CLI 仅适用于桌面端。
- **CI / 无头采集任务**：使用文件系统并手动解析 frontmatter。
- **跨仓库操作**：CLI 每次调用仅绑定一个仓库根目录；对于联邦式操作，应回退到遍历文件系统。
- **Obsidian 正在保存时进行实时编辑**：可能出现罕见的竞态；CLI 能够正确处理，但在极端情况下，应先获取 v1.7 的 `wiki-lock.sh` 咨询锁（参见 [skills/wiki-fold/](../wiki-fold/SKILL.md) 和 `agents/wiki-ingest.md`）。

---

## 交叉引用

- 决策树：[`wiki/references/transport-fallback.md`](../../wiki/references/transport-fallback.md)
- 旧版 MCP 选项（A/B/C/D）：[`skills/wiki/references/mcp-setup.md`](../wiki/references/mcp-setup.md)
- 并发策略（v1.7+）：[`skills/wiki-ingest/SKILL.md`](../wiki-ingest/SKILL.md) §并发
- 检测脚本：[`scripts/detect-transport.sh`](../../scripts/detect-transport.sh)

---

## 思考方式（10 原则映射）

处理此技能时，请应用 10 原则循环。有关标准框架，请参阅 [`skills/think/SKILL.md`](../think/SKILL.md)。

| # | 原则 | 在此处的应用 |
|---|-----------|-------------------|
| 1 | 观察（外部） | 检测已安装了哪些 Obsidian CLI 二进制文件；检查 Obsidian 应用是否正在运行。如果 `.vault-meta/transport.json` 存在，则读取它。 |
| 2 | 观察（内部） | 当 CLI 实际可用时，不要偏向文件系统回退方案——验证自动检测是否发现了已安装的工具。 |
| 3 | 倾听 | 如果 transport.json 中设置了 `manual_override: true`，说明用户已经明确表达了选择——保留其 `preferred` 和 `fallback_chain`。 |
| 4 | 思考 | 为当前环境计算正确的回退链。CLI > MCP > 文件系统；重新计算前先检查新鲜度。 |
| 5 | 连接（横向） | 这种传输方式的选择会如何影响其他所有技能的写入？有六个下游技能依赖此快照。 |
| 6 | 连接（系统） | transport.json 的模式稳定性比功能丰富度更重要——使用方通过简单的 shell 惯用法解析该 JSON。 |
| 7 | 感受 | 当没有可用的传输方式时，错误消息应明确告诉用户具体该怎么做（安装 CLI、配置 MCP 等）。 |
| 8 | 接受 | 使用文件系统回退方案完全没问题。CLI 不存在时应如实承认；不要捏造并不存在的二进制文件。 |
| 9 | 创造 | 以原子方式写入 transport.json（临时文件 + 重命名）。每个周期都要往返保留 `manual_override`。 |
| 10 | 成长 | 随着 MCP 支持日趋成熟，自动检测应覆盖暂缓实现的层级。将其作为 v1.7.x 范围进行跟踪。 |