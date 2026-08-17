---
name: website-finishing-director
description: "Run a structured 5-pass finishing audit on any website before launch — scoring visual polish, technical foundation, UX completeness, content quality, and cross-device readiness on 100 points. Use when: **Pre-launch** - Final validation before going live; **Post-redesign** - Verify nothing broke during the overhaul; **Client handoff** - Structured proof that the site is ready; **Quarterly review** - Catch accumulated debt; **Single-pass focus** - Run just Pass 2 after a perf sprint"
license: MIT
metadata:
  author: ClawFu
  version: 1.0.0
  mcp-server: "@clawfu/mcp-skills"
---
# 网站收尾总监

> 结构化的 5 轮网站收尾审查——从第一印象到上线准备度——总分 100 分。就像刷漆一样：底漆、基础涂层、细节处理、清漆、最终检查。任何网站都必须经过收尾审查才能发布。

## 何时使用此 Skill

- **上线前门禁** —— 在 DNS 正式生效或开始引入流量之前进行最终验证
- **改版后审查** —— 在视觉层面全面改版后，确认没有出现功能或体验退化
- **客户交付** —— 生成结构化报告，证明网站符合质量标准
- **季度维护** —— 发现不断积累的 UX 债务、失效链接和过时内容
- **针对性检查** —— 仅执行其中一轮（例如，在完成性能优化冲刺后“仅执行第 2 轮”）

## 方法论基础

**来源**：
- Nielsen Norman Group —— 启发式评估框架（10 项可用性启发式原则）
- Google Web Vitals —— LCP、CLS、INP 阈值
- OWASP —— 安全标头基线
- Oli Gardner / Unbounce —— 落地页转化最佳实践
- Don Norman —— 情感化设计（本能层、行为层、反思层）
- GUIA 生产经验库 —— 8 个已上线网站，以及涵盖 Next.js、Framer Motion、GSAP、Lenis、Railway、Docker 的已记录注意事项

**核心原则**：一个通过 Lighthouse 检测且 meta 标签正确的网站，在技术上是有效的，但并不代表它已经*收尾完成*。收尾工作填补了“可以运行”与“可以发布”之间的差距。它要求以访客的实际体验方式来评估网站——渐进式地、从情感层面、跨设备地进行评估——而不是对各项孤立指标进行清单式检查。

**为什么这很重要**：现有工具（Lighthouse、Screaming Frog、Awwwards）各自只审查一个维度。没有任何工具能在一套按顺序执行、带评分的工作流中，将视觉打磨 + UX 完整性 + 技术基础 + 内容质量 + 品牌一致性结合起来。此 Skill 正是这样的工具。

---

## Claude 负责什么，以及你需要决定什么

> “Claude 执行审查。你决定发布什么。”

| Claude 负责 | 你提供 |
|---------------|-------------|
| 按照检查清单系统地执行每一轮审查 | 线上 URL 或代码库访问权限 |
| 为每个检查点评分并说明理由 | 背景信息：品牌定位、目标受众、上线时间表 |
| 将问题划分为 P0/P1/P2 | 覆盖默认结论的决策（例如，“对于 MVP，P1 可以接受”） |
| 生成包含修复建议的最终报告 | 最终的上线/不上线判断 |
| 根据生产经验库标记 GUIA 技术栈的注意事项 | 在真实设备上进行验证（Claude 无法打开 Safari） |

**请记住**：这是一个人机协作工作流。Claude 以严谨的方式组织审查；你则需要在真实设备上亲自查看并验证结论。

---

## 此 Skill 的功能

1. **5 秒第一印象测试** —— 评估最初几秒内的信息清晰度、情感契合度和 CTA 可见性
2. **技术基础审查** —— 性能（Core Web Vitals）、SEO 基础、安全标头、失效链接
3. **UX 完整性检查** —— 组件状态、表单行为、动画打磨程度、移动端可用性
4. **内容与品牌验证** —— 文案质量、占位内容检测、品牌语调一致性、视觉协调性
5. **跨设备与上线准备度** —— 浏览器测试、OG 预览、分析工具、404 页面、favicon

## 使用方法

### 发布前的完整网站审计
```
I'm about to launch [site URL]. Run a full website-finishing-director audit (all 5 passes).
Brand quadrant: [Warm+Calm / Warm+Active / Cold+Active / Cold+Calm].
Target audience: [who].
```

### 完成特定修复后的单轮审计
```
I just optimized performance on [site URL]. Run Pass 2 only (Technical Foundation).
```

### 落地页快速审计
```
Audit this landing page: [URL]. Use the Landing Page profile (passes 1, 2, 4).
```

