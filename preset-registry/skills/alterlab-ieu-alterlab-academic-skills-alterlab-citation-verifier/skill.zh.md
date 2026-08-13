---
name: alterlab-citation-verifier
description: "Verifies that every entry in a bibliography ACTUALLY EXISTS by cross-checking it against four keyless public scholarly APIs (Crossref, OpenAlex, Semantic Scholar, arXiv) with a polite mailto identifier, resolving DOI/arXiv IDs, fuzzy-matching title and authors (difflib SequenceMatcher ratio >=0.70), flagging retractions marked in Crossref (update-to) or OpenAlex (is_retracted), and emitting per-entry JSON verdicts mapped to the AlterLab citation-hallucination taxonomy (TF/PAC/IH/PH/SH). Accepts BibTeX, a DOI/arXiv ID list, or free-form references; degrades gracefully offline by emitting 'unverified' verdicts and never silently passing. Use when the request mentions verify citations, check references, fabricated or hallucinated references, fake DOI, retraction check, bibliography audit, or reference existence check. Does NOT write or draft papers — for authoring a manuscript (whose citation-check mode inserts citations) prefer alterlab-paper-writer instead. Part of the AlterLab Academic Skills suite."
license: MIT
allowed-tools: Read Write Edit Bash(python:*) Bash WebSearch WebFetch
compatibility: No API key required — cross-checks four keyless public scholarly APIs (Crossref, OpenAlex, Semantic Scholar, arXiv) via WebFetch and `uv run python`; degrades gracefully offline to 'unverified' verdicts
metadata:
  skill-author: AlterLab
  version: "1.0.0"
  last_updated: "2026-06-06"
  depends_on: "alterlab-research-pipeline (shares the integrity taxonomy), alterlab-deep-research"
---
# 引文验证器——通过公共学术 API 验证参考文献是否存在

核心的存在性验证技能：给定任何常见格式的参考文献列表，通过查询四个无需密钥的公共学术 API，逐条证明每篇参考文献是否**真实存在**，然后将每项结果映射到规范的 AlterLab 引文幻觉分类体系。它是由 LLM 驱动的 `integrity_verification_agent` 的确定性、基于网络数据的配套工具——该智能体使用 WebSearch + 判断，而此技能使用权威 API 记录和可复现的 Python 脚本，因此相同的输入始终会产生相同的判定结果。

## 快速开始

```
Verify the citations in references.bib
Check whether these DOIs resolve to the papers I cited
Audit my bibliography for fabricated / hallucinated references
Does this reference list contain any fake citations or retractions?
```

→ 对参考文献列表运行 `scripts/verify_citations.py`，读取 JSON，然后按严重程度分组展示判定结果表。如果网络不可用，务必明确说明离线/降级状态。

---

## 此技能的作用

对于每条参考文献记录，该脚本会：

1. **解析**输入（自动检测 BibTeX / DOI 列表 / 自由格式），提取标题、作者、年份、出版物、DOI 和 arXiv ID。
2. **解析标识符**——如果存在所引用的 DOI/arXiv ID，则直接查询。
3. **按标题搜索**，作为后备方案在全部四个来源中进行查询。
4. **模糊匹配**所引用的标题（difflib `SequenceMatcher` 相似度，默认阈值为 **0.70**），并计算作者姓氏的重合度。
5. **标记撤稿**，包括 Crossref 中标记的撤稿（`update-to: retraction`）或 OpenAlex 中标记的撤稿（`is_retracted`）。
6. 为每条记录**输出判定结果**并映射到下方的分类体系，同时提供仓库级别的 `summary.verdict`（PASS / PASS_WITH_CONDITIONS / FAIL / UNVERIFIED）。

### 四个数据源（均无需密钥，使用礼貌请求池）

| 数据源 | 端点 | 用途 |
|--------|----------|----------|
| Crossref | `api.crossref.org/works` | DOI 解析、元数据、**撤稿标记** |
| OpenAlex | `api.openalex.org/works` | DOI + 标题搜索、**`is_retracted`** |
| Semantic Scholar | `api.semanticscholar.org/graph/v1` | DOI/arXiv 解析、标题搜索 |
| arXiv | `export.arxiv.org/api/query` | arXiv ID 解析、预印本标题搜索 |

所有请求都携带 `mailto` 参数（默认为 `alterlab.ieu@gmail.com`），以便使用各 API 的礼貌请求池。**无需使用任何 API 密钥，也不会使用任何 API 密钥。**

## 何时使用（以及何时不应使用）

