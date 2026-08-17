---
name: product-ui-taste
description: Anti-slop skill for PRODUCT UI - dashboards, data tables, forms, multi-step flows, settings, list/detail, app shells. The agent reads the surface, budgets the frame first, and ships dense interfaces that are correct at every edge case (overflow, long labels, empty/error/loading states, i18n expansion, keyboard/a11y). House-system-first; maps to Carbon/Polaris/Atlaskit/Fluent/Primer/Material3/Radix-shadcn/Ant. The counterpart to taste-skill, which owns landing/portfolio/marketing.
---
# product-ui-taste：面向高密度产品界面的反粗制滥造 Skill

> 仪表盘、数据表格、表单、向导、设置、列表/详情、管理控制台、应用外壳。不适用于落地页、作品集或营销页面（这些应使用 `taste-skill`）。不适用于图表（这些应使用 `dataviz`）。不适用于原生移动端。
> 每条规则都具有**上下文相关性和机械性**。它们由你正在构建的界面触发，而不会自动生效。先研判界面、规划框架，再仅采用适合的规则。
> **配套约定：**`taste-skill` 明确将“仪表盘 / 高密度产品 UI / 数据表格 / 多步骤表单”交给“正确的工具”。本 Skill 就是该工具。如果需求一半是营销页面、一半是产品界面（例如嵌入实时仪表盘的落地页），请将 `taste-skill` 用于主视觉区/营销区块，将本 Skill 用于产品界面。切勿对同一组件同时使用两者。

---

## 0. 产品研判（进行其他任何操作前，先研判界面）

营销 UI 依赖第一印象。产品 UI 则服务于某人在真实数据环境下执行工作时的**第一百次**使用。粗制滥造的失败模式并非“模板化审美”，而是**一接触真实数据就崩溃的原型**——表格让整个页面横向滚动、按钮截断自己的标签、三种不同情形复用同一个灰色“无数据”框、用户误触一个字段后整个表单便被清空。

### 0.A 首先研判以下信号
1. **界面类型**——这是最重要的一项研判。类型包括：**索引/表格**（用于浏览、筛选、选择的记录列表）、**详情/记录**（一个实体及其字段和关联数据）、**仪表盘/概览**（KPI + 小组件 + 一两个表格）、**表单/设置**（输入与配置）、**多步骤流程/向导**（顺序执行的任务）、**控制台/可观测性**（日志、指标、部署）、**信息流/消息**（项目流）。大多数真实界面都是其中两三种类型的组合（索引 + 详情抽屉；仪表盘 + 下钻表格）。
2. **数据形态与规模**——在 p95 情况下有多少行、一行有多宽、单元格内容是规整还是参差不齐、数据是实时/流式还是静态、字段是否可能为空/null/极长。
3. **密度需求**——交易员的操作台和面向消费者的设置页面都属于“产品 UI”，但对密度的需求完全相反。需要判断：面向每天使用的专家用户（紧凑、键盘优先），还是偶尔使用的消费者（舒适、宽容）。
4. **后果等级**——主要操作是信息性的（查看）、可逆的（重命名、移动），还是破坏性/不可逆的（删除、部署、信用卡扣款）。这决定了确认机制、默认焦点以及是否适合自动保存。
5. **用户是谁，以及他们被允许执行哪些操作**——角色、只读查看者、套餐/许可证层级。产品 UI 存在营销 UI 永远不会有的状态：权限被拒绝、只读、套餐锁定（第 6.G 节）。现在就研判这些，而不是等构建完理想路径之后再考虑。
6. **现有系统**——是否已有 Carbon/Fluent/Polaris/Atlaskit 应用或内部 token 集？产品 UI 几乎从来都不是从零开始构建的。先匹配宿主系统，再引入审美取向。

### 0.B 生成前先用一行给出“产品解读”
在输出任何代码之前，先声明：**“我对此的解读是：这是一个面向 \<user> 的 \<surface type>，采用 \<density> 密度，\<data volume> 数据量，操作后果级别为 \<level>，基于 \<design system | house tokens | none> 构建。”**

示例：
- *“我对此的解读是：这是一个面向内部运营人员的索引+详情抽屉界面，采用紧凑密度，约 2,000 行数据（需虚拟化），操作后果可逆，基于内部系统构建（表格 + 侧边栏检查器）。”*
- *“我对此的解读是：这是一个面向终端客户的设置/表单界面，采用舒适密度，数据量较低，操作后果混合（账单操作 = 破坏性），基于内部系统的表单布局构建。”*

### 0.C 最重要的反默认原则：使用行，而不是卡片
让产品界面看起来像 AI 原型，最快的方式就是**把每条记录都包裹在带有徽章的卡片中**。用户需要扫描、筛选、排序或选择的密集数据应放在**行**中（列式数据使用表格，单行数据使用列表/列表项），横向铺满，带分隔线，行高为 32-40px。卡片是**小组件容器**（KPI 图块、图表面板、设置分组、图库条目），绝不能作为列表项的包装容器。[Material3 列表；Carbon] 如果面对记录列表时，你的第一反应是使用卡片网格，请停下来重新阅读这一行。

### 0.D 如果需求说明存在歧义，只问一个问题，然后继续
唯一值得询问的问题几乎总是关于**数据量或操作后果**（它们会改变整体架构）：“数据量最大时大约有多少行？”或“这个操作可逆吗？”其他一切都根据产品解读进行推断，并说明你的假设。不要进行访谈式追问。

### 0.E 反默认纪律
模型在产品 UI 中的默认倾向包括：卡片堆砌、会溢出页面的固定宽度 `<table>`、仅依靠 `disabled` 提交按钮进行验证、一个通用的空状态、`z-index: 9999`，以及每次加载都显示全页加载指示器。下文为每一种情况都提供了明确且正确的替代方案。当你发现自己正准备采用其中一种默认做法时，这就是打开对应章节的信号。

---

## 1. 三个旋钮（核心配置）

完成产品解读后，设置三个旋钮。与面向表现力营销场景、调节 VARIANCE / MOTION / DENSITY 的 taste-skill 不同，产品旋钮针对**信息工作**进行调节。产品 UI 几乎刻意不使用动效；动效用于反馈，而非装饰。

* **`DENSITY: 2`** - 1 = 舒适/消费级，2 = 标准，3 = 紧凑/驾驶舱式。决定行高、内边距尺度、字号，以及是否提供密度切换器。
* **`DATA_COMPLEXITY: 2`** - 1 = 简单列表（普通表格/列表），2 = 可排序+可筛选+可选择的表格，3 = 企业级网格（冻结列、虚拟化、列管理、实时数据）。
* **`CONSEQUENCE: 2`** - 1 = 信息展示/只读，2 = 可逆变更，3 = 破坏性/不可逆/财务相关。决定默认确认机制、是否适合自动保存、错误提示语气，以及“未保存的更改”提示需要多醒目。

**基线：`2 / 2 / 2`**（带详情视图的标准 SaaS 产品表格）。根据产品解读进行调整。

### 1.A 旋钮推断
| 信号 | DENSITY | DATA_COMPLEXITY | CONSEQUENCE |
|---|---|---|---|
| “内部管理/运营工具/专家日常主力工具” | 3 | 2-3 | 2 |
| “企业数据控制台/网格/分析” | 3 | 3 | 2 |
| “消费者设置/账户/引导流程” | 1 | 1 | 1-2 |
| “SaaS 产品仪表板（默认）” | 2 | 2 | 2 |
| “账单/删除/部署/权限界面” | 匹配 | 匹配 | 3 |
| “可观测性/日志/实时指标” | 3 | 3 | 1 |

### 1.B 用例预设
| 预设 | DENSITY | DATA_COMPLEXITY | CONSEQUENCE | 框架 |
|---|---|---|---|---|
| 内部管理工具 | 3 | 2 | 2 | AppShell + SideNav，选中时显示检查器 |
| SaaS 产品仪表板 | 2 | 2 | 2 | AppShell + SideNav，或 TopNav + TabList |
| 企业数据控制台 | 3 | 3 | 2 | AppShell + SideNav，全高度网格 |
| 消费者设置/账户 | 1 | 1 | 1-2 | AppShell + 设置模板（导航 + 表单面板） |
| 多步骤向导 | 1 | 1 | 2-3 | 居中列、步骤指示器，无干扰性的外围界面 |