---

## 说明

执行此审计时，请按顺序完成 5 轮审计。每一轮都建立在前一轮的基础上——先夯实基础，再进行润色。为每个检查项评分，按优先级对问题进行分类，然后生成最终报告。

### 审计配置

并非每个网站都需要完成全部 5 轮审计。请选择与项目相匹配的配置：

| 配置 | 轮次 | 适用场景 |
|---------|--------|-------------|
| **落地页** | 1, 2, 4 | 单页营销活动页面或产品页面 |
| **完整网站** | 1, 2, 3, 4, 5 | 包含导航、表单和内容的多页面网站 |
| **电子商务** | 2, 3, 5 | 包含购物车、结账流程和产品页面的商店 |

使用精简配置时，按比例调整总分。上线/不上线阈值以百分制得分为准，而非原始分数。

---

### 第 1 轮：第一印象（15 分）

*“访客在 5 秒内能理解什么，又会产生怎样的感受？”*

展示首页（或首屏区域）5 秒钟。回答以下 5 个问题——每题 3 分：

```
## Pass 1 — First Impression (5-Second Test)

### 1. WHAT is this? (3 pts)
Can a visitor identify what the site/product/service IS?
[ ] 3 — Immediately clear, no ambiguity
[ ] 2 — Clear after reading subheadline
[ ] 1 — Vague, requires scrolling to understand
[ ] 0 — No idea what this is

### 2. WHO is it for? (3 pts)
Are there signals identifying the target audience?
[ ] 3 — Obvious demographic/psychographic signals
[ ] 2 — Implied but not explicit
[ ] 1 — Generic ("everyone")
[ ] 0 — Actively confusing (signals wrong audience)

### 3. WHY should I care? (3 pts)
Is the value proposition or benefit visible?
[ ] 3 — Clear benefit, emotionally resonant
[ ] 2 — Feature-focused but understandable
[ ] 1 — Present but buried
[ ] 0 — No value proposition visible

### 4. WHAT do I do next? (3 pts)
Is the primary CTA visible and clear?
[ ] 3 — CTA visible above fold, action-specific text
[ ] 2 — CTA present but generic ("Learn more")
[ ] 1 — CTA below the fold or hard to find
[ ] 0 — No CTA visible

### 5. HOW does it feel? (3 pts)
Does the emotional tone match the brand quadrant?
[ ] 3 — Perfect quadrant match (warm brand = warm design)
[ ] 2 — Mostly aligned, minor dissonance
[ ] 1 — Noticeable mismatch (warm brand + cold design)
[ ] 0 — Opposite quadrant (positioning confusion)

### Pass 1 Score: ___/15

Verdict:
- 12-15: PASS — First impression is clear and emotionally aligned
- 8-11: NEEDS WORK — Visitor gets it, but slowly or with friction
- <8: FAIL — Redesign the above-fold experience
```

**集成**：将情绪感受与 `web-design-director` 的象限系统进行比较。如果品牌属于温暖+沉静，但网站给人的感觉却是冷峻+活跃，那么无论得分如何，这都是一个 P0 问题。

**本轮 GUIA 常见陷阱**：
- 在 CTA 中硬编码 Calendly URL，而不是使用 `/contact/` 页面（会导致分析追踪失效）
- 将温暖的文案语调与冷峻的 UI 元素混用（陶土色调色板 + 等宽字体 = 风格混乱）

---

### 第 2 轮：技术基础（25 分）

*“基础设施是否足够稳固，可以继续在其上构建？”*

```
## Pass 2 — Technical Foundation

### Performance (10 pts)

| Metric | Target | Score |
|--------|--------|-------|
| LCP (Largest Contentful Paint) | ≤ 2.5s | 0-3 pts |
| INP (Interaction to Next Paint) | ≤ 200ms | 0-2 pts |
| CLS (Cumulative Layout Shift) | ≤ 0.1 | 0-2 pts |
| Lighthouse Performance score | ≥ 85 | 0-3 pts |

Scoring:
- LCP: 3 = ≤2.5s, 2 = ≤4.0s, 1 = ≤6.0s, 0 = >6.0s
- INP: 2 = ≤200ms, 1 = ≤500ms, 0 = >500ms
- CLS: 2 = ≤0.1, 1 = ≤0.25, 0 = >0.25
- Lighthouse: 3 = ≥90, 2 = ≥85, 1 = ≥70, 0 = <70

### SEO Basics (8 pts)

- [ ] (2 pts) Canonical URLs defined + trailing slash consistent
- [ ] (1 pt) Meta titles unique per page (≤60 chars)
- [ ] (1 pt) Meta descriptions present per page (≤160 chars)
- [ ] (1 pt) Sitemap.xml accessible and valid
- [ ] (1 pt) robots.txt present and correct
- [ ] (1 pt) Structured data present (JSON-LD)
- [ ] (1 pt) Alt text on all images

### Security & Links (7 pts)

- [ ] (2 pts) HTTPS enforced (no mixed content)
- [ ] (2 pts) Security headers present (CSP, X-Frame-Options, HSTS, X-Content-Type-Options)
- [ ] (1 pt) No broken internal links (404s)
- [ ] (1 pt) No broken external links
- [ ] (1 pt) No exposed source maps or debug endpoints in production

### Pass 2 Score: ___/25

Verdict:
- 21-25: SOLID — Ship it
- 16-20: ACCEPTABLE — Fix P0s, ship with P1 backlog
- 11-15: FRAGILE — Significant technical debt
- <11: BROKEN — Do not launch
```

