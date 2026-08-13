---
name: agent-eval
description: Benchmark CodeGraph retrieval quality on a real codebase by comparing agent behavior with vs without CodeGraph. Use when the user runs /agent-eval or asks to test, benchmark, audit, or validate a codegraph version (the local dev build or a published npm version) against a language's repo.
---
# CodeGraph 质量审计

衡量在某个真实仓库上，CodeGraph 相较于直接 `grep/read` 对 agent 的帮助程度，使用的是所选的 CodeGraph 版本。由 `scripts/agent-eval/` 中的 harness 驱动。

## 前置条件
- `tmux` 3+、已登录的 `claude` CLI、`node`、`git`（macOS/Linux）。
- 从 codegraph 仓库根目录运行。

## 工作流

复制此清单：
```
- [ ] 1. Pick version (local or npm)
- [ ] 2. Pick language
- [ ] 3. Pick repo by size
- [ ] 4. Pick harness (headless / tmux / both)
- [ ] 5. Run audit.sh in the background
- [ ] 6. Report results
```

**Step 1 — version.** 使用 `AskUserQuestion` 提问：要测试哪个 codegraph 版本。
提供“Local dev build”和“Latest published”；自由文本选项 “Other” 允许用户输入特定版本（例如 `0.7.10`）。将答案映射为 VERSION 标记：
- “Local dev build” → `local`
- “Latest published” → `latest`
- 输入的版本号 → 该字符串（例如 `0.7.10`）

**Step 2 — language.** 读取 `.claude/skills/agent-eval/corpus.json`。使用
`AskUserQuestion` 询问要测试的语言，并列出有条目的语言。

**Step 3 — repo.** 从所选语言的条目中询问要测试哪个仓库。将每个选项标注大小和文件数，例如 `excalidraw — Medium (~600 files)`。
每条记录包含 `repo` URL 和一个代表性 `question`。

**Step 4 — harness.** 使用 `AskUserQuestion` 询问要运行哪个 harness，并映射为 MODE 标记：
- “Headless” → `headless` — `claude -p` 且使用 stream-json：精确统计 token/成本，以及干净的工具序列（2 次运行，快速，无 TTY）。
- “Interactive (tmux)” → `tmux` — 在 tmux 中驱动真实 Claude TUI：忠实再现 Explore 子代理行为，从会话日志获取指标（2 次运行，较慢）。
- “Both” → `all` — headless + interactive（共 4 次运行）。

**Step 5 — run.** 后台启动（设置版本、缺失则克隆、清理并重建索引、运行选定分支；通常需数分钟）：
```bash
scripts/agent-eval/audit.sh <VERSION> <repo-name> <repo-url> "<question>" <MODE>
```

**Step 6 — report.** 作业完成后读取日志并按分支报告：
- Headless（`parse-run.mjs`）：工具总调用数、`Read` 文件数、`Grep/Bash` 数、codegraph-tool 调用数、耗时、**总成本**。
- Interactive（`parse-session.mjs`）：`VERDICT: codegraph_explore used Nx |
  Read N | Grep/Bash N` 与 `TOKENS:` 行。
- 两条路径还会输出三项反馈指标——剩余上下文占用、探索充分性、分配效率——并且 headless 与 interactive 的 A/B 对比会生成并列的 `ARM COMPARISON` 表格。先检查该表的污染行：若 `CLI calls that RETURNED output` > 0，说明该分支通过 Bash 接触到了 codegraph，数据无效。其余字段解释见：
  `docs/benchmarks/agent-eval-feedback-metrics.md`。

优先报告成本 + 工具/Read 次数——这是更可靠的信号；原始 token in/out 会受到子代理委派和 prompt 缓存的影响。说明 codegraph 是否降低了工作量，以及两条分支是否都给出了正确答案。

## 备注
- 每次运行都会重建索引（`audit.sh` 会清理 `.codegraph`）——不同版本提取方式不同，因此索引必须由构建它的同一个二进制提供。
- `audit.sh` 会临时改写全局 `codegraph` 安装用于测试，然后通过 `local-install.sh` 恢复你的开发链接。
- Corpus 仓库会克隆到 `/tmp/codegraph-corpus`（若已存在则复用）。
- 在 `corpus.json` 中添加或编辑仓库（字段：`name`、`repo`、`size`、`files`、`question`）。
