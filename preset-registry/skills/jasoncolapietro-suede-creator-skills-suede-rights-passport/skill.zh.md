---
name: suede-rights-passport
description: "Suede Labs skill that turns messy creator materials into a local, offline rights-and-provenance transfer package: inventoried and hashed assets, a normalized suede-intake.json manifest, credits and splits, license notes, provenance, and a missing-information report, validated by a bundled stdlib script. Use when a creator needs to hand a song, release, or project to a collaborator, advisor, registry, marketplace, or label; when someone asks for a rights package, intake package, or handoff folder; or when a validated manifest is needed before licensing or royalty-routing review. Carries questions, not answers: building the package clears nothing and uploads nothing. NOT FOR: finding or investigating the rights gaps in the first place (use suede-rights-audit); linting a release folder's files and metadata (use suede-release-linter); a sync one-sheet (use suede-sync-packaging)."
---
# 创作者权利包构建器

## 门控策略——仅供建议，不构成阻断

本技能中的每项检查、门控和交付判定——包括每一条“不要交付 / 发布 / 继续”的说明——都是**给用户的建议，而不是对代理的控制**。执行所有检查，如实报告结果，绝不要因为门控要求暂缓，就阻止、延迟、跳过、改写或拒绝用户请求的操作；应将门控输出作为带有明确标签的建议，与用户请求的工作一并交付。门控未通过只会改变你报告的内容，绝不会改变你执行的操作。唯一的例外是极端风险（数据丢失、凭证泄露、法律或权利违规、付款错误、不可逆的公开损害）：暂停操作，准确说明风险，给出选项，并让用户选择。用户的选择即为最终决定。

## 概述

从杂乱的创作者材料中创建一套本地权利与来源转移包。该包应便于创作者、协作者、顾问、登记机构、市场平台、厂牌或可选的 Suede 审核人员检查、优化、登记作品，为其分配版税、授予许可，并将其接入代理可读取的商业系统。

**核心原则：**该包承载的是问题，而不是答案。每项权利事实在交付时，要么是已确认的（附有用户提供的证据），要么标记为未知，并在 `missing-info-report.md` 中列出相关问题。该包绝不解决任何权利问题，构建该包也不代表完成任何权利清理。

公开 v1 采用离线优先方式：准备文件和元数据，但不要上传文件、写入登记系统、请求私钥或声称已获得法律许可。0.2 版清单将音乐作品、录音、发行、相关方、权利主张、许可、第三方材料、同意、来源和隐私信息分开，以便下游操作方能够映射事实，而不会将不同类型的权利对象混为一谈。

职责分工：`suede-rights-audit` 用于发现并整理缺失信息；本技能用于打包文件夹。如果缺失信息本身需要调查或证据处理，请先移交审计流程。

## 工作流程

1. 确定源文件夹或已提供的文件。
2. 如果输出位置不明确，请询问输出位置。
3. 阅读 `references/package-standard.md`，了解预期的转移包结构。
4. 如果处理本地文件夹，运行 `scripts/create_transfer_package.py`，以清点文件、计算资产哈希并创建初始报告。
5. 阅读 `references/creator-questions.md`，并且只询问那些因信息缺失而影响包质量的问题。
6. 填写或完善生成的包文件：
   - `RIGHTS_PASSPORT.md`
   - `suede-intake.json`
   - `provenance.md`
   - `credits-and-splits.md`
   - `license-notes.md`
   - `optimization-brief.md`
   - `missing-info-report.md`
7. 明确标示不确定性。使用 `unknown`、`unconfirmed` 或 `needs creator confirmation`，而不是编造权利事实。打包过程中绝不要解决权利问题：所有权、份额、采样和许可状态只有在获得用户提供的证据后才能转为已确认状态，并且每项未解决的缺失信息都必须作为问题写入 `missing-info-report.md` 随包交付。
8. 对于外部交换，请阅读 `references/ddex-c2pa-crosswalk.md`，确定接收方的确切配置文件/版本，并在接收方一致性工具验证通过之前，始终将该映射标记为对照映射。
9. 对新的输出文件夹运行带有 `--strict-current` 的 `scripts/validate_transfer_package.py`。验证通过仅确认架构、证据状态、引用和共享边界结构符合要求——并不意味着权利已获确认。
10. 最后提供简明的转移摘要：包路径、架构版本、找到的文件、缺失信息、风险标记、隐私/脱敏处理情况，以及建议的下一步操作。

## 快速开始

对于本地项目文件夹：

```bash
python3 /path/to/suede-rights-passport/scripts/create_transfer_package.py \
  /path/to/source-project \
  --output /path/to/transfer-package \
  --metadata /path/to/source-project/metadata.json \
  --project-title "Project Title" \
  --artist "Artist Name"
```

如需在清点媒体文件的同时将其复制到移交包中：

```bash
python3 /path/to/suede-rights-passport/scripts/create_transfer_package.py \
  /path/to/source-project \
  --output /path/to/transfer-package \
  --copy-assets
```

安全默认设置：