**本轮 GUIA 常见陷阱**：
- `next.config.js` 中缺少 `trailingSlash: true`（曾导致 Rental-CRM 于 2026 年 1 月被搜索引擎移除索引）
- 在 `'use client'` 组件中使用 `export const metadata`（元数据不会在服务端渲染）
- 模块级 SDK 初始化（Supabase/Stripe）会在缺少环境变量时导致构建失败——应在函数内部进行延迟初始化
- 使用 `echo` 导致 Vercel 环境变量末尾带有换行符——应改用 `printf`
- Railway 的 `*.railway.internal` 主机名在 Nixpacks 构建期间无法访问——应使用公共 URL

---

### 第 3 轮：UX 完整性（25 分）

*“网站是否能够应对真实场景，而不仅仅是理想流程？”*

```
## Pass 3 — UX Completeness

### Component States (8 pts)

For EACH interactive component (buttons, cards, forms, modals, lists):
- [ ] (2 pts) Loading state — skeleton, spinner, or progressive render
- [ ] (2 pts) Error state — clear message + recovery action
- [ ] (2 pts) Empty state — helpful message, not blank screen
- [ ] (2 pts) Success state — confirmation feedback

Score: deduct per missing state across all components.
8 pts = all states covered. -1 per missing state (cap at 0).

### Forms (6 pts)

- [ ] (1 pt) Client-side validation with clear error messages
- [ ] (1 pt) Server-side validation (not just client)
- [ ] (1 pt) Success feedback after submission (toast, redirect, or inline)
- [ ] (1 pt) Submit button disabled during processing (no double-submit)
- [ ] (1 pt) Spam protection (honeypot, reCAPTCHA, or rate limiting)
- [ ] (1 pt) Privacy policy link near form (GDPR)

### Animation Polish (6 pts)

- [ ] (1 pt) `viewport={{ once: true }}` on scroll animations (no replay on scroll-back)
- [ ] (1 pt) `useGSAP` hook used (not `useEffect`) for GSAP animations
- [ ] (1 pt) `prefers-reduced-motion` respected (disable or reduce animations)
- [ ] (1 pt) No animation blocks content access (content visible even if animation fails)
- [ ] (1 pt) Lenis initialized correctly (not Locomotive Scroll)
- [ ] (1 pt) Exit animations don't cause layout shift

### Mobile Usability (5 pts)

- [ ] (1 pt) Touch targets ≥ 44px (iOS HIG standard)
- [ ] (1 pt) No horizontal overflow / horizontal scroll
- [ ] (1 pt) Font sizes ≥ 16px for body text (prevents iOS zoom)
- [ ] (1 pt) Sticky/fixed elements don't overlap content
- [ ] (1 pt) Scroll behavior works correctly (no scroll-jacking that traps users)

### Pass 3 Score: ___/25

Verdict:
- 21-25: COMPLETE — Real-world usage covered
- 16-20: MOSTLY THERE — Edge cases need attention
- 11-15: INCOMPLETE — Users will hit dead ends
- <11: UNFINISHED — UX not production-ready
```

**本轮的 GUIA 注意事项**：
- GSAP + React 18 严格模式会在开发环境中触发动画 2 次（使用 `useGSAP`，不要使用 `useEffect`）
- 全局 CSS `a { color: var(--color-coral) }` 会覆盖锚点 CTA 上的 Tailwind `text-white`——请使用内联样式 `style={{ color: 'white' }}`
- Framer Motion 的 `AnimatePresence` 退出动画与 Next.js App Router 不兼容
- 同时运行过多 `ScrollTrigger` 实例会严重影响移动端性能
- Lenis 包名称：`npm install lenis`（不要使用 `@studio-freight/lenis`）

