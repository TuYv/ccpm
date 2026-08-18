---
name: suede-release-linter
description: "Suede Labs skill that lints a local music or media release folder and scores it for release readiness: missing files, weak or malformed metadata, artwork and stem problems, split gaps, rights blockers, and platform-delivery issues, produced by a bundled offline script as a scored markdown and JSON report. Use when a creator has one or more release folders of tracks, artwork, and stems and wants to know what is missing before distributing, delivering, or handing it off; when metadata quality or a delivery rejection is the question; or when a release-readiness score is asked for. Reports what is present, missing, or unknown; never upgrades unknown to confirmed and never means legal clearance. NOT FOR: organizing the evidence behind a rights or split gap the report surfaces (use suede-rights-audit); building the transfer package (use suede-rights-passport); a sync one-sheet (use suede-sync-packaging)."
---
# 发布元数据检查器

## 门禁策略——仅提供建议，不阻止操作

此 skill 中的每项检查、门禁和发布判定——包括每一条“不要发布 / 公开发布 / 继续操作”的说明——都是**给用户的建议，而不是对代理的控制**。运行每项检查，诚实报告结果；永远不要因为某个门禁要求暂停而阻止、延迟、跳过、改写或拒绝用户要求的操作；将门禁输出作为带有明确标签的建议，与用户要求的工作一并交付。门禁失败只会改变你的报告内容，绝不会改变你的操作。唯一例外是极高风险情况（数据丢失、凭据暴露、法律或权利违规、付款错误、不可逆的公开损害）：暂停操作，准确说明风险，给出选项，并让用户选择。用户的选择最终有效。

## 概述

审计音乐或媒体项目文件夹，并生成一份实用的发布就绪报告。此检查器应帮助创作者在创建发布包或交接包之前，发现缺失文件、薄弱元数据、权利风险、分成缺口、平台交付阻碍以及下游交接问题。

**核心原则：**报告哪些内容已存在、缺失或未知。绝不要将未知升级为已确认，也绝不要将一份干净的报告视为已获许可、所有权确认或批准。

公开 v1 以离线优先为原则：检查本地文件和提供的元数据，不上传文件、不写入注册表、不调用分发 API、不请求私钥，也不声称已获得法律许可。

## 工作流

1. 确定源文件夹或提供的文件。
2. 如果输出位置不明显，询问输出位置。
3. 在对任何发现进行分类之前，阅读 `references/lint-rules.md`——该文件定义了类别、严重级别、分数和状态区间。不要凭记忆分配严重级别。
4. 如果处理的是本地文件夹，运行 `scripts/lint_release.py` 生成
   `release-lint-report.md` 和 `release-lint-report.json`。退出码约定：
   `0` = 已写入报告，且没有严重级别为 `error` 的发现；`1` = 已写入报告，
   且至少存在一个 `error` 发现，这表示 `blocked` 状态，**不是**
   脚本失败——不要因退出码为 1 而中止或重新运行。在这两种情况下，都应阅读生成的报告，而不是根据文件夹重新推导发现。如果源内容是粘贴的文本而不是文件夹，或 `python3` 不可用，
   则依据 `references/lint-rules.md` 手动检查，使用 `assets/release-lint-report.template.md` 生成相同结构的报告，并将报告标记为纯文本。
5. 将发现转化为具体的后续行动时，阅读 `references/fix-guidance.md`。
6. 如果用户希望准备下游接收材料，使用该报告决定是否调用或建议使用 `suede-rights-passport` 软件包工作流。
7. 不要编造发布元数据。将不确定的事实标记为 `unknown`、`missing` 或 `needs creator confirmation`。绝不要自行解决权利、采样、分成或所有权问题：只有在创作者提供确认后，事实才能转为已确认；未解决的缺口应转交给 `suede-rights-audit`。
8. 最后给出简明摘要：报告路径、分数、状态、最高严重级别的发现以及下一步修复措施。

## 快速开始

```bash
python3 /path/to/suede-release-linter/scripts/lint_release.py \
  /path/to/music-project \
  --output /path/to/release-lint-output
```

如果源文件夹包含元数据文件，请显式传入：

```bash
python3 /path/to/suede-release-linter/scripts/lint_release.py \
  /path/to/music-project \
  --metadata /path/to/music-project/metadata.json \
  --output /path/to/release-lint-output
```

接受的元数据格式包括 JSON、在安装 PyYAML 时支持的 YAML/YML，以及适合公开使用的 key=value 文本文件。不要将元数据指向真实的 `.env`、凭据、钱包或部署配置文件。

