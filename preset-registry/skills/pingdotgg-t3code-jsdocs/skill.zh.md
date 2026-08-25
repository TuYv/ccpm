---
name: jsdocs
description: Write, insert, or update Effect public API JSDoc so it satisfies the jsdocs oxlint rule. Use when adding or fixing JSDoc comments, resolving jsdocs diagnostics, preparing docs for JSON extraction, or reviewing public API documentation.
---
使用此 skill 为 Effect 公共 API 编写格式规范的 JSDoc。

## 工作流程

更新公共 API JSDoc 时：

1. 在编辑前检查声明、实现、附近的测试以及相邻的 JSDoc。
2. 判断任务是单个 API 修复，还是模块完善工作。
3. 在保留正确信息和示例的同时，将注释重写为所需的文档结构。
4. 对于模块完善、复杂 API 或具有相关替代方案的 API，运行 `@see` 和 `**Gotchas**` 审查。
5. 运行范围最小的相关验证。

## 必需的文档结构

在 TypeScript 源代码中使用标准的多行 JSDoc 注释：

```ts
/**
 * Short description as one paragraph.
 *
 * **When to use**
 *
 * Optional practical usage guidance.
 *
 * **Details**
 *
 * Optional details for complex APIs, options, overloads, or behavior.
 *
 * **Gotchas**
 *
 * Optional edge cases, footguns, or surprising behavior.
 *
 * **Example** (Short title)
 *
 * Optional prose explaining the example.
 *
 * ```ts
 * const result = example()
 * ```
 *
 * @category constructors
 * @since 1.0.0
 */
```

## 正文规则

- 所有公共 JSDoc 正文均使用英文。
- 使用稳妥、实用的表达。
- 能使用普通词语时，不要使用术语。
- 不要刻意卖弄。
- 不要添加填充性章节。
- 简短描述是必需的，并且必须恰好是一个段落。
- 简短描述应当独立表达完整含义。不要依赖 `**When to use**` 才能让读者理解 API。
- 对于函数和方法，优先使用现在时、以动作为先的表达，例如
  `Creates`、`Returns`、`Checks`、`Provides`、`Represents`、
  `Converts`、`Decodes` 或 `Formats`。
- 对于技术值导出，使用一致的名词形式，例如 `Schema for`、`Layer that`、`Service that`、`Context reference that` 或 `Constructors and matchers for`。
- 当周围模块使用标准名词系列时，不要在规范技术名词前使用 `A` 或 `An`，例如优先使用 `Schema for ...`，而不是 `A schema for ...`。
- 当公共概念能够表达得更清楚时，不要描述实现机制。例如，相比只说明 API 使用了 `Data.taggedEnum`，优先使用 `Constructors and matchers for ...` 这样的表述。
- 除非是在说明真实的意外情况、注意事项，或与看似会发生变更的 API 之间存在有意义的对比，否则不要添加泛泛的纯函数性或不修改数据的说明。
- 可选章节必须按以下顺序出现：
  1. `**When to use**`
  2. `**Details**`
  3. `**Gotchas**`
