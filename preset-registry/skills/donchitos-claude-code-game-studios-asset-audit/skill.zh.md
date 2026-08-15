---
name: asset-audit
description: "Audits game assets for compliance with naming conventions, file size budgets, format standards, and pipeline requirements. Identifies orphaned assets, missing references, and standard violations."
argument-hint: "[category|all]"
user-invocable: true
allowed-tools: Read, Glob, Grep
model: sonnet
# Read-only diagnostic skill — no specialist agent delegation needed
---
## 阶段 1：阅读标准

阅读相关设计文档中的美术规范或资源标准，以及 CLAUDE.md 中的命名约定。

---

## 阶段 2：扫描资源目录

使用 Glob 扫描目标资源目录：

- `assets/art/**/*`：美术资源
- `assets/audio/**/*`：音频资源
- `assets/vfx/**/*`：VFX 资源
- `assets/shaders/**/*`：着色器
- `assets/data/**/*`：数据文件

---

## 阶段 3：执行合规性检查

**命名约定：**
- 美术：`[category]_[name]_[variant]_[size].[ext]`
- 音频：`[category]_[context]_[name]_[variant].[ext]`
- 所有文件名必须使用小写字母和下划线

**文件标准：**
- 纹理：尺寸必须为 2 的幂，格式正确（UI 使用 PNG，3D 使用压缩格式），且不得超出大小预算
- 音频：采样率和格式正确（音效使用 OGG，音乐使用 OGG/MP3），且不得超出时长限制
- 数据：JSON/YAML 有效且符合模式要求

**孤立资源：** 在代码中搜索对每个资源文件的引用。标记所有未被引用的资源。

**缺失资源：** 在代码中搜索资源引用，并验证对应文件是否存在。

---

## 阶段 4：输出审计报告

```markdown
# Asset Audit Report -- [Category] -- [Date]

## Summary
- **Total assets scanned**: [N]
- **Naming violations**: [N]
- **Size violations**: [N]
- **Format violations**: [N]
- **Orphaned assets**: [N]
- **Missing assets**: [N]
- **Overall health**: [CLEAN / MINOR ISSUES / NEEDS ATTENTION]

## Naming Violations
| File | Expected Pattern | Issue |
|------|-----------------|-------|

## Size Violations
| File | Budget | Actual | Overage |
|------|--------|--------|---------|

## Format Violations
| File | Expected Format | Actual Format |
|------|----------------|---------------|

## Orphaned Assets (no code references found)
| File | Last Modified | Size | Recommendation |
|------|-------------|------|---------------|

## Missing Assets (referenced but not found)
| Reference Location | Expected Path |
|-------------------|---------------|

## Recommendations
[Prioritized list of fixes]

## Verdict: [COMPLIANT / WARNINGS / NON-COMPLIANT]
```

此技能为只读技能——它只生成报告，不会写入文件。

---

## 阶段 5：后续步骤

- 使用 CLAUDE.md 中定义的模式修复命名违规问题。
- 经人工审核后，删除确认无用的孤立资源。
- 运行 `/content-audit`，将资源数量与 GDD 中规定的要求进行交叉核对。