---
name: folklore-variant-evidence
description: "Retrieve ClinGen gene-disease validity assertions for a public gene or disease, and review source-linked public evidence and literature for one supported GRCh38 germline nuclear SNV or simple indel through Folklore Clinical Variant Interpretation MCP. Use when a scientific agent must branch deterministically on resolved, ambiguous, not-found, invalid, unsupported, or unavailable variant outcomes; chain a resolved public variant into related literature or publication details; or preserve evidence provenance without accepting patient, phenotype, family, segregation, or private case data."
license: MIT
compatibility: Requires network access to api.helena.bio (stateless Streamable HTTP MCP, no credentials); works from any MCP-capable host or via JSON-RPC POST with curl.
metadata:
  version: "1.0"
  skill-author: "Helena Bioinformatics"
  website: "https://folklore.helena.bio"
  github: "https://github.com/helena-bioinformatics/folklore-mcp"
---
# Folklore 变异证据

使用 Folklore Clinical Variant Interpretation MCP 检索结构化公共变异证据、自动化的变异级 ACMG/AMP 决策支持、来源信息以及带来源链接的文献，供专业人员审核。工作流仅限于公共标识符，并保留每一种明确的结果状态。Adapter 1.5.0 还提供 ClinGen 基因-疾病有效性断言；来源覆盖范围有限，并不涵盖所有已知关联。

Folklore Clinical Variant Interpretation MCP 由 Helena
Bioinformatics 发布。其托管端点为：

```text
https://api.helena.bio/folklore/v1/mcp
```

无需账户或 API 密钥。公开的 Apache-2.0 adapter 及其契约位于 <https://github.com/helena-bioinformatics/folklore-mcp>。

## 最小连接示例

不支持原生 MCP 的主机可以发起相同的公共 JSON-RPC 调用：

```bash
curl --silent --show-error --fail-with-body --max-time 60 \
  -X POST https://api.helena.bio/folklore/v1/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -H 'MCP-Protocol-Version: 2026-07-28' \
  -H 'Mcp-Method: tools/call' \
  -H 'Mcp-Name: search_variant_evidence' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"_meta":{"io.modelcontextprotocol/protocolVersion":"2026-07-28","io.modelcontextprotocol/clientCapabilities":{}},"name":"search_variant_evidence","arguments":{"assembly":"GRCh38","query":"rs80357914"}}}'
```

在继续之前检查返回的结果。本示例可能返回包含多个候选项的
`ambiguous`：请停止操作，并要求提供明确无歧义的公共变异表示法，不要自动选择候选项。

## 选择正确的 skill

在以下任务中使用此 skill：针对一个公共变异获取 Folklore
结构化证据、处理明确的解析状态、获取与变异关联的文献，或获取 ClinGen 基因到疾病/疾病到基因的断言。

- 对 ClinVar、dbSNP、gnomAD、Ensembl VEP、COSMIC 或多个数据库进行广泛直接查询时，使用 `database-lookup`。
- 当参考基因组、坐标约定、contig 名称或变异表示法不确定时，先使用 `genomic-coordinates`。
- 不要将此 skill 用于 VCF 注释、批量处理、体细胞变异、结构变异、多基因评分或患者特异性解读。

Folklore Clinical Variant Interpretation MCP 通过一份带来源链接的公共证据契约为这些 skills 提供补充。它不能替代直接的数据库审查或合格临床人员的判断。

## 强制执行输入边界

在调用变异工具之前：

1. 准确提取一个公共变异标识符或表示法。
2. 要求使用 GRCh38，并且变异必须是生殖系核基因组 SNV 或简单 indel。
3. 删除或拒绝患者姓名、病例标识符、表型、家族史、共分离证据、临床记录、上传文件以及其他私有或患者特异性上下文。
4. 如果任务依赖患者上下文，请停止操作并说明 Folklore Clinical Variant Interpretation MCP 不接受或评估此类信息。
5. 绝不能将患者特异性请求转换为公共变异查询，同时暗示结果能够回答该患者特异性问题。

可接受的公共变体形式包括基因组坐标、基因组/编码/
蛋白质 HGVS、SPDI、rsID，或 Folklore Clinical
Variant Interpretation MCP 返回的 `canonical_key`。

## 验证实时工具目录

连接托管端点并调用 `tools/list`。验证可用工具，而不是依赖模型记忆。文档所述的公共目录包括：

- `search_variant_evidence`
- `search_variant_literature`
- `get_publication_details`
- `search_literature_corpus`
- `get_gene_disease_associations`
- `search_disease_genes`

单独的第七个工具 `support_helena` 不属于科学证据；仅在明确请求时使用。

如果发现工具或工具调用失败，请将其保留为可用性问题。不要将其重新解释为缺乏科学证据。

在编写工具调用或解释响应状态之前，请阅读[公共 MCP 合约](references/mcp-contract.md)。

## 获取基因-疾病断言