| 使用此技能 | 使用其他工具 |
|----------------|--------------------|
| “验证 / 检查 / 审核我的引文或参考文献是否存在” | 撰写论文 → `alterlab-paper-writer` |
| “AI 是否幻觉生成了其中任何参考文献？” | 流水线中的完整完整性关卡 → `alterlab-research-pipeline` Stage 2.5/4.5 |
| “这些 DOI 是否解析到我引用的论文？” | 评估来源质量 / 掠夺性期刊 → `alterlab-deep-research` `source_verification_agent` |
| “检查此参考文献列表中是否存在撤稿文献” | 某项主张是否得到其来源的*支持*（SH）→ `claim_verification_protocol`（Phase E） |
| 可复现、可编写脚本、支持离线的存在性检查 | Markdown 失效链接审核 → `alterlab-link-health` |

此技能回答 **“被引用的作品是否存在，其标识符是否指向该作品？”**
它**不会**读取被引用论文的全文，因此无法自行确认语义幻觉（Semantic Hallucination，即来源是否支持相关主张）——
这需要使用 `claim_verification_protocol`。SH 仅作为提示性
标记呈现，绝不会仅根据 API 元数据作出断言。

---

## 判定分类体系（与规范的五类型分类体系一致）

代码和定义与
`alterlab-research-pipeline/agents/integrity_verification_agent.md`
完全相同（GPTZero × NeurIPS 2025；Ansari，2026）。严重程度采用完整性报告模式中使用的同一套
SERIOUS / MEDIUM / MINOR 等级。

| 代码 | 名称 | 严重程度 | 脚本触发条件 |
|------|------|----------|----------------|
| `verified` | —（存在且匹配） | NONE | 标题相似度 >= 阈值，并且作者重合度符合要求，并且在 >=1 个权威来源中年份一致 |
| `TF` | 完全捏造 | **SERIOUS** | 在所有来源中均未找到；或者引用的 DOI/arXiv ID 在任何地方都无法解析，且不存在标题高度相似的匹配项 |
| `PAC` | 部分属性讹误 | MEDIUM | 找到条目，但 >=1 个元数据字段不一致（年份不匹配、作者重合度 < 50%，或标题相似度 < 阈值） |
| `IH` | 标识符劫持 | **SERIOUS** | 引用的 DOI/arXiv ID **已解析**（method=id），但解析所得记录的标题与之无关（相似度 < 阈值） |
| `PH` | 占位符幻觉 | **SERIOUS** | 未解析的模板/占位符（`[CITATION NEEDED]`、`\cite{}`、`et al., YYYY`、`TODO`、`forthcoming`）——在联网前捕获 |
| `SH` | 语义幻觉 | **SERIOUS** | 条目可解析，但并不支持其主张——**仅作提示**；需要进入阶段 E 才能断定 |
| `unverified` | —（无法检查） | MEDIUM | 处于离线状态，或此条目的所有 API 均调用失败。**绝不视为通过。** |

每当 Crossref 或 OpenAlex 将匹配的作品标记为已撤稿时，都会附加 `RETRACTED`
标记（并将严重程度提升至 SERIOUS），无论其存在性
判定结果如何。

### 仓库级判定

- **PASS** — 每个条目均为 `verified`，且没有 SERIOUS/MEDIUM 标记。
- **PASS_WITH_CONDITIONS** — 仅存在 `PAC` / MEDIUM 问题（元数据错误，可修复）。
- **FAIL** — 存在任何 SERIOUS 判定（`TF` / `IH` / `PH` / 撤稿）。
- **UNVERIFIED** — 存在 `unverified` 条目，且未发现明确的捏造
  （例如完全离线运行）。这**不代表**通过——请在具有网络访问权限的情况下重新运行。

---

## 流程（如何运行）

### 1. 定位或获取参考文献列表

接受以下任意形式：`.bib` 文件、包含 DOI/arXiv ID 列表的 `.txt` 文件、粘贴的
参考文献列表或内联文本。脚本会自动检测格式；如果检测错误，可使用
`--format bibtex|doi|freeform` 覆盖检测结果。

### 2. 运行验证器

```bash
uv run python skills/core/alterlab-citation-verifier/scripts/verify_citations.py \
    path/to/references.bib \
    --mailto alterlab.ieu@gmail.com \
    --threshold 0.70 \
    --out citation_report.json
```

- `path/to/references.bib` 也可以是 `-`（stdin）或内联文本。
- `--threshold` 用于调整模糊标题匹配的相似度（0..1；默认为 0.70）。
- `--offline` 会跳过网络访问，并有意生成 `unverified` 判定。
- 省略 `--out` 可将 JSON 报告输出到 stdout。

