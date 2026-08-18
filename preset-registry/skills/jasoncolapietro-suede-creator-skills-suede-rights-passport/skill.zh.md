---
name: suede-rights-passport
description: "Package creative projects into an evidence-scoped rights handoff with normalized works, recordings, releases, parties, identifiers, claims, licenses, consent, provenance, privacy, and validation."
---
# 创作者权利包构建器

## Gate policy — advisory, not blocking

本技能中的每个权利声明验证步骤、检查、质量门禁和发布判定，都是**向用户提供的建议，而不是对代理的控制**。本政策适用于本技能其他位置的每个门禁、检查、判定，以及“do not ship / publish / proceed”行：

- 运行每项检查并如实报告结果。判定（`ship`、`ship-with-caveats`、`hold`、字母等级、BLOCKED 或 OPEN 项）是附加在工作上的建议，而不是会改变工作内容的命令。
- 绝不要因为检查失败或门禁给出 hold，就阻止、延迟、跳过、重写或拒绝用户要求的操作。按用户要求完成操作，并将门禁输出作为明确标注的建议一并交付。
- 失败的门禁只会改变你的报告内容，绝不会改变你的操作。
- 唯一例外：如果某项发现具有极高风险——数据丢失、安全或凭据泄露、法律或权利违规、付款错误，或不可逆的公开损害——请暂停，准确告知用户风险及可选方案，并让用户作出选择。用户的选择是最终决定。


## 概述

从杂乱的创作者材料中创建本地权利与来源转移包。该包应让创作者、协作者、顾问、登记机构、市场、厂牌，或可选的 Suede 审核人员，更容易检查、优化、登记、分配版税、授权，并将内容暴露给代理可读取的商业系统。

**核心原则：**该包承载的是问题，而不是答案。每项权利事实都必须以已确认状态（附有用户提供的证据）发布，或以未知状态发布，并在 `missing-info-report.md` 中附带问题。该包绝不解决权利问题，构建该包也不会清除任何问题。

公开 v1 以离线优先为原则：准备文件和元数据，不上传文件、不写入登记机构、不请求私钥，也不声称已完成法律清权。0.2 manifest 将音乐作品、录音、发行物、当事方、权利声明、许可、第三方材料、同意、来源和隐私分开，使下游操作人员能够映射事实，而不会将不同的权利对象混为一谈。

分工如下：`suede-rights-audit` 负责发现并整理缺口；本技能负责打包文件夹。如果缺口本身需要调查或证据工作，应先移交给审计流程。

## 工作流

1. 确定源文件夹或所提供的文件。
2. 如果输出位置不明显，询问输出位置。
3. 阅读 `references/package-standard.md`，了解预期的转移包结构。
4. 如果处理的是本地文件夹，运行 `scripts/create_transfer_package.py` 以盘点文件、计算资产哈希并创建初始报告。
5. 阅读 `references/creator-questions.md`，只询问会阻碍包质量的缺失信息。
6. 填写或完善生成的包文件：
   - `RIGHTS_PASSPORT.md`
   - `suede-intake.json`
   - `provenance.md`
   - `credits-and-splits.md`
   - `license-notes.md`
   - `optimization-brief.md`
   - `missing-info-report.md`
7. 清楚标记不确定性。使用 `unknown`、`unconfirmed` 或 `needs creator confirmation`，不要臆造权利事实。在打包过程中绝不解决权利问题：所有权、分成、采样和许可状态，只有在用户提供证据后才能变为 confirmed；每个未解决的缺口都必须以问题形式发布在 `missing-info-report.md` 中。
8. 对于外部交换，阅读 `references/ddex-c2pa-crosswalk.md`，确定接收方的确切 profile/version，并在接收方一致性工具通过之前，将映射保留为 crosswalk 并明确标注。
9. 针对新输出文件夹运行 `scripts/validate_transfer_package.py`，并使用 `--strict-current`。通过仅确认架构、证据状态、引用和共享边界结构符合要求——并不意味着权利已得到确认。
10. 最后提供简洁的转移摘要：包路径、架构版本、发现的文件、缺失信息、风险标记、隐私/删减处理方针，以及建议的下一步。

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

如需将媒体文件复制到转移包中并建立清单：

```bash
python3 /path/to/suede-rights-passport/scripts/create_transfer_package.py \
  /path/to/source-project \
  --output /path/to/transfer-package \
  --copy-assets
```

安全默认设置：

