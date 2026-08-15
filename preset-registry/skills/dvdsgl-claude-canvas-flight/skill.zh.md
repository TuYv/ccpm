---
name: flight
description: |
  Flight canvas for comparing flights and selecting seats.
  Use when users need to browse flight options and book seats.
---
# 航班画布

赛博朋克主题的航班比较与座位选择界面。

## 示例提示词

可以尝试向 Claude 提出：

- “查找 1 月 15 日从旧金山飞往丹佛的航班”
- “帮我预订飞往纽约最便宜的直飞航班上的靠窗座位”
- “比较下周一从洛杉矶国际机场飞往西雅图的早间航班”
- “我需要一个飞往芝加哥、腿部空间更大的商务舱座位”
- “显示价格低于 300 美元、飞往波士顿的美联航航班”

## 场景

### `booking`（默认）
交互式航班比较与座位选择。

- 显示包含航空公司、时间、时长和价格的航班选项
- 用于选择座位的交互式座位图
- 支持使用键盘在航班和座位之间导航
- 通过 IPC 返回所选航班和座位

```bash
bun run src/cli.ts spawn flight --scenario booking --config '{
  "title": "// FLIGHT_BOOKING_TERMINAL //",
  "flights": [
    {
      "id": "ua123",
      "airline": "United Airlines",
      "flightNumber": "UA 123",
      "origin": {
        "code": "SFO",
        "name": "San Francisco International",
        "city": "San Francisco",
        "timezone": "PST"
      },
      "destination": {
        "code": "DEN",
        "name": "Denver International",
        "city": "Denver",
        "timezone": "MST"
      },
      "departureTime": "2026-01-08T12:55:00-08:00",
      "arrivalTime": "2026-01-08T16:37:00-07:00",
      "duration": 162,
      "price": 34500,
      "currency": "USD",
      "cabinClass": "economy",
      "aircraft": "Boeing 737-800",
      "stops": 0,
      "seatmap": {
        "rows": 30,
        "seatsPerRow": ["A", "B", "C", "D", "E", "F"],
        "aisleAfter": ["C"],
        "unavailable": ["1A", "1B", "1C", "1D", "1E", "1F"],
        "premium": ["2A", "2B", "2C", "2D", "2E", "2F"],
        "occupied": ["3A", "3C", "4B", "5D"]
      }
    }
  ]
}'
```

## 配置

```typescript
interface FlightConfig {
  flights: Flight[];
  title?: string;           // Header title
  showSeatmap?: boolean;    // Enable seat selection
  selectedFlightId?: string; // Pre-select a flight
}

interface Flight {
  id: string;
  airline: string;          // e.g., "United Airlines"
  flightNumber: string;     // e.g., "UA 123"
  origin: Airport;
  destination: Airport;
  departureTime: string;    // ISO datetime
  arrivalTime: string;      // ISO datetime
  duration: number;         // Minutes
  price: number;            // Cents
  currency: string;         // e.g., "USD"
  cabinClass: "economy" | "premium" | "business" | "first";
  aircraft?: string;        // e.g., "Boeing 737-800"
  stops: number;            // 0 = nonstop
  seatmap?: Seatmap;        // Optional seat selection
}

interface Airport {
  code: string;             // 3-letter code
  name: string;             // Full airport name
  city: string;
  timezone: string;
}

interface Seatmap {
  rows: number;
  seatsPerRow: string[];    // e.g., ["A", "B", "C", "D", "E", "F"]
  aisleAfter: string[];     // e.g., ["C"] = aisle after seat C
  unavailable: string[];    // Blocked seats
  premium: string[];        // Extra legroom/exit row
  occupied: string[];       // Already booked
}
```

## 控制方式

- `↑/↓`：在航班之间导航
- `Tab`：在航班列表和座位图之间切换焦点
- `←/→/↑/↓`（在座位图中）：移动座位光标
- `Space`：选择/取消选择座位
- `Enter`：确认选择
- `Shift+Enter`：立即确认（跳过倒计时）
- `q` 或 `Esc`：取消

## 选择结果

```typescript
interface FlightResult {
  selectedFlight: Flight;
  selectedSeat?: string;    // e.g., "12A"
}
```

## 座位图例

- `[ ]` - 可选座位
- `[X]` - 已占用座位
- `[/]` - 不可用/已锁定
- `[+]` - 高级座位（额外腿部空间）
- `[*]` - 当前已选择

## API 用法

```typescript
import { bookFlight } from "${CLAUDE_PLUGIN_ROOT}/src/api";

const result = await bookFlight({
  flights: [
    {
      id: "ua123",
      airline: "United Airlines",
      flightNumber: "UA 123",
      origin: { code: "SFO", name: "San Francisco", city: "SF", timezone: "PST" },
      destination: { code: "DEN", name: "Denver", city: "Denver", timezone: "MST" },
      departureTime: "2026-01-08T12:55:00-08:00",
      arrivalTime: "2026-01-08T16:37:00-07:00",
      duration: 162,
      price: 34500,
      currency: "USD",
      cabinClass: "economy",
      stops: 0,
      seatmap: { ... }
    }
  ]
});

if (result.success && result.data) {
  console.log(`Booked: ${result.data.selectedFlight.flightNumber}`);
  console.log(`Seat: ${result.data.selectedSeat}`);
}
```