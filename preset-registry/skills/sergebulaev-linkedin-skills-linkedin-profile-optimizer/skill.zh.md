---
name: linkedin-profile-optimizer
description: 'Audit and rewrite a LinkedIn profile end-to-end for 2026: headline, About 7-step, Featured, banner, photo, Experience metrics, Skills, custom URL, recommendations. Triggers on "review my profile", "rewrite my headline", "fix my About", "optimize banner", "profile audit", "LinkedIn bio". Converts resume-style profiles to ones that convert 3-5x better.'
---
# LinkedIn Profile Optimizer

对照 2026 年最佳实践，审计 LinkedIn 个人资料的九大组成部分（头像、横幅、标题（headline）、About、Featured、Experience、Skills、自定义 URL、推荐信（recommendations）），然后重写每个需要改进的部分。优化后的个人资料比默认/简历式资料多获得约 3.9 倍浏览量，访客转化效果提升 3-5 倍。

## 何时使用

- 用户粘贴其 LinkedIn 个人资料 URL 并请求审计
- 用户想重写标题（headline）、About 或 Featured 部分
- 用户正在启动内容策略，需要个人资料与之匹配
- 出现以下任意说法："review my profile"、"fix my headline"、"optimize bio"、"profile audit"、"LinkedIn optimization"

## 输入

- 个人资料 URL（或各部分截图）
- 目标：**赢得客户** / **求职** / **建立权威** — Featured 和 CTA 因目标而异
- 可选：用于与现有个人资料对照评估的草稿内容

## 输出

按以下形式输出结构化的审计 + 重写：

1. **评分卡**（9 个部分，通过/不合格/待改进）
2. **优先修复项**（按影响力排序）
3. 针对每个未通过部分的**改前 → 改后重写**
4. **预期提升**（基于基准数据）

## 步骤

1. **收集信息。** 收集个人资料现状 + 目标。标记缺失的部分。
2. **对 9 个部分逐一评分**，依据清单进行（见 references/ 目录）。
3. **重写标题（headline）**，使用 `[What You Do] | [Who You Help] [Achieve What Result]` 公式 — 用满全部 220 个字符。
4. **重构 About**，采用 7 步结构；验证前 **265-275 个字符**在 "see more" 之前能形成钩子。
5. **策划 Featured**（3 个强项），与目标匹配：
   - **赢得客户：** 引导磁铁 + 带成果的案例研究 + 日历预约链接
   - **求职：** 作品集 + 最佳工作样本 + 表现最佳的帖子
   - **建立权威：** 最佳内容 + 媒体/播客露出 + 通讯订阅入口
6. **重写 Experience 条目**，采用 `action verb + specific metric` 格式。每个职位添加 5+ 个技能。置顶前 3 项技能。
7. **认领自定义 URL**（linkedin.com/in/firstnamelastname，而非默认的 `-123abc456`）。
8. **起草推荐请求**，注明具体事项（"about [project/skill]"）— 不要发送 LinkedIn 的通用模板。
9. **交付改前/改后对比（diff）** + 预期提升（3.9 倍浏览量、3-5 倍转化、获得面试机会的可能性提高 71%）。

## 九部分评分卡

| # | 部分 | 通过标准（2026） |
|---|---------|----------------------|
| 1 | **头像（Photo）** | ≥400x400，面部占画面 60%，拍摄于 3 年内，自然光，浅微笑 |
| 2 | **横幅（Banner）** | 1584x396，文字位于右侧 2/3，高对比度，包含价值主张 + CTA，在移动端测试效果良好 |
| 3 | **标题（Headline）** | 用满全部 220 个字符；格式为 `[What You Do] | [Who You Help] [Result]` |
| 4 | **About** | 200-300 词，第一人称，7 步结构，前 265-275 个字符内设有钩子 |
| 5 | **Featured** | 3 个条目，与目标匹配，使用定制的 1200x627 缩略图 |
| 6 | **Experience** | 每条 = `action verb + metric`，每个职位 5+ 个技能，附有媒体材料 |
| 7 | **Skills** | 已列出 50 项，置顶前 3 项，与目标职位描述相呼应，每项 ≥1 个认可 |
| 8 | **自定义 URL** | `linkedin.com/in/firstnamelastname`（而非默认的随机字符串） |
| 9 | **推荐信（Recommendations）** | 至少 3 封近期的、具体的（非泛泛而谈的）、来自多元背景的推荐 |

## 关键基准（来自 co.actor 研究）

- 优化后的 About 部分：**浏览量提升 3.9 倍**
- 列出 5+ 项技能：**好友邀请增加 3 倍**
- 内容完善的个人资料：**获得面试的可能性提高 71%**
- Featured 部分有内容：**浏览时长增加 30%**
- 创始人个人资料对比公司主页：**互动量增加 315%，转化提升 270%**

## 硬性规则

全局语气规则：见根目录 `SKILL.md` 的 §Voice rules。本技能额外的专属规则：

- 使用第一人称（"I help..."），绝不使用第三人称（"Jane is a passionate..."）
- 绝不使用 "passionate thought leader" / "driven professional" / "results-oriented"（个人资料中典型的 AI 词汇）
- 避免大段文字墙。在 About 部分使用换行
- 80% 的用户将 Featured 留空。填好它就是免费的优势

## 参考文件

- `references/profile-headline-formulas.md` — 220 字符公式 + 改前/改后示例
- `references/about-section-templates.md` — 7 步结构及字符数预算
- `references/featured-section-playbook.md` — 与目标匹配的内容类型
- `references/banner-photo-specs.md` — 尺寸、构图、移动端测试
- `references/experience-skills-rules.md` — 条目重写 + 技能策略 + 自定义 URL + 推荐信

## 相关技能

- `linkedin-content-planner` — 帖子支柱应呼应个人资料标题/About 的核心主张
- `linkedin-post-writer` — Featured 部分按季度轮换；置顶你的旗舰帖子
- `linkedin-humanizer` — 用与清理帖子相同的方式清理个人资料文案中的 AI 痕迹