### 1.C 调节项如何驱动输出
在推理中使用这些确切名称作为全局变量。`DENSITY` 控制行高以及是否采用密度切换器的决策（第 10.A 节）。`DATA_COMPLEXITY` 控制表格深入设计（第 7 节）要进行到什么程度。`CONSEQUENCE` 控制第 6.G、8.E、8.F、9.A 节。不要创造别名。

---

## 2. 产品原型 → 设计系统映射

产品 UI 几乎从不使用手写 CSS。首先根据宿主应用选择基础系统，其次再考虑产品原型。**每个应用只使用一个系统。**不要将 Carbon 与 Fluent 混用，也不要把 shadcn 塞进 Polaris 组件树中。

### 2.A 优先采用内部系统（查明，而非猜测）
如果应用已经有设计系统，则应以该系统为准，而你的首要任务是**查明它实际提供了什么**，而不是想当然。大多数成熟系统已经解决了本技能所关注的密集型界面问题，因此你很少需要退回到原始 CSS。猜测组件名称和 props，是智能体生成看似正确但无法编译的代码时最常见的原因。

在编写 UI 之前，请根据宿主系统的真实 API（其 CLI、文档站点或 `.d.ts` 文件）确认以下各项：

| 需求 | 要查找的内容 | 如何确认 |
|---|---|---|
| 全页面外壳 | 应用外壳原语及其导航插槽 | 系统文档中的“布局”或“应用外壳”页面 |
| 多窗格工具/检查器 | 布局与侧面板的组合，而不是两个浮动的 div | 文档中的“布局”页面；检查面板是否可调整大小 |
| 列式数据 | 系统的 Table 及其排序/选择/分页插件 | 组件参考文档，而不是博客示例 |
| 粘性列/冻结列 | 专用 hook 或插件（大多数系统都提供） | 在手动实现之前，先在文档中搜索“sticky”或“frozen” |
| 可调整大小的列 | 列大小调整 hook | 同上 |
| 分页页脚 | 表格分页 + 每页数量控件 | 组件参考文档 |
| 搜索 + 筛选工具栏 | 有别于普通搜索的工具栏/筛选组件 | 组件参考文档 |
| 单行记录 | List / Item 组合 | 组件参考文档 |
| 空区域 | EmptyState 组件 | 组件参考文档 |
| 状态/元数据 | 有别于 Badge 的状态指示器 | token/状态文档 |

**始终遵循此工作流：**找到系统已经提供的最接近的页面或区块模板，研究其布局骨架，然后阅读所使用的每个组件的真实 props。**绝不要编造 props。**优先使用系统自身的布局组件，而不是原始 `<div>`，以确保间距与系统的尺度保持一致。所有值都使用设计 token（`var(--color-*)`、间距 token），绝不要使用原始十六进制值或 px。Badge 仅用于计数和枚举状态；状态应使用状态指示器。

**系统桥接原则（化解矛盾）：** 第 5-10 节中的 CSS 机制（滚动归属、`position:sticky` 表头、冻结列偏移、z-index 层级、`min-width:0`）是在底层由成熟系统的钩子负责满足的**契约**。在这样的系统中，应优先使用钩子或插件，因为真正的粘性列钩子能够正确处理偏移、纯色背景和阴影分隔线。只有在以下情况下才回退到原始 CSS 契约：(a) 当出现内容穿透时，用它验证系统是否正确实现；或 (b) 完全处于设计系统之外时。如果系统 Table 中已有相应钩子，绝不要使用内联样式手写粘性列。

### 2.B 外部系统（匹配宿主系统，或按原型选择）
| 原型 / 简要需求 | 选择 | 原因 |
|---|---|---|
| IBM 风格的企业分析、密集网格 | `@carbon/react` + `@carbon/styles` | 最成熟的数据密度、2 倍网格以及空状态/加载状态模式 [carbon] |
| Microsoft / 企业 SaaS、DataGrid | `@fluentui/react-components` (v9) | 官方 Fluent 2、Overflow 原语、设计令牌 [fluent] |
| Atlassian / Jira 风格的产品 | `@atlaskit/*` + `@atlaskit/tokens` | 根据语义选择的间距令牌 [atlaskit] |
| 商家/管理后台、资源列表 | Polaris (`@shopify/polaris` or web components) | IndexTable、四状态理念、错误内容 [polaris] |
| GitHub 风格的开发工具框架 | `@primer/react` / `@primer/css` | PageLayout 地标区域、Blankslate、Truncate [primer] |
| 自适应/规范化布局、偏消费者产品 | `@material/web` + Material 3 tokens | 窗口尺寸类别、列表-详情/辅助窗格 [material3] |
| 自主持代码的轻量内部工具 | Radix Primitives + shadcn/ui + TanStack Table | 无样式的无障碍原语，样式由你掌控 [radix, tanstack] |
| 快速构建数据密集型企业 React 应用 | Ant Design or Mantine + Mantine React Table | 功能齐备的 Table/Form [ant, mantine] |
| 轻量、键盘优先（Linear/Vercel 风格） | Radix/shadcn + custom tokens | 密度 + 命令面板 + 克制 [linear, vercel] |

**诚实原则：** 如果应用属于以上类型之一，请使用官方软件包及其 Table/Form/Dialog。不要用原始 CSS 重新实现 Carbon 的数据表。不要导入某个系统的设计令牌后又覆盖其中 90% 的内容。

---

## 3. 框架优先的应用外壳架构

**在编写任何内容之前，先以像素为单位规划框架预算。** 真正的应用是自上而下构建的：选择外壳、命名各个区域、为每个区域分配明确的 px 预算、确定其容器策略和响应式行为，然后再填充内容。内容优先的布局方式（先编写各个部分，再把每个部分包裹在 Card 中）会产生一个带内边距的滚动列，看起来像原型。[大多数系统的布局文档]

### 3.A 选择外壳
- **AppShell**（页眉和/或侧边导航）——默认的全页面产品框架。
- **Layout + LayoutContent + LayoutPanel**——多窗格工具：资源浏览器、控制台、带检查器的主从详情界面。
- **普通内容列**——单个表单、设置部分或向导。

### 3.B 区域 px 预算（请牢记）
| 区域 | 预算 |
|---|---|
| 侧边导航 | 240-280px |
| 图标栏（折叠导航） | 64-72px |
| 详情 / 检查器面板 | 340-420px（可调整范围为 320-480） |
| 筛选 / 分面栏 | 220-260px |
| 行高 | 32px 紧凑 / 40px 标准 / 48px 舒适 [密集型系统的预算为 32-40；Carbon 提供 5 个相对层级，没有固定 px] |
| 页眉 / 顶部导航 | 48-64px（常见的应用栏约定） |

### 3.C 地标区域（不要混淆）
使用真实的地标为每个区域命名，并了解它们之间的区别 [primer PageLayout]：
- **页眉（Header）** - 位于顶部、占据完整宽度，承载应用框架控件。
- **内容区（Content）** - 主要区域，可伸缩以填满可用空间。
- **窗格（Pane）** - 位于内容区**旁边**的次要区域，高度仅与内容相同。用于检查器或辅助信息。
- **侧边栏（Sidebar）** - **全高**导航，与窗格不同。绝不要构建实际上是内容高度窗格的“侧边栏”，也不要构建实际上是全高导航的“窗格”。
- **页脚（Footer）** - 位于底部、占据完整宽度（状态栏、分页上下文）。

### 3.D 规范布局（识别并搭建脚手架）[material3]
- **列表-详情** - 左侧为列表，右侧为选中的记录。低于约 1024px 时，详情区域以覆盖层显示或变为单独的路由。
- **辅助窗格** - 主要内容约占 2/3，辅助窗格约占 1/3。
- **信息流** - 单一滚动信息流（行/气泡，信息流中不使用卡片）。
- **带检查器的主从布局**（工具类应用的骨干）- 选择某一行会打开一个**固定宽度的 LayoutPanel 检查器**，而不会跳转离开当前页面。添加 `resizable`。低于约 1024px 时将其以覆盖层显示，而不是压缩内容区。

