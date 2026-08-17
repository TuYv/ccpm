---
name: vue-debug-guides
description: Vue 3 debugging and error handling for runtime errors, warnings, async failures, and SSR/hydration issues. Use when diagnosing or fixing Vue issues.
---
Vue 3 运行时问题、警告、异步失败和 hydration 缺陷的调试与错误处理。
有关开发最佳实践和常见陷阱，请使用 `vue-best-practices`。

### 响应式
- 跟踪意外的重新渲染和状态更新 → 参见 [响应式调试钩子](reference/reactivity-debugging-hooks.md)
- 由于缺少 .value 访问而导致 Ref 值未更新 → 参见 [Ref 值访问](reference/ref-value-access.md)
- 解构响应式对象后状态停止更新 → 参见 [响应式对象解构](reference/reactive-destructuring.md)
- 数组、Maps 或 Sets 中的 Refs 未自动解包 → 参见 [集合中的 Refs 需要使用 value](reference/refs-in-collections-need-value.md)
- 嵌套 Refs 在模板中渲染为 [object Object] → 参见 [模板仅解包顶层 Ref](reference/template-ref-unwrapping-top-level.md)
- 响应式代理的身份比较始终返回 false → 参见 [响应式代理身份隐患](reference/reactivity-proxy-identity-hazard.md)
- 第三方实例被代理后出现异常 → 参见 [对非响应式对象使用 markRaw](reference/reactivity-markraw-for-non-reactive.md)
- 侦听器意外地在每个 tick 中只触发一次 → 参见 [响应式同 tick 批处理](reference/reactivity-same-tick-batching.md)

### 计算属性
- 计算属性 getter 意外触发修改或请求 → 参见 [计算属性中不要产生副作用](reference/computed-no-side-effects.md)
- 修改计算属性值导致更改消失 → 参见 [计算属性返回值是只读的](reference/computed-return-value-readonly.md)
- 执行条件逻辑后计算属性值不再更新 → 参见 [计算属性的条件依赖](reference/computed-conditional-dependencies.md)
- 对数组进行排序或反转会破坏原始状态 → 参见 [计算属性中的数组修改](reference/computed-array-mutation.md)
- 向计算属性传递参数失败 → 参见 [计算属性不接受参数](reference/computed-no-parameters.md)

### 侦听器
- 异步操作用过期数据覆盖新数据 → 参见 [侦听器的异步清理](reference/watch-async-cleanup.md)
- 在异步回调中创建侦听器 → 参见 [异步创建侦听器导致的内存泄漏](reference/watch-async-creation-memory-leak.md)
- 侦听器从不因响应式对象属性变化而触发 → 参见 [使用 getter 侦听响应式属性](reference/watch-reactive-property-getter.md)
- 异步 watchEffect 遗漏 await 之后的依赖项 → 参见 [watchEffect 的异步依赖跟踪](reference/watcheffect-async-dependency-tracking.md)
- 侦听器回调中读取到的 DOM 数据已过期 → 参见 [侦听器的刷新时机](reference/watch-flush-timing.md)
- 深度侦听器报告相同的旧值和新值 → 参见 [深度侦听器中的相同对象引用](reference/watch-deep-same-object-reference.md)
- watchEffect 在模板 Refs 更新之前运行 → 参见 [为 Refs 设置 watchEffect 的 flush 为 post](reference/watcheffect-flush-post-for-refs.md)

### 组件
- 子组件抛出 "component not found" 错误 → 参见 [局部组件在后代组件中不可用](reference/local-components-not-in-descendants.md)
- 自定义组件上的点击侦听器未触发 → 参见 [组件上的点击事件](reference/click-events-on-components.md)
- 父组件无法在 script setup 中访问子组件 Ref 数据 → 参见 [组件 Ref 需要 defineExpose](reference/component-ref-requires-defineexpose.md)
- HTML 模板解析破坏 Vue 组件语法 → 参见 [DOM 内模板解析注意事项](reference/in-dom-template-parsing-caveats.md)
- 命名冲突导致渲染了错误的组件 → 参见 [组件命名冲突](reference/component-naming-conflicts.md)
- 父组件样式未应用于多根节点组件 → 参见 [多根节点组件的 class 属性](reference/multi-root-component-class-attrs.md)

