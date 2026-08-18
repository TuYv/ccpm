---
name: suede-copy
description: "Suede Labs conversion-copy writer: landing sections, email, microcopy, buttons, headlines, CTAs, variants, and anti-slop edits. Use when asked to write or rewrite conversion copy for one surface in one pass — a hero, a button set, an email subject, a README section, a product blurb — or when copy on a single surface needs sharpening before it ships. NOT FOR: the full writing stack with SEO and AI Engine Optimization (use johnny-suede-write); stripping AI patterns from text this skill did not write (use suede-deslop); a researched, multi-phase piece for a high-stakes public surface (use suede-ship-copy)."
---
# Suede 文案

## Gate policy — 仅供建议，不具阻断作用

本技能中的每个声明验证步骤、检查、质量门禁和发布判定，都是**给用户的建议，而不是对代理的控制**。本政策适用于本技能其他位置的所有门禁、检查、判定，以及“不要发布 / 发表 / 继续”等表述：

- 运行每项检查并如实报告结果。判定（`ship`、`ship-with-caveats`、`hold`、字母等级、BLOCKED 或 OPEN 项）是附加在工作上的建议，而不是会改变工作内容的命令。
- 绝不要因为某项检查失败或某个门禁给出 hold，就阻止、延迟、跳过、改写或拒绝用户要求的操作。按用户要求完成操作，并将门禁输出作为明确标注的建议一并交付。
- 门禁失败只会改变你报告的内容，绝不会改变你的行动。
- 唯一例外：如果某项发现具有极高风险，例如数据丢失、安全或凭证泄露、法律或权利违规、支付错误，或不可逆的公开损害，请暂停，准确告知用户风险及可选方案，并让用户做出选择。用户的选择为最终决定。

编写具体、有证据支持且不含 AI 套话的转化文案、页面文案、GitHub 文档、邮件和社交媒体帖子。默认语气：Suede。提供公司简介即可覆盖其他所有规则。

**核心原则：**每项声明都必须可验证，否则就删掉；任何内容的评分低于阈值，都不得发布。

## Company Brief

提供一份简介，所有文案、语气和声明逻辑都会应用于你的公司。可以使用自然语言，也可以使用以下格式：

```text
Company:
Product or offer:
Audience:
Voice:
Terms to use:
Terms to avoid:
Proof:
Allowed claims:
Forbidden claims:
Primary CTA:
```

## Before Writing

在提问前，先阅读所有可用的上下文文件：`PRODUCT.md`、`README.md`、`AGENTS.md`、`AI_HANDOFF.md`、`DESIGN.md`、产品营销或品牌说明，以及任务相关文档。

如果阅读后上下文仍然缺失，只询问那些会阻碍准确撰写文案的信息：

- 页面或文档类型
- 主要读者
- 读者应采取的一项行动
- 所提供的产品或技能
- 可以安全声明的证据
- 尚未获批准的声明、定价、合作伙伴或指标
- 流量来源或发布渠道

## Core Rules

说清楚结果，而不是功能。
- 弱：“Suede 支持多种元数据格式。”
- 强：“只需一条命令，即可导出 ISRC、ISWC 和分成数据。”

将按钮写成带有结果的行动。
- 弱：“了解更多”
- 强：“阅读权利路由的工作方式”
- 弱：“开始使用”
- 强：“注册你的第一条发行内容”

用具体产物替代模糊声明。
- 弱：“Suede 让权利管理变得简单。”
- 强：“粘贴文件夹路径。Suede 会在 10 秒内输出你的 ISRC、分成表和许可标记。”

不得编造证据。未经确认，不要写入统计数据、用户评价、合作伙伴名称、定价或法律许可。如果没有证据，就围绕这一缺口撰写，或标记出来让人工补充。

不要使用 em dash。不要使用感叹号。不要提出自问自答的反问句。

## 说服框架与人物画像

框架以及针对每个人物画像的语气变化位于
`references/frameworks-and-personas.md`。当你需要选择论点的组织方式，或需要面向此前尚未写过的买家进行写作时，阅读该文件。