### 3.E 营销 UI 中不会出现的应用框架控件
- **工作区/组织切换器** - 几乎每个 SaaS 应用框架都需要一个，固定在侧边导航顶部或页眉左侧，显示当前租户的名称/头像。点击后，通过下拉菜单（而非模态框）列出工作区；工作区达到 8 个以上时提供搜索字段，并包含“最近使用的工作区”分组，以及位于底部的“创建/加入”操作。它用于切换上下文（数据范围），而不是导航目的地。将其保持为单一元素；绝不要将租户选择分散到导航列表中。为每位用户持久化保存最后活跃的工作区。
- **全局命令面板**（Cmd/Ctrl-K）- 对于 DATA_COMPLEXITY >= 2 的键盘优先工具，这是最快的导航方式。应将其视为应用框架中的一等交互入口，而非可有可无的功能。
- **后台任务/异步状态托盘** - 当应用启动多个并发的长时间运行操作（导入、导出、部署）时，持久化通知托盘（一个带计数徽标的页眉图标，点击后打开任务下拉列表）优于为每个任务使用一个模态框。每个任务行都显示确定型进度条、取消入口，以及最终的成功/错误状态和结果链接。Carbon 的规则：如果等待时间超过几分钟，应允许用户离开，并在完成时通知用户。绝不要因为一个后台任务而阻塞整个 UI。[carbon loading]

### 3.F 各区域的容器策略（卡片与行，根据原型决定）
| 原型 | 容器策略 |
|---|---|
| 跟踪器/工作工具（问题、工单、CRM） | 仅使用行。采用边到边的分组列表，不使用卡片。 |
| 控制台/可观测性 | 仪表板小组件使用卡片网格；其他所有内容使用表格。 |
| 消息/信息流 | 使用行和气泡。信息流中不使用卡片。 |
| 媒体/图库 | 使用卡片网格（ClickableCard），详情中使用密集的元数据行。 |
| 设置/表单 | 使用 FormLayout 分区；仅使用卡片对危险操作/账单操作进行分组。 |

禁止：每个列表项使用一张卡片（卡片泛滥）、将堆叠的全宽卡片用作页面结构、嵌套卡片、将徽标用作装饰。

---

## 4. 布局硬性规则（违反任何一条都会交付不可用的成果）

* **滚动归属（产品 UI 中排名第一的布局缺陷）。** 每个滚动轴只能由**一个**包装容器负责（`overflow:auto`）。页面 `<body>` **绝不能**水平滚动。宽表格应在其自身容器内滚动，而不是将整个应用横向撑开。吸顶表头应使用限定在该滚动容器内的 `position:sticky`，**绝不能**使用相对于视口的 `position:fixed`。[carbon, ant table-scroll, tanstack] 如果两个嵌套元素都在同一轴上滚动，就说明存在缺陷。
* **每个吸顶元素都需要一个高度受限的祖先元素。** 如果没有祖先元素建立滚动边界，`position:sticky` 会悄无声息地失效。吸顶表头要求表格的滚动容器具有实际的最大高度。[css mechanics]
* **为包含文本的 flex 子元素设置 min-width:0。** flex/grid 子元素默认为 `min-width:auto`，这会拒绝收缩到小于内容尺寸，因此 `text-overflow:ellipsis` 会悄无声息地失效，子元素反而会将布局撑宽。flex 行内任何需要截断的文本，都必须在承载文本的子元素上设置 `min-width:0`。这是“为什么我的省略号不起作用”最常见的原因。[overflow-truncation]
* **预先按区域声明响应式约定。** 在填充内容之前，明确哪些区域会在哪些断点折叠、覆盖或隐藏。不要假设“Tailwind 会处理好”。导航应折叠为图标栏或画布外 MobileNav；检查器在约 1024px 以下以覆盖层形式显示；宽表格应保持水平滚动，而不是让列重新流式排列。
* **断点：使用尺寸类别，而不是设备名称。** 使用紧凑 / 中等 / 展开（Material 3），或将 Carbon 精确的 2x 网格断点（320 / 672 / 1056 / 1312 / 1584、8px 最小单位、16px 内边距、32px 沟槽）作为备用网格。[material3, carbon 2x-grid]
* **为可复用组件使用容器查询。** 同时出现在宽 Content 区域和窄 Pane 中的卡片或面板，必须响应**自身**宽度，而不是视口宽度。对于会在多个不同宽度区域中渲染的任何内容，应使用 `container-type` + `@container`，而不是视口媒体查询。[joshwcomeau, responsive-layout]
* **侧边栏折叠 = 画布外或图标栏，而不是原地缩窄。** 将 260px 的导航折叠为 180px 只会使其变得拥挤。应折叠为 64-72px 的图标栏（带工具提示），或将其滑动到画布外，同时保留一个始终可见的重新打开条。跨越调整尺寸/折叠操作时，应保留之前显示了哪些窗格，避免用户丢失上下文。
* **密度是一种布局模式，而不是 CSS 缩放。** 至少应将 DENSITY 调节项要求的密度预设实现为真正的切换功能（行高 + 内边距令牌切换），而不是使用浏览器缩放技巧。[i18n-a11y-density, carbon 5 row heights]
* **绝不要为文本容器硬编码固定宽度。** 徽章、按钮、表头、胶囊、标签必须使用自动布局（flex/grid、自适应内容宽度），以便文本能够重排或扩展。固定宽度的文本容器在使用真实数据和翻译文本时会发生裁切（第 10.B 节）。
* **对需要比较的数字使用等宽数字。** 用户需要纵向比较的任何数字列或数字列表都应使用 `font-variant-numeric: tabular-nums`，以便各位数字对齐。在指标列中使用比例数字是一个明显的破绽。

---

## 5. 溢出与截断目录（深入解析）

产品 UI 面对的是真实字符串：一个 90 个字符的文件路径、一个德语按钮标签、一个只有一个单词或长达四十个单词的客户名称。截断是手术刀，而不是默认方案。

### 5.A 绝不截断清单（强制）
**绝不截断主要内容或用于标识的内容**：标题、实体名称、唯一 ID、错误与验证消息、页面标题、按钮标签。截断仅适用于**次要/补充性**内容（描述、次要元数据、面包屑导航的中间部分）。[carbon overflow, primer truncate] 如果用于标识的字符串过长，应让它换行、为它提供更多空间，或使用保留首尾的中间截断（适用于路径/ID）——绝不能使用会隐藏两个记录之间区别部分的尾部省略号。

### 5.B 每个被截断的字符串都需要真正的完整文本后备方案
仅在悬停时显示的 `title` 工具提示**不是**无障碍后备方案：它无法满足仅使用键盘的用户、触摸设备用户和语音识别用户的需求。除悬停外，还应在获得焦点时提供完整文本，或以内联方式展开，或在详情视图中显示。[carbon, primer]

### 5.C 长按钮标签（强制，是产品 UI 的标志性特征）
**绝不截断按钮标签。** 让按钮根据其内容调整尺寸（“紧贴内容”），同时设置 `min-width` 下限，以满足点击目标的无障碍要求。如果标签很长（或经过翻译后变长），在考虑截断之前，最多允许换成 2 行，并重新评估标签文案。显示“保存更...”的按钮是有问题的设计。仅图标按钮需要提供 `aria-label` 和工具提示。[overflow-truncation, i18n]

### 5.D 单行省略号方案
`overflow:hidden; text-overflow:ellipsis; white-space:nowrap;`，**并且**在文本与滚动容器/行容器之间的每一层 flex 祖先元素上设置 `min-width:0`（第 4 节）。如果没有完整的 `min-width:0` 链，这段 CSS 不会生效。

### 5.E 多行截断方案（`-webkit-line-clamp`）
四个属性必须同时使用，否则不会生效：`display:-webkit-box; -webkit-line-clamp:N; -webkit-box-orient:vertical; overflow:hidden;`。**绝不要直接在被截断的元素上设置内边距**——截断计算会忽略内边距，导致文本溢出。如果需要内边距，请将截断元素包裹在一个带内边距的父元素中，或使用固定高度的后备方案（`line-height * N`）。[css-tricks line-clampin]

