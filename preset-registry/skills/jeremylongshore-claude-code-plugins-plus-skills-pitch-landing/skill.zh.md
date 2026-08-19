---
name: pitch-landing
description: |
  Use when asked to structure a landing page for positioning, plan a
  conversion-optimized page layout, or design a launch page. Examples: "landing
  page for product launch", "conversion-optimized layout for SaaS"
allowed-tools: Read, Bash, Glob, Grep
version: 0.6.6
author: tonone-ai <hello@tonone.ai>
license: MIT
---
# pitch-landing — 发布与定位落地页

遵循 docs/output-kit.md 中定义的输出格式 — CLI 最多 40 行、框线骨架、统一严重性指示符、压缩措辞。

## 使用场景

用户需要一个围绕产品定位、发布信息或面向特定受众的转化目标构建的落地页。

## 工作流

1. **从用户请求或 brief 中识别产品类型和定位锚点**
2. **搜索落地页模式：**
   ```bash
   python3 -m pitch_agent.uiux search --domain landing --query "{product_type}" --limit 3
   ```
3. **搜索产品推理，获取受众与信息传达背景：**
   ```bash
   python3 -m pitch_agent.uiux search --domain product --query "{product_type}" --limit 3
   ```
4. **融入定位：** CTA 策略、社会证明放置位置、异议处理
5. **按兼顾转化与信息传达优化的顺序输出各部分**

## 输出格式

```
┌─ Launch Landing Page — {product_type} ──────────────────────────────┐
│ #  │ Section            │ Purpose                    │ CTA?          │
├────┼────────────────────┼────────────────────────────┼───────────────┤
│  1 │ {section_name}     │ {purpose}                  │ Primary CTA   │
│  2 │ {section_name}     │ {purpose}                  │ —             │
│  3 │ {section_name}     │ {purpose}                  │ Secondary CTA │
│  … │ …                  │ …                          │ …             │
└────┴────────────────────┴────────────────────────────┴───────────────┘

CTA strategy:          {cta_strategy}
Social proof:          {social_proof_placement}
Objection handling:    {objection_section}
Positioning anchor:    {positioning_anchor}
```

## 反模式

- 绝不要在缺少明确定位锚点（面向谁 + 与众不同之处）的情况下组织文案
- 绝不要添加不服务于转化或异议处理的部分
- 绝不要将社会证明放在主要 CTA 之后 — 它应当在发出行动请求之前起到强化作用
- 绝不要在每个视口中没有单一、明确的主要 CTA 的情况下发布

## 交付

如果输出超过 40 行 CLI 预算，则调用 `/atlas-report` 并附上完整结果。HTML 报告即为输出。CLI 只是回执 — 包含框线标题、单行结论、排名前 3 的发现以及报告路径。绝不要将分析内容倾倒到 CLI 中。