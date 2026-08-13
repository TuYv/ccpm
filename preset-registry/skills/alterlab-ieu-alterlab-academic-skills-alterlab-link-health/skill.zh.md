---
name: alterlab-link-health
description: "Audits and repairs Markdown link health across a skills repo via a four-tier pipeline (config hardening, intra-repo file-ref fixes, external URL substitutions, residual exclusions) and enforces a Tier 3 substitution guardrail that prevents regressions of previously-passing links; designed for lychee-based GitHub Actions link checkers but generalizes to markdown-link-check and similar tools. Use when the request mentions link audit, dead links, link health, lychee, broken links, link checker, markdown link audit, link-health audit, 404 audit, check-links failing, CI link-check, or 連結健檢, 死鏈, 失效連結, 斷鏈檢查. Part of the AlterLab Academic Skills suite."
license: MIT
allowed-tools: Read Write Edit Bash WebFetch WebSearch
compatibility: Targets lychee-based GitHub Actions link checkers (generalizes to markdown-link-check); no external API key or account required
metadata:
  skill-author: AlterLab
  version: "1.0"
  last_updated: "2026-04-21"
  source_audit: "AlterLab-IEU/AlterLab-Academic-Skills PR #1 (merged 2026-04-21 as 93a72fe)"
---
# 链接健康度 — 全仓库 Markdown 链接审计方法论

一套可复用的方法论，用于修复文档密集型仓库中的损坏链接，使链接检查器恢复通过。该方法论总结自一次真实审计：通过 8 个提交，将 `AlterLab-IEU/AlterLab-Academic-Skills` 从 **1966 个链接中有 1208 个错误** 降至 **1912 个链接中有 0 个错误**，期间还自动检测到一次 Tier 3 回归，验证了防护规则的有效性。

## 快速开始

**完整审计（全新仓库，链接检查器未通过）：**

```
Audit and repair the link health of <owner/repo>. Run the full four-tier pipeline.
```
→ 按照 `playbooks/full-audit.md` 派出 10 个智能体执行审计，然后进入分层 APPLY 阶段。

**定向残留处理（首次派遣已减少错误，但仍有部分残留）：**

```
The link checker is down from 1208 to 67 errors. Close the residuals.
```
→ 按照 `playbooks/followup-pass.md` 派出 3 个智能体执行后续处理。

**合并后清理（PR 已通过，需要完成需人工决策的事项）：**

```
Finalize the post-merge cleanup: resolve pending human-decision items, file follow-up issues, document link debt.
```
→ 按照 `playbooks/post-merge.md` 派出 4 个智能体执行合并后处理。

---

## 触发条件

### 触发关键词

**英语**：link audit, dead links, link health, lychee, broken links, link checker, markdown link audit, link-health audit, 404 audit, check-links failing, CI link-check

**繁體中文**：連結健檢, 死鏈, 失效連結, 斷鏈檢查, 連結審計

### 此 Skill 的适用情形

- 每周运行的 `Check Links`（或类似的 lychee / markdown-link-check）工作流一直失败。
- 用户提到错误数量很大（数百个以上），并怀疑其中大部分是由配置导致的误报。
- 用户希望重构大量 Skill / 文档中损坏的仓库内文件引用。
- 用户希望建立一套可复用的流程，用于持续维护链接债务。

### 非触发场景

| 场景 | 应改用的 Skill / 工具 |
|----------|-----------------------------|
| 修复单个文件中的一个损坏链接 | 直接编辑——无需使用流水线 |
| 向 Skill 文档添加新 URL | `alterlab-scientific-writing` 或相关领域的 Skill |
| 验证参考文献是否确实存在（DOI/作者解析、伪造/幻觉引用） | `alterlab-citation-verifier`——它会与 Crossref/OpenAlex/Semantic Scholar/arXiv 进行交叉核验。链接健康度仅修复文档中的损坏超链接；绝不会验证被引用的作品是否存在。 |
| 审计链接以外的仓库结构（模式、元数据） | 单独执行 `schema-drift` 审计（不在本方法论范围内） |

---

## 流水线概览（4 个层级）

每个层级对应一个可独立审查的提交。请按顺序运行——每一层都会净化错误信号，从而为下一层创造条件。

