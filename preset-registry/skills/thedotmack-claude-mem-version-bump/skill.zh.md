---
name: version-bump
description: Automated semantic versioning and release workflow for Claude Code plugins. Handles version increments across package.json, marketplace.json, plugin.json manifests, build verification, git tagging, GitHub releases, and changelog generation. NPM publishing (so `npx claude-mem@X.Y.Z` resolves) is handed off to the human maintainer, who raised npm security.
---
# 版本更新与发布流程

**重要：** 开始前先制定并编写详细的发布说明。

**关键：** 提交全部内容（包括构建产物）。在该流程结束时，不能有任何未提交或未推送的内容。最后运行 `git status` 进行校验。

## 准备

1.  **分析**：判断变更属于 **PATCH**（修复问题）、**MINOR**（新增功能）或 **MAJOR**（不兼容变更）。
2.  **环境**：从 `git remote -v` 中确认仓库所有者/名称。
3.  **路径 — 所有包含版本号的文件**：
    - `package.json` — **npm/npx 发布的版本**（`npx claude-mem@X.Y.Z` 从此处解析）
    - `plugin/package.json` — 打包的插件运行时依赖
    - `.claude-plugin/marketplace.json` — 位于 `plugins[0].version` 的版本
    - `.claude-plugin/plugin.json` — 顶层 Claude-plugin 清单
    - `plugin/.claude-plugin/plugin.json` — 打包的 Claude-plugin 清单
    - `.codex-plugin/plugin.json` — Codex-plugin 清单
    - `plugin/.codex-plugin/plugin.json` — 打包的 Codex-plugin 清单
    - `openclaw/openclaw.plugin.json` — OpenClaw 插件清单

    编辑前请先校验：`git grep -l "\"version\": \"<OLD>\""` 应该列出以上八个文件。如果文档更新后新增了清单文件，请更新此列表。

## 流程

1.  **更新**：在上述每个路径中递增版本号。**不要修改** `CHANGELOG.md`，它会被重新生成。
2.  **校验**：`git grep -n "\"version\": \"<NEW>\""` — 确认全部八个文件版本一致。`git grep -n "\"version\": \"<OLD>\""` — 应该没有任何命中结果。
3.  **构建与同步**：执行 `npm run build-and-sync` 以重建产物、同步本地 marketplace 副本、重启 worker 并清空队列。发布验证时不要使用普通 `npm run build`，因为它可能导致本地 marketplace/worker 处于不同步状态。
4.  **提交**：`git add -A && git commit -m "chore: bump version to X.Y.Z"`.
5.  **打标签**：`git tag -a vX.Y.Z -m "Version X.Y.Z"`.
6.  **推送**：`git push origin main && git push origin vX.Y.Z`.
7.  **发布到 npm — 交由人工执行。** 人工维护者提高了 npm 安全等级，因此当前发布需要仅由其提供的凭据/2FA 完成。该 agent 不得自行运行 `npm publish`（也不得运行 `np` / `npm run release:*`，这些命令也会发布）。**现在请将 npm 发布交由人工处理：** 停止当前操作并告知其版本已提交、已打标签并已推送，需要由其发布到 npm 才能使 `npx claude-mem@X.Y.Z` 可解析。向其提供以下命令：
    ```bash
    npm publish   # run by the HUMAN — the prepublishOnly script rebuilds the package
    ```
    等待人工确认其完成发布后，再验证是否成功落库：
    ```bash
    npm view claude-mem@X.Y.Z version   # should print X.Y.Z
    ```
    如果发布构建触及本地产物，之后再执行一次 `npm run build-and-sync`。
8.  **GitHub 发布**：`gh release create vX.Y.Z --title "vX.Y.Z" --notes "RELEASE_NOTES"`.
9.  **变更日志**：通过项目的变更日志脚本重新生成：
    ```bash
    npm run changelog:generate
    ```
    （运行 `node scripts/generate-changelog.js`，该脚本会从 GitHub API 拉取发布记录并重写 `CHANGELOG.md`。）
10. **同步变更日志**：提交并推送更新后的 `CHANGELOG.md`。
11. **通知**：从 `~/Scripts/claude-mem/` 运行 Discord 通知脚本，读取 `.env` 中的 Discord webhook 信息：
    ```bash
    cd ~/Scripts/claude-mem/ && npm run discord:notify vX.Y.Z
    ```
    即使发布工作区本地不存在 `.env`，也要执行此步骤。
12. **收尾**：`git status` —— 工作区必须是干净状态。

## 检查清单

- [ ] All eight config files have matching versions
- [ ] `git grep` for old version returns zero hits
- [ ] `npm run build-and-sync` succeeded
- [ ] Git tag created and pushed
- [ ] **NPM publishing handed off to the human** (agent does NOT run `npm publish` — human raised security); once they publish, `npm view claude-mem@X.Y.Z version` confirms it (so `npx claude-mem@X.Y.Z` resolves)
- [ ] GitHub release created with notes
- [ ] `CHANGELOG.md` updated and pushed
- [ ] Discord notification run from `~/Scripts/claude-mem/`
- [ ] `git status` shows clean tree