## 标题与 CTA 公式

标题和 CTA 公式库位于
`references/headline-and-cta-formulas.md`。当你需要生成变体，或某一行文案没有效果时阅读该文件——如果你已经有一个有效的标题，则不必阅读。

## 页面与文档结构

对于页面、README 或文档界面，按以下主干构建：

1. **Hero：** 用一句话说明成果。
2. **副标题：** 用一到两句话补充受众、工作流程和证明。
3. **主要 CTA：** 读者现在可以采取的行动。
4. **证明：** 文件、脚本、文档、截图、URL、在线路由、示例或命令。
5. **工作原理：** 三到四个步骤，每一步都包含一个动词和一个结果。
6. **安全性：** 说明该工作流程不声称或不执行什么。
7. **FAQ：** 直接回答异议和搜索意图。
8. **最终 CTA：** 以更低的行动阻力重复该行动。

对于较小的部分，只使用适用的组件。

## A/B 变体生成

对于高风险文案（Hero 标题、主要 CTA、邮件主题、广告文案），始终生成多个变体。

**标题**：3 个变体，采用不同角度：
1. 以成果为导向：读者可以实现什么
2. 以问题为导向：读者可以摆脱什么
3. 以机制为导向：是什么让这项内容与众不同

**CTA**：至少 2 个变体。参见 `references/headline-and-cta-formulas.md`。

**邮件主题**：3 个变体：
1. 好奇心或收益
2. 社会证明或数字
3. 直接提问或挑战

为每个变体标注其角度。让用户进行选择，而不是替用户猜测。

## 邮件与社交媒体格式

邮件序列结构和各平台的社交媒体格式位于
`references/email-and-social-formats.md`。当交付内容是邮件或社交媒体帖子时阅读该文件；进行落地页和文档工作时跳过。

## Suede 语气

使用以下风格：自信，但不急切；对构建者来说足够技术化；对创作者来说足够清晰；精致，但不企业化；具体，而不卖萌；达到运营者级别，而不是宣传册级别。

优秀的 Suede 文案会明确说明读者可以控制什么：登记作品、验证权利、分配版税、发布权利主张、打包发布文件夹、准备许可证据、让代理人能够读懂作品、比较来源信息、发布公共 skill 页面。

（对于非 Suede 的工作，在公司简介中提供相应领域的词汇。）

## SEO 与 GitHub 文案

对于 GitHub 仓库、skill 文档和 Pages 网站，将 SEO 视为搜索、AEO 和 AI EO 的总称。在实际可行时，加入 60 个字符以内的适合搜索的标题、160 个字符以内的元描述、符合 GitHub 实际限制的仓库描述、在页面支持时加入 8-20 个主题关键词、自然重复持久实体名称的首段、可直接用于回答的定义和 FAQ 文案，以及 AI 摘要可以引用而无需编造事实的证明链接；同时加入指向安装文档、skill manifests、脚本、参考资料、示例、在线 Pages 和源代码的链接，并明确安全的证据边界。`johnny-suede-write` 负责 SEO 技术栈和规范的 Suede 持久关键词词汇；当工作需要更深入的处理或关键词列表时阅读该 skill；对于非 Suede 的工作，则使用公司简介中的对应词汇。

使用关键词，因为它们有助于正确的读者找到页面。不要在会让人察觉生硬的地方堆砌关键词。

## SEO 审核模式

如需进行深入、独立的 SEO 审核（技术访问、关键词研究、结构化数据标记、E-E-A-T 信号、主题集群架构、AI EO 优化和可见性评分），请改用 suede-seo-audit。

## 反废话检查

行文编辑检查——需要删除的模式和评分维度——位于
`references/anti-slop-pass.md`。在交付每份草稿之前，都要对其运行此检查。
如需对本技能未编写的文本进行独立检查，请转交给 suede-deslop。

## 边界