### Props 与 Emits
- 在 defineProps 中引用变量会导致错误 → 参见 [prop-defineprops-scope-limitation](reference/prop-defineprops-scope-limitation.md)
- 组件触发未声明的事件会导致警告 → 参见 [declare-emits-for-documentation](reference/declare-emits-for-documentation.md)
- 在函数或条件语句内部使用 defineEmits → 参见 [defineEmits-must-be-top-level](reference/defineEmits-must-be-top-level.md)
- defineEmits 同时包含类型参数和运行时参数 → 参见 [defineEmits-no-runtime-and-type-mixed](reference/defineEmits-no-runtime-and-type-mixed.md)
- 原生事件监听器不响应点击 → 参见 [native-event-collision-with-emits](reference/native-event-collision-with-emits.md)
- 点击时组件事件触发两次 → 参见 [undeclared-emits-double-firing](reference/undeclared-emits-double-firing.md)

### 模板
- 模板中的语句导致编译错误 → 参见 [template-expressions-restrictions](reference/template-expressions-restrictions.md)
- 出现 "Cannot read property of undefined" 运行时错误 → 参见 [v-if-null-check-order](reference/v-if-null-check-order.md)
- 动态指令参数无法正常工作 → 参见 [dynamic-argument-constraints](reference/dynamic-argument-constraints.md)
- v-else 元素始终无条件渲染 → 参见 [v-else-must-follow-v-if](reference/v-else-must-follow-v-if.md)
- 混用 v-if 和 v-for 会导致优先级错误和迁移时的破坏性问题 → 参见 [no-v-if-with-v-for](reference/no-v-if-with-v-for.md)
- 模板函数调用修改状态，导致不可预测的重新渲染错误 → 参见 [template-functions-no-side-effects](reference/template-functions-no-side-effects.md)
- 循环中的子组件显示 undefined 数据 → 参见 [v-for-component-props](reference/v-for-component-props.md)
- 排序或反转后数组顺序发生变化 → 参见 [v-for-computed-reverse-sort](reference/v-for-computed-reverse-sort.md)
- 列表项意外消失或状态互换 → 参见 [v-for-key-attribute](reference/v-for-key-attribute.md)
- 使用范围迭代时出现差一错误 → 参见 [v-for-range-starts-at-one](reference/v-for-range-starts-at-one.md)
- v-show 或 v-else 无法在 template 元素上工作 → 参见 [v-show-template-limitation](reference/v-show-template-limitation.md)

### 模板引用
- 元素被条件性隐藏时，Ref 变为 null → 参见 [template-ref-null-with-v-if](reference/template-ref-null-with-v-if.md)
- 循环中的 Ref 数组索引与数据数组不匹配 → 参见 [template-ref-v-for-order](reference/template-ref-v-for-order.md)
- 重构模板引用名称会导致代码静默失效 → 参见 [use-template-ref-vue35](reference/use-template-ref-vue35.md)

### 表单与 v-model
- 使用 v-model 时未显示表单初始值 → 参见 [v-model-ignores-html-attributes](reference/v-model-ignores-html-attributes.md)
- Textarea 内容变化未更新 ref → 参见 [textarea-no-interpolation](reference/textarea-no-interpolation.md)
- iOS 用户无法选择下拉列表的第一个选项 → 参见 [select-initial-value-ios-bug](reference/select-initial-value-ios-bug.md)
- 父组件和子组件的值不一致 → 参见 [define-model-default-value-sync](reference/define-model-default-value-sync.md)
- 对象属性变化未同步到父组件 → 参见 [definemodel-object-mutation-no-emit](reference/definemodel-object-mutation-no-emit.md)
- 中文/日文输入时实时搜索或验证失效 → 参见 [v-model-ime-composition](reference/v-model-ime-composition.md)
- 数字输入返回空字符串而不是零 → 参见 [v-model-number-modifier-behavior](reference/v-model-number-modifier-behavior.md)
- 自定义复选框值未随表单提交 → 参见 [checkbox-true-false-value-form-submission](reference/checkbox-true-false-value-form-submission.md)

### 事件与修饰符
- 链式使用多个事件修饰符会产生意外结果 → 参见 [event-modifier-order-matters](reference/event-modifier-order-matters.md)
- 使用系统修饰键时键盘快捷键不触发 → 参见 [keyup-modifier-timing](reference/keyup-modifier-timing.md)
- 非预期的修饰键组合会触发键盘快捷键 → 参见 [exact-modifier-for-precise-shortcuts](reference/exact-modifier-for-precise-shortcuts.md)
- 组合使用 passive 和 prevent 修饰符会破坏事件行为 → 参见 [no-passive-with-prevent](reference/no-passive-with-prevent.md)

