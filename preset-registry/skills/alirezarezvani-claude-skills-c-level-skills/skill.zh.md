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
# C-Level 顾问套件 — 索引

这是套件索引，而非顾问。它会告诉你有哪些内容以及从何处开始；具体工作由以下技能完成。

## 从这里开始

1. **入门引导** — `cs-onboard` 技能负责进行创始人访谈（`/cs:setup`，7 个维度，约 45 分钟），并写入 `~/.claude/company-context.md`。每季度使用 `/cs:update` 更新一次。这是所有顾问都会读取的规范上下文模式。
2. **提问** — `chief-of-staff` 技能会将任何问题路由给合适的顾问。有关全部 14 个角色，请参阅其路由矩阵。
3. **重大决策** — `board-meeting` 技能会执行一套**六阶段**审议流程：(1) 收集上下文 → (2) 独立提供意见（相互隔离）→ (3) 批评者分析 → (4) 综合 → (5) 创始人审阅（完全暂停）→ (6) 提取决策。通过 c-level-agents 插件中的 `/cs:boardroom` 调用。
4. **记忆** — 决策会存入规范的双层布局 `~/.claude/decisions/{raw,approved}/`（参阅 `../agent-protocol/SKILL.md` →“决策记忆（规范布局）”）。

## 套件包含的内容（33 个技能）

**14 个高管角色 + 批评者（15）：** ceo-advisor、cfo-advisor、cto-advisor、coo-advisor、cpo-advisor、cmo-advisor、cro-advisor、ciso-advisor、chro-advisor、general-counsel-advisor、chief-data-officer-advisor、chief-ai-officer-advisor、chief-customer-officer-advisor、vpe-advisor，以及 executive-mentor 批评者（同级插件）。

**编排（6）：** cs-onboard、chief-of-staff、board-meeting、decision-logger、agent-protocol、context-engine。

**跨职能（6）：** board-deck-builder、scenario-war-room、competitive-intel、org-health-diagnostic、ma-playbook、intl-expansion。

**文化与协作（6）：** culture-architect、company-os、founder-coach、strategic-alignment、change-management、internal-narrative。

此外还有本索引（1）。整个套件包含 37 个仅使用 stdlib 的 Python 工具和 68 份参考文档。

## 路由快速参考

完整矩阵位于 `../chief-of-staff/SKILL.md` 和 `../chief-of-staff/references/routing-matrix.md`。主要角色：CFO（资本/资金消耗）、CRO（销售管线/销售）、CMO（定位）、CPO（路线图/产品市场契合度）、CTO（架构）、COO（运营/OKR）、CHRO（人员）、CISO（安全）、GC（合同/投资条款清单）、CDO（数据战略/训练数据权利）、CAIO（AI 战略/评估）、CCO（留存/总收入留存率）、VPE（交付/DORA）、CEO（方向）。涉及多个领域或不可逆的事项 → 董事会会议。

## 相关层

- `../../c-level-agents/` — 构建在这些技能之上的 13 个 cs-* 人格代理 + 21 个 `/cs:*` 斜杠命令
- `../../executive-mentor/` — 对抗式 `/em:*` 批评者命令
- `../../CLAUDE.md` — 完整的架构图和集成指南