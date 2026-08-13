---
name: understand-figma
description: Analyze a Figma file via the Figma REST API and generate an interactive design knowledge graph (pages, screens, components, component sets, instances, design tokens) with a kind:"design" dashboard.
argument-hint: "<figma-file-url-or-key> [--language <lang>]"
---
# /understand-figma

分析一个 Figma 文件并在现有仪表板中生成交互式设计知识图谱。

## 前置条件

- **`FIGMA_TOKEN`** 环境变量——一个 Figma 个人访问令牌（在 https://www.figma.com/settings 创建）。如果缺失，请停止并告知用户：
  > 先设置 Figma 令牌：在 figma.com/settings 创建，然后执行 `export FIGMA_TOKEN=<token>`。
- Node ≥ 22，pnpm ≥ 10。

> **安全性：** 该令牌仅从环境变量读取，并且只会通过 `X-Figma-Token` 请求头传输。请勿将其写入图谱、`meta.json`、日志或中间文件。本技能会对 `api.figma.com` 发起外部调用——与 `/understand` 不同，它并非完全离线。请向用户说明这一点。

## 第 0 阶段 — 预检

1. 解析 `$ARGUMENTS` 中的 Figma URL 或裸文件 key（非 flag 标记 token）以及可选的 `--language <lang>`。
2. 将 `PROJECT_ROOT` 解析为当前工作目录。**一次性解析数据目录 `$UA_DIR`** 并在后续所有读写中复用：`UA_DIR="$PROJECT_ROOT/$([ -d "$PROJECT_ROOT/.understand-anything" ] && echo .understand-anything || echo .ua)"`——若 `.understand-anything/` 已存在则使用该目录，否则使用新的 `.ua/`。由于每个阶段可能在新的 shell 中运行，请像传递 `$PROJECT_ROOT` 一样向后续阶段传递 `$UA_DIR`；如果后续命令块需要它，请使用相同命令重新解析。
3. 解析 `PLUGIN_ROOT` 并确保核心模块已构建（与 `/understand` 的 Phase 0.1.5 使用相同逻辑）。如果缺少 `packages/core/dist/figma/index.js`，请执行：
   ```bash
   cd "$PLUGIN_ROOT" && (pnpm install --frozen-lockfile 2>/dev/null || pnpm install) && pnpm --filter @understand-anything/core build
   ```
4. `mkdir -p $UA_DIR/intermediate`。

## 第 1 阶段 — 获取与解析（确定性）

运行捆绑的扫描脚本（`<SKILL_DIR>` 为该技能目录）：

```bash
FIGMA_TOKEN="$FIGMA_TOKEN" node <SKILL_DIR>/figma-scan.mjs "$PROJECT_ROOT" "<url-or-key>"
```

它会写入 `$UA_DIR/intermediate/scan-manifest.json` 并打印节点计数。将计数返回给用户。如果返回非零退出码，请转发 stderr 并停止。

> 如果扫描输出 `UP_TO_DATE`，请报告“设计图谱已经与该 Figma 文件版本保持最新”，并停止。要强制完全重建，请在环境变量中设置 `UNDERSTAND_FIGMA_FORCE=1` 后重试。

## 第 2 阶段 — 分析（LLM 增强）

1. 读取 `scan-manifest.json`。将节点按约 15 个一组进行分批，并尽量按页面分组。
2. 对每个批次，使用 `design-analyzer` 智能体定义（`agents/design-analyzer.md`）分派子智能体。传入：
   - 批次节点（`id`、`type`、`name`、`figmaMeta`、子节点名称、令牌使用情况），
   - 所有现有节点 ID 的完整列表，
   - `$INTERMEDIATE_DIR = $UA_DIR/intermediate`，
   - 输出命名所需的批次编号。
   该智能体会写入 `analysis-batch-<N>.json`。
   若提供了 `--language`，则附加 `$LANGUAGE_DIRECTIVE`（复用 `/understand` 的指令文本）。
3. 最多并发运行 **5 个**批次。若某个批次失败，请记录警告并继续——manifest 是可靠基础。

## 第 3 阶段 — 合并

```bash
node <SKILL_DIR>/figma-merge.mjs "$PROJECT_ROOT"
```

它会合并 `scan-manifest.json` + `analysis-batch-*.json`，运行 `mergeDesignGraph`（校验并重新附加 `kind:"design"`），并写入 `knowledge-graph.json` + `meta.json`。将打印的统计信息和任何非 `auto-corrected` 的问题返回给用户。

## 第 4 阶段 — 保存与启动

1. 清理中间文件，**但保留** `scan-manifest.json`：
   ```bash
   INTER="$UA_DIR/intermediate"
   find "$INTER" -mindepth 1 -maxdepth 1 -not -name 'scan-manifest.json' -exec rm -rf {} +
   ```
2. 报告摘要：项目名称、按节点类型统计、按边类型统计、图层、导览步骤，以及路径 `$UA_DIR/knowledge-graph.json`。
3. 通过调用 `/understand-dashboard` 技能自动启动仪表板。