| 层级 | 范围 | 典型变化 |
|------|-------|---------------|
| **1 — 配置** | 引入 `.lychee.toml`，其中包含增量式接受集合；添加 `.lycheeignore` 以处理永久性噪声主机；并强化 CI 工作流。 | 通常能带来最大幅度的单次改善——错误数往往减少 70% 至 90%。修复“`--accept 403` 会替换默认集合”这一陷阱。 |
| **2 — 仓库内引用** | 修复 `[ERROR] file://` 条目：目录单复数拼写错误、缺失的路径前缀、YAML frontmatter 错误。将教学用占位符路径包装为行内代码。 | 消除大部分真实损坏——通常可将 200 至 400 个条目降至零。 |
| **3 — URL 替换** | 将 MOVED 外部 URL 替换为经验证仍可访问的替代链接；将 DEAD_INFRA URL 替换为替代资源。**未经验证，绝不替换。** | 将残留错误减少到几十个以内。 |
| **4 — 排除项** | 处理所有无法修复的剩余项：排斥机器人的主机、教学用占位符、已过期的上游基础设施、长期不稳定的学术网站。 | 将错误数降至 0，或稳定在个位数。 |

有关每一层级的决策规则，请参阅 `references/tier1-config.md` 至 `references/tier4-exclusions.md`。

---

## Tier 3 防护规则

每次完成 URL 替换后，**重新运行链接检查器，并与基线成功集合进行差异比较**。任何在基线中返回 200 OK、但替换后返回非 200 状态的 URL 都属于回归，提交前必须将其还原。

**自检：**

```bash
diff <(grep "^\[200\]" baseline.log | sort -u) \
     <(grep "^\[200\]" post.log | sort -u)
```

输出不应显示任何删除项，只能有新增项。出现删除项意味着某项替换导致原本正常工作的 URL 发生了回归。

之所以制定这条规则，是因为在源审计期间，宽泛的 `sed` 前缀替换会悄无声息地拼接到更具体的路径上（例如，将 `/v3/` → `/v3/docs` 会把原本正确的 `/v3/docs` 变成 `/v3/docsdocs`）。防护规则在第二次触发 CI 时发现了这一问题，而不是在提交本身发现。**假定你的 Tier 3 处理会产生回归。务必验证。**

完整详情：`references/tier3-substitution.md`。

---

## 验证优先规则

**默认在替换任何 URL 之前先进行探测验证。** 未经验证的替换正是虚假 URL 混入公开技能的原因。每次执行 `[old] → [new]` 替换之前：

1. 对于 GitHub 仓库：`gh api repos/owner/name` — 状态必须为 200（仓库存在且未归档）。
2. 对于 HTTP URL：`curl -sSI -L --max-time 15 '<new>'` — 最终状态必须为 200（经过重定向后）。
3. 对于 PyPI / npm / crates 包：直接检查注册表 API 或落地页。

如果验证失败，**通过 `.lycheeignore` 排除失效目标**并附上注释说明原因，而不是猜测替代项。排除一个失效链接是诚实的；替换成错误链接则是一颗定时炸弹。

完整详情：`references/tier3-substitution.md` § “验证规则”。

---

## 操作手册

三个可直接分派的提示词包，它们会按正确顺序调用此技能的各个层级。

| 操作手册 | 使用时机 | 智能体 |
|----------|-------------|--------|
| `playbooks/full-audit.md` | 全新审计、CI 失败且此前未开展相关工作。 | 10 个并行子智能体 + 综合汇总 |
| `playbooks/followup-pass.md` | 错误已显著减少，但仍有残留。 | 3 个针对性子智能体 |
| `playbooks/post-merge.md` | PR 已通过，现在需要解决待人工决策的项目。 | 4 个并行子智能体 |

三者都遵循相同的流程：**预检 → 并行分派 → 综合汇总 → 提交/PR/合并 → 验证**。

---

## 参考资料

| 文件 | 内容 |
|------|---------|
| `references/tier1-config.md` | `.lychee.toml` schema、工作流 YAML、accept-code 陷阱 |
| `references/tier2-intra-repo.md` | 仓库内路径审计、目录单复数模式、frontmatter 修复 |
| `references/tier3-substitution.md` | URL 替换规则、防护规则、sed 安全模式 |
| `references/tier4-exclusions.md` | 何时排除、何时替换，以及 `.lycheeignore` 分类准则 |
| `references/known-debt-template.md` | 面向维护者的 5 类 `KNOWN_LINK_DEBT.md` 布局 |

---

## 示例

- `examples/pr-1-retrospective.md` — 生成此技能的源审计。错误数从 1208 → 0，共 8 次提交，在第 5 次提交（`9cbd801`）中自动检测到 Tier 3 回归，最终以 `93a72fe` 合并。

---

## 范围约束

此技能用于修复*链接健康状况*。它不会：

- 统一整个仓库中的 SKILL.md 模式。文件模式不一致应作为单独的问题处理。
- 重构技能内容、示例或正文。仅修改链接 URL 和 CI 配置。
- 修改 `.lychee.toml` 的接受列表来掩盖实际的链接失效。对于不稳定的上游 5xx 错误或超时，应按主机排除并说明理由，而不是一概接受。

范围约束可确保 PR 易于审查，并保证链接检查信号真实可信。