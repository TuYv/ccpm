---
name: better-writing
description: >-
  UX writing and interface copy, from voice and button labels to error messages and empty states. Use when writing or reviewing any user-facing text: button and link labels, form errors, placeholders, settings labels, onboarding flows, notifications, or empty states. Triggers on UX writing, microcopy, interface copy, product copy, copywriting, button labels, link text, error messages, empty states, placeholder text, settings labels, capitalization, title case, sentence case, voice and tone.
---
# 消失在界面中的文案

清晰简洁胜过巧妙机智，一致性胜过多样性，而最好的错误消息，是重新设计交互，让错误根本不会发生。编写或审查任何面向用户的文本时，都应遵循这些原则。

文案的呈现方式（通过 `text-transform` 控制大小写、截断、智能标点）由 `better-typography` skill 负责；错误标记和播报（`aria-invalid`、live regions）由 `better-accessibility` skill 负责；为翻译后的字符串预留空间由 `better-layout` skill 负责。

## 快速参考

| 类别 | 使用时机 |
| --- | --- |
| [审查输出格式](review-output.md) | 严重程度等级、问题表格、验证、结论 |

## 核心原则

### 1. 了解现有文风

在编写或审查之前，检查界面附近的文案、产品术语、本地化约定，以及任何文风或内容风格指南。在品牌特征经过刻意设计、且仍然清晰并适合当前场景的情况下，应予以保留。只有当与通用的朴素语言存在差异会造成不一致、歧义、翻译风险或不合适的语气时，才将其视为问题。

### 2. 统一的文风，灵活的语气

产品应有一种统一的文风，由现有系统确立，而不是在局部编辑时临时创造。术语要保持一致：如果菜单中使用的是 "Archive"，提示消息中就不能写成 "Move to storage"。语气应根据场景的重要程度灵活调整：

| 场景 | 语气 |
| --- | --- |
| 成功、引导、空状态 | 温暖，可以轻松一些 |
| 常规操作、设置 | 中性、简洁 |
| 错误、破坏性确认 | 冷静、直白，完全不诙谐 |
| 数据丢失、安全 | 严肃、明确 |

### 3. 直接称呼读者

在说明性的界面文案中，应直接称呼读者为 "you"，而不是 "the user"。当错误消息中的 “we” 会造成歧义或读起来像是在推卸责任时，应避免使用：优先使用 “Unable to load content”，而不是 “We're having trouble loading this content”。在低风险场景中，只要清晰明确，就应保留已经确立的第一人称品牌文风。谨慎使用所有格（使用 “Favorites”，而不是 “Your Favorites”），绝不要无意中切换叙述视角。

### 4. 朴素词语胜过巧言妙语

选择容易理解的词语，删去每一个不必要的词。不要使用无法顺利翻译的习语、俗语或幽默。避免不必要的性别表达：使用 "Subscribers can post recipes"，而不是 "each subscriber can post his or her recipes"。根据输入设备选择匹配的动词：触摸设备使用 "tap"，指针设备使用 "click"，两者都可能时使用 "select"。绝不要通过在变量两侧拼接片段来构造句子（`"You have " + n + " new messages"`）；不同语言的词序会发生变化，因此应使用完整的模板字符串，并正确处理复数形式。

### 5. 按钮以动词开头

按钮标签应以动词开头，明确说明具体操作："Send"、"Save draft"、"Delete project"。绝不要使用 "OK!"、"Let's go!"，也不要在涉及重要后果的操作中只使用 "Yes"/"No"。确认按钮应重复说明后果，使用户无需阅读正文也能回答对话框："Delete this project?" 应提供 `Delete project` 和 `Cancel`，而不是 `Yes` 和 `No`。

### 6. 一致的流程用语

多步骤流程使用统一的词汇：“Get Started”用于进入流程，“Continue”或“Next”（二选一）用于推进，“Done”用于完成。在不同步骤中交替使用同义词，会让用户疑惑这些按钮是否有不同的作用。

### 7. 链接应描述其目标位置