---

### 第 4 轮：内容与品牌（20 分）

*“内容是否完整、一致且符合品牌调性？”*

```
## Pass 4 — Content & Brand

### Copy Quality (8 pts)

- [ ] (2 pts) No placeholder text detected ("Lorem ipsum", "[Your Name]", "Coming soon",
      "example.com", "TODO", empty sections)
- [ ] (1 pt) No spelling or grammar errors
- [ ] (1 pt) Link text is descriptive (not "click here" or naked URLs)
- [ ] (1 pt) CTA copy is specific ("Start free trial" not "Submit")
- [ ] (1 pt) Heading hierarchy is logical (H1 → H2 → H3, one H1 per page)
- [ ] (1 pt) Alt text is descriptive (not "image1.png" or empty)
- [ ] (1 pt) Phone numbers, emails, addresses are real (not placeholder)

### Brand Voice (6 pts)

- [ ] (2 pts) Tone matches brand positioning (warm/cold, formal/casual)
- [ ] (2 pts) Voice is consistent across all pages (same person "speaking")
- [ ] (1 pt) No AI-smoothing markers ("Don't hesitate to contact us",
      "In today's fast-paced world", "It's important to note that")
- [ ] (1 pt) CTAs match the emotional quadrant (warm brand = inviting CTA, not aggressive)

### Visual Consistency (6 pts)

- [ ] (1 pt) Color palette used consistently (no off-brand colors)
- [ ] (1 pt) Typography hierarchy clear (display, heading, body, caption — max 2-3 fonts)
- [ ] (1 pt) Spacing rhythm consistent (not random padding between sections)
- [ ] (1 pt) Icon style uniform (don't mix outline, filled, and emoji)
- [ ] (1 pt) Image treatment consistent (all photos same filter/tone, or all illustrations)
- [ ] (1 pt) Component style consistent (cards, buttons, inputs follow same pattern)

### Pass 4 Score: ___/20

Verdict:
- 17-20: POLISHED — Content is finished and on-brand
- 13-16: GOOD — Minor inconsistencies, shippable
- 9-12: ROUGH — Content needs editing pass
- <9: UNFINISHED — Major content gaps or brand mismatch
```

**本轮的 GUIA 注意事项**：
- Calendly URL 必须与正确的专业人士相匹配（Valeria、Matthieu 或客户）
- 不要将温暖的文案（“我们理解您面临的挑战”）与冷峻的 UI（深色模式、等宽字体、尖锐边角）混用
- AI 生成文案检测：发布前移除双换行（这是 LinkedIn 上的 AI 特征）
- credou.bzh 文案方向：机制优先，不要简历，不要经历/时间线

---

### 第 5 轮：跨设备与发布（15 分）

*“它是否能在所有环境中正常运行，并且一切都已准备好上线？”*

```
## Pass 5 — Cross-Device & Launch

### Browser Testing (5 pts)

Test on the 3 major browsers. Score per browser:
- [ ] (2 pts) Safari — renders correctly, animations work, fonts load
- [ ] (2 pts) Chrome — renders correctly, animations work, fonts load
- [ ] (1 pt) Firefox — renders correctly, no major breaks

Per browser, check: layout, animations, fonts, forms, scroll behavior.
Deduct 1 pt per browser with visual bugs. Deduct 2 pts per browser with functional bugs.

### Device Testing (4 pts)

- [ ] (2 pts) Mobile (375px) — full site usable, no content cut off
- [ ] (1 pt) Tablet (768px) — layout adapts, no awkward breakpoints
- [ ] (1 pt) Desktop (1440px) — content doesn't stretch or float in empty space

### Launch Readiness (6 pts)

- [ ] (1 pt) Analytics installed and firing (GA4, Plausible, or equivalent)
- [ ] (1 pt) OG image renders correctly (test with opengraph.xyz or Twitter card validator)
- [ ] (1 pt) 404 page exists and is styled (not default browser/framework error)
- [ ] (1 pt) Favicon present in all sizes (16, 32, 180, 192, 512 — or SVG adaptive)
- [ ] (1 pt) Google Search Console configured (or equivalent)
- [ ] (1 pt) Social preview correct on LinkedIn, Twitter, WhatsApp

### Pass 5 Score: ___/15

Verdict:
- 12-15: LAUNCH READY — Ship it
- 9-11: ALMOST — Fix critical device/browser issues
- <9: NOT READY — Cross-device experience is broken
```