对于一个确切的基因符号或 HGNC 标识符，使用 `get_gene_disease_associations`；对于一个确切的 MONDO 标识符或公共疾病名称子字符串，使用 `search_disease_genes`。两者都接受 `limit`（默认值为 20，范围为 1–50）和 `offset`（默认值为 0，范围为 0–1000）。请求示例请参阅参考文档。这是单独的来源查询，不需要变体输入或组装版本。

保留每个返回的疾病身份、遗传方式、证据评估、来源 URL、日期和快照。不要合并不同的疾病，也不要在名称匹配结果中默默选择其中一个。基因-疾病有效性不会对特定变体进行分类。空结果表示在可用的 ClinGen 来源中没有匹配的断言，并不表示不存在关联。不得发送患者、表型、家系、分离、私人病例数据或测序文件。仍需由具备资质的专业人员进行审查。

## 运行变体证据工作流

### 1. 解析并检索证据

调用 `search_variant_evidence`，参数如下：

```text
assembly: GRCh38
query: <one public variant identifier or notation>
```

不要向此调用添加表型、疾病、患者、家系或治疗背景。保留返回的合约字段、来源链接、限制条件和使用边界。

### 2. 根据返回的状态分支处理

将状态视为控制流值，而不是普通文本：

| 状态 | 必需操作 |
|---|---|
| `resolved` | 重用返回的 `canonical_key`；审查结构化解读、溯源信息、来源链接和限制条件。 |
| `ambiguous` | 展示返回的候选项，并要求明确选择公共变体。绝不自动选择候选项。 |
| `not_found` | 报告在此服务和查询范围内未找到结果。不要声称普遍不存在。 |
| `invalid_request` | 报告验证问题，并请求更正后的公共变体。不要默默重新解释输入。 |
| `unsupported` | 说明相关的服务边界并停止。不要强行将查询转换为受支持的形式。 |
| `resolution_unavailable` | 报告临时的解析或可用性故障。不要将其视为证据缺失。 |

只有 `resolved` 结果才可自动进入与变异关联的文献工作流。如果已解析的解释本身报告了证据不可用，应保留这一单独的限制。

### 3. 审查证据，避免过度推断

对于已解析的结果：

- 提供返回的变异身份和 `canonical_key`。
- 完全按照返回结果保留自动化的变异级 ACMG/AMP 决策支持结果。
- 引用返回的公开来源和溯源信息。
- 区分返回的事实与代理的综合分析。
- 说明必须由具备资质的专业人员进行审查。
- 不得将结果转化为诊断、个体风险评估、治疗建议或独立的临床报告。

## 关联文献

### 与变异关联的文献

在获得已解析的证据调用结果后，将返回的 `canonical_key` 传递给 `search_variant_literature`。保持 `assembly` 为 `GRCh38`。可选的 `question` 可用于缩小文献关注范围，但必须仍然是公开的科学问题，且不得包含患者背景信息。

区分每个结果的匹配类型：

- `exact_variant`：直接匹配已解析的变异
- `variant_alias`：通过报告中的别名进行匹配
- `gene_association`：更广泛的基因层面关联，而非变异特异性证据

文献关联不会改变返回的 ACMG/AMP 分类。

### 出版物详情

仅使用文献工具返回的 PMID 调用 `get_publication_details`。保留 PubMed URL、DOI/PMCID 字段（如有）、撤稿状态，以及基因提及和变异提及之间的区别。

### 语义语料库搜索

对于公开的自然语言科学问题，或通过出版物标识符、基因、变异、表型、HPO 或 OMIM 概念进行发现时，使用 `search_literature_corpus`。将结果视为与来源关联的候选内容，供具备资质的专业人员审查。零结果响应表示在该限定查询中没有返回结果，并不表示任何相关出版物在任何地方都不存在。

不得将患者信息放入语料库查询中，即使查询并非特定于变异。

## 报告可复现的结果

包括：

1. 完整的公开查询和 `GRCh38` assembly。
2. 返回的状态，以及在已解析时返回的 `canonical_key`。
3. 不改变其含义的结构化证据或文献结果。
4. 来源链接和出版物标识符。
5. 文献结果的匹配类型。
6. 访问日期和任何可用性限制。
7. 以下边界声明：

> 这是面向具备资质的专业人员审查的公开、变异级决策支持。它不评估患者、表型、家系、共分离或私有病例数据，也不是诊断或治疗建议。

## 可证伪的冒烟测试

使用公开 rsID `rs80357914` 测试歧义处理：

```text
Call search_variant_evidence with assembly GRCh38 and query rs80357914. If the
result is ambiguous, list the returned candidates and stop for explicit
selection. Do not select a candidate or call downstream literature tools.
```

只有当模棱两可的响应导致工作流停止，且不进行自动候选选择时，测试才会通过。

## 官方参考资料

- 集成设置：<https://folklore.helena.bio/integrations>
- 技术指南：<https://folklore.helena.bio/docs/folklore-connector>
- 公共适配器和契约：<https://github.com/helena-bioinformatics/folklore-mcp>
- 官方 MCP Registry 标识：`io.helena-bioinformatics/folklore`