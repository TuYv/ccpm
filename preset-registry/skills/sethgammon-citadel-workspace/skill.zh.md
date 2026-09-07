---
name: workspace
license: MIT
description: >-
  Multi-repo campaign coordinator. Same lifecycle as fleet -- scope claims,
  discovery relay, wave-based execution -- but the unit of work is a repo,
  not a file. Coordinates campaigns across repositories with shared context.
user-invocable: true
auto-trigger: false
trigger_keywords:
  - workspace
  - multi-repo
  - cross-repo
  - across repos
  - multiple repos
  - coordinate repos
  - add redis and snowflake
  - split into repos
last-updated: 2026-03-29
effort: high
---
# /workspace —— 多仓库任务活动协调器

## 何时使用

- 新增横跨多个仓库的基础设施（新数据库、共享服务、API 契约）
- 在前端仓库、后端仓库和基础设施仓库之间协调变更
- 将单体应用拆分为服务（每个服务成为一个仓库范围的任务活动）
- 任何仓库 A 中的变更依赖于或影响仓库 B 中变更的任务

**以下情况请勿使用：**
- 所有工作都在单个仓库中（改用 `/fleet` 或 `/archon`）
- 各仓库完全独立、没有共享契约（只需分别运行各自的任务活动即可）

## 协议

### 第 1 步：定位

1. 检查是否存在已有的工作区会话：`.planning/workspace/session-{slug}.md` —— 若 `status: active` 或为 `needs-continue` 则恢复该会话
2. 若全新开始：识别各仓库、验证每个路径都是 git 仓库、读取每个仓库的 `CLAUDE.md`、检查 `.planning/campaigns/` 中是否有进行中的任务活动（避免冲突）
3. **加载先前会话上下文并启动监视器**：
   ```bash
   node .citadel/scripts/momentum-watch-start.cjs
   node .citadel/scripts/momentum-read.cjs
   ```
   若输出为空，则跳过 momentum 注入。

### 第 2 步：分解

将方向拆解为仓库范围的工作项（每波次中每个仓库对应一个任务活动）。表格格式：`# | Repo | Campaign Direction | Scope | Deps | Wave`。

**规则：** 无依赖的项 → 第 1 波；有依赖的项 → 第 2 波及以后。每波最多 3 个仓库级任务活动。范围格式：`{repo}:{path}`。

对于每个跨波次的依赖，都要指定跨仓库契约：生产方将产出什么、消费方期望什么，以及契约存放于何处（共享类型包、OpenAPI 规范、环境变量）。

### 第 3 步：工作区会话文件

创建 `.planning/workspace/session-{slug}.md`，frontmatter 包含：`version`、`id`、`status: active`、`started`、`completed_at: null`、`direction`、`repos`（每个仓库的路径 + 名称 + 分支）、`wave_count`、`current_wave: 1`、`campaigns_total`、`campaigns_complete: 0`。

正文各节：方向、仓库表（名称/路径/分支/状态）、工作队列（第 2 步生成的表格）、跨仓库契约（生产方/消费方/契约/位置）、波次执行日志（每个波次：状态、任务活动、开始时间、完成时间）、共享上下文（发现中转的累积内容）。

### 第 4 步：波次执行

对每个波次：

#### 4a. 预检
- 验证先前波次中的所有依赖任务活动均已成功完成
- 检查跨仓库契约：生产方仓库是否创建了预期的产出？
- 若某个依赖失败：搁置受依赖的任务活动，标记并交由用户决策

#### 4b. 派生任务活动
对本波次中的每个仓库级任务活动：

1. 创建分支：`git checkout -b workspace/{slug}/{repo-name}`
2. 派生 agent 并下达方向：复杂任务（3 个及以上阶段）用 `/archon`，可并行化的用 `/fleet`，简单任务（1-2 步）用 `/marshal` 或直接调用技能
3. 注入上下文：先前波次的发现简报、先前会话上下文（通过 `node .citadel/scripts/momentum-read.cjs` 重新读取 `momentum.json`，以 `=== PRIOR SESSION CONTEXT ===` 形式注入，若为空则跳过）、跨仓库契约、来自其他仓库的相关 `CLAUDE.md` 章节