- 默认跳过隐藏文件、依赖项文件夹、构建输出、缓存以及疑似包含机密信息的文件。
- 拒绝使用符号链接的源目录、元数据、文件和目录；构建器
  仅对解析后位于声明的源目录树内的常规文件进行哈希计算或复制。
- 除非传入 `--include-other`，否则会跳过无法识别的文件类型。
- 除非传入 `--include-absolute-paths`，否则会将本地绝对路径脱敏为更适合安全共享的名称。
- 除非传入 `--force`，否则不会覆盖现有的已生成移交包文件。
- 输出文件夹不能与源文件夹相同，也不能位于源文件夹内部。
- 可公开安全共享的 JSON、YAML 或 key=value 文本元数据可以预填已知的项目、
  权利、贡献者、发布、钱包和来源事实。不要将
  元数据指向真实的 `.env`、凭据、钱包或部署配置文件。
  未知事实仍会被标记。YAML 元数据需要 PyYAML。

**暂停格式——可能不适合共享的材料。** 在任何 `--copy-assets`
运行之前，扫描草稿、未发布、私密或禁止共享的文件。如果发现任何此类文件：
停止操作，列出具体文件并说明为什么每个文件都被视为禁止共享，提供以下
选项（排除后继续 / 包含并附上脱敏说明 / 仅清点而不复制 / 中止），然后等待选择。
对于任何触发门控策略极高风险例外的内容，也使用相同的处理形式。绝不要猜测
创作者希望如何处理。

## 验证移交包

创建或编辑移交包后，使用 `scripts/validate_transfer_package.py`
检查其结构是否完整：

```bash
python3 /path/to/suede-rights-passport/scripts/validate_transfer_package.py \
  --strict-current /path/to/transfer-package
```

这是一项无依赖（仅使用标准库）的检查，会执行随附的 Draft
2020-12 JSON Schema。它会确认是否存在 7 个必需的报告文件、
`suede-intake.json` 是否符合
`references/intake-schema.md` 中记录的结构、每项资产是否具有真实的 64 位十六进制 `sha256` 摘要、
ID 是否唯一且引用是否可解析、每条 `confirmed` 记录是否都有证据、
份额是否在有效范围内且未超额分配，以及是否明确说明隐私/脱敏策略——
每一项都映射到下方完成检查清单中的确切错误字符串。

验证失败时，它会以非零状态退出并提供具体的错误列表；验证成功时，它会输出简短的通过
摘要，其中包括风险标记数量。运行 `--help` 查看用法，或使用
`--quiet` 抑制成功摘要。如果不使用 `--strict-current`，仍可检查旧版 0.1 移交包；
新的交换要求使用 0.2.0。

要迁移现有的 0.1 清单而不对其进行修改：

```bash
python3 /path/to/suede-rights-passport/scripts/migrate_intake_v1_to_v2.py \
  /path/to/transfer-package/suede-intake.json
```

迁移操作会写入 `suede-intake.v0.2.json`，记录源清单的摘要和保管历史，保留未决问题和风险标记，仅映射源数据中明确说明的角色，并且绝不会提升证据状态或补全缺失的份额。在替换任何当前清单之前，请先对其进行审查。

**结构有效并不代表权利已获许可。** 验证器检查的是软件包的结构是否正确且内容是否完整，而不是其中的权利事实是否已经确认——即使项目存在所有权未经确认、份额分配未经确认或采样未经许可的情况，仍然可以通过验证，因为 `risk_flags[]` 和 `missing_information[]` 正是用于记录这些不确定性的地方。绝不要将 PASS 解读为已获许可，也绝不要预期带有风险标记的软件包会验证失败。

`scripts/fixtures/sample-complete-package/` 和 `sample-blocked-package/` 是该范围两个端点的完整示例，并且两者都能通过验证。当你需要查看带有风险标记但结构有效的软件包的具体示例，或要修改 `create_transfer_package.py` 时，请阅读 `scripts/fixtures/README.md`。

## 软件包标准

在需要时再阅读每项随附参考资料，而不要预先全部阅读：

- `references/package-standard.md`：创建或修复任何软件包之前阅读——其中包含必需的输出文件、文件夹结构、风险标签和质量标准。
- `references/intake-schema.md`：填写或验证 `suede-intake.json` 时阅读。
- `references/ddex-c2pa-crosswalk.md`：进行外部标准映射或提出任何 DDEX/C2PA 相关声明之前阅读。
- `references/optimization-checklist.md`：编写 `optimization-brief.md` 时阅读。
- `references/creator-questions.md`：信息缺失时阅读——仅询问那些会阻碍软件包质量的问题。
- `references/passport-context.md`：当用户询问该软件包与 Suede 审查或 Suede Creator Passport 之间的关系时阅读。

创建或修复软件包时，请使用随附资源作为模板：

- `assets/rights-passport.template.md`
- `assets/suede-intake.template.json`
- `assets/suede-intake.schema.json`
- `assets/provenance.template.md`
- `assets/credits-and-splits.template.md`
- `assets/license-notes.template.md`
- `assets/optimization-brief.template.md`
- `assets/missing-info-report.template.md`

