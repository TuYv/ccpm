---
name: use-dom
description: Use Expo DOM components to run web code in a webview on native and as-is on web. Migrate web code to native incrementally.
version: 1.0.0
license: MIT
---
## 什么是 DOM 组件？

DOM 组件允许 Web 代码在原生平台的 WebView 中原样运行，同时在 Web 平台上按原样渲染。这样一来，你无需修改，就能在 Expo 应用中使用 `recharts`、`react-syntax-highlighter` 等仅限 Web 的库，或任何 React Web 库。

## 何时使用 DOM 组件

在以下情况下使用 DOM 组件：

- **仅限 Web 的库** — 图表库（recharts、chart.js）、语法高亮库、富文本编辑器，或任何依赖 DOM API 的库
- **迁移 Web 代码** — 无需重写即可将现有 React Web 组件迁移到原生平台
- **复杂的 HTML/CSS 布局** — 当 React Native 不支持所需的 CSS 特性时
- **iframe 或嵌入内容** — 嵌入需要浏览器上下文的外部内容
- **Canvas 或 WebGL** — 使用原生平台不支持的 Web 图形 API

## 何时不应使用 DOM 组件

在以下情况下避免使用 DOM 组件：

- **原生性能至关重要** — WebView 会带来额外开销
- **简单 UI** — 对于基础布局，React Native 组件效率更高
- **深度原生集成** — 对于原生 API，应改用本地模块
- **布局路由** — `_layout` 文件不能作为 DOM 组件

## 基础 DOM 组件

创建一个新文件，并在顶部添加 `'use dom';` 指令：

```tsx
// components/WebChart.tsx
"use dom";

export default function WebChart({
  data,
}: {
  data: number[];
  dom: import("expo/dom").DOMProps;
}) {
  return (
    <div style={{ padding: 20 }}>
      <h2>Chart Data</h2>
      <ul>
        {data.map((value, i) => (
          <li key={i}>{value}</li>
        ))}
      </ul>
    </div>
  );
}
```

## DOM 组件规则

1. **文件顶部必须包含 `'use dom';` 指令**
2. **单一默认导出** — 每个文件只能包含一个 React 组件
3. **使用独立文件** — 不能以内联方式定义，也不能与原生组件组合在同一文件中
4. **仅支持可序列化的 props** — 字符串、数字、布尔值、数组和普通对象
5. **在组件文件中包含 CSS** — DOM 组件在隔离的上下文中运行

## `dom` Prop

每个 DOM 组件都会收到一个用于配置 WebView 的特殊 `dom` prop。请始终在 props 中为其声明类型：

```tsx
"use dom";

interface Props {
  content: string;
  dom: import("expo/dom").DOMProps;
}

export default function MyComponent({ content }: Props) {
  return <div>{content}</div>;
}
```

### 常用 `dom` Prop 选项

```tsx
// Disable body scrolling
<DOMComponent dom={{ scrollEnabled: false }} />

// Flow under the notch (disable safe area insets)
<DOMComponent dom={{ contentInsetAdjustmentBehavior: "never" }} />

// Control size manually
<DOMComponent dom={{ style: { width: 300, height: 400 } }} />

// Combine options
<DOMComponent
  dom={{
    scrollEnabled: false,
    contentInsetAdjustmentBehavior: "never",
    style: { width: '100%', height: 500 }
  }}
/>
```

## 向 WebView 暴露原生操作

将异步函数作为 props 传递，以便向 DOM 组件暴露原生功能：

```tsx
// app/index.tsx (native)
import { Alert } from "react-native";
import DOMComponent from "@/components/dom-component";

export default function Screen() {
  return (
    <DOMComponent
      showAlert={async (message: string) => {
        Alert.alert("From Web", message);
      }}
      saveData={async (data: { name: string; value: number }) => {
        // Save to native storage, database, etc.
        console.log("Saving:", data);
        return { success: true };
      }}
    />
  );
}
```

```tsx
// components/dom-component.tsx
"use dom";

interface Props {
  showAlert: (message: string) => Promise<void>;
  saveData: (data: {
    name: string;
    value: number;
  }) => Promise<{ success: boolean }>;
  dom?: import("expo/dom").DOMProps;
}

export default function DOMComponent({ showAlert, saveData }: Props) {
  const handleClick = async () => {
    await showAlert("Hello from the webview!");
    const result = await saveData({ name: "test", value: 42 });
    console.log("Save result:", result);
  };

  return <button onClick={handleClick}>Trigger Native Action</button>;
}
```

## 使用 Web 库

DOM 组件可以使用任何 Web 库：

```tsx
// components/syntax-highlight.tsx
"use dom";

import SyntaxHighlighter from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";

interface Props {
  code: string;
  language: string;
  dom?: import("expo/dom").DOMProps;
}

export default function SyntaxHighlight({ code, language }: Props) {
  return (
    <SyntaxHighlighter language={language} style={docco}>
      {code}
    </SyntaxHighlighter>
  );
}
```

