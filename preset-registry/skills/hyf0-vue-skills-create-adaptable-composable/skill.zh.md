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

可适配的组合式函数是能够同时接受响应式和非响应式输入的可复用函数。这使开发者能够在各种上下文中使用组合式函数，而不必担心输入是否具有响应性。

在 Vue.js 中设计可适配组合式函数的步骤：
1. 确认组合式函数的用途、API 设计以及预期的输入和输出。
2. 确定应为响应式的输入参数（MaybeRef / MaybeRefOrGetter）。
3. 在响应式副作用中使用 `toValue()` 或 `toRef()` 对输入进行规范化。
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

- 只读且兼容计算属性的输入：使用 `MaybeRefOrGetter`
- 需要可写或双向绑定的输入：使用 `MaybeRef`
- 参数可能是函数值（回调函数/断言函数/比较函数）：不要使用 `MaybeRefOrGetter`，否则可能会意外将其作为 getter 调用。
- DOM/Element 目标：如果需要计算或派生目标，请使用 `MaybeRefOrGetter`。

使用 `MaybeRefOrGetter` 或 `MaybeRef` 时：
- 使用 `toRef()` 解析响应式值（例如侦听器数据源）
- 使用 `toValue()` 解析非响应式值

### 示例

可适配的 `useDocumentTitle` 组合式函数：只读标题参数

```ts
import { watch, toRef } from 'vue'
import type { MaybeRefOrGetter } from 'vue'

export function useDocumentTitle(title: MaybeRefOrGetter<string>) {
  watch(toRef(title), (t) => {
    document.title = t
  }, { immediate: true })
}
```

可适配的 `useCounter` 组合式函数：双向可写的计数参数

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