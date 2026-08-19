---
name: surge-landing
description: |
  Use when asked to design growth-optimized landing pages, activation funnel
  layouts, or experiment-friendly page structures. Examples: "growth-optimized
  landing", "activation funnel layout", "A/B testable page"
allowed-tools: Read, Bash, Glob, Grep
version: 0.6.6
author: tonone-ai <hello@tonone.ai>
license: MIT
---
# surge-landing — 增长优化型落地页

遵循 `docs/output-kit.md` 中定义的输出格式 — CLI 最多 40 行、框线骨架、统一严重性指示器、压缩 prose。

## 使用时机

用户需要为增长而设计的落地页：激活漏斗、A/B 测试、获客或 PLG 流程。

## 工作流

1. **从用户请求中识别产品类型和增长目标**（获客、激活、PLG、试用、免费增值等）
2. **搜索落地页模式：**
   ```bash
   python3 -m surge_agent.uiux search --domain landing --query "{product_type}" --limit 3
   ```
3. **搜索产品推理：**
   ```bash
   python3 -m surge_agent.uiux search --domain product --query "{product_type}" --limit 3
   ```
4. **搜索可能造成摩擦的 UX 环节：**
   ```bash
   python3 -m surge_agent.uiux search --domain ux --query "forms validation loading" --limit 3
   ```
5. **输出便于实验的结构**，包含激活触发点和摩擦审计

## 输出格式

```
┌─ 增长落地页 — {product_type} ───────────────────────────────────────┐
│ #  │ Section            │ Purpose                    │ Experiment?   │
├────┼────────────────────┼────────────────────────────┼───────────────┤
│  1 │ {section_name}     │ {purpose}                  │ A/B headline  │
│  2 │ {section_name}     │ {purpose}                  │ —             │
│  3 │ {section_name}     │ {purpose}                  │ A/B CTA copy  │
│  … │ …                  │ …                          │ …             │
└────┴────────────────────┴────────────────────────────┴───────────────┘

激活触发点：          {activation_triggers}
漏斗结构：            {funnel_structure}
摩擦点：              {friction_points}
实验触点：            {experiment_surfaces}
```

## 反模式

- 绝不要为了虚荣指标（页面浏览量、页面停留时间）而牺牲激活指标
- 在展示产品价值之前，绝不要增加摩擦（注册门槛、冗长表单）
- 绝不要设计无法独立进行 A/B 测试的页面区块
- 没有至少识别一个实验触点时，绝不要发布增长页面

## 交付

如果输出超过 CLI 的 40 行限制，请调用 `/atlas-report` 并附上完整发现。HTML 报告就是输出结果。CLI 只是回执 — 包含框线标题、单行结论、排名前 3 的发现以及报告路径。绝不要将分析内容全部倾倒到 CLI。