### 5.F 内容边界情况：计数、大数值、缺失数据（强制）
真实数据可能是 0、1 或 1,000,000——应为这三种情况全部进行设计，而不是只设计演示中的“3”。
- **零/一/多（复数形式）：** 每个计数字符串都应以正确的语法处理 0、1 和 N——“0 个项目”“1 个项目”“24 个项目”，绝不能出现“1 个项目们”或“24 项目”。使用支持 ICU/复数形式的格式化工具，绝不要拼接字符串；某些语言最多有 6 种复数形式。零值情况通常应进入空状态（第 6.C 节），而不是在完整布局中显示“0 个项目”。
- **非常大/精度非常高的数值：** 在信息密集的场景中使用缩写以便快速浏览（1.2k、3.4M、1.1B），但应确保用户可通过悬停/聚焦以及详情视图查看准确值；**绝不要缩写用户必须据此进行精确操作的数字**（例如发票总额、账户余额）。使用符合区域设置的数字分组方式（1,234.56 与 1.234,56）、在需要比较的列中使用 tabular-nums（第 4 节），并采用一致的缩写切换阈值。
- **缺失/null/不适用（通用规则，不仅适用于表格单元格）：** null 字段应呈现一致、低调的占位内容（“未设置”“-”“未知”），并在视觉上与空字符串和零明确区分。应针对每个字段确定 null 是表示“尚未设置”（提示输入）、“不适用”（简要说明），还是“因权限而隐藏”（第 6.G 节）——这三种情况应使用不同的占位内容，绝不能统一留空，让人误以为出现了渲染错误。
- **不可换行的长标记**（URL、哈希、文件路径、不含空格的 ID）：使用保留首尾的中间截断，或使用 `overflow-wrap:anywhere`；绝不要使用会隐藏用于区分内容的尾部省略号，也绝不要让标记撑破其所在列的宽度。

### 5.G 列标题与界面框架溢出
- **列标题**：最多换行至 2 行，之后截断，并通过工具提示显示完整标题。[carbon]
- **面包屑导航**：将中间部分折叠为省略号/溢出菜单，保留首项和末项。[carbon overflow]
- **工具栏 / 操作栏 / 标签页**：使用优先级增强型溢出（Fluent Overflow）：声明可见项的优先级顺序和 `minimumVisible` 下限，将其余项目移入“更多”菜单，并以相反的 DOM 顺序渲染，使第一项优先保留。[fluent]
- **较长的自由内容块**：可展开的正文使用“显示更多 / 收起”，列表使用“加载更多”（第 7.D 节）。

---

## 6. 状态矩阵（深入探讨）

每个数据界面都不只有理想路径。应从**三个粒度**设计完整矩阵：页面、组件/区域和字段。草率设计的典型问题是对每一种非理想状态都复用同一个灰色框。

### 6.A 四种基础状态，始终一并设计
对于任何加载数据的区域，在交付理想状态之前，先设计好**理想 / 加载中 / 空 / 错误**状态。[polaris four-states, nngroup]

### 6.B 加载时间阈值（强制要求）
- **< 1s**：不显示任何内容。一闪即逝的骨架屏，还不如短暂保持静止。
- **1-10s，整页/区域加载**：使用**与实际布局形状一致的骨架屏**（呈现其最终会变成的实际行/字段），绝不能只显示一个框架式灰色方框，也绝不能对结构化内容使用加载指示器。[nngroup skeleton, carbon loading]
- **> 10s，或耗时未知的任务**（上传、下载、转换、部署）：使用**确定型进度条**，绝不能使用不确定型加载指示器或骨架屏。对于耗时数分钟的任务，允许用户离开，并在完成后通知用户。[carbon]
- **对已显示数据的后台刷新**：保持旧内容可见，并显示一个不显眼的行内指示器。刷新时**绝不能再次清空**缓存内容，改为显示加载指示器/骨架屏。

### 6.C 空状态是三种不同的状态（强制要求）
绝不能在以下状态间复用同一个空状态组件/消息：
1. **从未使用过（首次运行）**——采用引导式语气：说明这是什么，并提供用于创建第一条记录的主要 CTA。[primer empty-states, pencilandpaper]
2. **筛选/搜索后无结果**——显示“未找到与 X 相关的结果”，并提供清除筛选条件的操作。数据确实存在；筛选条件才是无结果的原因。
3. **清零即成功**——“收件箱已清空”“没有提醒”。使用积极的语气，不提供会让用户产生负罪感的 CTA。
[carbon empty-states, atlaskit empty-state] 对于很小的磁贴/侧边面板，居中的纯文本空状态可以作为“不呈现实际布局形状”原则的例外。

### 6.D 错误状态绝不是空状态
加载失败**始终**属于 ErrorState，绝不能属于 EmptyState。错误文案应具体、通俗易懂、可指导行动（说明下一步该怎么做），并提供供技术支持使用的错误代码/id。通过一个共享的 ErrorState 组件处理所有错误，使语气和布局保持一致；绝不能只显示一句“发生错误”。[polaris error-messages, nngroup]

### 6.E 字段与行内状态
字段有各自的微状态：等待异步验证（第 8.D 节）、行内错误、成功确认、保存中/已保存（自动保存，第 8.E 节）。不要让字段级失败悄无声息地不执行任何操作。

### 6.F 部分加载、数据陈旧和离线状态（必须考虑）
在“已加载”和“失败”之间，还存在真实网络环境中会出现的各种状态：
- **部分加载/部分失败：** 当一个组合视图加载时，如果其中一个小组件失败，应让**该小组件在原位置失败**（显示其自身的内联 ErrorState 和重试操作），绝不能因为一个面板失败就让整个页面空白。一个损坏的区块导致仪表板所有区块都无法显示，就是缺陷。
- **陈旧/缓存/刷新中：** 显示最近一次已知正常的数据，并配以不显眼的“正在更新”指示器和“上次更新于 <time>”时间戳；后台刷新时绝不能重新显示空白骨架屏（第 6.B 节）。刷新失败时，保留陈旧数据，并显示一条非阻塞式的“无法刷新，当前显示 <time> 的数据”通知。
- **离线/连接断开：** 检测连接丢失，显示持续存在的非模态横幅，禁用变更操作或将其**加入队列**，并在重新连接后进行协调。绝不能让用户在一个实际上无法保存、却不作任何提示的表单中输入内容。
- **乐观更新契约：** 如果你在服务器确认之前就渲染变更结果，则必须提供回滚路径——写入失败时恢复之前的值，并显示清晰的错误信息。无法回滚的乐观更新，是数据完整性问题的明显信号。

### 6.G 权限和套餐状态（仅限产品 UI，必须考虑）
营销 UI 中没有这些概念；产品 UI 则离不开它们：
- **权限被拒绝/角色受限**：应有意识地决定是**禁用还是隐藏**。对于用户永远无法拥有的操作，应将其隐藏；对于用户可通过变更角色获得的操作，应将其禁用（并在悬停/聚焦时说明原因）。绝不能显示一个无法使用且没有任何解释的控件。
- **只读模式**：保持相同的布局，将输入内容呈现为静态值，并提供清晰的“只读”提示，而不是使用看起来像出了故障的灰色输入框。
- **套餐/许可证锁定**：锁定功能提示（“升级以解锁”）是一种独立状态，应有自己的组件——可见、有说明，并提供升级路径——而不是一个禁用的按钮。[应与宿主应用已经建立的先例保持一致。]

---

## 7. 数据表格深度解析（最具挑战性的产品界面）

根据 DATA_COMPLEXITY 控制实现深度。简单列表只需要 7.A-7.B；企业级网格则需要完整实现所有内容。**在设计系统中，应使用其 `Table` 及系统提供的插件/钩子；以下机制是这些钩子需要满足的契约，也是脱离设计系统时的实现指南。**

### 7.A 滚动归属与吸顶表头（强制要求）
由一个具有有限高度的容器同时负责两个轴向的滚动（`overflow:auto`）；页面本身绝不能横向滚动（第 4 节）。通过 `position:sticky; top:0` 实现吸顶表头，并将其作用域**限制在该容器内**。[carbon, ant table-scroll]

### 7.B 冻结/固定列（强制实现方案）
`position:sticky` + 显式的 `left:0`（或 `right:0`）偏移 + `z-index >= 10`（位于滚动表体之上）+ **纯色、不透明的背景，并且该背景还必须覆盖悬停和选中行状态** + 使用**内嵌 `box-shadow` 分隔线，绝不能使用 CSS `border`**（在粘性滚动时，边框会消失或被重复渲染）。如果缺少纯色背景，滚动内容就会从冻结列下方透出。[ant, mantine-react-table column-pinning, tanstack]

