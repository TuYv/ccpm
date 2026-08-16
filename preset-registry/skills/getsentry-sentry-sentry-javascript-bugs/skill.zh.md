---
name: sentry-javascript-bugs
description: 'Review Sentry React and TypeScript changes for bug patterns drawn from real production issues. Use when reviewing a frontend diff or PR, checking Warden findings, auditing the current branch, reviewing production-error patterns, or looking for common regressions in `static/`.'
allowed-tools: Read Grep Glob Bash
---
# Sentry JavaScript 前端错误模式审查

通过检查最常导致真实生产错误的模式，在 Sentry 前端代码中查找错误。

此技能总结了 428 个真实生产问题（201 个已解决、130 个已忽略、97 个未解决）中的模式，这些问题在 93,000 多名受影响用户中产生了超过 524,000 个错误事件。这些并非理论上的风险——它们是最常被发布到生产环境中的真实错误，并且已解决的问题都有已知的修复方案。

## 范围

审查用户、Warden 或当前分支差异所提供的代码。如果用户未提供目标，则审查当前分支差异。从发生变更的代码块或文件开始，仅在需要确认行为时向外扩展阅读范围。

1. 根据下方的模式检查项分析变更后的代码。
2. 必要时使用 `Read` 和 `Grep` 追踪初始差异之外的数据流。沿着组件 props、hook 返回值、API 响应结构和状态转换进行追踪，直到确认其行为。
3. 仅报告置信度为 **HIGH** 和 **MEDIUM** 的发现。

| 置信度     | 标准                                                                  | 操作                         |
| ---------- | --------------------------------------------------------------------- | ---------------------------- |
| **HIGH**   | 已追踪代码路径，并确认该模式符合某个已知错误类别                      | 报告并提供修复方案           |
| **MEDIUM** | 存在该模式，但上下文可能会降低其影响                                  | 报告为需要验证               |
| **LOW**    | 仅为理论风险，或已在其他位置得到缓解                                  | 不报告                       |

## 第 1 步：对代码进行分类

确定正在审查的代码类型，并加载相关参考资料。

| 代码类型                                                                | 加载参考资料                            |
| ----------------------------------------------------------------------- | --------------------------------------- |
| null/undefined 属性访问、可选链、对象解构                               | `references/null-reference-errors.md`   |
| 仪表板小组件、图表可视化、小组件 URL 生成                               | `references/dashboard-widget-errors.md` |
| Trace 视图、span 详情、Trace 树渲染                                     | `references/trace-view-errors.md`       |
| API 调用、响应处理、错误状态、fetch 封装器                              | `references/api-response-handling.md`   |
| React hooks、context providers、渲染循环、组件生命周期                  | `references/react-lifecycle-errors.md`  |
| AI Insights、LLM prompt 解析、gen_ai span 数据                           | `references/ai-insights-parsing.md`     |
| 数组操作、日期/时间值、数值格式化                                       | `references/range-and-bounds-errors.md` |

如果代码涉及多个类别，请加载所有相关参考资料。

## 第 2 步：检查主要错误模式

以下模式按照真实生产数据中的综合出现频率和影响程度排序。

### 检查 1：null/undefined 属性访问——158 个问题，46,337 个事件

代码访问了可能为 null 或 undefined 的值上的属性。这是 Sentry 前端中最常见的单一错误模式。

**危险信号：**

- 在未进行 null 检查的情况下访问 `.id`、`.slug`、`.name`、`.type`、`.match`、`.length`、`.charCodeAt`
- 对 API 响应中的数据使用 `object.property`，而不是 `object?.property`
- 未进行 null 验证就将 API 响应数据直接传递给实用函数
- 未检查元素是否存在，就访问由 `querySelector` 或 `useRef` 获取的 DOM 元素的属性
- 从可能在加载状态期间返回 null 的钩子或存储中解构对象
- 对已卸载的元素调用 `.dispatchEvent()`

**安全模式：**

- 可选链：`obj?.property?.nested`
- 默认值：`const value = obj?.field ?? defaultValue`
- 在调用函数前进行 null 防护：`if (data) { parser.parse(data); }`
- 在实用函数中，当参数为 null/undefined 时提前返回

### 检查 2：仪表板小组件输入验证 -- 6 个问题，90,482 次事件

小组件可视化组件在接收到非预期格式的数据时会抛出异常。

**危险信号：**

- 未检查数据是否包含可绘制值就渲染图表组件
- 对不支持多个查询的小组件类型调用 `getWidgetExploreUrl()`
- 将 undefined 的 `field` 值传递给 `parseFunction()` 或类似的字段解析器
- 未在小组件数据获取器中处理空 API 响应

**安全模式：**

- 渲染前验证数据结构：`if (!hasPlottableValues(data)) return <EmptyState />`
- 生成探索 URL 前检查小组件查询数量
- 对字段解析器进行防护：`if (!field) return null`

### 检查 3：追踪视图数据完整性 -- 12 个问题，328,482 次事件

追踪树渲染器和追踪详情视图遇到了违反结构假设的数据。

**危险信号：**

