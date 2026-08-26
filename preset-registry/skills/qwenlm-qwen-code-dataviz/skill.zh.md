---
name: dataviz
description: Design guidance for charts, graphs, dashboards, maps, and data visualizations, including a local palette validator.
when_to_use: When creating or revising charts, graphs, dashboards, maps, plots, inline SVG, D3, Plotly, Recharts, matplotlib, or any Artifact page that visualizes data.
allowedTools:
  - read_file
---
# 数据可视化

在制作图表、仪表板、地图或数据可视化之前使用此技能。

## 工作流程

1. 确定分析任务：比较、趋势、分布、关系、排名、部分与整体、地理信息或状态监控。
2. 选择能够回答该任务的最简单图表形式。当图表形式不明显时，阅读
   `references/choosing-a-form.md`。
3. 将发现写入标题、副标题、坐标轴标签或直接标注中。查看者应当能够了解发生了什么变化、什么较高或较低，或该图表支持什么决策。
4. 从 `references/palette.md` 中选择颜色，或使用下面的脚本验证自定义调色板。
5. 在最终确定设计之前检查 `references/anti-patterns.md`。

## 调色板验证

相对于上述技能正文中所示的技能基础目录解析路径。
不要假设 `$QWEN_SKILL_ROOT` 已为常规 shell 命令设置。

运行：

```bash
node <skill-base-directory>/scripts/validate_palette.js '#1d4ed8,#b45309,#166534' --mode light
```

将 `FAIL` 视为必须更换调色板。只有当图表同时使用标签、形状、纹理、排序或其他次级编码时，才可接受 `WARN`。

## 图形标记规则

- 对无序分组使用分类调色板；仅对有序值使用连续色阶或发散色阶。
- 当图表中的系列数量较少时，优先使用直接标签而不是图例。
- 网格线应保持低调，且数量少于数据标记。
- 除非两个系列共享经过明确解释的变换，否则避免使用双坐标轴。
- 不要仅依赖颜色来表达关键区别。
- 保持仪表板便于快速浏览：对齐卡片，使用一致的数字格式，并将高饱和度颜色保留给重要的状态变化。