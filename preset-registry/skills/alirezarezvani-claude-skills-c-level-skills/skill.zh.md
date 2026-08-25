---
name: "c-level-skills"
description: "Index and router for the C-level advisory bundle: 33 skills covering 14 C-suite roles, orchestration, cross-cutting capabilities, and culture. Use when exploring what the c-level-advisor bundle contains, deciding which advisor skill fits a question, or finding the entry points (cs-onboard interview, chief-of-staff routing, board-meeting protocol)."
license: MIT
metadata:
  version: 2.1.0
  author: Alireza Rezvani
  category: c-level
  domain: executive-advisory
  updated: 2026-06-11
  skills_count: 33
  scripts_count: 37
  references_count: 68
---
# C-Level Advisory Bundle — 索引

这是该捆绑包的索引，而不是顾问。它会告诉你有哪些内容以及从哪里开始；下面的 skills 负责实际工作。

## 从这里开始

1. **入职** — `cs-onboard` skill 运行创始人访谈（`/cs:setup`，7 个维度，约 45 分钟），并写入 `~/.claude/company-context.md`。使用 `/cs:update` 按季度刷新。这是每位顾问读取的规范上下文架构。
2. **提问** — `chief-of-staff` skill 会将任何问题路由给合适的顾问。有关全部 14 个角色，请参阅其路由矩阵。
3. **重大决策** — `board-meeting` skill 运行一个**6 阶段**的审议流程：(1) 上下文收集 → (2) 独立贡献（隔离进行）→ (3) 批评分析 → (4) 综合 → (5) 创始人审阅（完全停止）→ (6) 决策提取。通过 `c-level-agents` plugin 中的 `/cs:boardroom` 调用。
4. **记忆** — 决策会写入规范的双层布局 `~/.claude/decisions/{raw,approved}/`（参见 `../agent-protocol/SKILL.md` → “Decision Memory (Canonical Layout)”）。

## 捆绑包中包含的内容（33 个 skills）

**14 个 C-suite 角色 + 批评者（15 个）：** ceo-advisor、cfo-advisor、cto-advisor、coo-advisor、cpo-advisor、cmo-advisor、cro-advisor、ciso-advisor、chro-advisor、general-counsel-advisor、chief-data-officer-advisor、chief-ai-officer-advisor、chief-customer-officer-advisor、vpe-advisor — 以及 executive-mentor 批评者（兄弟 plugin）。

**编排（6 个）：** cs-onboard、chief-of-staff、board-meeting、decision-logger、agent-protocol、context-engine。

**跨领域（6 个）：** board-deck-builder、scenario-war-room、competitive-intel、org-health-diagnostic、ma-playbook、intl-expansion。

**文化与协作（6 个）：** culture-architect、company-os、founder-coach、strategic-alignment、change-management、internal-narrative。

此外还有本索引（1 个）。整个捆绑包中还有 37 个仅使用 stdlib 的 Python 工具和 68 篇参考文档。

## 路由速查

完整矩阵见 `../chief-of-staff/SKILL.md` 和 `../chief-of-staff/references/routing-matrix.md`。主要角色：CFO（资本/烧钱）、CRO（销售漏斗/销售）、CMO（定位）、CPO（路线图/PMF）、CTO（架构）、COO（运营/OKR）、CHRO（人员）、CISO（安全）、GC（合同/条款清单）、CDO（数据战略/训练数据权利）、CAIO（AI 战略/评测）、CCO（留存/GRR）、VPE（交付/DORA）、CEO（方向）。跨领域或不可逆的事项 → 董事会会议。

## 相关层

- `../../../c-level-agents/` — 基于这些 skills 的 13 个 cs-* persona agents 和 21 个 `/cs:*` slash commands
- `../../executive-mentor/` — 对抗式 `/em:*` 批评者命令
- `../../CLAUDE.md` — 完整架构图和集成指南