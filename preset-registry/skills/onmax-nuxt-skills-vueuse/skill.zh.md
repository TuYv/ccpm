---
name: vueuse
description: Use when working with VueUse composables - track mouse position with useMouse, manage localStorage with useStorage, detect network status with useNetwork, debounce values with refDebounced, and access browser APIs reactively. Check VueUse before writing custom composables - most patterns already implemented.
license: MIT
---
# VueUse

一组必备的 Vue Composition 工具。在编写自定义组合式函数之前，请先查看 VueUse——大多数模式都已实现。

**当前稳定版本：**适用于 Vue 3.5+ 的 VueUse 14.x

## 安装

**Vue 3：**

```bash
pnpm add @vueuse/core
```

**Nuxt：**

```bash
pnpm add @vueuse/nuxt @vueuse/core
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@vueuse/nuxt'],
})
```

Nuxt 模块会自动导入组合式函数——无需手动导入。

## 分类

| 分类       | 示例                                                       |
| ---------- | ---------------------------------------------------------- |
| 状态       | useLocalStorage, useSessionStorage, useRefHistory          |
| 元素       | useElementSize, useIntersectionObserver, useResizeObserver |
| 浏览器     | useClipboard, useFullscreen, useMediaQuery                 |
| 传感器     | useMouse, useKeyboard, useDeviceOrientation                |
| 网络       | useFetch, useWebSocket, useEventSource                     |
| 动画       | useTransition, useInterval, useTimeout                     |
| 组件       | useVModel, useVirtualList, useTemplateRefsList             |
| 侦听       | watchDebounced, watchThrottled, watchOnce                  |
| 响应式     | createSharedComposable, toRef, toReactive                  |
| 数组       | useArrayFilter, useArrayMap, useSorted                     |
| 时间       | useDateFormat, useNow, useTimeAgo                          |
| 实用工具   | useDebounce, useThrottle, useMemoize                       |

## 快速参考

根据需要加载组合式函数文件：

| 当前任务           | 加载文件                                               |
| ------------------ | ------------------------------------------------------ |
| 查找组合式函数     | [references/composables.md](references/composables.md) |
| 特定组合式函数     | `composables/<name>.md`                                |

## 加载文件

**请根据你的任务考虑加载以下参考文件：**

- [ ] [references/composables.md](references/composables.md) - 按分类或功能搜索 VueUse 组合式函数时加载

**不要一次性加载所有文件。**仅加载与当前任务相关的文件。

## 常见模式

**状态持久化：**

```ts
const state = useLocalStorage('my-key', { count: 0 })
```

**鼠标追踪：**

```ts
const { x, y } = useMouse()
```

**防抖 ref：**

```ts
const search = ref('')
const debouncedSearch = refDebounced(search, 300)
```

**共享组合式函数（单例）：**

```ts
const useSharedMouse = createSharedComposable(useMouse)
```

## SSR 注意事项

许多 VueUse 组合式函数会使用在 SSR 期间不可用的浏览器 API。

**使用 `isClient` 检查：**

```ts
import { isClient } from '@vueuse/core'

if (isClient) {
  // Browser-only code
  const { width } = useWindowSize()
}
```

**封装在 onMounted 中：**

```ts
const width = ref(0)

onMounted(() => {
  // Only runs in browser
  const { width: w } = useWindowSize()
  width.value = w.value
})
```

**使用 SSR 安全的组合式函数：**

```ts
// These check isClient internally
const mouse = useMouse() // Returns {x: 0, y: 0} on server
const storage = useLocalStorage('key', 'default') // Uses default on server
```

**`@vueuse/nuxt` 会自动处理 SSR**——组合式函数在服务器端会返回安全的默认值。

## 目标元素引用

当目标是组件引用而非 DOM 元素时：

```ts
import type { MaybeElementRef } from '@vueuse/core'

// Component ref needs .$el to get DOM element
const compRef = ref<ComponentInstance>()
const { width } = useElementSize(compRef) // ❌ Won't work

// Use MaybeElementRef pattern
import { unrefElement } from '@vueuse/core'

const el = computed(() => unrefElement(compRef)) // Gets .$el
const { width } = useElementSize(el) // ✅ Works
```

**或者直接访问 `$el`：**

```ts
const compRef = ref<ComponentInstance>()

onMounted(() => {
  const el = compRef.value?.$el as HTMLElement
  const { width } = useElementSize(el)
})
```