### 7.C 虚拟化（DATA_COMPLEXITY 3）
超过约 100-200 行时进行虚拟化。所需的 DOM 结构：**两个包装器**——外层 = 具有视口高度且可滚动，内层 = 完整虚拟内容高度（一个占位元素）。**切勿将 `<table>` 元素本身设置为完整虚拟高度**——这会扭曲行高，并导致粘性表头失效（粘性表头无法脱离一个过短的父元素）。[tanstack virtual #640] 在虚拟渲染期间，不要为每一行附加样式对象或创建菜单实例（性能灾难）；除非已进行记忆化，否则使用 `columnResizeMode:"onEnd"`。[ant, mantine]

### 7.D 分页、无限滚动与“加载更多”（决策树）
- 当索引中的项目超过约 50 个时，使用**分页**（Polaris 的具体阈值）；对于“查找特定项目 / 比较相距较远的项目 / 查看最前面的几个项目”这类任务，始终使用分页。[polaris, smashingmagazine]
- **无限滚动**：仅用于探索性、同质化、无尽的信息流——**绝不要**用于搜索结果或比较任务。如果使用，请实现 `history.pushState()`，以便后退按钮能够恢复滚动位置（超过 90% 的实现都没有正确处理这一点）。在移动端，一次加载一个较大的扁平批次（15-30 个项目），绝不要在滚动途中进行分块延迟加载（用户主动滚动期间发起的数据获取并不可靠）。[nngroup infinite-scrolling, baymard]
- **“加载更多”按钮**：对于有限但较长的列表，这是安全的折中方案；由用户控制数据获取。

### 7.E 选择、批量操作与选择状态持久化
- 行选择应支持按住 Shift 单击进行范围选择和全选。在文案中区分“选择全部 N 项（跨页面）”和“选择本页全部项目”。[polaris]
- **选择状态持久化（一个经典的企业级正确性缺陷）：**在分页、排序和筛选条件发生变化时，保留已选行的 **ID**；不要在页面切换时静默丢弃选择状态。显示一个持续更新的“已选择 N 项”计数，并使其在导航后仍然保留。
- 批量操作执行期间，禁用各行的操作，以防止发生冲突的变更。
- **工具栏操作上限：显示 5 个主要操作**，其余操作收纳到菜单中。[polaris]

### 7.F 筛选、分面与搜索（彼此不同）
- **搜索**（自由文本）和**筛选**（结构化谓词）是不同的控件；不要在没有说明的情况下将它们合并到一个输入框中。让每种筛选控件与其数据类型相匹配（日期范围、枚举多选、数值范围）。[data-table-mechanics; most systems ship a toolbar-filter component]
- **已应用筛选条件标签：**在表格上方以一行可移除的标签显示当前生效的筛选条件，并提供“全部清除”；对于分面较多的情况，还应提供分面侧边栏。这是如今已成为标准的 Jira/Linear/Notion 模式；如果没有这一标签行，用户就无法看出是什么条件正在筛选其数据，也无法撤销这些条件。

### 7.G 单元格内容
单元格承载长短不一的真实数据。按照第 5 节截断次要单元格中的内容（完整文本应可通过焦点访问），绝不要截断用于标识的单元格。数值列右对齐，并使用等宽数字（第 4 节）。空单元格 = 使用一致的“未设置”占位符（禁止使用长破折号；请使用“-”或“未设置”），绝不要留空，以免看起来像渲染错误。

---

## 8. 表单、验证与多步骤流程（深入解析）

### 8.A 标签位置
默认采用顶部对齐的标签（扫描速度最快，最适合本地化和移动端）。仅在垂直空间有限的密集型企业表单中使用右对齐标签。仅在需要刻意让用户放慢操作速度、谨慎完成任务时使用左对齐。切勿在本地化产品中使用右对齐标签（文本扩展会破坏列布局）。[lukew web-form, nngroup web-form-design]

### 8.B 验证时机
在字段**失去焦点**和**提交**时进行验证，而不是在用户输入尚未完成的值时逐个按键验证（不要在输入第一个字符时就高喊“电子邮件无效”）。实时正向辅助提示属于例外，例如密码强度提示。既要在字段旁显示行内错误，**也要**在提交时在顶部显示汇总错误摘要，绝不能只提供二者之一。[nngroup errors-forms, polaris inline-error]

### 8.C 切勿将禁用“提交”按钮作为唯一提示（强制要求）
对于包含 5 个以上字段的表单，**绝不能**将禁用“提交”按钮作为唯一反馈——用户无法知道缺少了什么。允许用户提交，然后显示汇总错误数量，并将焦点移至第一个错误。只有在非常简单（少于 3 个字段）的表单中，才可以禁用“提交”按钮。**提交失败后始终保留用户输入**——绝不能清空表单。[forms-flows, nngroup]

### 8.D 异步/远程字段验证
对其进行防抖，**并且**使用 `AbortSignal` 取消已被取代的请求——未取消的慢响应可能会覆盖更新且正确的结果（用户名可用性竞态）。[forms-flows]

### 8.E 自动保存（按 CONSEQUENCE 设置门槛）
- 按**逻辑字段组**自动保存，绝不能在每次按键时保存整个表单。
- **绝不能自动保存**密码、可见性/权限、保密性或具有财务影响的字段——这些字段需要显式手动确认（CONSEQUENCE 3）。
- 在失去焦点时，以及最后一次按键约 3 秒后触发。先显示“正在保存...”，然后显示“已保存 <relative time>”。
- 自动保存失败时，显示带有重试操作的**持久性**（不会自动消失）提示消息，绝不能静默失败。

### 8.F 多步骤流程/向导
- 步骤指示器必须映射到**真实**步骤；已完成的步骤应可点击以返回。不要使用虚假的“阶段 1 / 阶段 2”标签——应使用实际步骤的名称。[taste-skill tell parity]
- 要减少用户放弃向导的情况，应削减**字段数量**，而不是增加步骤。不要在流程中途插入追加销售内容。[baymard checkout-linear]
- 保持流程线性；分支型向导需要提供可见的流程图。

### 8.G 破坏性/不可逆操作确认（CONSEQUENCE 3，强制要求）
删除/部署/收费操作的确认对话框应将默认键盘焦点置于安全操作（“取消”）上，而不是破坏性操作上。使用 `role="alertdialog"`、`aria-modal="true"`，并让 `aria-describedby` 指向警告文本。对于后果严重的删除操作，要求用户输入资源名称后才能启用破坏性操作按钮。关闭对话框时，将焦点返回到打开该对话框的元素（或下一个符合逻辑的元素）。[w3 alertdialog, radix dialog]

---

## 9. 导航、覆盖层与分层（深入解析）

### 9.A 对话框/模态框
打开时将焦点限制在其中，关闭时返回焦点，按 Escape 键时关闭；仅在非破坏性场景下，点击覆盖层时关闭。即使在视觉上隐藏，`Dialog.Title` 和 `Dialog.Description` 也**绝不能省略**（屏幕阅读器会朗读它们）。[radix dialog, w3 dialog-modal]

### 9.B Toast / 通知
默认显示约 5000ms，**悬停和聚焦时暂停计时**，滑动关闭阈值约为 50px，并且可手动关闭。区分前台通知（用户自己的操作已成功）与后台通知（某些内容发生了变化），以确定屏幕阅读器的播报优先级。切勿在 Toast 中放置破坏性操作确认。[radix toast]

### 9.C 菜单、下拉菜单、标签页、组合框
完整支持键盘操作规范：方向键导航、Home/End、输入字符快速定位、巡游式 tabindex（第 10.D 节）。Tab 键用于在复合组件与下一处内容**之间**移动；方向键用于在组件**内部**移动。需要保持键盘可达的菜单项/标签项应使用 `aria-disabled`，而不是原生 `disabled`（后者会将其移出 Tab 键顺序）。[radix, w3 grid]

### 9.D z-index / 层叠上下文系统（强制要求，取代临时设置的 z-index）
- **为每个层级分配间隔较大的数值**，并统一定义为 token，例如：基础层 0、粘性层 100、下拉菜单 1000、粘性页头 1050、遮罩层/抽屉 1100、模态框 1200、弹出框 1300、Toast 1400、工具提示 1500。切勿孤立地手动微调某一个 z-index；应结合整个层级尺度进行调整。临时使用 `9999`/`99999` 是一个明显的警示信号。
- 在调试层级问题之前，**列举所有会触发层叠上下文的条件**：带有 z-index 的 `position:fixed/sticky`、`opacity < 1`、会指定上下文属性的 `transform` / `filter` / `will-change`、`contain`、`container-type`、`isolation:isolate`、顶层元素。[mdn stacking-context]
- **嵌套层叠上下文是不可分割的整体**：深层嵌套元素上再大的 z-index，**也无法**超越浅层祖先元素的同级元素。如果菜单被页头遮挡，应该修复祖先元素的上下文，而不是使用更大的数值。
- **遮罩层按打开顺序分层**，而不是按类型使用静态常量：最后打开的遮罩层位于最上方。在可用的情况下，使用层级管理器或平台顶层（`<dialog>`、popover API）。

---

## 10. 密度、国际化与无障碍（深入探讨）

### 10.A 将密度作为一等模式
提供 >= 3 种密度预设（舒适 / 标准 / 紧凑），并将其实现为真正的切换模式，用于替换行高和内边距 token，而不是通过缩小缩放比例来实现。[i18n-a11y-density] Carbon 提供 5 种行高；请根据 DENSITY 调节项的需求选择相应组合。

### 10.B 国际化文本扩展余量（强制要求）
在设计容器时为翻译后的文本预留空间，因为英语是文本最短的 UI 语言之一：
- 德语：通常增加 **+30-40%**，最坏情况下可达约 70%。
- 法语 / 俄语 / 西班牙语：增加 +20-25%。
- 芬兰语：最多增加 +100%（翻倍）。
- CJK：文本会缩短，而不是扩展。
切勿为文本容器硬编码固定宽度（第 4 节）。使用 flex/grid，让文本自动换行，而不是被裁剪。伪本地化（用带重音符号的填充字符包裹字符串）是一种快速冒烟测试，可以发现约 80% 的文本扩展问题。[crowdin, i18n-a11y-density]

### 10.C RTL
仅镜像**具有方向性**的图标（后退/前进箭头、V 形箭头、进度方向）。**切勿**镜像通用图标（时钟、播放、对勾、徽标）。即使位于 RTL 文本中，数字仍保持 LTR 书写方向。主要操作按钮移至左侧（即 RTL 阅读浏览的自然结束位置）。进度条从右向左填充。[crowdin]

### 10.D ARIA 网格键盘交互约定（任何包含可聚焦单元格的自定义网格/表格均必须遵循）
- **漫游 tabindex**：有且仅有一个单元格具有 `tabindex="0"`，其他所有单元格均为 `-1`；网格容器本身绝不能成为 Tab 键停靠点。
- 方向键用于在单元格之间移动，并且**在边界处停止**（到达行/列边缘时不循环）。
- **Home/End** 在当前行内移动；**Ctrl+Home / Ctrl+End** 跳转到网格的第一个/最后一个单元格。
- **Page Up/Down** 仅用于可滚动网格（移动约 5 行）。
[w3 grid data-grids] 如果你使用真正的设计系统 Table（Carbon、Fluent、Polaris、Ant），这些行为已由其处理——不要重复实现。只有在手动构建网格时才使用这套约定。

### 10.E 跨领域无障碍底线
- 触控目标 >= 44-48px（触控），>= 24px（高密度桌面界面）。[material3 accessibility]
- 使用 `:focus-visible`，绝不要使用会在鼠标点击时闪现的裸 `:focus`；绝不要在没有替代方案的情况下移除焦点轮廓。
- 每个仅含图标的控件都必须有 `aria-label`。
- 数字/日期/货币格式应感知区域设置；绝不要发布含义不明确的 `01/02/2025`。

---

## 11. 新手引导与渐进式披露

高密度产品在首次使用时容易让用户不知所措。应逐步展现强大功能；复杂性需要循序渐进。

**渐进式披露（默认机制）：**
- 将高级控件（批量编辑、列管理、已保存视图、API/webhook 配置）放在一次交互即可触达的位置（例如“More”、展开器或设置弹出框），而不是一次性全部显示在屏幕上。Linear 的原则是：上手简单，逐步增强。[linear]
- **经验法则：一个区域中有 >7 个控件时，就应触发渐进式披露。** 将主要的 3-5 个操作以内联方式分组，其余操作放入溢出菜单；把高级设置放在带标签的展开器后面，绝不要使用没有工具提示、含义不明的齿轮图标。
- 披露按界面区域分别处理，而非全局处理：不要隐藏用户两次点击前刚刚使用过的控件。

**首次运行（强制要求）：**
- 首次运行应显示**“从未使用过”空状态**（第 6.C.1 节），而不是空白网格或加载指示器。它应使用一行文字说明这个界面的用途，并指向唯一的首要操作（“Create your first project”），而不是提供包含十个选项的菜单。
- 仅当示例/演示数据有明确标识且可一键移除时，才可预置这些数据；绝不要留下用户无法分辨是真实数据还是虚假数据的虚构“Acme Inc”行。

**引导标记、导览、清单（除非可关闭，否则禁用）：**
- 任何引导标记、产品导览或新手引导清单都必须能够在第 1 步跳过，并且可以永久关闭；关闭状态应按用户跨会话保留（绝不要再次触发已关闭的导览）。无法跳过的导览，或没有关闭入口的清单，都是一个 **Tell**。
- 同一时间最多只能有一个活动导览；绝不要在模态框上叠加引导标记。
- 导览应指向真实 UI 中的真实控件；绝不要使用虚假的高亮截图。退出时应让用户返回可用状态，而不是陷入死胡同。
- 对用户进行区分：回访用户、有经验的用户以及受邀加入的团队成员应跳过首次运行流程；不要对加入已有数据的现有工作区的用户重新进行新手引导。

**从空状态到产生价值的路径：**每个空状态的 CTA 都必须在 <=3 个步骤内引导至真正能够创造价值的位置。只链接到文档的新手引导清单只是装饰。

---

## 12. 上下文感知的主动性（需要识别的规范骨架）

当产品解读与以下某种模式匹配时，应搭建完整骨架，而不是只实现其中一部分：
- **索引/表格页面**：标题 + 工具栏（搜索、筛选器、主要操作、密度）+ 已应用筛选条件标签 + 表格（吸顶表头、选择）+ 分页页脚 + 三种空状态 + 错误状态。
- **列表-详情/主从视图**：列表区域 + 在低于约 1024px 时以覆盖层形式显示的检查器 LayoutPanel +“未选择任何内容”空状态。
- **设置页面**：分区导航 + FormLayout 面板 + 自动保存或保存栏 + 仅在危险操作区周围使用 Card。
- **多步骤向导**：真正的步骤指示器 + 线性步骤 + 分步骤验证 + 审核步骤 + 非破坏性退出方式。
- **仪表盘/概览**：KPI 指标块行（Cards）+ 小组件网格 + 一到两个可下钻的 Tables（行）。
- **带批量操作的管理控制台**：表格 + 选择状态持久化 + 批量操作栏（最多显示 5 个操作，其余收进溢出菜单）+ 确认对话框。

### 12.A 区块库（参考实现）
完整的组件实现位于宿主系统中，此处不再重复：可通过宿主系统的模板/骨架命令或其文档（附录 B）访问。下面详细展示了三个高价值骨架，因为它们体现了最容易实现错误的约定；请将其视为规范形态，并根据宿主系统进行调整。

**区块 1 - 索引 + 详情抽屉（框架优先）：**
```tsx
// Budget the frame first: nav 256 | table flex | inspector 380
<AppShell sideNav={<SideNav>{/* nav */}</SideNav>} contentPadding={0}>
  <Layout>
    <LayoutContent>
      <ToolbarTableFilter /* search + status/priority filters + overflow (cap 5) */ />
      {/* applied-filter chips row + Clear all (Section 7.F) */}
      <Table
        plugins={[useTableStickyColumns, useTableColumnResize /*, pagination */]}
        /* selection persists by row id across page/sort/filter (Section 7.E) */
      />
      {/* pagination footer; three empty states + ErrorState wired per Section 6 */}
    </LayoutContent>
    <LayoutPanel width={380} resizable={{minSizePx: 320, maxSizePx: 480}} hasDivider isScrollable>
      {selected ? <DetailFields item={selected} /> : <EmptyState title="Nothing selected" />}
    </LayoutPanel>
  </Layout>
</AppShell>
// Below ~1024px: LayoutPanel overlays Content; SideNav becomes MobileNav.
```

**区块 2 - 表格滚动 + 吸顶表头 + 冻结列（系统钩子需要满足的 CSS 约定）：**
```css
/* ONE wrapper owns both scroll axes; page body never scrolls sideways (Section 4). */
.table-scroll { overflow: auto; max-block-size: 70vh; }            /* bounded height => sticky works */
.table-scroll thead th { position: sticky; inset-block-start: 0; z-index: 20; }
/* Frozen first column: sticky + offset + z + SOLID THEME-TOKEN bg + shadow divider, never border */
.col-frozen {
  position: sticky; inset-inline-start: 0; z-index: 10;
  background: var(--color-surface);                 /* must also cover hover/selected rows */
  box-shadow: inset -1px 0 0 var(--color-border);   /* not border-right (double-renders on scroll) */
}
```

**块 3 - 截断约定（单行 + 多行）：**
```css
.cell { min-inline-size: 0; }                        /* required on EVERY flex ancestor or ellipsis no-ops */
.cell .text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.clamp {                                             /* all four props; NO padding on this node */
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
```

---

## 13. 性能与可访问性护栏
- 表格加载/筛选响应应让人感觉即时；超过约 1 秒时显示乐观更新/加载反馈，超过 6.B 中的阈值时升级处理。
- 企业级网格性能：渲染时不得为每行分配样式/菜单对象；限定自动调整大小的范围；除非已做记忆化，否则使用 `columnResizeMode:"onEnd"`；超过约 100-200 行时使用虚拟化。
- 产品 UI 中的动效**仅用于反馈**：状态转换、焦点移动、行进入/离开。不得使用装饰性滚动动画、跑马灯或视差效果。所有动效都应遵循 `prefers-reduced-motion`。
- 核心网页指标仍然适用：CLS < 0.1（骨架屏必须预留实际尺寸，避免内容跳动），交互的 INP < 200ms。

---

## 14. 深色模式
由令牌驱动，每个应用锁定一个主题（遵循 taste-skill 第 8/11 节中的相同规范：应用内不得有区域突然切换为反色）。使用宿主系统的语义层令牌（`var(--color-*)`、Carbon `$layer`/`$border-subtle` 等），绝不硬编码灰色。应在两种模式下测试表格、冻结列（纯色背景必须使用**主题令牌**，否则在深色模式下会发生透色）、浮层和焦点环。只在应用外壳根节点设置一次主题，绝不按区段设置。

---

## 15. 产品 UI 的 AI 痕迹（禁止模式）

不同于 taste-skill 中落地页的 AI 痕迹。以下是模型伪造产品界面的典型特征。除非需求说明确实要求，否则严格禁止。

- **卡片泛滥**：每条记录都被包裹在 Card + Badge 中。应使用行。（第 0.C 节）
- **导致页面横向滚动的固定宽度 `<table>`**：没有独立承担滚动的包装容器。（第 4 节）
- **截断的按钮标签**（"Save chang..."）。根据内容确定尺寸。（第 5.C 节）
- **截断的标识性内容**（名称/ID/错误），且仅提供悬停可见的 `title`。（第 5.A-B 节）
- **将 `disabled` 的提交按钮作为包含 5 个以上字段的表单的唯一验证方式**。（第 8.C 节）
- **使用同一个通用空状态**处理首次使用、筛选结果为空和加载失败。（第 6.C-D 节）
- **"An error occurred"**，但不提供原因、操作或错误代码。（第 6.D 节）
- **永不结束的骨架屏**，或仅有框架、不反映真实布局的灰色方框。（第 6.B 节）
- **在缓存数据后台刷新时使用全页加载指示器**（重新清空用户正在阅读的数据）。（第 6.B 节）
- **使用透明背景的粘性/冻结列**（滚动时内容会透出）。（第 7.B 节）
- **临时随意设置的 z-index**（`9999`、`99999`），而不是分层的令牌尺度。（第 9.D 节）
- **固定宽度的徽章/标签/选项卡**，在德语/芬兰语文本扩展后被裁切。（第 4、10.B 节）
- **对本应保持键盘可访问的菜单/选项卡项使用原生 `disabled`**（应使用 `aria-disabled`）。（第 9.C 节）
- **将徽章用作装饰**，以及**在每一行滥用状态点**（状态标识只能少量、谨慎使用）。
- **在工作工具中使用炫技动效**（装饰性滚动/悬停动画）。（第 13 节）
- **虚假的步骤标签**（"Stage 1 / Stage 2"）、虚假的精确数字，以及已发布界面中的 "Jane Doe"/"Acme" 占位数据。
- **任何可见位置都不得使用长破折号（`—`）。** 标题、单元格、标签、空状态/错误文案、工具提示中均禁止使用，也不得将其用作表示“未设置”的单元格占位符。应使用连字符（`-`）。这是最常被违反的一项 AI 痕迹规则；零容忍。（taste-skill 第 9.G 节，内部规则）

---

## 16. 参考词汇（智能体应了解的名称）
应用外壳 / PageLayout（页眉 / 内容区 / 窗格 / 侧边栏 / 页脚）· 标准布局（列表-详情 / 辅助窗格 / 信息流）· 主从视图 + 检查器 · IndexTable / Resource List / DataGrid / Table · 冻结（固定）列 · 虚拟化 · 漫游式 tabindex · 层叠上下文 · 容器查询 · 骨架屏（形状映射）· Blankslate / EmptyState / ErrorState · 溢出菜单 / priority-plus · 已应用筛选条件标签 / 分面搜索 · alertdialog · 乐观更新与悲观更新 · 密度模式 · 伪本地化 · 命令面板 · 工作区切换器 · 任务/状态托盘。

---

## 17. 重新设计协议（审查现有的高密度界面）
在调整视觉样式之前，先审查比美观更重要的正确性问题：
1. **滚动归属**违规（页面横向滚动；嵌套的双重滚动）。
2. **主要内容被截断**；仅悬停时可用的后备方案。
3. **缺少状态区分**（用同一个空框表示三种状态；没有错误状态；缺少骨架屏）。
4. **冻结列内容透出**；粘性定位区域的背景透明。
5. **随意设置 z-index**；嵌套层叠上下文导致的分层错误。
6. **没有 i18n 缓冲空间**；文本容器采用固定宽度。
7. **键盘/a11y 缺陷**：没有漫游式 tabindex、直接使用 `:focus`、图标按钮没有标签、仅以禁用提交按钮作为提示。
先修复这些问题。然后再进行密度、令牌和视觉细节优化。保留宿主设计系统；不要以“重新设计”为由将 Carbon 替换为 shadcn。

---

## 18. 与 taste-skill 的关系 + 范围之外
- **移交给 `taste-skill`**：营销主视觉区、落地页、作品集、编辑类页面、重插画的品牌界面。如果一个界面一半是产品、一半是营销，应将其拆分：营销部分使用 taste-skill，产品界面使用此技能。切勿在同一个组件上同时运行两者。
- **移交给 `dataviz`**：图表/图形创作（颜色、编码、坐标轴）。此技能涵盖表格以及图表周围的仪表板框架，不涵盖图表内部。
- **范围之外**：响应式 Web 之外的原生移动端（iOS/Android）应用界面框架（标签栏、原生导航），这属于其他技能的工作；应明确指出，不要默默地近似实现。实时协作基础能力（在线状态、光标、OT）属于另一类问题。

---

## 19. 最终发布前检查

**逐项执行检查。如果任何一项未通过，该界面就尚未完成。**

- [ ] 是否陈述了**产品解读**（第 0.B 节的一句话说明）？
- [ ] 是否根据解读设置了**调节项**（DENSITY / DATA_COMPLEXITY / CONSEQUENCE），而不是默认采用基线值？
- [ ] 是否在内容之前以 px 为单位分配了**框架空间**；是否已命名外壳 + 地标区域（未混淆 Header/Content/Pane/Sidebar）？
- [ ] 高密度数据是否使用**行而非卡片**；Card 是否仅用于小组件；是否避免了卡片堆砌和嵌套卡片？
- [ ] **滚动归属**：每个轴是否恰好有一个包装器，页面是否从不横向滚动，粘性定位是否限定在该包装器内？
- [ ] 每个会截断内容的 flex 文本子项上是否都设置了 **min-width:0**？
- [ ] 是否**没有截断主要内容**（名称/ID/错误/标题）且**没有截断按钮标签**；每处截断是否都有可通过焦点访问的完整文本后备方案？
- [ ] **行截断方案**是否完整（全部 4 个属性，应用截断的节点上没有内边距）？
- [ ] 是否为每个数据区域设计了**四种状态**（理想/加载中/空/错误）？
- [ ] **加载阈值**：<1s 时不显示任何内容，骨架屏是否映射布局，>10s 时是否显示确定性进度，缓存刷新是否从不重新变为空白？
- [ ] 是否有**三种不同的空状态**（首次使用 / 筛选后为空 / 零即成功）；加载失败是否为带有原因 + 操作 + 代码的 ErrorState？
- [ ] 是否处理了**部分/过期/离线状态**（单个失败的小组件是否就地失败；缓存刷新是否从不重新变为空白；离线时是否排队或阻止操作并显示通知；乐观更新是否有回滚路径）？
- [ ] **内容边界情况**：计数是否正确处理单复数（0/1/N，不出现“1 items”）；大数字是否缩写且可查看精确值，并且在精度至关重要时绝不缩写；缺失数据是否使用与零值/空值不同的一致占位符？
- [ ] 在存在角色/层级的情况下，是否考虑了**权限/套餐状态**（禁用与隐藏、只读、套餐锁定）？
- [ ] **表格**：是否有拥有滚动的包装器 + 有界高度；粘性表头；冻结列是否具有纯色主题令牌背景 + 内嵌阴影分隔线 + z-index；虚拟化是否使用双包装器 DOM？
- [ ] 是否正确选择了**分页或无限滚动**（>50 条 / 搜索场景使用分页；仅信息流使用无限滚动，并配合 pushState + 移动端扁平批次）？
- [ ] **选择项是否持续保留**于翻页/排序/筛选过程中；批量工具栏是否限制为 5 项 + 溢出菜单？
- [ ] 存在筛选条件时，是否显示**已应用筛选条件标签**行；搜索和筛选是否为不同的控件？
- [ ] **表单**：是否默认使用顶部标签；是否在失焦+提交时验证；是否同时提供行内错误 + 错误摘要；提交失败时是否保留输入；字段数达到 5 个以上时，是否避免将禁用提交按钮作为唯一提示？
- [ ] **异步验证**是否经过防抖处理并通过 AbortSignal 取消？
- [ ] **自动保存**是否按组执行，是否不用于密码/权限/财务字段，是否提供 Saving/Saved 状态 + 失败时持续显示的重试操作？
- [ ] **破坏性操作确认**是否将焦点置于安全操作上、设置 `role=alertdialog`，并在关闭时恢复焦点？
- [ ] **对话框**是否捕获+恢复焦点、支持 Escape 关闭、包含 Title/Description；**消息提示**是否在悬停时暂停且可关闭？
- [ ] **z-index**是否来自分层令牌量表（没有 9999）；分层错误是否通过追踪层叠上下文来解决，而不是使用更大的数字？
- [ ] 每个文本容器是否都有 **i18n 缓冲空间**（德语增加 30-40%）；是否没有硬编码的固定宽度文本；比较用数字是否使用 tabular-nums？
- [ ] **RTL**是否仅镜像方向性图标（如果 RTL 在范围内）？
- [ ] **键盘/a11y**：自定义网格是否使用漫游式 tabindex、`:focus-visible`，图标按钮是否有标签，可通过键盘访问的菜单项是否使用 `aria-disabled` 而非 `disabled`，点击目标是否为 44px/24px？
- [ ] 当 DENSITY 要求时，是否提供**密度切换**（模式切换，而非缩放）？
- [ ] **深色模式**是否锁定一个主题，冻结列背景是否为主题令牌，是否已在两种模式下测试？
- [ ] **内部系统**：属性是否从真实文档中查明（没有虚构内容），布局是否不使用 `<div>`，是否仅使用令牌，Badge 是否仅用于计数，状态是否通过状态指示器呈现？
- [ ] 是否不存在第 15 节中的**产品 UI 痕迹**；所有可见内容中是否**完全没有长破折号**？
- [ ] 每个应用是否只使用**一个设计系统**（不混用 Carbon + Fluent）？

如果有任何一个复选框无法如实勾选，请在交付前修正。

---

# 附录 - 有来源支持的参考资料

## 附录 A - 各系统的安装方式 / CLI

```bash
# House design system - resolve the real API before writing UI.
# Most systems ship a CLI or a docs site; use whichever exists.
#   1. find the closest shipped page/block template
#   2. study its layout skeleton
#   3. read real props for every component (never invent props)

# IBM Carbon
npm install @carbon/react @carbon/styles
# Microsoft Fluent UI React v9
npm install @fluentui/react-components
# Atlassian Atlaskit (per-component + tokens)
npm install @atlaskit/tokens @atlaskit/dynamic-table
# Shopify Polaris
npm install @shopify/polaris
# GitHub Primer React
npm install @primer/react styled-components
# Radix Primitives + shadcn/ui + TanStack Table
npm install @radix-ui/react-dialog @radix-ui/react-toast @tanstack/react-table
npx shadcn@latest add table dialog
# Material Web (Material 3)
npm install @material/web
# Ant Design / Mantine + Mantine React Table
npm install antd
npm install @mantine/core @mantine/form mantine-react-table
```

## 附录 B - 权威来源（真实 URL，已通过 gsearch 验证）

汇总的主要来源：

**框架 / 布局**
- Carbon 2x 网格：https://carbondesignsystem.com/elements/2x-grid/usage/
- Primer PageLayout：https://primer.style/product/components/page-layout
- Material 3 规范布局：https://m3.material.io/foundations/adaptive-design/canonical-layouts
- Material 3 列表-详情：https://m3.material.io/foundations/layout/canonical-examples/list-detail
- Material 3 辅助窗格：https://m3.material.io/foundations/layout/canonical-examples/supporting-pane
- 容器查询：https://www.joshwcomeau.com/css/container-queries-unleashed/

**溢出 / 截断**
- Carbon 溢出内容：https://carbondesignsystem.com/patterns/overflow-content/
- Primer Truncate：https://primer.style/product/components/truncate/
- CSS line-clamp：https://css-tricks.com/line-clampin/

**状态矩阵**
- Polaris EmptyState：https://polaris-react.shopify.com/components/layout-and-structure/empty-state
- Carbon 空状态：https://carbondesignsystem.com/patterns/empty-states-pattern/
- Carbon 加载状态：https://carbondesignsystem.com/patterns/loading-pattern/
- Primer 空状态：https://primer.style/product/ui-patterns/empty-states/
- NN/g 骨架屏：https://www.nngroup.com/articles/skeleton-screens/
- NN/g 空状态设计：https://www.nngroup.com/articles/empty-state-interface-design/
- Pencil&Paper 空状态：https://www.pencilandpaper.io/articles/empty-states
- Polaris 错误消息：https://polaris-react.shopify.com/content/error-messages

**数据表格**
- Carbon 数据表格：https://carbondesignsystem.com/components/data-table/usage/
- Polaris IndexTable：https://polaris-react.shopify.com/components/tables/index-table
- Ant 表格滚动：https://ant.design/docs/blog/table-scroll-ghost/
- Ant 虚拟表格：https://ant.design/docs/blog/virtual-table/
- TanStack 列尺寸调整：https://tanstack.com/table/latest/docs/guide/column-sizing
- Mantine React Table 列固定：https://www.mantine-react-table.com/docs/guides/column-pinning
- NN/g 无限滚动：https://www.nngroup.com/articles/infinite-scrolling-tips/
- Baymard 结账流程线性化 / 分页上下文：https://baymard.com/blog/checkout-process-should-be-linear
- 分页、无限滚动与加载更多：https://www.smashingmagazine.com/2016/03/pagination-infinite-scrolling-load-more-buttons/

**表单 / 流程**
- LukeW Web 表单设计：https://www.lukew.com/ff/entry.asp?504
- NN/g Web 表单设计：https://www.nngroup.com/articles/web-form-design/
- NN/g 表单错误：https://www.nngroup.com/articles/errors-forms-design-guidelines/
- Polaris 行内错误：https://polaris-react.shopify.com/components/selection-and-input/inline-error
- Ant / 2x 表单模式：https://2x.ant.design/docs/pattern/form
- Mantine 表单验证：https://mantine.dev/form/validation/

**覆盖层 / 分层 / 无障碍**
- Radix 对话框：https://www.radix-ui.com/primitives/docs/components/dialog
- Radix 消息提示：https://www.radix-ui.com/primitives/docs/components/toast
- W3C ARIA 警告对话框：https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/
- W3C ARIA 模态对话框：https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
- W3C ARIA 网格数据表格：https://www.w3.org/WAI/ARIA/apg/patterns/grid/examples/data-grids/
- MDN 层叠上下文：https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Positioned_layout/Stacking_context

**设计令牌 / 密度 / 国际化**
- Atlaskit 设计令牌：https://atlassian.design/foundations/design-tokens
- Atlaskit 间距：https://atlassian.design/foundations/spacing
- Crowdin UI 本地化：https://crowdin.com/blog/best-practices-for-ui-localization
- Material 3 无障碍（目标尺寸）：https://m3.material.io/components/buttons/accessibility

**现代极简**
- Linear 方法：https://linear.app/method/introduction
- Vercel 设计指南：https://vercel.com/design/guidelines