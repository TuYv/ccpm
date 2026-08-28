---
name: interaction-design-board
description: >-
  Generate several genuinely different, runnable HTML interaction prototypes for
  one product surface, combine them in an interactive Design Board, collect
  structured selection/remix feedback, and only then hand the approved behavior
  to production implementation. Use when a user asks for multiple clickable UI
  versions, interaction alternatives, progressive-disclosure options, a Design
  Board, HTML prototypes, test-time scaling for product design, or says the visual
  styling is acceptable but the hierarchy, workflow, layout, or interaction still
  feels unprofessional. Prefer this over static image exploration when the decision
  depends on what happens after clicking, expanding, selecting, filtering, or moving
  through states.
---
# 交互设计板

将交互不确定性转化为可检查的证据。保持产品的真实事实和设计语言不变；充分改变交互架构，让用户能在生产代码发生变化之前体验其中的权衡。

## 路由请求

- 当选择取决于行为、状态、工作流、层级或渐进式披露时，使用此技能。
- 对于静态视觉风格校准和图像矩阵，使用 `design-style-picker`。
- 对于全新的产品级设计系统，使用 gstack 的 `design-consultation`；对于静态生成的模拟稿，使用 gstack 的 `design-shotgun`。
- 如果已经选定视觉方向，但用户仍需要比较可点击的交互结构，请返回使用此技能。
- 对于已经确定的单行 CSS 调整，或用户已经提供经过批准的交互规格且仅要求实现时，不要使用此技能。

## 不可妥协的结果

产出一个决策，而不是一个图库：

1. 多个可运行的 HTML 候选方案必须保持相同的业务事实、产品范围、设计令牌和可用操作。
2. 每个候选方案都必须体现不同的交互假设，而不是仅仅更换外观。
3. Design Board 必须让用户能够操作每个候选方案、记录具体反馈、选择其中一个，或请求一次有明确名称的混合改版。
4. 在用户批准交互行为之前，不得开始生产实现。

静态截图只能作为辅助证据。截图无法证明折叠状态、键盘路径、选择模型或任务交接。

## 工作流

### 1. 冻结决策契约

在生成变体之前，将一份简明契约写入会话工作区：

- **用户任务：** 操作者试图完成的真实任务。
- **决策范围：** 正在比较的单个页面、组件或边界明确的旅程。
- **不可变事实：** 每个变体都必须保留的真实对象、标签、状态、权限、操作和数据语义。
- **现有语言：** 必须保持可识别的现有令牌、组件、导航、密度和品牌资产。
- **首屏不变量：** 在任何披露之前必须保持可见的内容。
- **交互状态：** 用户必须能够实际操作的有意义状态。
- **停止条件：** 已批准的变体或明确的混合改版说明；暂不进行产品编辑。

对于现有产品，在编写契约之前，先检查其渲染页面和实现。不要用看似合理的示例数据替代未知事实。如果某些未知信息对交互选择并非必要，应将其标记为未知或省略。

在提出候选架构之前，阅读 `references/interaction-design-method.md`。其中包含用于判断一个方向是否合理的层级、渐进式披露、比较和无障碍规则。

### 2. 提出不同的交互架构

默认提出三个候选方案。只有在存在另一个独立的交互假设时才增加候选方案；不要用细微变体充斥设计板。

对于每个候选方案，说明：

- 关于它如何帮助用户完成工作的假设；
- 它将什么置于首要位置；
- 它延后处理或隐藏什么；
- 可能的权衡；
- 原型中必须正常工作的状态和操作。

保持决策契约不变。改变导航/选择/披露/操作归属或信息顺序——不要同时改变颜色、文案和数据。可用的模式包括命令优先、队列-详情、对象驱动、比较驱动和账本优先，但应根据当前任务推导候选方案，而不是为了凑齐模式配额。

### 3. 生成相互隔离的可运行候选方案

为每个候选方案在产品源代码树之外的会话工作区中创建一个自包含的 HTML 文件。将 CSS 和 JavaScript 内联；避免运行时网络依赖，以便每个原型都能在 Board 中运行。

当有可用的独立工作线程上下文时，为每个工作线程分配一个候选方案，并使用相同的冻结决策契约和仅属于该候选方案的假设。不要让工作线程看到彼此的输出。这种隔离是测试时扩展机制：它保留不同的假设，而不是让它们收敛成相似方案。如果工作线程不可用，则按串行方式生成，但在开始下一个候选方案之前重新阅读冻结的契约，而不是前一个候选方案。

每个候选方案都必须实现所声明的状态。没有任何交互作用的装饰性按钮不算交互原型。使用真实的本地状态；不要模拟产品并不具备的后端响应。

### 4. 构建并打开 Design Board

使用 `references/board-contract.md` 创建 `board.json`，然后运行：

