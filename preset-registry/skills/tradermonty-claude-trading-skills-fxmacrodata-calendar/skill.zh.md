---
name: fxmacrodata-calendar
description: Fetch official FXMacroData macro release-calendar events for trade planning, macro regime checks, and event-risk filters. Use before CPI, NFP, GDP, PCE, retail sales, PMI, and central-bank decision windows.
---
# FXMacroData Calendar

从 FXMacroData 获取来自官方来源的宏观发布日历事件。当交易计划需要事件时点、已确认的发布日期或顶级宏观风险检查时，使用此技能。

## 工作流程

1. 运行日历脚本：

   ```bash
   python3 skills/fxmacrodata-calendar/scripts/fetch_calendar.py --currency usd --min-tier 1
   ```

2. 检查 `events[]` 中的顶级发布事件。

   将非零退出码视为未验证的事件风险状态，绝不能视为空日历。只有包含 `events: []` 的成功响应才能确认未返回任何匹配的事件。客户端仅在响应货币与请求一致、且 `data_quality` 确认来源是官方、最新、非代理、非回退、时间戳完整、时点安全（point-in-time-safe）的来源时，才接受结果。每个事件都必须包含公告时间戳和非空的发布标识符。

3. 将事件时点纳入交易计划：
   - 在高影响力发布前后暂停新开仓；
   - 降低杠杆或仓位规模；
   - 在实际值公布后安排后续复盘；
   - 说明是哪个事件和时间戳导致了该调整。

## 身份验证

为需要身份验证的 FXMacroData 端点设置 `FXMACRODATA_API_KEY`。无需密钥即可获取公开的 USD 日历数据行。客户端使用规范端点 `https://api.fxmacrodata.com/v1`，且仅接受 `--min-tier` 取值 1、2 或 3。实时日历响应目前包含 `market_tier`；本技能将其视为扩展字段，并要求其值为 1 到 3 的整数以用于筛选，尽管当前的 `CalendarReleaseRow` OpenAPI schema 并未声明该字段。