### 生命周期
- 未移除的事件监听器导致内存泄漏 → 参见 [cleanup-side-effects](reference/cleanup-side-effects.md)
- 在组件挂载前访问 DOM 会失败 → 参见 [lifecycle-dom-access-timing](reference/lifecycle-dom-access-timing.md)
- 状态变化后读取 DOM 会返回旧值 → 参见 [dom-update-timing-nexttick](reference/dom-update-timing-nexttick.md)
- SSR 渲染与客户端水合结果不一致 → 参见 [lifecycle-ssr-awareness](reference/lifecycle-ssr-awareness.md)
- 异步注册的生命周期钩子永远不会运行 → 参见 [lifecycle-hooks-synchronous-registration](reference/lifecycle-hooks-synchronous-registration.md)

### 插槽
- 在插槽内容中访问子组件数据会返回 undefined 值 → 参见 [slot-render-scope-parent-only](reference/slot-render-scope-parent-only.md)
- 混合使用具名插槽和作用域插槽会导致编译错误 → 参见 [slot-named-scoped-explicit-default](reference/slot-named-scoped-explicit-default.md)
- 在原生 HTML 元素上使用 v-slot 会导致编译错误 → 参见 [slot-v-slot-on-components-or-templates-only](reference/slot-v-slot-on-components-or-templates-only.md)
- 隐式默认插槽行为导致内容位置异常 → 参见 [slot-implicit-default-content](reference/slot-implicit-default-content.md)
- 作用域插槽的 props 中缺少预期的 name 属性 → 参见 [slot-name-reserved-prop](reference/slot-name-reserved-prop.md)
- 包装组件导致子组件的插槽功能失效 → 参见 [slot-forwarding-to-child-components](reference/slot-forwarding-to-child-components.md)

### Provide/Inject
- 在异步操作后调用 provide 会静默失败 → 参见 [provide-inject-synchronous-setup](reference/provide-inject-synchronous-setup.md)
- 追踪所提供值的来源 → 参见 [provide-inject-debugging-challenges](reference/provide-inject-debugging-challenges.md)
- 提供者发生变化时，注入的值不会更新 → 参见 [provide-inject-reactivity-not-automatic](reference/provide-inject-reactivity-not-automatic.md)
- 多个组件共享同一个默认对象 → 参见 [provide-inject-default-value-factory](reference/provide-inject-default-value-factory.md)

### Attrs
- 内部事件处理器和透传事件处理器都会执行 → 参见 [attrs-event-listener-merging](reference/attrs-event-listener-merging.md)
- 显式属性会被透传值覆盖 → 参见 [fallthrough-attrs-overwrite-vue3](reference/fallthrough-attrs-overwrite-vue3.md)
- 包装组件中的属性被应用到错误的元素上 → 参见 [inheritattrs-false-for-wrapper-components](reference/inheritattrs-false-for-wrapper-components.md)

### 组合式函数
- 在 setup 上下文之外或异步调用组合式函数 → 参见 [composable-call-location-restrictions](reference/composable-call-location-restrictions.md)
- 输入变化时，组合式函数的响应式依赖未更新 → 参见 [composable-tovalue-inside-watcheffect](reference/composable-tovalue-inside-watcheffect.md)
- 组合式函数意外修改外部状态 → 参见 [composable-avoid-hidden-side-effects](reference/composable-avoid-hidden-side-effects.md)
- 对组合式函数的返回值进行解构会意外破坏响应性 → 参见 [composable-naming-return-pattern](reference/composable-naming-return-pattern.md)

### Composition API
- 异步操作后，生命周期钩子静默失效 → 参见 [composition-api-script-setup-async-context](reference/composition-api-script-setup-async-context.md)
- 父组件的 refs 无法访问已暴露的属性 → 参见 [define-expose-before-await](reference/define-expose-before-await.md)
- 函数式编程模式破坏 Vue 预期的响应式行为 → 参见 [composition-api-not-functional-programming](reference/composition-api-not-functional-programming.md)
- React Hook 的思维模型导致 Composition API 使用不当 → 参见 [composition-api-vs-react-hooks-differences](reference/composition-api-vs-react-hooks-differences.md)

### 动画
- 复用 DOM 节点时，动画无法触发 → 参见 [animation-key-for-rerender](reference/animation-key-for-rerender.md)
- 高负载下，TransitionGroup 列表更新出现卡顿 → 参见 [animation-transitiongroup-performance](reference/animation-transitiongroup-performance.md)