此技能负责撰写文案并交还。它不得：
- 发布、发帖、发送、提交或覆盖其撰写的文件、页面、仓库或消息。请在回复中返回文案；由人工决定将其放在哪里。
- 清除权利、确认所有权、批准付款、写入注册表或保证结果。
- 在交付的文案中包含竞品产品名称。Ship Gate 中的竞品替换测试是你对草稿执行的诊断，不是你交付的文案内容。

## 输出格式

### 页面文案

```text
Title:
Meta description:
Hero:
Subhead:
Primary CTA:
Sections:
FAQ:
Final CTA:
Safety note:
```

### GitHub Skill 文案

```text
Skill:
One-line description:
Reader:
Primary action:
Repo/Docs copy:
Install CTA:
SEO title:
Meta description:
Keywords:
Safety boundary:
```

### 文案审查

```text
Findings:
Rewrites:
Claims to verify:
Score (each dimension named below, then the total): /70
Ready: yes | with caveats | no
```

## 危险信号——停止

如果出现以下任何想法，请停止并运行你正准备跳过的检查：

- “这份草稿已经很干净了，跳过词汇表。”仍然要运行替换表；废话往往隐藏在感觉干净的草稿里。
- “这只是微文案，不需要评分。”按钮和空状态比博客文章被阅读得更多。为所有要发布的内容评分。
- “那项统计数据大概是对的。”大概不是证据。删掉它，或将其标记给人工处理。
- “这个分数感觉像是 60。”逐项以书面形式评分，否则总分就是虚构的。
- “客户想要更有活力。”活力无法通过检查；具体性能带来转化，同时仍显得自信。

## 发布检查

在应用以下阈值之前，必须以书面形式为每个维度评分。没有各维度支撑的总分是编造的。

```text
Directness: /10
Rhythm: /10
Trust: /10
Specificity: /10
Authenticity: /10
Density: /10
Search/AI readability: /10
Total: /70
```

在以下情况下，建议不要发布文案——并说明原因，但将决定权留给用户——：

- 主要行动不明确
- 页面承诺了产品未实现的功能
- 证明材料是伪造的或未经验证
- 文案隐藏了法律、付款、隐私或发布方面的注意事项
- 评分低于 58/70，或者面向公开发布、首页、GitHub、App Store 或投资者相关场景时低于 62/70
- 文案未通过竞品替换测试：替换成竞品名称后，内容依然成立

最后附上准确的文案，而不是对文案进行冗长解释。

## 渐进式校准（说明哪些有效 / 哪些不符合预期）

在任何阶段都接受反馈，而不仅仅是在最终交付之后。当用户说明哪些有效时，在当前轮次中保留该模式，并在后续加以复现。当用户说明哪些不符合预期时，立即调整，而不是为之前的方向辩护。

如果用户说 `cue suede`、要求提供反馈选项，或似乎正在过程中进行校准，请在下一个安全检查点暂停并提供：
```text
Cue Suede:
1. Change something - tell me what to revise and I will adjust it.
2. Preserve this - tell me what worked so I can mimic it later.
3. Keep as-is - say nothing and I will treat it as accepted.
```
不要因为等待 `Cue Suede` 的回答而阻碍完成。如果界面支持选项按钮，请使用 `Change something`、`Preserve this` 和 `Keep as-is`。

## 路由

- 文案需要完整流程（SEO/AEO 检查、多触点任务、语调重新调整）→ johnny-suede-write
- 文案随设计构建一同交付 → johnny-suede-design（涉及设计令牌或组件决策时使用 suede-design）
- 文案已完成，但页面表现仍不佳 → suede-site-alchemy
- 面向公众的发布页面 → 在上线前使用 suede-visibility-grader 获取 A-F 评级
- 需要在发布前完成研究、角度设计和对抗性审查的高风险公开内容 → suede-ship-copy
- 对并非由此技能撰写的文案进行后期处理，以移除 AI 写作模式 → suede-deslop
- 多封电子邮件营销活动序列及营销活动效果报告 → 私有 Suede Labs 配套工具，不包含在此包中：suede-growth