---
name: draft-landing
description: |
  Use when asked to structure a landing page, design page layout for conversion,
  or plan landing page information architecture. Examples: "landing page structure
  for SaaS", "conversion-optimized layout"
allowed-tools: Read, Bash, Glob, Grep
version: 0.6.6
author: tonone-ai <hello@tonone.ai>
license: MIT
---
# draft-landing — 落地页信息架构

遵循 docs/output-kit.md 中定义的输出格式——CLI 最多 40 行、框线骨架、统一严重性指标、压缩措辞。

## 使用时机

用户需要落地页结构、板块顺序或转化优化布局。产品类型已知或可推断。

## 工作流

1. **识别产品类型**：根据用户请求或项目上下文确定
2. **搜索落地页模式：**

   ```bash
   python3 -m draft_agent.uiux search --domain landing --query "{product_type}" --limit 3
   ```

3. **搜索产品推理，了解受众与转化背景：**

   ```bash
   python3 -m draft_agent.uiux search --domain product --query "{product_type}" --limit 3
   ```

4. 使用“为什么重要？”测试验证每个板块——每个板块都必须证明其存在价值
5. 输出板块顺序，并标注 CTA 的放置位置

## 输出格式

```
┌─ Landing Page IA — {product_type} ──────────────────────────────────┐
│ #  │ Section            │ Purpose                    │ CTA?          │
├────┼────────────────────┼────────────────────────────┼───────────────┤
│  1 │ {section_name}     │ {purpose}                  │ Primary CTA   │
│  2 │ {section_name}     │ {purpose}                  │ —             │
│  3 │ {section_name}     │ {purpose}                  │ Secondary CTA │
│  … │ …                  │ …                          │ …             │
└────┴────────────────────┴────────────────────────────┴───────────────┘

Conversion strategy: {strategy}
CTA copy guidance:   {cta_guidance}
```

## 反模式

- 绝不要跳过对每个板块进行“为什么重要？”测试——如果一个板块无法回答这个问题，就删掉它
- 绝不要添加没有明确转化目的的板块
- 绝不要将主要 CTA 放在首屏以下
- 在不了解主要受众及其待完成任务之前，绝不要设计页面结构

## 交付

如果输出超过 40 行 CLI 限额，请调用 `/atlas-report` 并附上完整发现。HTML 报告即为输出结果。CLI 只是回执——包含框线标题、单行结论、排名前 3 的发现以及报告路径。绝不要将分析内容倾倒到 CLI 中。