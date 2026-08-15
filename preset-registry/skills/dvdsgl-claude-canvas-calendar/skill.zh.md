---
name: calendar
description: |
  Calendar canvas for displaying events and picking meeting times.
  Use when showing calendar views or when users need to select available time slots.
---
# 日历画布

显示日历视图，并支持交互式选择会议时间。

## 示例提示词

可以尝试这样询问 Claude：

- “安排下周某个时间与 Alice 和 Bob 开一个 30 分钟的会议”
- “找出周二工程团队所有人都有空的时间”
- “显示我本周的日历”
- “大家什么时候有空参加 1 小时的规划会议？”
- “将周五下午 2 点至 4 点设置为专注工作时间”

## 场景

### `display`（默认）
只读日历显示。用户可以切换周，但不能选择时间。

```bash
bun run src/cli.ts show calendar --scenario display --config '{
  "title": "My Week",
  "events": [
    {"id": "1", "title": "Meeting", "startTime": "2025-01-06T09:00:00", "endTime": "2025-01-06T10:00:00"}
  ]
}'
```

### `meeting-picker`
交互式场景，用于在查看多人的日历时选择空闲时间段。

- 以不同颜色叠加显示多个日历
- 用户可以**单击**空闲时间段来选择会议时间
- 选择结果通过 IPC 发送回去
- 支持配置时间段粒度（15/30/60 分钟）

```bash
bun run src/cli.ts spawn calendar --scenario meeting-picker --config '{
  "calendars": [
    {
      "name": "Alice",
      "color": "blue",
      "events": [
        {"id": "1", "title": "Standup", "startTime": "2025-01-06T09:00:00", "endTime": "2025-01-06T09:30:00"}
      ]
    },
    {
      "name": "Bob",
      "color": "green",
      "events": [
        {"id": "2", "title": "Call", "startTime": "2025-01-06T14:00:00", "endTime": "2025-01-06T15:00:00"}
      ]
    }
  ],
  "slotGranularity": 30,
  "minDuration": 30,
  "maxDuration": 120
}'
```

## 配置

### 显示配置
```typescript
interface CalendarConfig {
  title?: string;
  events: CalendarEvent[];
}

interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;  // ISO datetime
  endTime: string;    // ISO datetime
  color?: string;     // blue, green, red, yellow, magenta, cyan
}
```

### 会议时间选择器配置
```typescript
interface MeetingPickerConfig {
  calendars: Calendar[];
  slotGranularity?: number;  // 15, 30, or 60 minutes (default: 30)
  minDuration?: number;      // Minimum meeting duration in minutes
  maxDuration?: number;      // Maximum meeting duration in minutes
}

interface Calendar {
  name: string;              // Person's name
  color: string;             // Calendar color
  events: CalendarEvent[];   // Their busy times
}
```

## 控制方式

**显示场景：**
- `←/→` 或 `h/l`：在日期之间切换
- `n` 或 `PageDown`：下一周
- `p` 或 `PageUp`：上一周
- `t`：跳转到今天
- `q` 或 `Esc`：退出

**会议时间选择器场景：**
- **鼠标单击**：选择空闲时间段
- `←/→`：在周之间切换
- `t`：跳转到今天
- `q` 或 `Esc`：取消选择

## 选择结果

```typescript
interface MeetingSelection {
  startTime: string;  // ISO datetime
  endTime: string;    // ISO datetime
  duration: number;   // Minutes
}
```

## API 用法

```typescript
import { pickMeetingTime } from "${CLAUDE_PLUGIN_ROOT}/src/api";

const result = await pickMeetingTime({
  calendars: [
    { name: "Alice", color: "blue", events: [...] },
    { name: "Bob", color: "green", events: [...] },
  ],
  slotGranularity: 30,
});

if (result.success && result.data) {
  console.log(`Selected: ${result.data.startTime} - ${result.data.endTime}`);
}
```