- 仅当可选章节包含有用且非空的内容时，才添加该章节。
- 对于只有一个事实、选项、情况或注意事项的 `**Details**`、`**When to use**` 或 `**Gotchas**` 章节，优先使用正文而不是项目符号列表。当存在两个或更多并列事实、选项、情况或注意事项时，才使用项目符号。
- `**When to use**` 描述所记录 API 的正向使用场景。不要将其用作同级 API 的路由章节。如果需要提及相邻 API，应在 `@see` 标签文本中说明这一边界。
- 当 API 存在紧密的替代方案、权衡取舍或 `@see` 标签时，`**When to use**` 很重要。如果存在 `@see` 标签，请检查其引用的 API，并在能够澄清当前 API 自身使用场景时添加 `**When to use**`。
- `**When to use**` 必须以以下实用指导形式之一开头：`Use to`、`Use when`、`Use as` 或 `Use with`。避免使用诸如 `Use this...` 这样的模糊开头或项目符号列表。
- 优先使用面向读者的 `**When to use**` 表述，尤其是在句子描述用户目标时使用 `Use when you ...`。当第三人称名词短语主语（例如 `the input is ...`、`a service needs ...` 或 `values should ...`）会使句子变得生硬时，应避免使用。
- 一句好的 `**When to use**` 即使被复用为用户意图提示也应读起来自然，例如放在 `I need ...` 或 `I have ...` 之后。
- 区分 `short` 和 `**When to use**`：简短描述说明 API 是什么或做什么；`**When to use**` 说明何时选择它。
- 仅针对语义上有用的相关公共 API 添加内部 `@see` 标签。
- 将 `@see` 标签文本写成链接后的普通正文；不需要使用特殊分隔符。若简短解释有所帮助，优先采用 `@see {@link otherApi} for ...` 这样的形式。
- 简短描述、章节、示例和标签之间恰好使用一个空行。
- 不要使用诸如 `# Heading` 的 Markdown 标题，也不要使用诸如 `**Notes**` 的临时加粗标题；只能使用规定的标准标题。
- 示例必须使用 `**Example** (Title)`、可选的说明正文以及恰好一个非空的 `ts` 代码围栏。
- 示例标题在去除首尾空格并转换为小写后必须唯一。
- 示例标题应为简短的使用场景短语，而不是通用标签。
- 优先使用动名词或动作名词标题，使其接在 `for` 后面时读起来自然，例如 `Parsing JSON`、`Creating a scoped runtime` 或 `Comparing structs`。
- 避免使用祈使句标题，例如 `Parse JSON`；避免使用模糊标签，例如 `Syntax` 或 `Basic usage`；也避免使用标题式大小写的片段，例如 `String Ordering`。
- 保留短语中规范技术术语的大小写，例如 `Option`、`Effect`、`Schema`、`DateTime`、`HashMap`、`Base64` 和 `JSON`。
- 对于同一 API 的多个示例，使每个标题都描述该示例所展示的不同使用场景。
- 优先使用输出稳定且确定的示例。避免使用依赖堆栈跟踪、对象检查、`Error` 格式化、并发顺序、计时、随机性或环境相关格式的断言或 `console.log` 注释。示例可以假设使用 Node.js 控制台格式。直接输出 `Set` / `Map` 是可以接受的，前提是插入顺序确定且预期输出使用 Node 的格式；否则应展示稳定的属性。
- 不要使用 `@example`。
- 不要将 TypeScript 代码围栏放在 `**Example** (Title)` 章节之外。
- 行内 `{@link Symbol}` 目标必须解析为 TypeScript 符号；不要使用 `{@link}` 链接到 URL。
- 避免在正文中过度添加链接。仅当导航到该符号有助于读者选择或理解 API 时，才使用 `{@link Symbol}`。对于正在记录的 API、模块的核心类型、相邻的明显名称或反复出现的名称，优先使用普通代码格式，例如 `Cause`、`Effect` 或 `Context`。
- 不要记录模块级注释；此规则会忽略模块 JSDoc。
- `@internal` 表示该项目会被忽略；不要将其重写为公共文档。
- 默认导出会被忽略，不需要为其添加 JSDoc。
- 不要在检查的文件中添加不受支持的结构，例如枚举或空导出。
- 对于底层公共值，优先使用准确的类别，例如 `symbols`、`type IDs` 或 `prototypes`，而不是通过冗长的描述来弥补。

## 标签规则

存在多个标签时，按以下顺序排列：

1. `@deprecated`
2. `@default`
3. `@see`
4. `@category`
5. `@since`

不同声明类型的标签要求：

