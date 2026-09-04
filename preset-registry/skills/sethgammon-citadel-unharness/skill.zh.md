---
name: unharness
license: MIT
description: >-
  Safely leave Citadel using the active adoption receipt. Produces a no-write,
  reviewable plan, preserves a portable archive, removes only exact owned
  material, and reports modified or externally registered surfaces as retained
  or unknown. Legacy installs must be imported before exact leave is claimed.
user-invocable: true
auto-trigger: false
trigger_keywords:
  - unharness
  - remove citadel
  - uninstall citadel
  - clean up citadel
  - remove harness
  - uninstall harness
last-updated: 2026-07-30
---
# /unharness - 凭回执退出 Citadel

## 方向定位

当用户希望从项目中移除 Citadel 时使用此技能。退出是一个两步、凭回执的操作。计划永不修改项目。执行（Apply）需要确切的已保存计划及其确认令牌。

不要根据眼熟的路径推断所有权。不要仅因为 `.planning/`、`.citadel/`、运行时设置、钩子、技能或注册看起来与 Citadel 相关就将其删除。

## 协议

### 1. 定位 Citadel 并检查接管权限

存在时读取 `.citadel/plugin-root.txt`。否则使用包含此技能的目录。检查 `.citadel/adoption/active.json`；接管规划器还会检查私有恢复账本。

### 2. 创建只读离开计划

在项目内选择一个计划路径，例如
`.planning/adoption/leave.plan.json`，然后运行：

```bash
node {citadelRoot}/scripts/adopt.js leave plan \
  --target {projectRoot} \
  --out {planPath} \
  --json
```

向用户展示：

- 将被移除或恢复的确切文件；
- 将被保留的已修改或有歧义的足迹条目；
- 可移植归档路径；
- 移除证据为 `unknown` 的运行时注册；
- 计划摘要和确认令牌。

如果结果为 `NOT_ADOPTED`，则停止。创建一份保守的遗留清单：

```bash
node {citadelRoot}/scripts/adopt.js import plan {citadelRoot} \
  --target {projectRoot} \
  --out {importPlanPath} \
  --json
```

只有在获得该导入自身的明确批准后才执行它。然后根据产生的回执创建新的离开计划。绝不将遗留清理描述为确切移除。

### 3. 获得明确批准

离开操作具有破坏性。要求用户批准所展示的计划和确切的确认令牌。不要基于未保存或重新生成的计划执行。

### 4. 执行并验证

获得批准后：

```bash
node {citadelRoot}/scripts/adopt.js leave apply {planPath} \
  --confirm {confirmationToken} \
  --json

node {citadelRoot}/scripts/adopt.js doctor \
  --target {projectRoot} \
  --json
```

干净退出后 Doctor 可能报告 `not_adopted`。报告离开回执、归档路径、已移除条目、保留的冲突，以及每一条 `unknown` 的注销观测结果。只有当回执证明了每一项必需的本地与外部移除时，才允许声明『Citadel 已移除』。

## 仅导出兼容模式

当用户明确希望在不退出的情况下获得人类可读的导出时：

```bash
node {citadelRoot}/scripts/unharness.js {projectRoot} --export-only
```

这会写入旧版 Markdown 归档，但不移除 harness 材料。

## 边缘情况

- 如果 `.planning/` 不存在，将其视为空的可移植状态集并显示设置/导入提示；不要为了退出而创建它。
- 接管权限缺失或无效会阻止退出。使用 `import plan` 或私有账本恢复；绝不猜测所有权。
- 已保存计划、源、目标或前置映像发生变更时需要重新生成计划。
- 运行时注销 API 不可用时状态保持为 `unknown`；报告所需的手动观测。
- 如果无法定位 Citadel 根目录，则停止并指出确切缺失的路径。

## 质量关卡

- 除非用户明确请求 `--out`，规划阶段是只读的。
- 执行（Apply）只消费确切的已保存计划，并重新验证源、目标和前置映像。
- 已修改的自有材料会被保留，并带有显式冲突标记。
- 共享运行时文件只有在已安装字节保持完全一致时才恢复确切的前置映像。
- 缺失的回执、格式错误的回执以及无法枚举的注册一律为 `unknown` 或被阻止，绝不视为成功。
- 可移植归档和私有回执账本保持可用，以供还原和恢复。

## 退出协议

返回离开操作 ID 和回执摘要、可移植归档路径、确切的移除/恢复计数、保留的冲突，以及未知的外部移除项。明确说明是否证明了确切退出。当所需的移除证据缺失时，不要因命令执行完毕就声称成功。
