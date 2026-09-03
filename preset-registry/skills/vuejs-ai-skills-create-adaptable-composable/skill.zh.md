---
name: create-adaptable-composable
description: Create a library-grade Vue composable that accepts maybe-reactive inputs (MaybeRef / MaybeRefOrGetter) so callers can pass a plain value, ref, or getter. Normalize inputs with toValue()/toRef() inside reactive effects (watch/watchEffect) to keep behavior predictable and reactive. Use this skill when user asks for creating adaptable or reusable composables.
license: MIT
metadata:
  author: github.com/vuejs-ai
  version: "17.0.0"
compatibility: Requires Vue 3 (or above) or Nuxt 3 (or above) project
---
# 创建可适配的组合式函数

可适配的组合式函数是可以同时接受响应式和非响应式输入的可复用函数。这使得开发者能够在各种场景中使用该组合式函数，而无需担心输入的响应性。

在 Vue.js 中设计可适配组合式函数的步骤：
1. 确认组合式函数的用途、API 设计以及预期的输入/输出。
2. 识别应当支持响应式的输入参数（MaybeRef / MaybeRefOrGetter）。
3. 在响应式副作用中使用 `toValue()` 或 `toRef()` 来规范化输入。
4. 使用 Vue 的响应式 API 实现组合式函数的核心逻辑。

## 核心类型概念

### 类型工具

```ts
/**
 * value or writable ref (value/ref/shallowRef/writable computed)
 */
export type MaybeRef<T = any> = T | Ref<T> | ShallowRef<T> | WritableComputedRef<T>;

/**
 * MaybeRef<T> + ComputedRef<T> + () => T
 */
export type MaybeRefOrGetter<T = any> = MaybeRef<T> | ComputedRef<T> | (() => T);
```

### 策略与规则

- 只读的、对 computed 友好的输入：使用 `MaybeRefOrGetter`
- 需要可写 / 双向的输入：使用 `MaybeRef`
- 参数可能是函数值（回调/谓词/比较器）：不要使用 `MaybeRefOrGetter`，否则可能会意外地将其作为 getter 调用。
- DOM/元素目标：如果希望支持 computed/派生的目标，使用 `MaybeRefOrGetter`。

当使用 `MaybeRefOrGetter` 或 `MaybeRef` 时：
- 使用 `toRef()` 解析响应式值（例如 watcher 的来源）
- 使用 `toValue()` 解析非响应式值

### 示例

可适配的 `useDocumentTitle` 组合式函数：只读的 title 参数

```ts
import { watch, toRef } from 'vue'
import type { MaybeRefOrGetter } from 'vue'

export function useDocumentTitle(title: MaybeRefOrGetter<string>) {
  watch(toRef(title), (t) => {
    document.title = t
  }, { immediate: true })
}
```

可适配的 `useCounter` 组合式函数：双向可写的 count 参数

```ts
import { watch, toRef } from 'vue'
import type { MaybeRef } from 'vue'

function useCounter(count: MaybeRef<number>) {
  const countRef = toRef(count)
  function add() {
    countRef.value++
  }
  return { add }
}
```
