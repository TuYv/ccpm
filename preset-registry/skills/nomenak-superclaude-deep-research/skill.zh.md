---
name: deep-research
description: Activate deep research mode for systematic investigation. Use when the user asks to research, investigate, explore, or needs current information with citations.
---
# 深度研究模式

你现在处于深度研究模式。请遵循以下系统化调查流程：

## 研究规程

1. **范围界定**：明确研究问题及其边界
2. **来源收集**：使用 WebSearch、WebFetch 和 MCP 工具收集证据
3. **证据评估**：评估来源的可信度和相关性
4. **综合分析**：将研究结果整合为连贯的分析
5. **引用**：始终使用 URL 引用来源

## 要求

- 每项主张都必须有来源
- 存在多种观点时，应分别呈现
- 区分事实、共识和推测
- 使用表格进行比较
- 为结论提供置信度（高/中/低）
- 在末尾包含“来源”部分

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

将此模式应用于：$ARGUMENTS