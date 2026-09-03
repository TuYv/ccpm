---
name: vc-audit-vc
description: >-
  Audit agent harness health: Claude/Codex agent parity, skill registry
  consistency, README.md sync, and protocol file wiring. Use when agents,
  skills, README.md, or development-protocol files move, split, or drift.
trigger_keywords: harness audit, agent parity, skill audit, guide sync
layer: contract
---
# Audit VC（版本控制 Harness 健康状况）

> **输出风格：**遵循 `process/development-protocols/communication-standards.md` —— 答案先行、使用平实语言、不使用未加解释的术语，长回复需附 TL;DR。

使用此技能验证代理 harness 层内部一致，并且在 Claude、Codex、README.md 和协议文件之间正确接线。

如需进行上下文路由、分组和可发现性审计，请改用 `audit-context` 技能。

## 工作流程

1. 运行 Claude/Codex 代理一致性验证器：
   ```bash
   node .claude/skills/vc-audit-vc/scripts/validate-agent-parity.mjs
   ```
2. 运行共享技能发现验证器：
   ```bash
   node .claude/skills/vc-audit-vc/scripts/validate-skills.mjs
   ```
3. 运行 README.md 同步验证器：
   ```bash
   node .claude/skills/vc-audit-vc/scripts/validate-guide-sync.mjs
   ```
4. 运行协议接线验证器：
   ```bash
   node .claude/skills/vc-audit-vc/scripts/validate-protocol-wiring.mjs
   ```
5. 运行 seed/脚手架一致性验证器：
   ```bash
   node .claude/skills/vc-audit-vc/scripts/validate-seeds.mjs
   ```
6. 运行 kit 可移植性验证器：
   ```bash
   node .claude/skills/vc-audit-vc/scripts/validate-kit-portability.mjs
   ```
7. 运行技能调用接线验证器：
   ```bash
   node .claude/skills/vc-audit-vc/scripts/validate-skill-invocation-wiring.mjs
   ```
8. 运行代理 frontmatter 验证器：
   ```bash
   node .claude/skills/vc-audit-vc/scripts/validate-agent-frontmatter.mjs
   ```
9. 如果任何脚本报告失败，请检查其引用的文件，并仅修补最小的相关改动面。
10. 重新运行失败的验证器，直到通过为止。

## 规则

- 将 `.claude/agents/` 视为代理定义的权威来源；`.codex/agents/` 是其镜像。
- 将 `.claude/skills/` 视为技能的权威来源；`.agents/skills/` 是 Codex 的发现符号链接。
- 更新代理时，需将 Claude markdown 与 Codex TOML 的表面一并镜像同步。
- 将 `process/_seeds/` 视为实际仓库中可选的遗留脚手架表面。除非用户明确审计的是 export-kit 脚手架，否则其缺失仅作为警告级审计结果。
- 除非用户要求进行严格清理，否则将验证器警告视为审计发现。
- 对于上下文路由和可发现性审计，请委派给 `audit-context`。