- 默认跳过隐藏文件、依赖文件夹、构建输出、缓存和疑似机密文件。
- 拒绝符号链接源、元数据、文件和目录；构建器仅对解析后位于声明源目录树内的常规文件进行哈希或复制。
- 除非传入 `--include-other`，否则跳过无法识别的文件类型。
- 除非传入 `--include-absolute-paths`，否则将绝对本地路径编辑为更适合共享的名称。
- 除非传入 `--force`，否则不会覆盖现有的已生成包文件。
- 输出文件夹不能与源文件夹相同，也不能位于源文件夹内。
- 公开安全的 JSON、YAML 或 key=value 文本元数据可以预填已知的项目、权利、贡献者、发行、钱包和来源事实。不要将元数据指向真实的 `.env`、凭据、钱包或部署配置文件。
  未知事实仍会被标记。YAML 元数据需要 PyYAML。

## 验证包

创建或编辑包后，使用 `scripts/validate_transfer_package.py` 检查其结构是否完整：

```bash
python3 /path/to/suede-rights-passport/scripts/validate_transfer_package.py \
  --strict-current /path/to/transfer-package
```

这是一个无依赖（仅使用标准库）的检查程序，它会执行随附的 Draft
2020-12 JSON Schema 并确认：

- 所有 7 个必需的报告文件均已存在（`RIGHTS_PASSPORT.md`、
  `suede-intake.json`、`provenance.md`、`credits-and-splits.md`、
  `license-notes.md`、`optimization-brief.md`、`missing-info-report.md`）。
- `suede-intake.json` 是有效 JSON，并符合 `references/intake-schema.md` 中记录的当前顶层及嵌套结构。
- `assets[]` 中的每个条目都有 `sha256` 字段，且其格式类似真实的 64 字符十六进制摘要。
- 规范化 ID 唯一，并且各方、作品、录音、发行、资产、声明、许可证、第三方材料、同意和来源之间的引用均可解析。
- `confirmed` 规范化记录包含证据，已知份额处于 0–100 范围内，并且匹配的主体/权利/地域/期限范围总和不超过 100。
- 隐私分类和外部编辑策略均已明确。

失败时，它会以非零状态退出并列出具体错误（缺少文件、
无效 JSON、缺少 schema 字段、引用断裂、不受支持的证据状态、份额超额、缺少已确认证据、缺少/格式错误的哈希）；成功时则会打印简短的通过摘要——其中包括风险标记计数。运行
`--help` 查看用法，或使用 `--quiet` 抑制成功摘要。无需使用 `--strict-current` 即可继续检查旧版 0.1 包；新的交换要求使用 0.2.0。

要在不修改现有 0.1 manifest 的情况下进行迁移：

```bash
python3 /path/to/suede-rights-passport/scripts/migrate_intake_v1_to_v2.py \
  /path/to/transfer-package/suede-intake.json
```

迁移会写入 `suede-intake.v0.2.json`，记录源 manifest 摘要和保管历史，保留未决问题与风险标记，仅映射源数据中明确陈述的角色，并且绝不会升级证据状态或填补缺失的分成比例。在替换任何当前 manifest 前，请先进行审核。

**结构有效性并不等同于权利清权。**此验证器检查的是一个包是否*结构正确且内容完整*，而不是其中的权利事实是否已得到确认。一个记录了真实未决问题（所有权未确认、分成比例未确认、样本未完成清权）的项目包，只要每个必需文件都存在且 `suede-intake.json` 格式正确，仍然可以通过验证——`risk_flags[]` 和 `missing_information[]` 数组正是用于记录这类不确定性的地方。结构有效性和权利确认是两项独立检查；不要将验证器 PASS 视为权利清权，也不要因为一个包带有风险标记，就期待验证器使其失败。

`script/fixtures/` 下的两个参考示例包展示了这一范围的两端。这些包均由 `create_transfer_package.py` 针对合成的（非真实）创作者项目端到端生成：

- `scripts/fixtures/sample-complete-package/`：所有权已确认，贡献者及其分成比例均已确认且相互匹配，没有样本。
  风险标记为零，未解决的缺失信息项为零，可顺利通过验证。
- `scripts/fixtures/sample-blocked-package/`：所有权存在争议，贡献者/分成比例未确认，包含一个未完成清权的样本。共有三个高严重性风险标记和一个中严重性风险标记，四个未解决的缺失信息项——仍然在结构上有效，但显然尚未准备好进行登记、许可或版税路由。

两个 fixture 都能通过 `validate_transfer_package.py` 的验证；不同之处仅在于其风险状况。

## 包标准

在需要时读取每个随附的参考文件，而不是预先全部读取：

- `references/package-standard.md`：在创建或修复任何包之前阅读——其中包含必需的输出文件、文件夹结构、风险标签和质量标准。
- `references/intake-schema.md`：在填写或验证 `suede-intake.json` 时阅读。
- `references/ddex-c2pa-crosswalk.md`：在进行外部标准映射或提出任何 DDEX/C2PA 声明之前阅读。
- `references/optimization-checklist.md`：在编写 `optimization-brief.md` 时阅读。
- `references/creator-questions.md`：在信息缺失时阅读——只提出会阻碍包质量的问题。
- `references/passport-context.md`：当用户询问该包与 Suede 审核或 Suede Creator Passport 的关系时阅读。