### TypeScript
- 可变的 prop 默认值导致状态在组件实例之间泄漏 → 参见 [ts-withdefaults-mutable-factory-function](reference/ts-withdefaults-mutable-factory-function.md)
- reactive() 的泛型类型导致 ref 解包不匹配 → 参见 [ts-reactive-no-generic-argument](reference/ts-reactive-no-generic-argument.md)
- 模板 refs 在挂载前或通过 v-if 卸载后引发 null 访问错误 → 参见 [ts-template-ref-null-handling](reference/ts-template-ref-null-handling.md)
- 可选的 boolean props 表现为 false 而非 undefined → 参见 [ts-defineprops-boolean-default-false](reference/ts-defineprops-boolean-default-false.md)
- 导入的 defineProps 类型因无法解析或复杂的类型引用而失败 → 参见 [ts-defineprops-imported-types-limitations](reference/ts-defineprops-imported-types-limitations.md)
- 未指定类型的 DOM 事件处理程序在严格的 TypeScript 设置下无法通过检查 → 参见 [ts-event-handler-explicit-typing](reference/ts-event-handler-explicit-typing.md)
- 动态组件 refs 触发响应式组件警告 → 参见 [ts-shallowref-for-dynamic-components](reference/ts-shallowref-for-dynamic-components.md)
- 联合类型的模板表达式因未进行类型收窄而无法通过类型检查 → 参见 [ts-template-type-casting](reference/ts-template-type-casting.md)

### 异步组件
- 路由组件错误配置了 defineAsyncComponent 懒加载 → 参见 [async-component-vue-router](reference/async-component-vue-router.md)
- 加载组件时发生网络故障或超时 → 参见 [async-component-error-handling](reference/async-component-error-handling.md)
- 组件重新激活后，模板 refs 为 undefined → 参见 [async-component-keepalive-ref-issue](reference/async-component-keepalive-ref-issue.md)

### 渲染函数
- 状态变化后，渲染函数的输出仍保持静态 → 参见 [rendering-render-function-return-from-setup](reference/rendering-render-function-return-from-setup.md)
- 复用的 vnode 实例渲染不正确 → 参见 [render-function-vnodes-must-be-unique](reference/render-function-vnodes-must-be-unique.md)
- 字符串形式的组件名称被渲染为 HTML 元素 → 参见 [rendering-resolve-component-for-string-names](reference/rendering-resolve-component-for-string-names.md)
- 访问 vnode 内部属性会导致代码在 Vue 更新后失效 → 参见 [render-function-avoid-internal-vnode-properties](reference/render-function-avoid-internal-vnode-properties.md)
- Vue 2 的渲染函数模式在 Vue 3 中会导致崩溃 → 参见 [rendering-render-function-h-import-vue3](reference/rendering-render-function-h-import-vue3.md)
- 通过 h() 传入的插槽内容未渲染 → 参见 [rendering-render-function-slots-as-functions](reference/rendering-render-function-slots-as-functions.md)

### KeepAlive
- 使用嵌套 Vue Router 路由时，子组件会挂载两次 → 参见 [keepalive-router-nested-double-mount](reference/keepalive-router-nested-double-mount.md)
- 将 KeepAlive 与 Transition 动画结合使用时，内存占用持续增长 → 参见 [keepalive-transition-memory-leak](reference/keepalive-transition-memory-leak.md)

### 过渡
- JavaScript 过渡钩子缺少 done 回调时会卡住 → 参见 [transition-js-hooks-done-callback](reference/transition-js-hooks-done-callback.md)
- 移动动画无法应用于行内列表元素 → 参见 [transition-group-flip-inline-elements](reference/transition-group-flip-inline-elements.md)
- 列表项发生跳动，而非平滑地执行动画 → 参见 [transition-group-move-animation-position-absolute](reference/transition-group-move-animation-position-absolute.md)
- 从 Vue 2 迁移到 Vue 3 时，TransitionGroup 包装元素的变化会破坏布局 → 参见 [transition-group-no-default-wrapper-vue3](reference/transition-group-no-default-wrapper-vue3.md)
- 嵌套过渡会在完成前被截断 → 参见 [transition-nested-duration](reference/transition-nested-duration.md)
- scoped 样式在可复用的过渡包装组件中失效 → 参见 [transition-reusable-scoped-style](reference/transition-reusable-scoped-style.md)
- RouterView 过渡在首次渲染时意外执行动画 → 参见 [transition-router-view-appear](reference/transition-router-view-appear.md)
- 混用 CSS 过渡和动画会导致时序问题 → 参见 [transition-type-when-mixed](reference/transition-type-when-mixed.md)
- 快速切换过渡时，清理钩子未被调用 → 参见 [transition-unmount-hook-timing](reference/transition-unmount-hook-timing.md)