- 根声明必须包含 `@category` 和稳定 semver 的 `@since`，且不得使用 `@default`。
- 命名空间及命名空间内的声明必须包含稳定 semver 的 `@since`，可以使用 `@category`，且不得使用 `@default`。
- 成员 JSDoc 是可选的。存在时，遵循相同的正文和布局规则，可以使用可选的稳定 semver `@since`，可以使用非空的 `@default`，且不得使用 `@category`。
- 任何声明都可以使用带有非空消息的 `@deprecated`，以及多个带有非空内容的 `@see` 标签，用于指向在语义上有用的相关公共 API。

## 更新现有 JSDoc

修复或更新现有文档时：

1. 保留正确的事实和示例。
2. 将布局改写为标准模板。
3. 将用法指南移入 `**When to use**`，将行为细节移入 `**Details**`，将实际存在的注意事项移入 `**Gotchas**`。
4. 将 `@example` 标签和松散的 `ts` 代码围栏转换为 `**Example** (Title)` 小节。
5. 保留有效的 `@see`、`@deprecated`、`@default`、`@category` 和 `@since` 标签。
6. 移除不指向在语义上有用的相关公共 API 的 `@see` 标签。
7. 当链接目标从当前声明或模块的上下文中已经显而易见时，将多余的内联 `{@link ...}` 标签替换为普通代码格式。
8. 移除会为空的小节。

## 模块完善

当要求完善现有模块时：

1. 首先扫描模块中的本地文档模式、重复的 API 系列和分类约定。
2. 除非用户同时要求修改规则或源代码，否则应将更改集中在文档质量上。
3. 优先改进现有注释，而不是将每条注释都改写成全新的风格。
4. 保留示例，除非它们不正确、已过时、具有非确定性，或不符合要求的文档结构。
5. 完成前，对整个模块执行 `@see` 和 `**Gotchas**` 审查。

## See 审查

完善现有公共 API 模块时，始终执行专门的 `@see` 检查：

1. 在保留、修改或移除现有 `@see` 标签之前，检查这些标签及其引用的 API。
2. 当所记录的 API 是多个可执行类似操作的方式之一时，查找同一模块或 API 系列中的紧密替代项。
3. 仅当链接的 API 对理解所记录的 API 在语义上有帮助时，才保留或添加 `@see`。
4. 合适的 `@see` 目标包括同级 API、替代方案、逆向操作、更底层或更高层的变体、互补操作，以及与之紧密相关的返回类型、消费类型或配置类型和值。
5. 不要将 `@see` 用于实现依赖、宽泛概念、外部背景链接、仅仅共享某个单词或名称的 API、只在示例中使用的辅助 API、未文档化或私有成员，或仅仅具有一般兼容性的 API。
6. 保留或添加 `@see` 标签时，如果所记录 API 的自身用例无法从简短描述中明显看出，则加入 `**When to use**` 指南。将与同级 API 的比较保留在 `@see` 标签文本中。

## 易错点审查

在完善现有公共 API 模块时，始终执行一次专门的 `**易错点**` 审查：

1. 扫描现有正文，查找注意事项相关表述：警告、例外、限制、前置条件、特殊情况，或容易被误用的行为。
2. 检查实现及附近的测试，查找那些无法从类型签名或简短描述中明显看出的行为。
3. 当真实的注意事项描述了边界情况、易用错之处、前置条件、出人意料的行为或重要的失败模式时，将其从 `**Details**` 移至 `**易错点**`。
4. 仅当注意事项具体且对选择或使用 API 的读者有帮助时，才添加 `**易错点**`。
5. 如果在完善过程中没有添加任何易错点，请说明已执行易错点审查，并解释为什么没有值得记录的注意事项。

## 验证

运行与变更相匹配的最小范围验证：

- 对于包含生成文档的软件包中的 JSDoc 或示例变更，从该软件包目录运行 `pnpm docgen`。
- 运行 `pnpm lint`，因为该 lint 工具包含检查公共 API JSDoc 的自定义规则。
- 对于仅修改技能文档正文的变更，不要运行宽泛的验证。