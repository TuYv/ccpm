---
name: reflect-skills-from-memory
description: This skill should be used when the user asks to "reflect on skills from memory", "audit marketplace skills against memory", "从记忆中检查 skills 的问题", "反思并修改 skill", "apply memory feedback to skills", or wants to turn accumulated memory feedback about this marketplace's skills into concrete skill fixes. Reads the project's persistent memory, re-verifies each known skill problem against current code, then fixes the skill or corrects the stale memory.
version: 0.1.0
---
# 根据记忆反思技能

将关于 Claude Code 插件市场技能的累积记忆反馈转化为具体且经过验证的修复。记忆记录了来之不易的经验教训（“L3 规则会被跳过”、“git 插件仍然没有提交钩子”），但记忆只是某个时间点的快照——它会逐渐与代码脱节。此技能用于闭合反馈循环：回忆反馈，根据当前技能重新验证，然后修复有问题的一方——技能或记忆。

请在插件市场仓库（例如 `dotclaude`）中运行此技能，该仓库的反馈存放在每个项目对应的记忆目录中。

## 何时使用

当请求根据已记住的反馈来反思、审计或核对该插件市场的技能，或者将尚未处理的记忆反馈应用于技能文件时触发。

## 工作流程

### 阶段 1：定位并加载记忆

解析每个项目对应的记忆目录。Claude Code 通过将项目路径中的每个 `/` 替换为 `-` 对其进行编码：

```bash
MEM="$HOME/.claude/projects/$(pwd | sed 's/\//-/g')/memory"
ls "$MEM"/MEMORY.md "$MEM"/*.md
```

首先阅读 `MEMORY.md`（索引），然后阅读每个 `feedback_*.md` 记忆——这些文件包含可操作的问题。还要阅读指出特定插件的 `project_*.md` 记忆（它们通常会记录固定于特定版本的修复，以及“升级后重新验证”的提示）。

### 阶段 2：提取候选技能问题

从反馈记忆中构建一份关于技能的具体、可检查的声明列表。每个候选项都需要包含：声明、它所涉及的目标技能/文件，以及验证方式。跳过没有对应技能产物、仅表达偏好的记忆（例如“用中文回复”）。

此项目的记忆中记录了以下反复出现的问题类别（将其视为长期检查清单）：
- **L2/L3 强制执行**（`skill-l2-l3-enforcement-pattern`）：仅存在于 `references/*.md` 中或仅以软性措辞（`## Pre-operation Checks`、`Note:`、`warn user`）表达的强制规则会被跳过。它们必须是 SKILL.md 正文中的 `CRITICAL:` 块（L2）。
- **缺少强制执行钩子**（`git-commit-hook-added`）：plugin.json 可能缺少所需的钩子。应通过检查当前的 `hooks` 字段进行验证，而不能相信记忆中的版本。
- **过时的模型/分支/版本事实**（`project_gitflow_plugin` 及相关记忆）：硬编码的模型名称、分支落地假设或版本号会逐渐过时。

### 阶段 3：根据当前代码重新验证（不要相信记忆）

对于每个候选项，在进行任何更改之前，先根据当前文件进行验证。记忆中的“可能已过时”警告是有原因的，而且此项目中的自我审计曾发现审计者自己刚刚写入的错误（`feedback_self_audit_caught_my_bugs`、`verification-requirement-before-reporting`）。具体来说：
- 阅读记忆所指向的实际 SKILL.md / plugin.json。
- 确认问题是否仍然存在（grep 搜索软性措辞、检查 `hooks` 键、核对模型字符串/版本）。
- 将每个候选项分类为：**仍有问题**（修复技能）、**已修复**或**错误**（改为修复记忆），或者**不适用**（记录后继续）。

当变更涉及 Claude Code 自身的 API 表面（hook schema、frontmatter 字段、
工具名称）时，请在编辑前通过 `claude-code-guide` agent 确认当前行为
（`use-claude-code-guide-agent`）——不要根据记忆中的 API 形式进行编辑。

### 阶段 4：修复 skill（STILL-BROKEN）

应用能够解决已验证问题的最小变更，并与周围风格保持一致：
- 将被跳过的规则或软性规则提升为 SKILL.md 正文中的 `CRITICAL:` 块；保留 L3
  引用作为详细信息的指引，而不是该规则唯一存在的位置。
- 添加缺失的 hook / 更正过时的事实。
- 当某条 CRITICAL 断言有意与后续阶段重复时（例如顶层防护规则
  加上详细的阶段 0），请在两处都注明它们必须同步更改。

编辑插件的 skill 后，请在该插件的 `plugin.json` 中递增版本号，并同步更新
`.claude-plugin/marketplace.json` 中对应的条目——两者必须保持一致（报告前，
请逐一核对每个 `plugin.json` 的版本与 `marketplace.json`）。如果添加/删除/重命名
插件后 README 中的插件列表出现偏差，请交由项目的 `/utils:update-readme` 处理。

### 阶段 5：修复 memory（ALREADY-FIXED / WRONG）

当验证表明 memory 已过时或有误时，请更正 memory 文件，而不是 skill：
更新版本/日期/声明，并保持 `MEMORY.md` 中的索引行同步。如果某个
memory 的 `name:` slug 发生变化，基于文件名的 `MEMORY.md` 链接仍然有效，但需要检查
现在已失效的 `[[slug]]` wikilink。Memory 文件位于 git 仓库之外，无需提交。

### 阶段 6：验证并报告

使用项目的 optimizer（`/plugin-optimizer:optimize-plugin`
或 `python3 plugin-optimizer/scripts/validate-plugin.py <plugin-path>`）验证被修改的插件。当修复的是
hook 或其他防护脚本时，请在报告前同时测试应触发和应放行两条路径
（`feedback_self_audit_caught_my_bugs`）。然后针对每个候选项报告：声明 → 结论
（STILL-BROKEN / ALREADY-FIXED / WRONG / NOT-APPLICABLE）→ 采取的操作（skill 编辑及文件
路径，或 memory 更正）。说明验证了什么以及如何验证。

## 硬性规则

- CRITICAL: 编辑前必须对照当前文件重新验证每一条记忆中的声明。绝不能仅根据
  memory 内容编辑 skill 或断言问题已修复。
- CRITICAL: 绝不能为了提交而运行 `git add` / `git commit` / `git status` / `git diff`。
  当用户要求提交 skill 修复时，请通过 Skill 工具调用 `/git:commit` skill
  ——它会处理暂存和提交消息生成。
- 保持变更最小化并与周围风格一致；不要引入文件中原本没有的防御性检查、
  额外注释或抽象。