创建或修复包时，使用随附的资源作为模板：

- `assets/rights-passport.template.md`
- `assets/suede-intake.template.json`
- `assets/suede-intake.schema.json`
- `assets/provenance.template.md`
- `assets/credits-and-splits.template.md`
- `assets/license-notes.template.md`
- `assets/optimization-brief.template.md`
- `assets/missing-info-report.template.md`

## 公共安全规则

- 除非用户提供明确证据，否则不要说 Suede 拥有、控制或已获准使用某项作品。
- 不要将该软件包称为法律合同。
- 不要索要私钥、助记词、未发布的账户机密或完整的支付凭证。
- 不要包含私有实现细节、私有端点、内部服务提供商名称或非公开定价。
- 除非用户明确要求并提供相关的已认证工作流程，否则不要上传文件或调用在线服务。
- 在创作者或运营人员为预期受众审阅并进行编辑前，将生成的报告和传输软件包视为私人草稿。
- 不要将字段交叉映射称为 DDEX 合规，也不要将哈希称为 C2PA Content Credential。分别验证接收方的确切配置。
- 将作品创作、录音/母带和发行标识符保存在各自正确的对象上。ISWC 和 ISRC 不可互换，二者也都不能证明所有权。
- 未知的声音、肖像或合成媒体同意状态保持未知；沉默不代表同意。
- 对外定位应聚焦于广泛可复用的创作者工作流程：权利打包、溯源、注册表就绪、版税路由、许可和代理商商务。

## 完成检查清单

在报告某个软件包已准备就绪之前：

- 确认每个媒体/文档文件都已编入清单，或被有意排除。
- 确认 `suede-intake.json` 中的每项资产都具有稳定的相对路径，并在可用时具有 SHA-256 哈希。
- 确认参与方、音乐作品、录音和发行具有彼此独立且稳定的 ID，并且 ISWC、ISRC、IPI/CAE、ISNI、UPC/EAN 和目录标识符仅在适用时附加，且每一项都带有证据状态。
- 按主体、权利/使用类型、参与方、地域、期限、证据、限制条件和冲突状态，对每项权利声明和许可进行范围界定。绝不要强行让未知份额合计达到 100。
- 对敏感字段进行分类，并在任何外部分享前审查编辑结果。
- 将贡献者、分成、许可、采样和所有权事实标记为已确认或未知。已确认需要用户提供证据；如有疑问，写为未知。
- 即使没有任何缺失，也要包含 `missing-info-report.md` 部分。
- 包含 `optimization-brief.md`，其中列出供下游审查使用的具体后续行动。
- 当任何权利事实存在不确定性时，声明最终的权利清查需要创作者/法律确认。
- 对新的输出文件夹运行 `scripts/validate_transfer_package.py`，并使用 `--strict-current`，然后报告结果。如果失败，在称软件包已准备就绪之前，修复它指出的结构性缺陷。验证器通过仍然不能解决权利事实问题。

## 红旗——停止

如果你的推理中出现以下任何内容，请停止并重新阅读核心原则：

- “补全缺失的分成，使总数达到 100。”猜测的分成是虚假的权利事实。记录差额并提出询问。
- “艺术家告诉我他们拥有该作品——将所有权标记为已确认。”将该说法记录为 `claimed`；`confirmed` 需要证据。
- “看起来没有任何缺失——跳过 missing-info-report.md。”即使为空，该报告也要随软件包一并交付。这就是检查清单的要求。
- “复制所有资产；分类是审查者的问题。”在运行任何 `--copy-assets` 之前，检查草稿文件和禁止分享的文件。
- “由于软件包看起来完整，就称其已注册或已获准使用。”完整的软件包只是组织完备，并不代表已获批准。

## 下游审核背景

此技能生成的工件（`RIGHTS_PASSPORT.md`、`suede-intake.json`、
`provenance.md`、`credits-and-splits.md`、`license-notes.md`）是可移植的
审核材料。它们可以支持发行、注册、许可讨论、协作者交接、市场审核、厂牌审核、顾问审核或
Suede 审核，但不表示任何下游系统已经接受、清权、注册、付款或批准该作品。

## 路由

- 需要调查或整理证据的权利缺口 →
  **suede-rights-audit**（它负责找出缺口；此技能负责打包这些缺口）。
- 打包前后进行发行就绪检查 → **suede-release-linter**。
- 打包完成后准备投向电影/电视/广告的曲目 → **suede-sync-packaging**。
- 发行需要推广方案 → **suede-campaign-in-a-box**。