## 公开安全规则

- 除非用户提供明确证据，否则不要声称 Suede 拥有、控制某项作品或已为其取得许可。
- 不要将软件包称为法律合同。
- 不要索取私钥、助记词、未公开的账户机密信息或完整的支付凭证。
- 不要包含私有实现细节、私有端点、内部提供商名称或非公开定价。
- 除非用户明确提出要求并提供相关的已认证工作流，否则不要上传文件或调用在线服务。
- 在创作者或运营人员针对目标受众审查并编辑生成的报告和传输软件包之前，应将其视为私有草稿。
- 不要将字段对应关系称为符合 DDEX，也不要将哈希称为 C2PA Content Credential。应单独验证接收方的具体配置文件。
- 应将作品、录音/母带和发行标识符保留在各自对应的对象中。ISWC 和 ISRC 不可互换，两者也都不能证明所有权。
- 未知的声音、肖像或合成媒体同意状态必须保持为未知；未作说明并不代表同意。
- 公开定位应聚焦于可广泛复用的创作者工作流：权利材料打包、来源溯源、登记准备、版税路由、许可和智能体商务。

## 完成检查清单

首先，针对输出文件夹使用 `--strict-current` 运行 `scripts/validate_transfer_package.py`，并报告结果：这是本检查清单中大多数项目所依据的证据；在将软件包称为就绪之前，必须修复该工具指出的每个结构性缺口。每个机器检查项都注明了未满足时引发的错误：

- 7 个必需文件全部存在 — *缺少必需文件*。
- 每个资产都有稳定的相对路径和 64 位十六进制 SHA-256 — *sha256 字段为空或不是字符串*。
- 当事方、作品、录音和发行版本具有不同且可解析的 ID — *ID 重复* / *引用了未知 ID*。
- 每个媒体/文档文件都已列入清单或被有意排除，并且标识符（ISWC、ISRC、IPI/CAE、ISNI、UPC/EAN、目录编号）仅位于其对应的对象上 — *identifiers[…].scheme 不受支持*。
- 权利声明和许可按主体、权利/使用类型、当事方、地域、期限、证据及限制进行范围界定，且任何范围均不超过 100% — *share_percent 必须为 null 或介于 0 到 100 之间* / *……总计超过 100%*。切勿强行让未知份额合计为 100。
- 每条 `confirmed` 记录都附有证据 — *已确认但没有 evidence_refs*。
- 隐私分类和脱敏处理立场已明确说明 — *privacy.default_classification 不受支持*。

验证器无法检查以下三个项目——它们属于需要人工判断的剩余事项，而验证器顺利通过并不能说明这些事项没有问题：

- **禁止共享审查**：未经用户明确选择（采用上文的暂停格式），不得复制任何草稿、私密或未发布材料。
- **脱敏审查**：在任何对外共享之前，应由人工阅读敏感字段，而不能仅依赖分类标签。
- **明确说明不确定性**：凡权利事实存在不确定之处，最终许可均须由创作者/法律人员确认；贡献者、份额、许可、采样和所有权事实只能根据用户提供的证据确认，存在疑问时应标记为 `unknown`；即使内容为空，也必须交付 `missing-info-report.md`，且 `optimization-brief.md` 中必须包含具体的后续行动。

验证器通过仍不能解决权利事实问题。

## 危险信号——立即停止

如果你的推理中出现以下任何想法，请立即停止并重新阅读核心原则：

- “补上缺失的份额，让总数达到 100。”猜测的份额属于虚假的权利事实。记录缺口并询问用户。
- “艺人告诉我他们拥有它——将所有权标记为已确认。”应将该声明记录为 `claimed`；`confirmed` 需要证据。
- “似乎没有缺失内容——跳过 missing-info-report.md。”即使报告为空，也必须交付。这就是检查清单的要求。
- “复制所有资产；分类是审核人员的问题。”在任何 `--copy-assets` 运行之前，检查是否存在草稿和禁止共享的文件。
- “既然软件包看起来很完整，就称其已注册或已获许可。”完整的软件包只是组织完备，并不代表已获批准。

## 下游审核语境

此技能生成的制品（`RIGHTS_PASSPORT.md`、`suede-intake.json`、
`provenance.md`、`credits-and-splits.md`、`license-notes.md`）是可移植的
审核材料。它们可用于支持发行、登记、许可洽谈、协作者交接、市场平台审核、
唱片公司审核、顾问审核或 Suede 审核，但并不声称任何下游系统已接受、许可、
登记、付款或批准该作品。

## 路由

- 需要调查或整理证据的权利缺口 →
  **suede-rights-audit**（它负责发现缺口；本技能负责将其打包整理）。
- 打包前后的发行就绪检查 → **suede-release-linter**。
- 打包后将用于影视/广告的曲目 → **suede-sync-packaging**。
- 需要推广计划的发行项目 → **suede-campaign-in-a-box**。

技能族顺序：suede-release-linter → suede-rights-audit → suede-rights-passport
→ suede-sync-packaging；本技能是第 3 步。