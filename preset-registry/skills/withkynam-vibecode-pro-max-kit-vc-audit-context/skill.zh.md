---
name: vc-audit-context
description: Audit project context routing, shared-skill discoverability, and Claude/Codex wiring. Use when context docs or skill surfaces move, split, or drift.
trigger_keywords: audit context, context gaps, context routing audit, discoverability
layer: contract
metadata:
  author: vibecode-pro-max-kit
  version: "1.0.0"
---
# 审计上下文

> **输出风格：** 遵循 `process/development-protocols/communication-standards.md` —— 先给结论、使用平实语言、不使用未加解释的行话、长回复附 TL;DR。

使用此技能来验证项目的持久上下文层是可被发现且组织有序的。

可选输入：一个上下文分组、agent、技能或文件夹范围，用于在审计中优先处理。

## 工作流

0. 运行 `find process/context/ -type f | sort`，在路由之前先获取完整的文件清单。
   这样可确保当路由器不完整或发生漂移时，不会有任何上下文文件被静默跳过。
1. 阅读 `process/context/all-context.md`，了解上下文路由协议。
2. 阅读 `references/audit-context.md`，了解完整的审计流程。
3. 运行上下文发现验证器：
   ```bash
   node .claude/skills/vc-audit-context/scripts/validate-context-discovery.mjs
   ```
3a. 运行协议发现 frontmatter 验证器（对每个
   `process/development-protocols/**/*.md` 强制要求 discovery frontmatter，递归包含 `vc-system-behavior/`；`note.md` 是
   唯一有意设置的例外）：
   ```bash
   node .claude/skills/vc-audit-context/scripts/validate-protocol-discovery.mjs
   ```
4. 运行共享技能路由覆盖验证器：
   ```bash
   node .claude/skills/vc-audit-context/scripts/validate-skill-routing.mjs
   ```
5. 运行技能交叉引用验证器：
   ```bash
   node .claude/skills/vc-audit-context/scripts/validate-skill-cross-refs.mjs
   ```
6. 运行技能依赖/易混淆性分析：
   ```bash
   node .claude/skills/vc-audit-context/scripts/validate-skill-dependencies.mjs
   node .claude/skills/vc-audit-context/scripts/validate-confusable-skills.mjs
   ```
7. 重新生成或检查机器可读的技能目录：
   ```bash
   node .claude/skills/vc-audit-context/scripts/generate-skills-catalog.mjs --write
   node .claude/skills/vc-audit-context/scripts/generate-skills-catalog.mjs --check
   ```
8. 验证每个 SKILL.md 都带有 `trigger_keywords` + 有效的 `layer`
   （`contract`|`helper`），并且目录保持同步：
   ```bash
   node .claude/skills/vc-audit-context/scripts/validate-skill-keywords.mjs
   ```
9. 如果任何脚本报告失败，请检查被引用的文件，并在最小的
   相关范围内进行修补。
10. 重新运行失败的验证器，直到通过为止。

如需对 agent/技能承载体系进行验证（agent 一致性、技能 frontmatter、README.md 同步、协议接线），请使用 `audit-vc` 技能。

## 上下文引导（当 process/context/ 不存在或需要完整初始化时）

在为一个新项目从零开始初始化上下文层时使用：

1. 在各个主要源码目录上并行运行 `vc-scout`（跳过 `.git`、`node_modules`、`.claude` 和缓存），以收集代码库摘要。
2. 创建 `process/context/all-context.md`（路由表、架构、约定），并为任何识别出的持久领域创建分组的 `all-{group}.md` 入口文件。
3. **针对既有上下文文件的并行阅读者策略** —— 更新之前，按文件数量成比例地派生子代理：1-3 个文件直接阅读；4-6 个文件使用 2-3 个阅读 agent；7 个及以上文件使用 4-5 个阅读 agent（最多 5 个），按 LOC 分配。
4. 在生成或更新上下文文件后，运行 `find process/context -name '*.md' -print0 | xargs -0 wc -l | sort -rn` —— 超过 800 LOC 的文件应拆分为一个上下文分组，除非用户另有要求。
5. 最后，在宣布完成之前，运行发现验证器（上述第 3 步）。

## 规则

- 将 `.claude/skills/` 视为权威来源；`.agents/skills/` 是供 Codex 发现用的符号链接。
- 将 `.claude/skills/vc-audit-context/references/skill-routing-policy.json` 视为有意不参与路由的共享技能的显式白名单。
- 在未更新 `process/context/all-context.md` 的情况下，不要移动大型上下文文件。
- 除非当前没有任何引用指向兼容包装器，否则不要删除它们。
- 保持上下文分组基于持久领域，而不是为每个临时功能单独建组。
- 更新 agent 时，同步维护 Claude markdown 与 Codex TOML 两套表面。
- 除非用户要求进行严格清理，否则将验证器警告视为审计发现。
- 优先采用有验证器支撑的路由事实，而不是添加更多含糊的文字说明。
- 将 process/context/generated-skills-catalog.json 视为由 `audit-context` 拥有的机器可读目录。
