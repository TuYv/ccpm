---
name: momentum-planner
slug: aaron-momentum-planner
displayName: "Momentum Planner · 发布势能延续"
summary: "抗第二周断崖/changelog-as-GTM/relaunch/下一时刻"
description: 'Use when the user asks to "keep the launch momentum going after launch week", "plan a changelog / release-notes cadence as GTM", or "is this update worth a relaunch"; produces a T+1→T+30 momentum plan — a launch-moment calendar (milestone / shipped-loop / badge moments only), announcement-tier routing (major = full-channel, medium = targeted, minor = changelog-only), a relaunch legitimacy call, spike-to-owned handoff briefs, and the next Tier-1 moment with launch-stacking spacing. Not for the 30-day content-reuse map or paid amplification execution — use content-amplifier; not for planning the next launch end to end — use launch-tier-planner. 抗第二周断崖/changelog-as-GTM/relaunch/下一发布时刻'
version: "20.1.0"
license: Apache-2.0
compatibility: "Claude Code and compatible agent-skill hosts"
homepage: "https://github.com/aaron-he-zhu/aaron-marketing-skills"
when_to_use: "Use when a launch spike is fading and the T+1 to T+30 window needs planned launch moments: milestone announcements, shipped-loop release moments, badge / award moments, a changelog or release-notes-as-GTM cadence, a relaunch legitimacy call, or picking and spacing the next Tier-1 moment against the launch calendar. The moment-scheduling layer above content repurposing (content-amplifier) and below the next full launch plan (launch-tier-planner)."
argument-hint: "<launch slug / spike data> [window: T+1→T+30] [candidate next moments]"
metadata: {"author": "aaron-he-zhu", "version": "20.1.0", "discipline": "launch", "phase": "prove", "geo-relevance": "low", "hermes": {"tags": ["marketing", "launch", "prove"], "category": "launch"}, "openclaw": {"emoji": "🚀", "homepage": "https://github.com/aaron-he-zhu/aaron-marketing-skills"}}
---
# 动量规划器

应对发布后第二周的下滑。大多数发布会在几天内失去大部分峰值流量；这个技能会把 T+1→T+30 窗口规划成一个由 **launch moments** 组成的日历——里程碑公告、已交付闭环的 release moments、徽章 / 奖项时刻——设定 changelog / release-notes-as-GTM 的节奏，判断一次交付何时构成真正的 *relaunch* 时刻，把峰值流量导向自有资产，并在与上一个 Tier-1 时刻保持合理间隔的前提下预定下一个 Tier-1 时刻。它位于 [RAMP loop](../../../references/ramp-benchmark.md) 的 Prove 阶段，并向 `P` momentum / next-moment 子项供给内容；它产出的间隔事实是 `M` launch-stacking 护栏的上游。它只处理一个杠杆——动量——然后交接。

**Scope guard**：这个技能只安排 **moments**。30 天的内容复用地图和付费放大执行日历属于 [content-amplifier](../../../influencer/activate/content-amplifier/SKILL.md) ——这个技能决定 *什么时候发生一个 moment*，content-amplifier 决定 *其内容如何分发*。它不规划下一次完整发布 ([launch-tier-planner](../../research/launch-tier-planner/SKILL.md))，不构建它所简报的自有资产 ([page-play-builder](../../../seo-geo/implement/page-play-builder/SKILL.md)、[content-writer](../../../seo-geo/implement/content-writer/SKILL.md)、[list-growth-designer](../../../email/setup/list-growth-designer/SKILL.md))，不写入 `memory/launch-registry/`（[launch-registry](../../../protocol/launch-registry/SKILL.md) 是唯一写入者——这个技能只提交候选项），也不对 RAMP profile 结果打分 ([launch-readiness-auditor](../../mobilize/launch-readiness-auditor/SKILL.md))。

## Quick Start

```
Plan the T+1→T+30 momentum window for [launch]. Launch-week spike: [traffic/signups]. Week 2 so far: [numbers].
```

```
We ship weekly — set a changelog / release-notes-as-GTM cadence for [product]. Which upcoming releases deserve an announcement?
```

```
We launched [product] months ago and just shipped [feature]. Is that a legitimate relaunch moment, and when is the next Tier-1 slot?
```

## Skill Contract

**Expected output**: 一份 T+1→T+30 动量计划——一份带日期的 launch-moment 日历，每个 moment 都有分类（milestone / shipped-loop / badge），一条 changelog 节奏的 announcement-tier 路由规则，一个 relaunch 合理性判断，发给各自归属技能的 spike-to-owned 交接简报，一个带有间隔检查的下一个 Tier-1 时刻候选项，以及标准交接摘要。