脱离上下文时，链接文本也应有意义；屏幕阅读器用户会通过页面链接列表进行导航。使用“Read the billing docs”，不要使用“Click here”（这也违反了触摸设备上的设备动词规则），当同一页面上有多个链接时，也不要只写一个“Learn more”。为每个链接补充具体对象：“Learn more about exports”。

### 8. 统一的大小写规则

针对每种元素类型（所有按钮、所有标题）选择标题式大小写或句首字母大写，并始终保持一致；句首字母大写是更稳妥的默认选择：更平和，不需要逐词处理大小写，也更易于本地化。“Save Changes”与“Discard changes”并列显示，会显得不够严谨。

### 9. 设置应描述开启状态

为切换开关标注开启时会发生什么：“Send read receipts”，用户会据此推断关闭状态。不要标注否定状态（“Don't send read receipts”），否则会让切换开关变成双重否定。对于被引用的设置，应直接链接到该设置，而不是描述如何找到它：使用“Notification settings”链接，而不是“Go to Settings > Notifications > Email”。

### 10. 错误信息应说明修复方法，并紧邻出错位置

错误信息是一条紧邻出错字段的指引：

| 不佳 | 更好 |
| --- | --- |
| That password is too short | Choose a password with at least 8 characters |
| Invalid name | Use only letters for your name |
| Oops! Something went wrong. | Unable to save. Check your connection and try again. |

不要责备用户，不要使用“oops”，也不要使用感叹号。以积极的方式表达提示（“Use only letters”，而不是“Don't use numbers or symbols”），并在用户犯错之前显示这些提示，而不是事后才显示。如果同一个错误持续影响许多用户，应重新设计交互，而不是重新措辞。

### 11. 空状态应指明下一步

空状态应说明此处是什么，以及如何填充内容，并提供一个明确的下一步操作：

```html
<!-- Bad: a shrug -->
<p>No results.</p>

<!-- Good: orientation plus a next step -->
<p class="font-medium">No projects yet</p>
<p class="text-sm text-zinc-500">Projects keep your tasks and files together.</p>
<button class="mt-4">Create a project</button>
```

搜索和筛选的空状态应指出查询内容，并提供退出方式：“No results for 'quarterly'. Clear filters”。不要把重要的持久信息放在空状态中；一旦有内容出现，这些信息就会消失。

### 12. 占位符是示例，不是标签

占位符用于展示预期格式（`name@example.com`、`DD/MM/YYYY`）。占位符绝不能作为字段唯一的标签：用户输入后它会消失，并且每个字段都应保留可见标签。

## 常见错误

| 错误 | 修复方法 |
| --- | --- |
| 本地改写忽略了产品既有的术语或语气 | 在提出修改建议前，检查附近的文案和样式指南 |
| 指导性界面文案中使用“The user” | 直接用“you”称呼读者 |
| “We're having trouble…”掩盖了责任或恢复方式 | 使用直接的状态和下一步：“Unable to load content” |
| 在确认破坏性对话框中使用`OK` / `Yes` | 重复说明后果：“Delete project” |
| 第 2 步使用“Continue”，第 3 步使用“Next” | 在整个流程中统一使用一套词汇 |
| 使用“Click here”或只写“Learn more”作为链接文本 | 描述链接目标：“Read the billing docs” |
| “Save Changes”与“Discard changes”并列 | 每种元素类型采用统一的大小写规则 |
| 使用“Don't send read receipts”作为切换开关标签 | 标注开启状态：“Send read receipts” |
| “Oops! Something went wrong.” | 在出错字段旁说明应采取的操作 |
| 用“No results.”作为完整的空状态 | 提供定位信息，并通过下一步操作引导用户继续 |
| 让占位符承担标签的作用 | 使用可见标签；占位符展示格式 |
| `"You have " + n + " messages"` | 使用包含复数形式处理的完整模板字符串 |

## 报告

当所有已确认的问题都按照 [review-output.md](review-output.md) 中的格式报告，并包含验证结果和结论时，独立的写作审查即告完成。在 `better-interface` 下，则以其格式为准。