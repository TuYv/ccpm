---
name: understand-figma
description: Analyze a Figma file via the Figma REST API and generate an interactive design knowledge graph (pages, screens, components, component sets, instances, design tokens) with a kind:"design" dashboard.
argument-hint: "<figma-file-url-or-key> [--language <lang>]"
---
# /understand-figma

分析一个 Figma 文件，并在现有仪表盘中生成一个交互式设计知识图谱。

## 前置条件

- **`FIGMA_TOKEN`** 环境变量——Figma 个人访问令牌（在 https://www.figma.com/settings 创建）。如果缺失，请停止并告知用户：
  > 先设置 Figma 令牌：在 figma.com/settings 创建，然后 `export FIGMA_TOKEN=<token>`。
- Node ≥ 22，pnpm ≥ 10。

> **安全：** 该令牌仅从环境变量读取，并且仅在 `X-Figma-Token` 请求头中传输。绝不能将其写入图谱、`meta.json`、日志或中间文件。该技能会向 `api.figma.com` 发起外部调用——与 `/understand` 不同，它并非完全离线。请向用户说明这一点。

## 阶段 0 — 预检

1. 解析 `$ARGUMENTS`，获取 Figma URL 或裸文件 key（非 flag 标记的 token）以及可选的 `--language <lang>`。
2. 将 `PROJECT_ROOT` 解析为当前工作目录。**解析数据目录 `$UA_DIR`** 一次，并在下文所有读取与写入中复用：`UA_DIR="$PROJECT_ROOT/$([ -d "$PROJECT_ROOT/.understand-anything" ] && echo .understand-anything || echo .ua)"`——若 `.understand-anything/` 已存在则沿用旧目录，否则使用新的 `.ua/`。由于每个阶段可能在新的 shell 中运行，请像传递 `$PROJECT_ROOT` 一样向后续命令块传递 `$UA_DIR`，如果后续命令块需要时使用同一行命令重新解析。
3. 解析 `PLUGIN_ROOT` 并确保 core 已构建（与 `/understand` 的 0.1.5 阶段使用同样的逻辑）。若缺失 `packages/core/dist/figma/index.js`，请执行：
   ```bash
   cd "$PLUGIN_ROOT" && (pnpm install --frozen-lockfile 2>/dev/null || pnpm install) && pnpm --filter @understand-anything/core build
   ```
4. `mkdir -p $UA_DIR/intermediate`。

## 阶段 1 — 获取与解析（确定性）

运行捆绑的扫描脚本（`<SKILL_DIR>` 是该技能目录）：

```bash
FIGMA_TOKEN="$FIGMA_TOKEN" node <SKILL_DIR>/figma-scan.mjs "$PROJECT_ROOT" "<url-or-key>"
```

它会写入 `$UA_DIR/intermediate/scan-manifest.json` 并打印节点数量。请将数量转告给用户。如果退出码非零，请转发 stderr 并停止。

> 若扫描输出 `UP_TO_DATE`，请报告“Design graph is already up to date for this Figma file version”，然后停止。若需强制完整重建，请在环境中设置 `UNDERSTAND_FIGMA_FORCE=1` 后重试。

## 阶段 2 — 分析（LLM 丰富化）

1. 读取 `scan-manifest.json`。将节点按约 15 个为一组，并尽量按页面分组。
2. 对每一批节点，使用 `design-analyzer` 智能体定义（`agents/design-analyzer.md`）分发一个子智能体。传入：
   - 节点批次（`id`、`type`、`name`、`figmaMeta`、子节点名称、token 使用情况）；
   - 全量现有节点 ID 列表；
   - `$INTERMEDIATE_DIR = $UA_DIR/intermediate`；
   - 用于输出命名的批次编号。  
   该智能体会写入 `analysis-batch-<N>.json`。
   如果提供了 `--language`，请追加 `$LANGUAGE_DIRECTIVE`（复用 `/understand` 的 directive 文本）。
3. 最多并发运行 **5** 批。若某批失败，请记录警告并继续——清单文件是坚实的基础。

## 阶段 3 — 合并

```bash
node <SKILL_DIR>/figma-merge.mjs "$PROJECT_ROOT"
```

它会合并 `scan-manifest.json` 与 `analysis-batch-*.json`，执行 `mergeDesignGraph`（会校验并重新挂接 `kind:"design"`），并写入 `knowledge-graph.json` 与 `meta.json`。请转报打印出的统计信息以及所有非 `auto-corrected` 的问题。

## 阶段 4 — 保存与启动

1. 清理中间文件，但保留 `scan-manifest.json`：
   ```bash
   INTER="$UA_DIR/intermediate"
   find "$INTER" -mindepth 1 -maxdepth 1 -not -name 'scan-manifest.json' -exec rm -rf {} +
   ```
2. 报告摘要：项目名称、各节点类型数量、各边类型数量、层级、tour 步骤，以及路径 `$UA_DIR/knowledge-graph.json`。
3. 通过调用 `/understand-dashboard` 技能自动启动仪表盘。