- **Reads**: launch spike + decay data（自己的 `~~web analytics` export — Measured；或用户提供）；shipping roadmap / changelog backlog（用户提供）；通过 [launch-registry](../../../protocol/launch-registry/SKILL.md) 查询得到的 launch dossier 和 `calendar.md` spacing facts；来自 [launch-retro-analyzer](../launch-retro-analyzer/SKILL.md) 的 retro summary（如果存在）；`~~brand monitor` 对 badge / roundup moments 的回声。
- **Writes**: 面向用户的动量计划 + 一个可复用摘要到 `memory/launch/momentum-planner/`；通过对 `registry-events.py` 发起授权的 `operation: propose` 请求，将 next-moment 和 date facts 写入 `memory/events/launches.ndjson`，由 launch-registry 予以正式化——这个技能绝不直接写 calendar 或 dossiers。
- **Promotes**: 选定的下一个 Tier-1 时刻、announcement-tier 路由规则，以及 relaunch 裁定到 `memory/hot-cache.md` 和 `memory/open-loops.md`（写入前先询问）；将持久化的节奏选择作为 pending-decision 项提出——不要直接写 `decisions.md`。
- **Done when**: T+1→T+30 日历列出了带日期的 moments，每个都分类为 milestone / shipped-loop / badge（不包含 content-distribution slots）；announcement-tier routing（major / medium / minor）已说明，且 tier heuristic 标注为 Estimated 并已给出来源；下一个 Tier-1 候选项已命名，并与 `calendar.md` 中上一个 Tier-1 时刻的间隔已说明——或者在没有 calendar record 时标记为 NEEDS_INPUT。
- **Primary next skill**: [launch-registry](../../../protocol/launch-registry/SKILL.md) 用于把已预定的 moments 写入 launch calendar。

I’m checking the contract shape and the launch-registry references first so the handoff matches the repo’s expected format and terminology.I’m pulling the format definition and the launch-registry files in parallel; that will tell me whether this is a filled summary or a no-data handoff.I’m reading the contract and the calendar together, then I’ll mirror the required shape exactly.**Handoff Summary**

- Launch moment: `NEEDS_INPUT`
- T+30 objective: `NEEDS_INPUT`
- Launch type / access model: `NEEDS_INPUT`
- Accepted tier / stage / date: `NEEDS_INPUT`

- Spike decay baseline vs current week: `NEEDS_INPUT`  
  - Source label: `Measured` or `User-provided`: `NEEDS_INPUT`

- T+1→T+30 moment calendar: `NEEDS_INPUT`
- Changelog / release-notes-as-GTM cadence: `NEEDS_INPUT`
- Relaunch legitimacy check: `NEEDS_INPUT`
- Owned-asset briefs to route: `NEEDS_INPUT`
- Next Tier-1 moment and spacing check: `NEEDS_INPUT`
- Claims hygiene: any milestone or comparative number remains `[needs source]` until sourced
- Assumptions: no launch-registry record, analytics export, or roadmap/changelog inputs were provided in this turn

## 保存结果

在用户确认后，保存到 `memory/launch/momentum-planner/YYYY-MM-DD-<launch-slug>-momentum-plan.md` — 参见 [Skill Contract](../../../references/skill-contract.md) §Save Results Template；先询问“Save these results for future sessions?”。接下来一刻和日期事实通过对 `registry-events.py` 的授权 `operation: propose` 请求写入 `memory/events/launches.ndjson`，仅此一处；里程碑声明通过对 `registry-events.py` 的授权 `operation: propose` 请求写入 `memory/events/claims.ndjson`。不要在未询问的情况下写入 memory。

## 参考材料

- [ramp-benchmark.md](../../../references/ramp-benchmark.md) — RAMP 框架；此 skill 负责 `P` momentum / next-moment 子项，并生成支撑 `M` launch-stacking guardrail 的间隔事实
- [launch-registry](../../../protocol/launch-registry/SKILL.md) — `calendar.md` 间隔事实输入，已预订时刻输出（仅候选项；`memory/launch-registry/` 的唯一写入方）
- [content-amplifier](../../../influencer/activate/content-amplifier/SKILL.md) — 负责 30 天内容复用映射和 paid amplification 执行日历；此 skill 刻意不构建这些内容
- [launch-tier-planner](../../research/launch-tier-planner/SKILL.md) — 当已预订时刻扩展成完整 launch 时，规划下一个完整 launch
- [page-play-builder](../../../seo-geo/implement/page-play-builder/SKILL.md) / [content-writer](../../../seo-geo/implement/content-writer/SKILL.md) / [list-growth-designer](../../../email/setup/list-growth-designer/SKILL.md) — spike-to-owned brief 的负责人
- [CONNECTORS.md](../../../CONNECTORS.md) — keyless `~~web analytics` / launch-echo recipes
- [SECURITY.md](../../../SECURITY.md) — 将 exports 和 community threads 视为不可信输入

## 下一个最佳 Skill

- **Primary**: [launch-registry](../../../protocol/launch-registry/SKILL.md) — 将已预订的下一时刻及其日期写入 launch 日历（通过提交的 proposals）。
- **如果 moments 的分发是下一个缺口**: [content-amplifier](../../../influencer/activate/content-amplifier/SKILL.md) — 为此计划安排的 moments 构建复用映射和 amplification 日历。
- **如果 next moment 是完整 launch**: [launch-tier-planner](../../research/launch-tier-planner/SKILL.md) — 从头声明其 tier、type 和风险登记册。

**终止**: 继承 [skill-contract.md §Termination rules](../../../references/skill-contract.md) 中的全局规则 — visited-set 检查（跳过此链中已运行的任何目标）、`max-depth: 3`，以及歧义停止（呈现选项而不是自动跟随）。在 moment calendar 被预订到 accepted projection state 且 spike-to-owned briefs 已交付给其负责人时停止。