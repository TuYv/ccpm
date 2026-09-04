---
name: comet-archive
description: "Comet Phase 5: Archive. Invoke with /comet-archive. Merge delta specs into main specs with OpenSpec semantics, archive change."
---
# Comet 阶段 5：归档（Archive）

## 前置条件

- 验证已通过（阶段 4 完成）
- 分支已处理
- `openspec/changes/<name>/.comet.yaml` 中的 `verify_result: pass`

## 步骤

### 0. 输出语言约束

归档摘要和生命周期闭环说明必须使用触发此工作流的用户请求所用的语言。

### 0. 入口状态验证（Entry Check）

执行入口验证：

```bash
COMET_ENV="${COMET_ENV:-$(find . "$HOME"/.*/skills "$HOME/.config" "$HOME/.gemini" -path '*/comet/scripts/comet-env.sh' -type f -print -quit 2>/dev/null)}"
if [ -z "$COMET_ENV" ]; then
  echo "ERROR: comet-env.sh not found. Ensure the comet skill is installed." >&2
  return 1
fi
. "$COMET_ENV"
"$COMET_BASH" "$COMET_STATE" check <name> archive
```

验证通过后继续执行步骤 1。验证失败时，脚本会输出具体的失败原因。

### 1. 最终归档确认（Blocking Point）

入口验证通过后，**必须遵循 `comet/reference/decision-point.md` 协议暂停并等待用户确认是否立即归档**。在用户确认之前，不得运行 `"$COMET_BASH" "$COMET_ARCHIVE" "<change-name>"`。

确认前，向用户展示简要摘要：
- 变更名称
- 验证报告路径与结果
- 分支处理状态
- 本次归档将执行的不可逆操作：使用 OpenSpec delta 语义合并主规范、标注设计文档 / 计划，并将变更移动到归档目录

用户确认问题必须以单选题形式呈现，并包含以下选项：
- “确认归档” — 立即运行归档脚本，完成规范合并与变更移动
- “需要调整或重新验证” — 不归档；运行 `"$COMET_BASH" "$COMET_STATE" transition <change-name> archive-reopen` 以回到 `phase: verify`，然后调用 `/comet-verify`。如果验证确认需要修复，则按照 `/comet-verify` 的验证失败决策流程返回 `/comet-build`
- “暂不归档” — 不归档；保持当前 `phase: archive` 状态，等待用户稍后再次调用 `/comet-archive`

只有在用户选择“确认归档”后，步骤 2 才能继续。用户选择“需要调整或重新验证”后，必须先执行 `archive-reopen` 状态转换；不要手动编辑 `.comet.yaml`。

### 2. 执行归档

运行归档脚本以自动完成所有步骤：

```bash
"$COMET_BASH" "$COMET_ARCHIVE" "<change-name>"
```

脚本会自动执行：
1. 入口状态校验（phase=archive, verify_result=pass, archived=false）
2. 设计文档 frontmatter 标注（archived-with, status）
3. 计划 frontmatter 标注（archived-with）
4. 执行 OpenSpec 归档以应用 delta 合并语义，并将变更移动到归档目录
5. 对主规范执行守卫检查，防止泄漏 delta 专属的章节标题
6. 通过 `comet-state transition <archive-name> archived` 更新 `archived: true`

若脚本返回非零退出码，报告错误并停止。
若脚本返回零退出码，归档完成。
摘要 `X/Y steps succeeded` 统计实际执行的步骤，不会重复计算 delta 规范同步或文档标注。

脚本会调用 OpenSpec 归档，将 `ADDED/MODIFIED/REMOVED/RENAMED` 的 delta 语义合并到主规范中，然后验证主规范不包含 delta 专属的章节标题。

使用 `--dry-run` 标志可在不执行的情况下预览。

### 3. 生命周期闭环

规范生命周期在此完成：
```
brainstorming → delta spec → implementation → verification → main spec merge → design doc annotation → archive
```

## 退出条件

- 归档脚本执行成功（退出码 0）
- 归档目录 `openspec/changes/archive/YYYY-MM-DD-<change-name>/` 存在
- 归档后的 `.comet.yaml` 包含 `archived: true`

归档脚本会将 `openspec/changes/<name>/` 移动到 `openspec/changes/archive/YYYY-MM-DD-<name>/`。

> **警告**：归档成功后，**不要**针对旧的活动变更名称运行 `"$COMET_BASH" "$COMET_GUARD" <change-name> archive`；活动目录已不存在。这样做会导致守卫脚本报错 "change directory not found"。归档是否完整由脚本退出码和归档目录状态决定。

## 完成

Comet 工作流已完成。要开始新的工作，请调用 `/comet` 或 `/comet-open`。

## 上下文压缩恢复

按照 `comet/reference/context-recovery.md` 执行，phase 设为 `archive`。如果 `archived: true` 且归档目录存在，则归档已完成——不要重复执行归档操作。