```tsx
// components/chart.tsx
"use dom";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface Props {
  data: Array<{ name: string; value: number }>;
  dom: import("expo/dom").DOMProps;
}

export default function Chart({ data }: Props) {
  return (
    <LineChart width={400} height={300} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="value" stroke="#8884d8" />
    </LineChart>
  );
}
```

## DOM 组件中的 CSS

由于 DOM 组件在隔离的上下文中运行，因此必须在 DOM 组件文件中导入 CSS：

```tsx
// components/styled-component.tsx
"use dom";

import "@/styles.css"; // CSS file in same directory

export default function StyledComponent({
  dom,
}: {
  dom: import("expo/dom").DOMProps;
}) {
  return (
    <div className="container">
      <h1 className="title">Styled Content</h1>
    </div>
  );
}
```

或者使用内联样式 / CSS-in-JS：

```tsx
"use dom";

const styles = {
  container: {
    padding: 20,
    backgroundColor: "#f0f0f0",
  },
  title: {
    fontSize: 24,
    color: "#333",
  },
};

export default function StyledComponent({
  dom,
}: {
  dom: import("expo/dom").DOMProps;
}) {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Styled Content</h1>
    </div>
  );
}
```

## DOM 组件中的 Expo Router

expo-router 的 `<Link />` 组件和 router API 可在 DOM 组件内部使用：

```tsx
"use dom";

import { Link, useRouter } from "expo-router";

export default function Navigation({
  dom,
}: {
  dom: import("expo/dom").DOMProps;
}) {
  const router = useRouter();

  return (
    <nav>
      <Link href="/about">About</Link>
      <button onClick={() => router.push("/settings")}>Settings</button>
    </nav>
  );
}
```

### 需要 Props 的 Router API

这些 Hook 无法直接在 DOM 组件中使用，因为它们需要同步访问原生路由状态：

- `useLocalSearchParams()`
- `useGlobalSearchParams()`
- `usePathname()`
- `useSegments()`
- `useRootNavigation()`
- `useRootNavigationState()`

**解决方案：**在原生父组件中读取这些值，并将其作为 props 传递：

```tsx
// app/[id].tsx (native)
import { useLocalSearchParams, usePathname } from "expo-router";
import DOMComponent from "@/components/dom-component";

export default function Screen() {
  const { id } = useLocalSearchParams();
  const pathname = usePathname();

  return <DOMComponent id={id as string} pathname={pathname} />;
}
```

```tsx
// components/dom-component.tsx
"use dom";

interface Props {
  id: string;
  pathname: string;
  dom?: import("expo/dom").DOMProps;
}

export default function DOMComponent({ id, pathname }: Props) {
  return (
    <div>
      <p>Current ID: {id}</p>
      <p>Current Path: {pathname}</p>
    </div>
  );
}
```

## 检测 DOM 环境

检查代码是否正在 DOM 组件中运行：

```tsx
"use dom";

import { IS_DOM } from "expo/dom";

export default function Component({
  dom,
}: {
  dom?: import("expo/dom").DOMProps;
}) {
  return <div>{IS_DOM ? "Running in DOM component" : "Running natively"}</div>;
}
```

## 资源

优先使用 require 引入资源，而不是使用 public 目录：

```tsx
"use dom";

// Good - bundled with the component
const logo = require("../assets/logo.png");

export default function Component({
  dom,
}: {
  dom: import("expo/dom").DOMProps;
}) {
  return <img src={logo} alt="Logo" />;
}
```

## 在原生组件中使用

像使用普通组件一样导入并使用 DOM 组件：

```tsx
// app/index.tsx
import { View, Text } from "react-native";
import WebChart from "@/components/web-chart";
import CodeBlock from "@/components/code-block";

export default function HomeScreen() {
  return (
    <View style={{ flex: 1 }}>
      <Text>Native content above</Text>

      <WebChart data={[10, 20, 30, 40, 50]} dom={{ style: { height: 300 } }} />

      <CodeBlock
        code="const x = 1;"
        language="javascript"
        dom={{ scrollEnabled: true }}
      />

      <Text>Native content below</Text>
    </View>
  );
}
```

## 平台行为

| 平台     | 行为                                  |
| -------- | ----------------------------------- |
| iOS      | 在 WKWebView 中渲染                    |
| Android  | 在 WebView 中渲染                      |
| Web      | 按原样渲染（无 webview 包装器）          |

在 Web 平台上，由于不需要 webview，因此会忽略 `dom` prop。

## 提示

- DOM 组件在开发期间支持热重载
- 保持 DOM 组件功能专一——不要将整个屏幕放入 webview
- 使用原生组件实现导航界面元素，使用 DOM 组件实现专用内容
- 在所有平台上进行测试——Web 渲染可能与原生 webview 略有不同
- 大型 DOM 组件可能影响性能——如有需要，请进行性能分析
- webview 拥有自己的 JavaScript 上下文——无法直接与原生端共享状态