### Teleport
- 在 DOM 中找不到 Teleport 目标元素 → 参见 [teleport-target-must-exist](reference/teleport-target-must-exist.md)
- Teleport 传送的内容会破坏 SSR 水合 → 参见 [teleport-ssr-hydration](reference/teleport-ssr-hydration.md)
- scoped 样式未应用于 Teleport 传送的内容 → 参见 [teleport-scoped-styles-limitation](reference/teleport-scoped-styles-limitation.md)

### Suspense
- 需要处理 Suspense 组件中的异步错误 → 请参阅 [suspense-no-builtin-error-handling](reference/suspense-no-builtin-error-handling.md)
- 在服务端渲染中使用 Suspense → 请参阅 [suspense-ssr-hydration-issues](reference/suspense-ssr-hydration-issues.md)
- 在 Suspense 下，异步组件的加载/错误 UI 被忽略 → 请参阅 [async-component-suspense-control](reference/async-component-suspense-control.md)

### SSR
- 服务端与客户端渲染的 HTML 不同 → 请参阅 [ssr-hydration-mismatch-causes](reference/ssr-hydration-mismatch-causes.md)
- 共享的单例 store 导致用户状态在请求之间泄漏 → 请参阅 [state-ssr-cross-request-pollution](reference/state-ssr-cross-request-pollution.md)
- 仅限浏览器的 API 导致通用代码路径中的服务端渲染崩溃 → 请参阅 [ssr-platform-specific-apis](reference/ssr-platform-specific-apis.md)

### 性能
- 由于父组件传递了不稳定的 props，列表子组件发生不必要的重新渲染 → 请参阅 [perf-props-stability-update-optimization](reference/perf-props-stability-update-optimization.md)
- 尽管值等价，计算对象仍会重新触发 effect → 请参阅 [perf-computed-object-stability](reference/perf-computed-object-stability.md)

### SFC（单文件组件）
- 尝试从组件 script 块中使用具名导出 → 请参阅 [sfc-named-exports-forbidden](reference/sfc-named-exports-forbidden.md)
- 变量更改后未在模板中更新 → 请参阅 [sfc-script-setup-reactivity](reference/sfc-script-setup-reactivity.md)
- scoped 样式未应用于子组件元素 → 请参阅 [sfc-scoped-css-child-component-styling](reference/sfc-scoped-css-child-component-styling.md)
- scoped 样式未应用于动态 v-html 内容 → 请参阅 [sfc-scoped-css-dynamic-content](reference/sfc-scoped-css-dynamic-content.md)
- scoped 样式未应用于 slot 内容 → 请参阅 [sfc-scoped-css-slot-content](reference/sfc-scoped-css-slot-content.md)
- 动态构建时缺少 Tailwind 类 → 请参阅 [tailwind-dynamic-class-generation](reference/tailwind-dynamic-class-generation.md)
- 递归组件因名称冲突而无法渲染 → 请参阅 [self-referencing-component-name](reference/self-referencing-component-name.md)

### 插件
- 调试全局属性为何会导致命名冲突 → 请参阅 [plugin-global-properties-sparingly](reference/plugin-global-properties-sparingly.md)
- 插件不工作或 inject 返回 undefined → 请参阅 [plugin-install-before-mount](reference/plugin-install-before-mount.md)
- 插件全局属性在基于 setup 的组件中不可用 → 请参阅 [plugin-prefer-provide-inject-over-global-properties](reference/plugin-prefer-provide-inject-over-global-properties.md)
- 插件类型扩充错误破坏 ComponentCustomProperties 类型定义 → 请参阅 [plugin-typescript-type-augmentation](reference/plugin-typescript-type-augmentation.md)

### 应用配置
- 调用 mount 后，应用配置方法不再生效 → 请参阅 [configure-app-before-mount](reference/configure-app-before-mount.md)
- 由于 mount() 返回组件实例，在 mount() 后链式调用应用配置会失败 → 请参阅 [mount-return-value](reference/mount-return-value.md)
- 基于 require.context 的组件自动注册在 Vite 中失败 → 请参阅 [dynamic-component-registration-vite](reference/dynamic-component-registration-vite.md)