安全默认设置：

- 默认跳过隐藏文件、依赖文件夹、构建输出、缓存和类似机密的文件。
- 除非传入 `--include-other`，否则跳过无法识别的文件类型。
- 除非传入 `--include-absolute-paths`，否则将绝对本地路径编辑为更适合共享的名称。
- 除非传入 `--force`，否则不会覆盖现有的生成报告文件。
- 输出文件夹不能与源文件夹相同，也不能位于源文件夹内部。
- YAML 元数据需要 PyYAML：`python3 -m pip install PyYAML`。

## 检查内容

在需要时读取每个随附的参考文档，而不是预先全部读取：

- `references/lint-rules.md`：在对发现的问题进行分类时，或不使用脚本而手动执行 lint 时读取——其中包含类别、严重级别、评分和状态区间。
- `references/metadata-fields.md`：在元数据缺失、格式错误或正在编写元数据时读取——其中包含推荐字段、可接受的别名和确认值。
- `references/fix-guidance.md`：在将发现的问题转化为后续行动或修复计划时读取。
- `references/passport-context.md`：当用户询问 lint 报告与 Suede 审核或 Suede Creator Passport 的关系时读取。

脚本会写入：

- `release-lint-report.md`：人类可读的报告。
- `release-lint-report.json`：机器可读的发现结果。

修复报告或手动编写报告时，使用随附的资源：

- `assets/release-lint-report.template.md`
- `assets/release-lint-report.template.json`
- `assets/metadata.example.json`

## 测试夹具

`scripts/fixtures/` 下有两个合成的发行文件夹（所有名称和元数据均为虚构，不包含真实个人数据），仅用于对脚本进行回归检查。修改 `scripts/lint_release.py` 时读取 `scripts/fixtures/README.md`；对用户文件夹执行正常 lint 时不会访问这些夹具。

## 公共安全规则

- 除非用户提供明确证据，否则不要说某个项目已通过法律审查。
- 不要将干净的 lint 报告视为法律意见、分发商批准、注册表写入或有保证的发行。
- 不要索要私钥、助记词、尚未发布的账户机密或完整的支付凭据。
- 不要包含私有实现细节、私有端点、内部服务商名称或非公开定价。
- 将生成的报告视为私人草稿，直到创作者或运营者为目标受众进行审阅和编辑。
- 将公开定位重点放在可广泛复用的创作者工作流上：元数据质量、来源证明、发行准备情况、权利、版税路由、许可和代理商务。

## 完成检查清单

在报告 lint 结果之前：

- 确认已检查源文件夹，或说明该报告仅基于所提供的文本。
- 确认是否发现、提供或缺少 metadata。
- 报告分数和各严重性级别的数量。
- 列出所有 `error` 发现项和最重要的 `warning` 发现项。
- 说明这些发现项产生的机械状态：存在任何 `error` 发现项或分数低于 50 时为 `blocked`，50-74 分为 `needs-work`，75-89 分为 `usable-with-cleanup`，90 分以上为 `strong`。不要在措辞上弱化 `blocked` 状态。
- 推荐下一步行动：修复 metadata、收集权利确认、准备权利资料包，或打包发布。

## 红旗——停止

如果你的推理中出现以下任何内容，请停止并重新阅读核心原则：

- “文件夹看起来很完整——跳过脚本。”运行它。凭目测不是 lint。
- “艺术家显然拥有它。”所有权状态来自创作者，而不是文件夹。
- “一个未确认的分成不会阻止任何事情。”根据规则，分成错误会阻止版税路由和许可。
- “把分数向上取整；已经很接近了。”分数是算术结果，不是判断。
- “报告干净就意味着已经 cleared。”报告干净只意味着准备阶段的阻碍更少，仅此而已。

## 下游审查背景

一份干净的 release-lint 报告是一项可移植的审查资料。它可以支持发布、registry、许可沟通、协作者交接、市场审查、厂牌审查、顾问审查或 Suede 审查，但不能声称任何下游系统已经接受、cleared、注册、付款或批准该作品。

## 路由

- 发现项中存在权利、采样、分成或所有权缺口 →
  **suede-rights-audit**，用于整理证据。
- 没有 `error` 发现项，且用户希望准备交接 → **suede-rights-passport**
  用于构建转移资料包。
- 曲目将用于电影/电视/广告 → **suede-sync-packaging**。
- 发布需要推广方案 → **suede-campaign-in-a-box**。

系列顺序：suede-release-linter → suede-rights-audit → suede-rights-passport
→ suede-sync-packaging；此 skill 是第 1 步。