#### 4c. 收集结果
提取 HANDOFF 块，压缩为跨仓库发现简报，写入持久化发现记录：
  ```bash
  node .citadel/scripts/discovery-write.cjs \
    --session {session-slug} --agent {repo-name}-{campaign-type} \
    --wave {wave-number} --status {success|partial|failed} \
    --scope "{repo-name}:{scope-path}" --handoff "{json-array}" \
    --decisions "{json-array}" --files "{json-array}" --failures "{json-array}"
  ```

#### 4d. 发现中转
为每个已完成的任务活动写入 `workspace/briefs/wave{N}-{repo-name}.md`。
同时写入 `workspace/briefs/wave{N}-cross-repo.md`，总结：
- 新创建的 API 端点或类型
- 影响其他仓库的配置变更
- 契约履行状态（生产方是否交付了承诺的内容？）

#### 4e. 契约验证
对每个跨仓库契约：验证生产方创建了预期产出（类型对应文件 + 导出，端点对应路由存在）。若验证失败，进行标记，并且不继续执行消费方。

#### 4f. 更新会话
标记已完成的任务活动，更新波次状态，写入发现中转，推进 `current_wave`。

### 第 5 步：完成

1. 对每个仓库独立运行 typecheck/build（若存在共享类型包，先构建它）
2. 将会话设为 `status: completed`、`completed_at: {ISO timestamp}`
3. 运行 `node .citadel/scripts/momentum-synthesize.cjs`
4. 列出各仓库中创建的所有分支，并基于依赖图给出建议的合并顺序
5. 输出 HANDOFF

## 边缘情况

- **仓库不是 git 仓库：** 跳过它。报告哪些仓库被跳过及原因。
- **仓库存在未提交的变更：** 建分支前先 stash。在会话文件中记录 stash 引用。
  在完成或失败时执行 pop。
- **目标仓库中已有进行中的任务活动：** 不要启动第二个任务活动。报告该冲突，
  并询问用户是等待、搁置现有任务活动，还是合并范围。
- **`.planning/workspace/` 不存在：** 创建它（连同 `workspace/briefs/`）。
- **跨仓库契约被破坏：** 搁置所有下游任务活动。报告哪个契约失败、哪个生产方
  负责该契约、消费方期望的是什么。不要试图自行修复生产方 —— 将问题呈报给用户，
  或重新运行生产方的任务活动。
- **一个仓库失败，其他仓库成功：** 标记失败的仓库级任务活动。不要回滚成功的
  仓库。由用户决定是修复后继续还是放弃。
- **仓库位于不同机器或远程：** 不支持。所有仓库必须可在本地访问。若某个仓库仅存在于远程，
  用户必须先将其克隆到本地。
- **包含多个包的 monorepo：** 在范围划分上，将每个包视为一个“仓库”。
  使用 `{monorepo}:{package-path}` 作为范围标识符。

## 情境闸门

**披露：** "正在跨 [repos] 运行多仓库任务活动。变更将独立提交到各仓库。"
**可逆性：** 红 —— 协调跨多个仓库的变更；跨仓库的提交很难批量回滚。
**信任闸门：**
- 熟练（5 次以上会话）：可自主协调多仓库任务活动；新手应针对每个仓库分别使用 /marshal。

## 质量闸门

- [ ] 开始前已验证所有仓库都是可访问的 git 仓库
- [ ] 工作队列在同一仓库内没有范围重叠
- [ ] 为每个跨波次依赖都指定了跨仓库契约
- [ ] 每个波次之后都写入了发现中转
- [ ] 在派生消费方任务活动之前运行了契约验证
- [ ] 完成后每个仓库的 typecheck/build 均独立通过
- [ ] 每个波次之后都更新了会话文件（而不是只在最后）
- [ ] 完成时没有任务活动处于 `active` 状态

## 退出协议

```
---HANDOFF---
- Workspace: {slug} -- {direction summary}
- Repos: {N} repos, {M} campaigns across {W} waves
- Results: {completed}/{total} campaigns succeeded
- Branches: {list branches ready for review}
- Merge order: {suggested order based on dependency graph}
- Unresolved: {any failed campaigns or broken contracts}
---
```
