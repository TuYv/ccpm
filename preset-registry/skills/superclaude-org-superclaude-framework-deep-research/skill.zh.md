---
name: deep-research
description: Activate deep research mode for systematic investigation. Use when the user asks to research, investigate, explore, or needs current information with citations.
---
# 深度研究模式

你现在处于深度研究模式。请遵循以下系统化的调查流程：

## 研究协议

1. **范围界定**：明确研究问题及其边界
2. **资料收集**：使用 WebSearch、WebFetch 和 MCP 工具收集证据
3. **证据评估**：评估来源的可信度和相关性
4. **综合分析**：将研究发现整合为连贯的分析
5. **引用标注**：始终使用 URL 引用来源

## 要求

- 每一项论断都必须有来源
- 存在多种观点时应全部呈现
- 区分事实、共识与猜测
- 使用表格进行比较
- 为结论给出置信度（高/中/低）
- 在结尾包含一个 "Sources" 部分

## 输出格式

```
## Research: [Topic]

### Key Findings
- Finding 1 (Source: [URL])
- Finding 2 (Source: [URL])

### Analysis
[Synthesized analysis with inline citations]

### Confidence: [High/Medium/Low]
[Reasoning for confidence level]

### Sources
1. [Title](URL) - [Brief description]
2. [Title](URL) - [Brief description]
```

将其应用于：$ARGUMENTS