**本轮的 GUIA 注意事项**：
- Lenis 平滑滚动在 Safari 上存在已知问题——请仔细测试
- Vercel 环境变量末尾的换行符会导致 OG 图片 URL 失效
- Docker healthcheck 必须通过，CI/CD 才能报告成功
- `deploy.sh` 使用 `flock`——VPS 上不能并发部署
- Resend 子域名 DNS：`send.send.<zone>` 看起来不对，但实际上是正确的（Resend 会添加 `send.` 前缀）

---

### 步骤 6：生成最终报告

运行所有适用的检查轮次后，汇总报告：

```
## Final Report Template

# Website Finishing Audit: [Site Name]

**URL:** [https://...]
**Date:** [YYYY-MM-DD]
**Profile:** [Landing Page / Full Website / E-commerce]
**Auditor:** [Name] + Claude (website-finishing-director)

---

## Score Summary

| Pass | Name | Score | Max | Status |
|------|------|-------|-----|--------|
| 1 | First Impression | __/15 | 15 | [PASS/NEEDS WORK/FAIL] |
| 2 | Technical Foundation | __/25 | 25 | [SOLID/ACCEPTABLE/FRAGILE/BROKEN] |
| 3 | UX Completeness | __/25 | 25 | [COMPLETE/MOSTLY/INCOMPLETE/UNFINISHED] |
| 4 | Content & Brand | __/20 | 20 | [POLISHED/GOOD/ROUGH/UNFINISHED] |
| 5 | Cross-Device & Launch | __/15 | 15 | [READY/ALMOST/NOT READY] |
| **TOTAL** | | **__/100** | **100** | |

---

## Verdict

| Score Range | Verdict |
|-------------|---------|
| 85-100 | LAUNCH READY |
| 70-84 | CONDITIONAL — fix P0s then ship |
| 50-69 | NEEDS WORK — significant issues |
| <50 | NOT READY — major gaps |

**Override rule:** 1 unresolved P0 = NOT READY, regardless of total score.

**VERDICT: [LAUNCH READY / CONDITIONAL / NEEDS WORK / NOT READY]**

---

## Issues

### P0 — Blockers (must fix before launch)

| # | Pass | Issue | Location | Fix |
|---|------|-------|----------|-----|
| 1 | [1-5] | [Description] | [file:line or URL path] | [Concrete solution] |

### P1 — Important (fix within 1 week of launch)

| # | Pass | Issue | Location | Fix |
|---|------|-------|----------|-----|
| 1 | [1-5] | [Description] | [file:line or URL path] | [Concrete solution] |

### P2 — Nice-to-have (backlog)

| # | Pass | Issue | Location | Fix |
|---|------|-------|----------|-----|
| 1 | [1-5] | [Description] | [file:line or URL path] | [Concrete solution] |

---

## Strengths

- [What the site does well — acknowledge good work]
- [Specific design/technical/content wins]

## Recommendations

1. [Highest-priority improvement]
2. [Second priority]
3. [Strategic suggestion for next iteration]

---

## Sign-off

- [ ] All P0s resolved
- [ ] P0 + P1 resolved (optimal)
- [ ] Stakeholder review completed
- [ ] Go-live date confirmed: ____________
```

---

## 示例

### 示例 1：完整网站审计——credou.bzh

**背景**：面向顾问的个人品牌网站。Warm+Calm 象限。Next.js 16、Framer Motion、Lenis。刚刚完成第 3 版文案并部署。

**输入**：
> 对 credou.bzh 运行完整的 website-finishing-director 审计。品牌象限：Warm+Calm。目标受众：在 AI 集成方面遇到困难的决策者。

**输出**：

# 网站收尾审计：credou.bzh

**URL：** https://credou.bzh
**日期：** 2026-02-12
**配置：** 完整网站
**审计者：** Matthieu + Claude (website-finishing-director)

---

## 评分摘要

| 轮次 | 名称 | 得分 | 满分 | 状态 |
|------|------|-------|-----|--------|
| 1 | 第一印象 | 13/15 | 15 | 通过 |
| 2 | 技术基础 | 19/25 | 25 | 可接受 |
| 3 | 用户体验完整性 | 18/25 | 25 | 基本完善 |
| 4 | 内容与品牌 | 17/20 | 20 | 打磨完善 |
| 5 | 跨设备与上线准备 | 11/15 | 15 | 接近完成 |
| **总分** | | **78/100** | **100** | |

---

## 结论

**有条件通过** — 得分 78/100。修复 P0 问题后即可上线。

---

## 问题

### P0 — 阻塞问题