```bash
SKILL_ROOT="<absolute directory containing this loaded SKILL.md>"
python3 "$SKILL_ROOT/scripts/build_board.py" \
  --manifest <session-dir>/board.json \
  --output <session-dir>/design-board.html
```

预期输出：

```text
BOARD_BUILT variants=<derived count> output=<absolute path>
```

构建器会拒绝字节级完全相同的候选方案、路径遍历、缺失的声明状态，以及静态外部样式、脚本或媒体。Board 还会向每个沙箱候选方案注入禁止网络访问的 Content Security Policy，使动态 JavaScript 无法创建未声明的运行时依赖。修复候选方案；不要为了让 Board 构建成功而削弱任一边界。

如果 gstack 的设计可执行文件已经安装，请从当前活动的 gstack Skill 安装位置解析其绝对路径；不要假设 `$D` 在新 shell 中存在。然后捕获服务器打印的确切 Board URL：

```bash
GSTACK_DESIGN="<resolved gstack design executable>"
SERVER_OUTPUT="$("$GSTACK_DESIGN" serve \
  --html <session-dir>/design-board.html --timeout 1800 2>&1)"
printf '%s\n' "$SERVER_OUTPUT"
BOARD_URL="$(printf '%s\n' "$SERVER_OUTPUT" | sed -n 's/^BOARD_URL: //p' | tail -1)"
test -n "$BOARD_URL"
```

如果无法解析该可执行文件，或命令没有打印 `BOARD_URL`，则使用宿主环境的浏览器打开工具直接打开 `design-board.html`。直接文件模式仍然可用：Submit 和 Remix 会下载 `feedback.json` 或 `feedback-pending.json`，供代理读取。Board 本身就是选择器；聊天仅作为备用渠道。

### 5. 观察任务，而不是凭感觉

要求用户在每个候选方案中执行相同的代表性任务。记录：

- 他们首先注意到了什么；
- 他们在哪里知道或不知道下一步该做什么；
- 哪些披露帮助他们发现了必要的证据，或将其隐藏了起来；
- 哪个状态转换感觉自然或出人意料；
- 哪些元素应当保留、拒绝或重新组合。

不要用数字评分，或声称打磨得最完善的候选方案就是最佳方案，来取代这些观察结果。用户可以选择一个候选方案，也可以组合多个候选方案中明确指出的部分。

当出现 `feedback-pending.json` 时，保留已接受的部分，修改被指出的失败维度，仅重新生成受影响的候选方案，并在同一会话目录中构建一个带版本号的 Board 文件。如果已有 gstack Board 正在提供服务，请重新加载该确切的 Board，而不是在旧的源路径上再次调用 `serve`：

```bash
curl -sS -X POST "${BOARD_URL%/}/api/reload" \
  -H 'Content-Type: application/json' \
  -d '{"html":"<absolute-versioned-board-path>"}'
```

预期响应：`{"reloaded":true}`。重复调用 `serve` 可能会复用现有的 Board 实例，而不会读取已更改的字节，因此它们不是重新加载机制。要求用户在同一个 Board URL 中重试该任务。当反馈不再改变决策时，停止增加轮次。

### 6. 在生产实现之前冻结审批结果

用户确认你的反馈摘要后，再按照 `references/board-contract.md` 中的 schema，将 `approved.json` 写入 Board 旁边。记录：

- 选定的候选方案或重新组合的候选方案；
- 已批准的交互规则和首屏不变量；
- 被拒绝的权衡取舍；
- 用户实际操作过的状态；
- 尚未明确的问题；
- 原型文件的确切身份。

然后——也只能在这之后——在产品中实现。保留当前的设计系统和真实数据契约。使用项目的前端实现和视觉 QA 技能，然后在真实浏览器中验证同一个代表性任务。像素级相似是不够的；已批准的状态转换和信息顺序必须得到保留。

如果项目有设计 SSOT，请在实现过程中将已批准的交互决策写入其中。保留会话反馈和原型文件作为证据；不要将其中会变化的值复制到通用项目指令中。

## 失败边界

- 不要将每个候选方案都变成不同的产品或数据模型。
- 不要让静态图像生成替代可运行的交互。
- 当身份、当前状态、主要证据或下一步操作对于做出决策而言是必要信息时，不要将它们隐藏在渐进式披露之后。
- 在用户操作过候选方案之前，不要实现看似胜出的方案。
- 不要将原型写入生产组件目录。
- 不要根据作者自己的点击流程声称完成了可用性验证。Agent QA 可以发现损坏的状态；用户的任务观察才决定交互。

## 交付

返回 Board 路径或 URL、候选方案假设、反馈/审批产物路径、已执行的浏览器验证，以及明确的下一步：迭代 Board、实现已批准的候选方案，或停止。