- 构建追踪树时未检测循环（或检测到了循环，但未妥善处理）
- 根据 span 数据中的 ID 查找项目时，未检查该项目是否可访问
- 生成追踪链接时，未验证 `traceSlug` 是否非空
- 在渲染路径中使用 `captureException` 时未进行去重（每个渲染周期都会触发）

**安全模式：**

- 通过将循环节点分离为孤立根节点来打破循环
- 生成链接前验证 traceSlug：`if (!traceSlug) return fallbackLink`
- 使用 ref 对错误捕获进行去重：`if (!capturedRef.current) { captureException(...); capturedRef.current = true; }`
- 渲染 span 详情前检查项目访问权限

### 检查 4：API 响应结构假设 -- 31 个问题，24,019 次事件

前端代码假设 API 响应具有特定结构，但响应为空、为 undefined，或具有非预期的状态码。

**危险信号：**

- 未处理正文为空的 200 响应（例如，`GET /customers/{orgSlug}/` 返回 200，但没有响应正文）
- 未在订阅流程中处理 402（需要付款）状态码
- 未在变更端点中处理 409（冲突）状态码
- 将 `UndefinedResponseBodyError` 视为非预期错误（它表示 API 未返回可解析的正文）
- 假设 SelectAsync 选项始终能够成功加载

**安全模式：**

- 解析前检查响应体：`if (!response.body) return null`
- 在 catch 块中处理特定的 4xx 状态码
- API 获取失败时提供空状态作为回退，而不是抛出异常

### 检查 5：违反 React 生命周期规则 -- 10 个问题，2,595 次事件

组件违反 React 渲染规则，导致无限循环或崩溃。

**危险信号：**

- 在没有正确依赖数组的情况下，于 `useEffect` 中无条件设置状态
- 在组织上下文加载完成前就会渲染的组件中调用 `useOrganization()`
- 在 provider 边界之外使用 `useContext()`
- 将对象而非字符串/元素作为 React 子元素传递
- 组件在挂载时立即触发重新渲染

**安全模式：**

- 始终为 `useEffect` 提供依赖数组
- 对上下文 hook 添加保护：`const org = useOrganization(); if (!org) return <Loading />`
- 将依赖组织信息的路由包裹在 provider 边界内
- 渲染前验证元素类型：`if (typeof Component !== 'function') return null`

### 检查 6：AI Insights 数据解析 -- 2 个问题，3,005 次事件

对 AI 提示消息和 gen_ai span 数据进行 JSON 解析时，无法处理非标准格式。

**危险信号：**

- 在没有 try-catch 的情况下，对 `ai.prompt.messages` span 属性调用 `JSON.parse()`
- 假设所有 AI 模型响应都能生成有效的 JSON
- 未处理多模态 AI 消息的 "parts" 格式

**安全模式：**

- 对外部数据的所有 `JSON.parse` 调用都使用 try-catch 包裹
- 解析前检查是否以 `[` 或 `{` 开头
- 解析失败时，提供原始文本回退渲染

### 检查 7：数组和边界验证 -- 15 个问题，3,120 次事件

数组操作和数值格式化所使用的值超出有效范围。

**危险信号：**

- 使用 `result.push(...largeArray)`（数组过大时会崩溃）
- 将未限制范围的值传递给 `toLocaleString({maximumFractionDigits: n})`
- 使用未经验证的时间戳构造 Date 对象
- 在没有深度限制的情况下递归渲染组件

**安全模式：**

- 对于可能很大的数组，使用 `concat` 或迭代式 push
- 限制数值格式化参数的范围：`Math.min(100, Math.max(0, precision))`
- 构造日期前进行验证：`if (isNaN(new Date(ts).getTime())) return fallback`
- 对深层嵌套结构使用带显式栈的迭代式渲染

### 检查 8：逻辑正确性 -- 不基于模式

检查完上述所有已知模式后，对变更后的代码本身进行分析：

- 每条代码路径是否都返回正确的类型（或 JSX）？
- 条件语句的所有分支是否都得到处理（尤其是缺少 `else` 或 switch 中的 default 情况）？
- 是否有任何 prop 或 state 值（null、undefined、空数组、空字符串）可能导致意外行为？
- hook 依赖数组是否正确？缺少依赖会导致闭包陈旧；额外依赖会导致无限循环。
- 如果此组件在异步操作期间卸载，是否进行了清理？

只有在能够追踪到触发该 bug 的具体输入时才报告。不要报告理论上的隐患。

**如果所有检查均未发现潜在问题，请停止并报告零个问题。不要为了填充报告而编造问题。当代码中不存在符合这些模式的缺陷时，空结果就是正确的输出。**

每个代码位置只应在与之匹配的最具体模式下报告一次。不要在多项检查中重复标记同一行。

## 第 3 步：报告问题

对于每个问题，请提供审查工具所需的证据：

- 精确位置
- 严重性和置信度
- 可实际触发问题的输入或状态
- 根本原因及后果
- 可用时，提供一个与之匹配的生产环境先例
- 具体的代码修复方案；如果审查工具支持，最好采用统一差异格式

修复建议必须包含实际代码。绝不能建议将注释或文档字符串作为修复方案。

不要自行规定输出格式——响应结构由审查工具控制。