| # | 轮次 | 问题 | 位置 | 修复方式 |
|---|------|-------|----------|-----|
| 1 | 2 | 缺少安全响应头（无 CSP、无 X-Frame-Options） | `next.config.js` | 添加包含 CSP、X-Frame、HSTS、X-Content-Type 的 `headers()` 配置 |
| 2 | 5 | 404 页面是默认的 Next.js 错误页面 | `/app/not-found.tsx` | 创建符合 Papier/Encre 主题的定制 404 页面 |

### P1 — 重要问题

| # | 轮次 | 问题 | 位置 | 修复方式 |
|---|------|-------|----------|-----|
| 1 | 2 | 缺少 eslint.config.js | 项目根目录 | 添加 ESLint 扁平配置 |
| 2 | 3 | 未处理 `prefers-reduced-motion` | `globals.css` | 添加 `@media (prefers-reduced-motion: reduce)` 以禁用动画 |
| 3 | 3 | 缺少跳转至内容的链接 | `layout.tsx` | 添加视觉隐藏的跳转链接 |
| 4 | 5 | 未在 WhatsApp 上测试社交分享预览 | OG 图片 | 验证通过 WhatsApp 分享时 OG 是否正确渲染 |

### P2 — 锦上添花

| # | 轮次 | 问题 | 位置 | 修复方式 |
|---|------|-------|----------|-----|
| 1 | 4 | “Le plan”部分的卡片可以采用更多样化的间距 | `HomeContent.tsx` | 改变各卡片行之间的垂直内边距 |

---

## 优点

- v3 版文案（表达瓶颈）精准有力——机制优先，没有用履历内容凑篇幅
- Papier/Encre 双主题协调统一，符合品牌调性
- 颗粒纹理与无边框卡片营造出真实的温暖感（而非模板感）
- 边缘渲染的 OG 图片为 SEO 带来了切实优势

## 建议

1. 修复安全响应头（P0）——15 分钟即可完成，对安全性影响显著
2. 创建自定义 404 页面（P0）——在无效链接页面上维持一致的品牌体验
3. 添加 `prefers-reduced-motion`（P1）——满足无障碍合规要求

---

**这种方式为何有效**：该审计能够发现“技术上已部署”与“实际上已完成”之间的差距。网站在第一印象和内容方面得分很高，但存在基础设施缺口（安全响应头、404 页面）；单纯的 Lighthouse 审计会单独标记这些问题，却不会进行优先级排序。

---

### 示例 2：落地页审计 — SaaS 产品发布

**背景**：一款生产力工具的新 SaaS 落地页。Cold+Active 象限。单页面、无表单，CTA 链接指向候补名单。

**输入**：
> 使用落地页配置（第 1、2、4 轮）审计此落地页：taskflow.app。象限：Cold+Active。受众：工程经理。

**输出**：

# 网站收尾审计：TaskFlow

**URL：** https://taskflow.app
**日期：** 2026-02-12
**配置：** 落地页（第 1、2、4 轮）
**审计方：** 产品团队 + Claude（website-finishing-director）

---

## 评分摘要

| 轮次 | 名称 | 得分 | 满分 | 状态 |
|------|------|-------|-----|--------|
| 1 | 第一印象 | 9/15 | 15 | 需要改进 |
| 2 | 技术基础 | 22/25 | 25 | 扎实 |
| 4 | 内容与品牌 | 11/20 | 20 | 粗糙 |
| **总分** | | **42/60** | **60** | **（70%）** |

---

## 结论

**有条件通过** — 得分 70%。第 1 轮检查中的 P0 问题需要处理。

---

## 问题

### P0 — 阻断问题

| # | 检查轮次 | 问题 | 位置 | 修复方式 |
|---|------|-------|----------|-----|
| 1 | 1 | “这是什么？”仅得 1/3 分 — 首屏区域中的产品类别不明确 | 首屏区域 | 在标语上方添加一行：“面向工程团队的项目跟踪工具” |
| 2 | 4 | 3 条使用素材照片的占位推荐语 | 社会认同部分 | 完全移除此部分，或替换为真实的 Beta 用户评价 |

### P1 — 重要问题

| # | 检查轮次 | 问题 | 位置 | 修复方式 |
|---|------|-------|----------|-----|
| 1 | 1 | CTA 写的是“开始使用” — 对候补名单来说过于笼统 | 首屏 CTA | 改为“加入候补名单”或“申请抢先体验” |
| 2 | 4 | 检测到 AI 润色痕迹：“在当今快节奏的工程环境中……” | 首屏副标题 | 重写：直接、具体，不要赘述 |
| 3 | 4 | 功能图标混用了填充和轮廓样式 | 功能网格 | 统一使用一种图标样式 |

