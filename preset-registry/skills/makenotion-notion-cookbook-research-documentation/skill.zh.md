---
name: notion-research-documentation
description: Searches across your Notion workspace, synthesizes findings from multiple pages, and creates comprehensive research documentation saved as new Notion pages. Turns scattered information into structured reports with proper citations and actionable insights.
---
# 研究与文档编写

支持全面的研究工作流：在 Notion 工作区中搜索信息、获取并分析相关页面、综合研究结果，以及创建结构清晰的文档。

## 快速开始

当被要求研究某个主题并编写文档时：

1. **搜索相关内容**：使用 `Notion:notion-search` 查找页面
2. **获取详细信息**：使用 `Notion:notion-fetch` 读取完整页面内容
3. **综合研究结果**：分析并整合多个来源的信息
4. **创建结构化输出**：使用 `Notion:notion-create-pages` 编写文档

## 研究工作流

### 第 1 步：搜索相关信息

```
Use Notion:notion-search with the research topic
Filter by teamspace if scope is known
Review search results to identify most relevant pages
```

### 第 2 步：获取页面内容

```
Use Notion:notion-fetch for each relevant page URL
Collect content from all relevant sources
Note key findings, quotes, and data points
```

### 第 3 步：综合研究结果

分析收集到的信息：

- 识别关键主题和模式
- 关联不同来源中的相关概念
- 记录信息缺口或相互冲突的信息
- 有条理地组织研究结果

### 第 4 步：创建结构化文档

使用合适的文档模板（参见[参考/格式选择指南](reference/format-selection-guide.md)）组织输出：

- 清晰的标题和执行摘要
- 使用标题妥善组织各个章节
- 包含返回来源页面链接的引用
- 可操作的结论或后续步骤

## 输出格式

根据请求选择合适的格式：

**研究摘要**：参见[参考/研究摘要格式](reference/research-summary-format.md)
**综合报告**：参见[参考/综合报告格式](reference/comprehensive-report-format.md)
**简要概述**：参见[参考/简要概述格式](reference/quick-brief-format.md)

## 最佳实践

1. **先广泛搜索**：从宽泛的搜索开始，然后逐步缩小范围
2. **引用来源**：始终使用提及链接回来源页面
3. **确认时效性**：检查页面的最后编辑日期，确保信息是最新的
4. **交叉验证**：通过多个来源验证研究结果
5. **结构清晰**：使用标题、项目符号和格式设置来提高可读性

## 页面位置

默认情况下，将研究文档创建为独立页面。如果用户指定：

- 父页面 → 使用 `page_id` 作为父级
- 数据库 → 先获取数据库，然后使用相应的 `data_source_id`
- 团队空间 → 在该上下文中创建

## 高级功能

**搜索筛选**：参见[参考/高级搜索](reference/advanced-search.md)
**引用样式**：参见[参考/引用](reference/citations.md)

## 常见问题

**“未找到结果”**：尝试使用更宽泛的搜索词或搜索其他团队空间
**“结果过多”**：添加筛选条件或在特定页面内搜索
**“无法访问页面”**：用户可能没有相应权限，请其确认访问权限

## 示例

有关完整的工作流演示，请参阅 [examples/](examples/)：

- [examples/market-research.md](examples/market-research.md) - 研究市场趋势
- [examples/technical-investigation.md](examples/technical-investigation.md) - 技术深度调查
- [examples/competitor-analysis.md](examples/competitor-analysis.md) - 多来源综合分析