该脚本会自动选择 HTTP 后端：如果已安装 `requests`，则使用它；否则回退到 Python 标准库（`urllib`）——因此它可以在纯净的 `uv` 环境中运行，且**无需任何额外依赖**。

### 3. 读取 JSON 并报告结果

解析 `summary.verdict` 和每个条目的 `verdict` 代码。呈现：

1. **总体判定**及计数（`verdict_counts`、`severity_counts`）。
2. 包含每个非 `verified` 条目的**表格**，列出其代码、严重程度和 `detail`。
3. 对于每个 `TF` / `IH` / `PH`：引用对应条目并解释证据（例如，“DOI 10.x 解析到了另一篇不相关的论文，标题为‘……’”）。
4. 突出显示所有 `RETRACTED` 标记。
5. 如果 `verdict == UNVERIFIED`：明确说明没有任何内容得到确认，并转达每个条目的 `manual_instructions`。

### 4. 处理修复

- `TF` / `PH` → 必须移除或替换该参考文献；它并不存在。
- `IH` → DOI/arXiv ID 错误；查找并替换为正确的标识符。
- `PAC` → 更正 `detail` 中指出的具体元数据字段。
- `RETRACTED` → 向作者标明；引用撤稿通知或弃用该来源。

---

## 优雅降级（无网络）

网络故障**绝不能**被静默忽略并视为通过：

- DNS/连接故障会引发 `NetworkUnavailable`；该条目会变为 `unverified`，并填充 `manual_instructions` 字段。
- `--offline` 会预先将每个需要联网的条目强制设为 `unverified`（占位符仍会在本地被识别为 `PH`）。
- 只要存在未验证条目且没有任何确切的伪造发现，仓库级判定就会变为 `UNVERIFIED`（不同于 `PASS`）。

发生降级时，指导用户在网络连接可用时重新运行，并回退到由 LLM 驱动的 `integrity_verification_agent`（WebSearch）进行人工检查。

---

## 输出结构（节选）

```json
{
  "tool": "alterlab-citation-verifier/verify_citations.py",
  "version": "1.0.0",
  "summary": {
    "total": 2,
    "verdict": "FAIL",
    "verdict_counts": {"verified": 1, "TF": 1, "PAC": 0, "IH": 0, "PH": 0, "SH": 0, "unverified": 0},
    "severity_counts": {"SERIOUS": 1, "MEDIUM": 0, "MINOR": 0},
    "citation_integrity_score": 0.5,
    "fabrication_risk_score": 0.5,
    "retracted": 0
  },
  "entries": [
    {"ref_id": "walters2023", "verdict": "verified", "severity": "NONE",
     "title_ratio": 1.0, "author_overlap": 1.0, "matches": [{"source": "crossref"}]},
    {"ref_id": "ghostpaper2021", "verdict": "TF", "severity": "SERIOUS",
     "detail": "Cited DOI/arXiv identifier did not resolve in any source..."}
  ]
}
```

`citation_integrity_score` 和 `fabrication_risk_score`（均为 0..1）与完整性报告架构中的同名字段保持一致，因此该报告可以直接输入 `alterlab-research-pipeline` 的完整性门禁。

---

## 报告前自检

- 本次运行是否成功访问网络？如果 `config.http_backend` 已运行，但每个条目都是 `unverified`，则说明网络不可用——应明确说明这一点；不要暗示检查已通过。
- 是否存在任何 `RETRACTED` 标记？即使出现在其他方面均为 `verified` 的条目上，也要突出显示。
- 是否有任何条目被判定为 `IH`？确认 `detail` 显示的是**标识符已解析**但内容不匹配，而不是宽松标题搜索造成的巧合（脚本会强制区分这两种情况）。
- 总体判定是否与各条目代码一致（存在任何 SERIOUS → FAIL）？

---

## 参考文献

- `alterlab-research-pipeline/agents/integrity_verification_agent.md` — 规范来源，包含
  本技能旨在识别的五类型分类法、复合欺骗模式，以及 Lin 等人（2020）
  的拼接案例研究。
- `alterlab-research-pipeline/references/claim_verification_protocol.md` — 阶段 E
  声明与来源核验（本技能将其交由 SH 检查处理）。
- `shared/schemas/integrity_report.schema.json` — 完整性报告的结构，本技能沿用其中的
  `citation_integrity_score` / `fabrication_risk_score`。
- Walters, W. H., & Wilder, E. I. (2023). ChatGPT 生成的
  参考文献引文中的捏造与错误。*Scientific Reports, 13*, 14045。
  https://doi.org/10.1038/s41598-023-41032-5
- Ansari, S. (2026). 精英同行评审中的复合欺骗。*arXiv:2602.05930*。