### P2 — 锦上添花

| # | 检查轮次 | 问题 | 位置 | 修复方式 |
|---|------|-------|----------|-----|
| 1 | 2 | 缺少结构化数据（没有 Product 或 SoftwareApplication schema） | `<head>` | 添加 JSON-LD SoftwareApplication schema |
| 2 | 4 | 页脚版权年份为 2025 | 页脚 | 更新为 2026 |

---

## 优点

- 技术基础扎实（22/25）— 速度快、优化良好
- 深色 UI + 渐变强调色与冷色+活跃象限完美契合
- 响应式布局在各个断点上都表现良好

## 建议

1. 明确首屏信息 — 访问者需要在 3 秒内理解产品类别
2. 移除虚假推荐语 — 留白也比虚假的社会认同更好
3. 重写 CTA，使其与实际操作相符（加入候补名单，而不是“开始使用”）

---

**这种方式为何有效**：落地页配置会跳过 UX 完整性（第 3 轮）和跨设备检查（第 5 轮），聚焦于对单页最重要的内容：信息传达是否清晰、技术是否扎实，以及内容是否真实。70% 的得分表示修复后即可发布 — P0 都是文案问题，而不是工程问题。

---

## 技能边界（边界识别）

### 此技能擅长：
- 对任何网站（静态、动态、SPA、SSR）进行发布前验证
- 生成用于客户交付的结构化审计报告
- 发现从“技术上可运行”到“真正准备就绪”之间的“收尾差距”
- 使用 GUIA 技术栈（Next.js、Framer Motion、GSAP、Lenis）的团队 — 已内置对常见陷阱的检查

### 此技能不适合：
- **深度性能工程** — 请直接使用 Lighthouse、WebPageTest 或 Chrome DevTools
- **无障碍审计（WCAG 合规性）** — 此技能涵盖基础检查，但并非完整的无障碍审计。请使用 axe-core 或 WAVE。
- **安全渗透测试** — 此技能检查的是响应头，而非漏洞。请使用 OWASP ZAP。
- **转化率优化** — 请使用 `landing-page-optimizer` 进行 CRO。此技能只检查 CTA 是否存在，而不检查它是否能够带来转化。
- **设计方向** — 请使用 `web-design-director` 选择视觉方向。此技能用于验证执行效果。

### 质量检查点

在接受审计输出之前，请验证：
- [ ] 所有 5 轮检查（或配置文件对应的检查轮次）均已评分
- [ ] 总分计算正确（完整审计为 15 + 25 + 25 + 20 + 15 = 100）
- [ ] 每个 P0 问题都有具体的修复方案（而不只是“改进这里”）
- [ ] 结论遵循覆盖规则（存在 1 个 P0 = NOT READY）
- [ ] 优势部分认可了真正做得好的地方（而不只是列出问题）

---

## 迭代指南

> “第一轮检查发现明显问题。第二轮检查发现细微问题。”

### 推荐的迭代模式

| 轮次 | 重点 | 要问的问题 |
|------|-------|------------------|
| **第 1 次审计** | 全面检查 | “哪里有问题？缺少什么？哪些地方不符合品牌调性？” |
| **第 2 次审计**（修复后） | P0 验证 | “阻塞性问题是否真的已修复？修复是否引入了回归问题？” |
| **第 3 次审计**（发布前） | 打磨 | “我会为公开分享这个 URL 而感到自豪吗？” |

### 实用的后续提示词

- “只重新运行第 2 轮检查——我已经修复了安全标头和 404 页面。”
- “首页和关于页面的品牌语调感觉不一致。深入检查第 4 轮。”
- “按照电子商务配置文件对此进行评分——我们添加了结账流程。”
- “将本次审计与上一次进行比较，并告诉我有哪些改进。”

---

## 学习曲线

| 使用次数 | 你将获得的体验 |
|-------|----------------------|
| **第 1 次审计** | 你会发现以前不知道的缺口（尤其是状态和移动端方面） |
| **第 3 次审计** | 你开始将收尾工作融入工作流程，而不只是最后临时补上 |
| **第 10 次审计** | 由于你已将检查清单内化，网站发布时的问题会更少 |

**专业提示**：在完成度达到 50% 时就运行第 1 轮检查（第一印象），而不要只在最后运行。尽早发现定位不匹配可以节省重新设计的时间。

---

## 检查清单和模板

### 快速发布前检查清单（5 分钟）

