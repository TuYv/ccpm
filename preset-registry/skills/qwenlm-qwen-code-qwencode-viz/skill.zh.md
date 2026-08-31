---
name: qwencode-viz
description: >
  Generate renderable chart outputs for clients that support the Qwen Code Web
  Shell echarts-fulldata renderer. Use only when the current Web Shell host has
  explicitly registered that renderer and the user asks for a chart,
  visualization, ECharts output, or Web Shell-rendered chart block.
---
# Qwen Code 可视化 Skill

使用此 skill 输出图表块，以便 Qwen Code Web Shell 主机进行渲染。
此 skill 仅定义模型输出契约；不会加载或执行图表运行时。主机客户端必须已经注册
`echarts-fulldata` 围栏代码块渲染器。

## 前提条件

仅当以下所有条件均满足时，才使用此 skill：

- 当前主机是 Qwen Code Web Shell，或等效的 Web Shell 客户端。
- 主机已注册 `echarts-fulldata` 围栏代码块渲染器。
- 用户需要可视化图表，而不仅仅是普通 Markdown 表格或代码块。

如果不满足任何一个条件，则不要输出 `echarts-fulldata` 块。应改用普通
Markdown、表格或自然语言。

## 输出契约

输出一个围栏代码块，其语言标签必须恰好是 `echarts-fulldata`。

代码块正文必须是一个可直接通过 `JSON.parse` 解析的有效 JSON 对象。不要输出 JavaScript。

首选的内联载荷结构：

```echarts-fulldata
{
  "version": 1,
  "data": {
    "kind": "inline",
    "dimensions": ["day", "orders"],
    "source": [
      ["Mon", 120],
      ["Tue", 200],
      ["Wed", 150],
      ["Thu", 80],
      ["Fri", 240]
    ]
  },
  "option": {
    "title": { "text": "Weekly orders" },
    "tooltip": { "trigger": "axis" },
    "xAxis": { "type": "category" },
    "yAxis": { "type": "value" },
    "series": [{ "type": "bar", "encode": { "x": "day", "y": "orders" } }]
  }
}
```

当不需要封装结构时，也接受传统的、基于 dataset 的 ECharts 选项 JSON：

```echarts-fulldata
{
  "title": { "text": "Weekly orders" },
  "dataset": {
    "dimensions": ["day", "orders"],
    "source": [
      { "day": "Mon", "orders": 120 },
      { "day": "Tue", "orders": 200 }
    ]
  },
  "xAxis": { "type": "category" },
  "yAxis": { "type": "value" },
  "series": [{ "type": "bar", "encode": { "x": "day", "y": "orders" } }]
}
```

## 安全规则

- 仅输出 JSON 数据，不要输出 JavaScript。
- 不要输出 `const option = ...`、表达式、注释、尾随逗号、函数或回调。
- 不要要求主机使用 `eval`、`new Function` 或脚本注入。
- 不要引用 DOM、全局变量、网络请求、随机性、计时器、`document`、`window` 或文件系统。
- 将图表数据放入封装结构的 `data.source` 中，或者对于传统选项载荷，放入 `dataset.source` 中。
- 当使用 `dataset` 加 `encode` 即可表达数据时，避免在 `xAxis.data`、`legend.data` 或 `series.data` 中重复相同的数据。
- 如果数据过大，应先进行聚合或采样，并在代码块外说明该处理。

## 响应格式

适合使用图表时，按以下顺序进行响应：

1. 用一句简短的要点说明图表所展示的主要信息。
2. 输出一个包含完整 JSON 载荷的 `echarts-fulldata` 围栏代码块。
3. 可选地补充指标定义、聚合选择或阅读指导等说明。

不要将图表块嵌套在任何其他 Markdown 容器中。

## 图表指导

- 趋势：优先使用折线图，将时间放在 x 轴，将指标放在 y 轴。
- 排名：优先使用按指标降序排列的条形图。
- 构成：类别数量较少时使用饼图；类别较多时使用条形图。
- 多指标比较：优先使用分组条形图或多条折线，避免图表中包含过多数据系列而显得拥挤。
- 确保标题、坐标轴、单位和图例清晰明了。

## 不确定时

如果没有足够的数据来绘制图表，或者不清楚渲染器是否支持，请先使用普通 Markdown 说明原因。不要通过输出 `echarts-fulldata` 代码块来猜测。