```
## Quick Check (non-negotiable minimums)

- [ ] Site loads in < 4s on mobile
- [ ] CTA visible above the fold
- [ ] No placeholder text anywhere
- [ ] No broken links on main pages
- [ ] HTTPS enforced
- [ ] 404 page exists
- [ ] OG image renders

If ALL checked → safe to soft-launch
If ANY unchecked → run full audit
```

### GUIA 技术栈检查清单（Next.js + Framer + GSAP）

```
## GUIA Stack Finishing Checklist

### Next.js Config
- [ ] trailingSlash: true in next.config.js
- [ ] export const metadata on server components (not 'use client')
- [ ] Lazy SDK init (getSupabase(), getStripe()) — not module-level
- [ ] sitemap.ts + robots.ts present

### Animation
- [ ] useGSAP (not useEffect) for GSAP
- [ ] viewport={{ once: true }} on scroll animations
- [ ] prefers-reduced-motion media query
- [ ] Lenis (not Locomotive Scroll)

### CSS
- [ ] Global a{color} doesn't override CTA text — use inline style if needed
- [ ] No horizontal overflow on mobile
- [ ] Touch targets ≥ 44px

### Deploy
- [ ] Env vars set with printf (no trailing newline)
- [ ] Docker healthcheck passes before success report
- [ ] deploy.sh flock prevents concurrent deploys
```

### 危险信号检查清单

```
## Warning Signs in Your Audit

- [ ] Score is 85+ but something still "feels off" → trust your gut, re-examine Pass 1
- [ ] All passes score well except one pass scores <50% → that pass is a blocker
- [ ] P0 list has more than 3 items → the site isn't ready, period
- [ ] Multiple P2s in the same area → that's actually a P1 (systemic issue)
- [ ] "It works on my machine" for any browser test → test on real devices
```

---

## 与其他 ClawFu 技能的集成

| 技能 | 集成点 |
|-------|------------------|
| **[web-design-director](../web-design-director/)** | 在构建之前使用——确定情感象限。第 1 轮将据此进行验证。 |
| **[design-trends-2026](../design-trends-2026/)** | 第 4 轮视觉一致性检查可参考与当前趋势的契合度 |
| **[minimalist-image-director](../minimalist-image-director/)** | 第 4 轮图像处理一致性检查 |
| **[landing-page-optimizer](../../content/landing-page-optimizer/)** | 在通过本审核之后进行转化优化——CRO 的前提是基础功能正常 |
| **[landing-page-copy](../../content/landing-page-copy/)** | 第 4 轮文案质量检查——如果文案不合格，则交由此技能重写 |

**工作流顺序**：
```
web-design-director → [build site] → website-finishing-director → [fix issues] → landing-page-optimizer
(direction)            (code)         (QA/finishing)               (iterate)      (CRO/optimization)
```

---

## 参考资料

- Nielsen, Jakob。《用户界面设计的 10 项可用性启发式原则》（1994 年，2020 年更新）——UX 完整性检查的基础
- Google。《Web Vitals》——LCP、CLS、INP 阈值定义
- OWASP。《安全标头项目》——安全标头建议
- Gardner, Oli。《101 条落地页优化技巧》（Unbounce）——上线前转化检查清单
- Norman, Don。《情感化设计》（2004）——本能层、行为层与反思层设计评估
- GUIA 生产经验——`.claude/memory/agents/webdesign.md`、`seo.md`、`devops.md`、`gotchas.md`

## 相关技能

- [web-design-director](../web-design-director/)——视觉方向框架（在本技能之前使用）
- [design-trends-2026](../design-trends-2026/)——用于第 4 轮验证的当前视觉趋势
- [minimalist-image-director](../minimalist-image-director/)——用于确保图像一致性的 AI 摄影指导
- [landing-page-optimizer](../../content/landing-page-optimizer/)——转化优化（在本技能之后使用）
- [ai-video-qa](../../video/ai-video-qa/)——用于视频内容的同类 QA 技能（采用相同的评分理念）

---

## 技能元数据

```yaml
name: website-finishing-director
category: ai-design
subcategory: quality-assurance
version: 1.0
author: GUIA
source_expert: Nielsen Norman Group + Google Web Vitals + OWASP + GUIA Production Memory (8 shipped sites)
source_work: null
difficulty: intermediate
mode: centaur
estimated_value: QA/finishing audit engagement (~1500-3000 EUR per site)
tags: [web-design, qa, audit, finishing, pre-launch, ux, performance, seo, brand, cross-device, scoring]
created: 2026-02-12
updated: 2026-02-12
```

---

*此技能属于 GUIA 高级营销技能库——连接 AI 基础与技术实现的 201 进阶层。*