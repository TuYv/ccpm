---
name: setup-engine
description: "Configure the project's game engine and version. Pins the engine in CLAUDE.md, detects knowledge gaps, and populates engine reference docs via WebSearch when the version is beyond the LLM's training data."
argument-hint: "[engine] | [engine version] | refresh | upgrade [old-version] [new-version] | no args for guided selection"
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Edit, WebSearch, WebFetch, Task, AskUserQuestion
model: sonnet
---
调用此技能时：

## 1. 解析参数

四种模式：

- **完整规格**：`/setup-engine godot 4.6` — 已提供引擎和版本
- **仅引擎**：`/setup-engine unity` — 已提供引擎，将查询版本
- **无参数**：`/setup-engine` — 完全引导模式（引擎推荐 + 版本）
- **刷新**：`/setup-engine refresh` — 更新参考文档（参见第 10 节）
- **升级**：`/setup-engine upgrade [old-version] [new-version]` — 迁移到新的引擎版本（参见第 11 节）

---

## 2. 引导模式（无参数）

如果未指定引擎，则运行交互式引擎选择流程：

### 检查是否存在游戏概念
- 如果 `design/gdd/game-concept.md` 存在，则读取该文件 — 提取类型、规模、目标平台、美术风格、团队规模，以及 `/brainstorm` 给出的任何引擎推荐
- 如果不存在游戏概念，则告知用户：
  > “未找到游戏概念。建议先运行 `/brainstorm`，以明确你想要构建什么 — 它还会推荐一个引擎。或者告诉我你的游戏构想，我可以帮你选择。”

### 如果用户想在没有游戏概念的情况下进行选择，请按以下顺序提问：

**问题 1 — 过往经验**（始终先通过 `AskUserQuestion` 询问此问题）：
- 提示：“你以前使用过以下哪些引擎？”
- 选项：`Godot` / `Unity` / `Unreal Engine 5` / `Multiple — I'll explain` / `None of them`
- 如果用户选择了某个特定引擎 → 推荐该引擎。过往经验的重要性高于所有其他因素。与用户确认并跳过决策矩阵。
- 如果选择“None”或“Multiple” → 继续询问以下问题。

**问题 2-6 — 决策矩阵输入**（仅当用户没有过往引擎使用经验时）：

**问题 2 — 目标平台**（始终通过 `AskUserQuestion` 将此问题作为第二个问题询问 — 平台因素会在考虑任何其他因素之前排除某些引擎或显著提高其权重）：
- 提示：“这款游戏的目标平台是什么？”
- 选项：`PC (Steam / Epic)` / `Mobile (iOS / Android)` / `Console` / `Web / Browser` / `Multiple platforms`
- 直接用于生成推荐的平台规则：
  - 移动端 → 强烈推荐 Unity；Unreal 并不适合；Godot 适用于简单的移动游戏
  - 主机 → Unity 或 Unreal；Godot 的主机支持需要第三方发行商，或投入大量额外工作
  - Web → Godot 可以顺利导出到 Web；Unity WebGL 可用；Unreal 的 Web 支持较差
  - 仅 PC → 所有引擎都可行；由其他因素决定
  - 多平台 → Unity 在 PC、移动端和主机之间拥有最佳的可移植性

1. **什么类型的游戏？**（2D、3D，还是两者兼有？）
2. **主要输入方式？**（键盘/鼠标、游戏手柄、触控，还是混合输入？）
3. **团队规模和经验？**（单人初学者、有经验的单人开发者、小型团队？）
4. **是否有强烈的语言偏好？**（GDScript、C#、C++、可视化脚本？）
5. **引擎许可预算？**（仅限免费，还是可以接受商业许可？）

### 给出推荐

不要使用会排除引擎的简单评分矩阵。应根据以下真实的权衡因素分析用户情况，然后在提供完整背景信息的前提下给出 1-2 个推荐。最后始终应由用户做出选择 — 绝不要强行给出定论。

**对各引擎优缺点的坦诚分析：**

**Godot 4**
- 真正的优势：2D（同类最佳）、风格化/独立游戏 3D、快速迭代、永久免费（MIT）、开源、学习曲线最平缓，最适合希望拥有完全控制权的独立开发者
- 实际的局限：与 Unity/Unreal 相比，3D 生态较为薄弱（针对 3D 特定问题的教程、资产和社区解答更少）；在 Godot 中开发大型开放世界 3D 游戏非常困难，且基本未经验证；导出到主机平台需要借助第三方发行商或投入大量额外工作；专业就业市场较小
- 许可现状：真正免费，永远没有收入门槛。MIT 许可证意味着一切成果都归你所有。
- 最适合：任何规模的 2D 游戏；风格化/氛围型 3D 游戏；范围有限的 3D 世界（非开放世界）；重视学习曲线的首个游戏项目；任何规模下预算都受到严格限制的项目

**Unity**
- 真正的优势：中等规模 3D 游戏和移动游戏的行业标准；庞大的资产商店与教程生态；C# 是一门专业编程语言；为独立游戏提供最佳的主机认证支持；几乎每种游戏类型都有强大的社区支持
- 实际的局限：2023 年的许可争议损害了开发者的信任（曾提出按运行次数收费，随后又撤回——政策发生变化的风险依然真实存在）；C# 的初期学习曲线比 GDScript 更陡；对于简单项目，其编辑器比 Godot 更臃肿
- 许可现状：收入低于 $200K 且安装量低于 200K 时免费（Unity Personal/Plus）。只有游戏真正取得成功后，成本才会变高——大多数独立游戏永远不会达到这一门槛。2023 年的争议值得了解，但对大多数独立开发者而言，目前的实际条款是合理的。
- 最适合：移动游戏；中等规模的 3D 游戏；面向主机平台的游戏；具有 C# 背景的开发者；需要大型资产商店的项目；2-5 人团队

**Unreal Engine 5**
- 真正的优势：同类最佳的 3D 视觉效果（Lumen、Nanite、Chaos physics）；AAA 和照片级写实 3D 的行业标准；对大型开放世界的支持成熟且经过生产验证；Blueprint 可视化脚本降低了 C++ 的使用门槛；非常适合面向高端 PC 或主机平台的游戏
- 实际的局限：学习曲线最陡；编辑器最臃肿（编译时间长、项目体积大）；对于风格化/2D/小规模游戏而言过于重量级；C++ 确实很难；不适合移动端或 Web；总收入超过 $1M 后需支付 5% 的版税
- 许可现状：只有单个游戏的总收入超过 $1M 后，才需支付 5% 的版税。对于首款游戏或任何收入未达到 $1M 的游戏，无需支付任何费用。这一门槛足够高，因此大多数独立开发者永远不需要支付版税。
- 最适合：AAA 级 3D；大型开放世界游戏；照片级写实视觉效果；具有 C++ 经验或愿意使用 Blueprint 的开发者；面向高端 PC/主机平台，且将视觉保真度作为核心卖点的游戏

**针对特定游戏类型的指导建议**（请在推荐时考虑这些因素）：
- 任何风格的 2D → 强烈推荐 Godot
- 风格化/氛围型/范围有限的 3D 世界 → Godot 可行，Unity 是可靠的替代选择
- 3D 开放世界（大型、无缝）→ Unity 或 Unreal；Godot 尚未在生产环境中得到验证
- 照片级写实/AAA 级 3D → Unreal
- 移动端优先 → 强烈推荐 Unity
- 主机平台优先 → Unity 或 Unreal；Godot 的主机支持需要额外工作
- 恐怖/叙事/步行模拟 → 任何引擎均可；应根据美术风格和团队经验进行选择
- 动作 RPG/类魂游戏 → 3D 项目选择 Unity 或 Unreal；社区支持和资产在此类游戏中很重要
- 2D 平台游戏 → Godot
- 策略/俯视角/RTS → 根据是 2D 还是 3D 选择 Godot 或 Unity

**推荐格式：**
1. 使用对比表格，将用户的具体考量因素作为行
2. 给出首选推荐，并提供坦诚的理由
3. 指出最佳备选方案，以及应在何种情况下改选该方案
4. 明确说明：“这只是一个起点，而不是最终定论——你随时可以迁移引擎，而且许多开发者会在不同项目之间切换引擎。”
5. 使用 `AskUserQuestion` 确认：“你觉得这个推荐合适吗，还是想探索其他引擎？”
   - 选项：`[Primary engine] (Recommended)` / `[Alternative engine]` / `[Third engine]` / `Explore further` / `Type something`

**如果用户选择“Explore further”：**
使用 `AskUserQuestion` 提供针对具体概念的深入探讨主题。始终根据用户的实际构想生成这些选项——不要使用通用选项。至少应始终包括：
- 首选引擎对于此构想的具体局限性（例如，“Godot 3D 在 [genre] 方面究竟能做到什么程度？”）
- 备选引擎对于此构想的具体权衡
- 语言选择对此构想所面临技术挑战的影响
- 任何特定于此构想的技术问题（例如，自适应音频、开放世界流式加载、多人游戏网络代码）

用户可以选择多个主题。深入回答每个选定主题，然后再返回引擎确认问题。

---

## 3. 查询当前版本

引擎选定后：

- 如果已提供版本，则使用该版本
- 如果未提供版本，则使用 WebSearch 查找最新稳定版本：
  - 搜索：`"[engine] latest stable version [current year]"`
  - 向用户确认：“[engine] 的最新稳定版本是 [version]。使用此版本吗？”

---

## 4. 更新 CLAUDE.md 技术栈

### 语言选择（仅限 Godot）

如果选择了 Godot，请在展示拟议的技术栈**之前**询问用户要使用哪种语言：

> “Godot 支持两种主要语言：
>
>   **A) GDScript** — 类似 Python、Godot 原生、迭代速度最快。最适合初学者、独立开发者，以及有 Python 或 Lua 背景的团队。
>   **B) C#** — .NET 8+，Unity 开发者更为熟悉，IDE 工具支持更强（Rider / Visual Studio），在繁重逻辑处理方面有轻微性能优势。
>   **C) Both** — 使用 GDScript 编写游戏玩法/UI 脚本，使用 C# 开发性能关键型系统。这是一种高级配置——除 Godot 外，还需要 .NET SDK。
>
> 此项目将主要使用哪一种？”

记录该选择。它将决定 CLAUDE.md 模板、命名约定、专家路由，以及整个项目中针对代码文件启动哪个代理。

---

读取 `CLAUDE.md`，并向用户展示拟议的技术栈变更。
询问：“我可以将这些引擎设置写入 `CLAUDE.md` 吗？”

在进行任何编辑之前，等待用户确认。

更新技术栈部分，将 `[CHOOSE]` 占位符替换为实际值：

**对于 Godot**——使用与上述所选语言相匹配的模板。有关全部三种变体（GDScript、C#、Both），请参阅本技能底部的**附录 A**。

**对于 Unity：**
```markdown
- **Engine**: Unity [version]
- **Language**: C#
- **Build System**: Unity Build Pipeline
- **Asset Pipeline**: Unity Asset Import Pipeline + Addressables
```

**对于 Unreal：**
```markdown
- **Engine**: Unreal Engine [version]
- **Language**: C++ (primary), Blueprint (gameplay prototyping)
- **Build System**: Unreal Build Tool (UBT)
- **Asset Pipeline**: Unreal Content Pipeline
```

---

## 5. 填写技术偏好

更新 CLAUDE.md 后，创建或更新 `.claude/docs/technical-preferences.md`，并填入适用于相应引擎的默认值。先阅读现有模板，然后填写：

### 引擎与语言部分
- 根据第 4 步中所做的引擎选择填写

### 命名约定（引擎默认值）

**对于 Godot** — 有关 GDScript、C# 和两者兼用的变体，请参阅**附录 A**。

**对于 Unity (C#)：**
- 类：PascalCase（例如 `PlayerController`）
- 公共字段/属性：PascalCase（例如 `MoveSpeed`）
- 私有字段：_camelCase（例如 `_moveSpeed`）
- 方法：PascalCase（例如 `TakeDamage()`）
- 文件：使用与类匹配的 PascalCase（例如 `PlayerController.cs`）
- 常量：PascalCase 或 UPPER_SNAKE_CASE

**对于 Unreal (C++)：**
- 类：带前缀的 PascalCase（Actor 使用 `A`，UObject 使用 `U`，结构体使用 `F`）
- 变量：PascalCase（例如 `MoveSpeed`）
- 函数：PascalCase（例如 `TakeDamage()`）
- 布尔值：使用 `b` 前缀（例如 `bIsAlive`）
- 文件：与去掉前缀后的类名匹配（例如 `PlayerController.h`）

### 输入与平台部分

使用第 2 节中收集的答案（或从游戏概念中提取的信息）填写 `## Input & Platform`。使用以下映射推导各项值：

| 目标平台 | 游戏手柄支持 | 触摸支持 |
|-----------------|-----------------|---------------|
| 仅 PC | 部分（推荐） | 无 |
| 主机 | 完整 | 无 |
| 移动设备 | 无 | 完整 |
| PC + 主机 | 完整 | 无 |
| PC + 移动设备 | 部分 | 完整 |
| Web | 部分 | 部分 |

对于**主要输入方式**，使用该游戏类型的主导输入方式：
- 面向主机的动作/RPG/平台游戏 → 游戏手柄
- 策略/点击式/RTS → 键盘/鼠标
- 移动游戏 → 触摸
- 跨平台 → 询问用户

展示推导出的值，并在写入前请用户确认或调整。

填写后的部分示例：
```markdown
## Input & Platform
- **Target Platforms**: PC, Console
- **Input Methods**: Keyboard/Mouse, Gamepad
- **Primary Input**: Gamepad
- **Gamepad Support**: Full
- **Touch Support**: None
- **Platform Notes**: All UI must support d-pad navigation. No hover-only interactions.
```

### 其余部分
- **性能预算**：使用 `AskUserQuestion`：
  - 提示："我现在应该设置默认性能预算，还是留待以后设置？"
  - 选项：`[A]` 立即设置默认值（60fps、16.6ms 帧预算、适用于相应引擎的绘制调用上限）/ `[B]` 保留为 `[TO BE CONFIGURED]` — 等我确定目标硬件后再设置
  - 如果选择 `[A]`：填入建议的默认值。如果选择 `[B]`：保留占位符。
- **测试**：建议适用于相应引擎的框架（Godot 使用 GUT，Unity 使用 NUnit 等）— 添加前先询问。
- **禁止的模式**：保留为占位符 — 不要预先填充。
- **允许的库**：保留为占位符 — 不要预先填充项目当前并不需要的依赖项。仅当某个库正在被实际集成时才将其添加到此处，不要进行推测性添加。

> **防护规则**：切勿向允许使用的库中添加推测性的依赖项。例如，除非本次会话中正在实际开始 Steam 集成，否则不要添加 GodotSteam。发布后集成所需的库应在相关工作开始时添加到允许使用的库中，而不是在引擎设置期间添加。

### 引擎专家路由

还应根据所选引擎，在 `technical-preferences.md` 的 `## Engine Specialists` 部分填入正确的路由：

**对于 Godot**——请参阅**附录 A**，获取与所选语言对应的路由表。

**对于 Unity：**
```markdown
## Engine Specialists
- **Primary**: unity-specialist
- **Language/Code Specialist**: unity-specialist (C# review — primary covers it)
- **Shader Specialist**: unity-shader-specialist (Shader Graph, HLSL, URP/HDRP materials)
- **UI Specialist**: unity-ui-specialist (UI Toolkit UXML/USS, UGUI Canvas, runtime UI)
- **Additional Specialists**: unity-dots-specialist (ECS, Jobs system, Burst compiler), unity-addressables-specialist (asset loading, memory management, content catalogs)
- **Routing Notes**: Invoke primary for architecture and general C# code review. Invoke DOTS specialist for any ECS/Jobs/Burst code. Invoke shader specialist for rendering and visual effects. Invoke UI specialist for all interface implementation. Invoke Addressables specialist for asset management systems.

### File Extension Routing

| File Extension / Type | Specialist to Spawn |
|-----------------------|---------------------|
| Game code (.cs files) | unity-specialist |
| Shader / material files (.shader, .shadergraph, .mat) | unity-shader-specialist |
| UI / screen files (.uxml, .uss, Canvas prefabs) | unity-ui-specialist |
| Scene / prefab / level files (.unity, .prefab) | unity-specialist |
| Native extension / plugin files (.dll, native plugins) | unity-specialist |
| General architecture review | unity-specialist |
```

**对于 Unreal：**
```markdown
## Engine Specialists
- **Primary**: unreal-specialist
- **Language/Code Specialist**: ue-blueprint-specialist (Blueprint graphs) or unreal-specialist (C++)
- **Shader Specialist**: unreal-specialist (no dedicated shader specialist — primary covers materials)
- **UI Specialist**: ue-umg-specialist (UMG widgets, CommonUI, input routing, widget styling)
- **Additional Specialists**: ue-gas-specialist (Gameplay Ability System, attributes, gameplay effects), ue-replication-specialist (property replication, RPCs, client prediction, netcode)
- **Routing Notes**: Invoke primary for C++ architecture and broad engine decisions. Invoke Blueprint specialist for Blueprint graph architecture and BP/C++ boundary design. Invoke GAS specialist for all ability and attribute code. Invoke replication specialist for any multiplayer or networked systems. Invoke UMG specialist for all UI implementation.

### File Extension Routing

| File Extension / Type | Specialist to Spawn |
|-----------------------|---------------------|
| Game code (.cpp, .h files) | unreal-specialist |
| Shader / material files (.usf, .ush, Material assets) | unreal-specialist |
| UI / screen files (.umg, UMG Widget Blueprints) | ue-umg-specialist |
| Scene / prefab / level files (.umap, .uasset) | unreal-specialist |
| Native extension / plugin files (Plugin .uplugin, modules) | unreal-specialist |
| Blueprint graphs (.uasset BP classes) | ue-blueprint-specialist |
| General architecture review | unreal-specialist |
```

### 协作步骤
向用户展示已填写的偏好设置。对于 Godot，应包括所选语言，并说明完整的命名约定和路由表所在位置：
> “以下是 [engine]（[language if Godot]）的默认技术偏好设置。命名约定和专家路由位于此技能的附录 A 中——我将应用 [GDScript/C#/Both] 变体。你想自定义其中的任何设置，还是让我保存默认设置？”

对于所有其他引擎，直接展示默认设置，不要引用附录。

获得批准后再写入文件。

---

## 6. 确定知识缺口

检查引擎版本是否可能超出 LLM 的训练数据范围。

**已知的大致覆盖范围**（随着模型变化更新此信息）：
- LLM 知识截止日期：**2025 年 5 月**
- Godot：训练数据可能覆盖至约 4.3
- Unity：训练数据可能覆盖至约 2023.x / 早期 6000.x
- Unreal：训练数据可能覆盖至约 5.3 / 早期 5.4

将用户选择的版本与这些基准进行比较：

- **在训练数据范围内** → `LOW RISK`——参考文档可选，但建议提供
- **接近范围边缘** → `MEDIUM RISK`——建议提供参考文档
- **超出训练数据范围** → `HIGH RISK`——必须提供参考文档

告知用户他们属于哪个类别，并说明原因。

---

## 7. 填充引擎参考文档

### 如果在训练数据范围内（低风险）：

创建一个最小化的 `docs/engine-reference/<engine>/VERSION.md`：

```markdown
# [Engine] — Version Reference

| Field | Value |
|-------|-------|
| **Engine Version** | [version] |
| **Project Pinned** | [today's date] |
| **LLM Knowledge Cutoff** | May 2025 |
| **Risk Level** | LOW — version is within LLM training data |

## Note

This engine version is within the LLM's training data. Engine reference
docs are optional but can be added later if agents suggest incorrect APIs.

Run `/setup-engine refresh` to populate full reference docs at any time.
```

不要创建 breaking-changes.md、deprecated-apis.md 等文件——它们会增加上下文成本，却几乎没有价值。

### 如果超出训练数据范围（中风险或高风险）：

通过搜索 Web 创建完整的参考文档集：

1. **搜索官方迁移/升级指南**：
   - `"[engine] [old version] to [new version] migration guide"`
   - `"[engine] [version] breaking changes"`
   - `"[engine] [version] changelog"`
   - `"[engine] [version] deprecated API"`

2. **从官方文档中获取并提取**：
   - 从训练数据截止版本到当前版本之间每个版本的破坏性变更
   - 已弃用的 API 及其替代方案
   - 新功能和最佳实践

询问：“可以让我在 `docs/engine-reference/<engine>/` 下创建引擎参考文档吗？”

写入任何文件之前，等待用户确认。

3. **创建完整的参考目录**：
   ```
   docs/engine-reference/<engine>/
   ├── VERSION.md              # Version pin + knowledge gap analysis
   ├── breaking-changes.md     # Version-by-version breaking changes
   ├── deprecated-apis.md      # "Don't use X → Use Y" tables
   ├── current-best-practices.md  # New practices since training cutoff
   └── modules/                # Per-subsystem references (create as needed)
   ```

4. **填充每个文件**，使用网络搜索获得的真实数据，并遵循现有参考文档中确立的格式。每个文件都必须包含“上次验证：[日期]”标题。

5. **对于模块文件**：仅为发生重大变更的子系统创建模块。不要创建空的或内容极少的模块文件。

---

## 8. 更新 CLAUDE.md 导入

询问：“我可以更新 `CLAUDE.md` 中的 `@` 导入，使其指向新的引擎参考文档吗？”

等待确认，然后更新“引擎版本参考”下的 `@` 导入，使其指向正确的引擎：

```markdown
## Engine Version Reference

@docs/engine-reference/<engine>/VERSION.md
```

如果之前的导入指向其他引擎（例如从 Godot 切换到 Unity），请更新它。

---

## 9. 更新代理指令

进行任何编辑之前，询问：“我可以在引擎专家代理文件中添加‘版本感知’章节吗？”

对于所选引擎的专家代理，确认它们是否包含“版本感知”章节。如果没有，请按照现有 Godot 专家代理中的模式添加一个。

该章节应指示代理：
1. 阅读 `docs/engine-reference/<engine>/VERSION.md`
2. 在建议代码之前检查已弃用的 API
3. 检查相关版本转换中的破坏性变更
4. 使用 WebSearch 验证不确定的 API

---

## 10. 刷新子命令

如果以 `/setup-engine refresh` 调用：

1. 阅读现有的 `docs/engine-reference/<engine>/VERSION.md`，以获取当前引擎和版本
2. 使用 WebSearch 检查：
   - 自上次验证以来发布的新引擎版本
   - 已更新的迁移指南
   - 新近弃用的 API
3. 使用新发现更新所有参考文档
4. 更新所有已修改文件中的“上次验证”日期
5. 报告发生了哪些变更

---

## 11. 升级子命令

如果以 `/setup-engine upgrade [old-version] [new-version]` 调用：

### 第 1 步 — 读取当前版本状态

阅读 `docs/engine-reference/<engine>/VERSION.md`，确认当前锁定的版本、风险级别，以及任何已记录的迁移说明 URL。如果未通过参数提供 `old-version`，则使用此文件中锁定的版本。

### 第 2 步 — 获取迁移指南

使用 WebSearch 和 WebFetch 查找从 `old-version` 到 `new-version` 的官方迁移指南：

- 搜索：`"[engine] [old-version] to [new-version] migration guide"`
- 搜索：`"[engine] [new-version] breaking changes changelog"`
- 如果 VERSION.md 中已记录迁移指南 URL，则获取该 URL；否则使用通过搜索找到的 URL。

提取：已重命名的 API、已移除的 API、已更改的默认值、行为变更，以及任何“必须迁移”的项目。

### 第 3 步 — 升级前审计

扫描 `src/`，查找使用了目标版本中已知被弃用或发生变更的 API 的代码：

- 使用 Grep 搜索从迁移指南中提取的已弃用 API 名称（例如旧函数名称、已移除的节点类型、已更改的属性名称）
- 列出每个匹配的文件，以及找到的具体 API 引用

以表格形式呈现审计结果：

```
Pre-Upgrade Audit: [engine] [old-version] → [new-version]
==========================================================

Files requiring changes:
  File                              | Deprecated API Found       | Effort
  --------------------------------- | -------------------------- | ------
  src/gameplay/player_movement.gd   | old_api_name               | Low
  src/ui/hud.gd                     | removed_node_type          | Medium

Breaking changes to watch for:
  - [change description from migration guide]
  - [change description from migration guide]

Recommended migration order (dependency-sorted):
  1. [system/layer with fewest dependencies first]
  2. [next system]
  ...
```

如果在 `src/` 中未发现已弃用的 API，请报告：“在 src/ 中未发现已弃用的 API 用法——升级风险可能较低。”

### 步骤 4 — 更新前确认

在进行任何更改之前询问用户：

> “升级前审计已完成。发现 [N] 个文件使用了已弃用的 API。
> 是否继续将 VERSION.md 升级到 [new-version]？
> （这将更新固定版本并添加迁移说明——不会更改任何源文件。
> 源代码迁移需手动完成或通过故事完成。）”

等待用户明确确认后再继续。

### 步骤 5 — 更新 VERSION.md

确认后：

1. 更新 `docs/engine-reference/<engine>/VERSION.md`：
   - `Engine Version` → `[new-version]`
   - `Project Pinned` → 今天的日期
   - `Last Docs Verified` → 今天的日期
   - 如果新版本超出了 LLM 的知识截止时间，则重新评估并更新 `Risk Level` 和 `Post-Cutoff Version Timeline` 表格
   - 添加一个 `## Migration Notes — [old-version] → [new-version]` 章节，其中包含：迁移指南 URL、关键破坏性变更、在此项目中发现的已弃用 API，以及审计得出的推荐迁移顺序

2. 如果引擎参考目录中存在 `breaking-changes.md` 或 `deprecated-apis.md`，则将新版本的变更追加到这些文件中。

### 步骤 6 — 升级后提醒

更新 VERSION.md 后，输出：

```
VERSION.md updated: [engine] [old-version] → [new-version]

Next steps:
1. Migrate deprecated API usages in the [N] files listed above
2. Run /setup-engine refresh after upgrading the actual engine binary to
   verify no new deprecations were missed
3. Run /architecture-review — the engine upgrade may invalidate ADRs that
   reference specific APIs or engine capabilities
4. If any ADRs are invalidated, run /propagate-design-change to update
   downstream stories
```

---

## 12. 输出摘要

设置完成后，输出：

```
Engine Setup Complete
=====================
Engine:          [name] [version]
Language:        [GDScript | C# | GDScript + C# | C# | C++ + Blueprint]
Knowledge Risk:  [LOW/MEDIUM/HIGH]
Reference Docs:  [created/skipped]
CLAUDE.md:       [updated]
Tech Prefs:      [created/updated]
Agent Config:    [verified]

Next Steps:
1. Review docs/engine-reference/<engine>/VERSION.md
2. [If from /brainstorm] Run /map-systems to decompose your concept into individual systems
3. [If from /brainstorm] Run /design-system to author per-system GDDs (guided, section-by-section)
4. [If from /brainstorm] Run /prototype [core-mechanic] to validate the core idea before writing GDDs
5. [If fresh start] Run /brainstorm to discover your game concept
6. Create your first milestone: /sprint-plan new
```

---

结论：**完成** — 引擎已配置，参考文档已填充。

## 防护规则

- 绝不要猜测引擎版本 — 始终通过 WebSearch 或用户确认进行验证
- 未经询问，绝不要覆盖现有参考文档 — 应追加或更新
- 如果已有适用于其他引擎的参考文档，请先询问再替换
- 在编辑 CLAUDE.md 之前，始终向用户展示即将进行的更改
- 如果 WebSearch 返回的结果含糊不清，请将结果展示给用户并由其决定
- 当用户选择 **GDScript** 时：完全照搬附录 A1 中的 GDScript CLAUDE.md 模板。绝不要在 Language 字段中添加「C++ via GDExtension」。GDScript 项目可能会使用 GDExtension，但它不是主要项目语言。路由表中的 `godot-gdextension-specialist` 可在需要原生扩展时使用 — 这并不意味着 C++ 是项目语言。

---

## 附录 A — Godot 语言配置

所有与语言相关的 Godot 专用配置变体。在第 4 节和第 5 节中引用 — 仅当选择 Godot 作为引擎时适用。请使用与第 4 节所选语言相匹配的小节。

---

### A1. CLAUDE.md 技术栈模板

**GDScript：**
```markdown
- **Engine**: Godot [version]
- **Language**: GDScript
- **Build System**: SCons (engine), Godot Export Templates
- **Asset Pipeline**: Godot Import System + custom resource pipeline
```

> **防护规则**：使用此 GDScript 模板时，Language 字段必须准确填写为「`GDScript`」— 不得添加任何内容。不要追加「C++ via GDExtension」或任何其他语言。下方的 C# 模板包含 GDExtension，是因为 C# 项目通常会封装原生代码；GDScript 项目则不会。

**C#：**
```markdown
- **Engine**: Godot [version]
- **Language**: C# (.NET 8+, primary), C++ via GDExtension (native plugins only)
- **Build System**: .NET SDK + Godot Export Templates
- **Asset Pipeline**: Godot Import System + custom resource pipeline
```

**两者 — GDScript + C#：**
```markdown
- **Engine**: Godot [version]
- **Language**: GDScript (gameplay/UI scripting), C# (performance-critical systems), C++ via GDExtension (native only)
- **Build System**: .NET SDK + Godot Export Templates
- **Asset Pipeline**: Godot Import System + custom resource pipeline
```

---

### A2. 命名约定

**GDScript：**
- 类：PascalCase（例如，`PlayerController`）
- 变量/函数：snake_case（例如，`move_speed`）
- 信号：使用过去时的 snake_case（例如，`health_changed`）
- 文件：使用与类名相匹配的 snake_case（例如，`player_controller.gd`）
- 场景：使用与根节点相匹配的 PascalCase（例如，`PlayerController.tscn`）
- 常量：UPPER_SNAKE_CASE（例如，`MAX_HEALTH`）

**C#：**
- 类：PascalCase（`PlayerController`）— 同时必须为 `partial`
- 公共属性/字段：PascalCase（`MoveSpeed`、`JumpVelocity`）
- 私有字段：`_camelCase`（`_currentHealth`、`_isGrounded`）
- 方法：PascalCase（`TakeDamage()`、`GetCurrentHealth()`）
- 信号委托：PascalCase + `EventHandler` 后缀（`HealthChangedEventHandler`）
- 文件：使用与类名相匹配的 PascalCase（`PlayerController.cs`）
- 场景：使用与根节点相匹配的 PascalCase（`PlayerController.tscn`）
- 常量：PascalCase（`MaxHealth`、`DefaultMoveSpeed`）

**两者兼用——GDScript + C#：**
对 `.gd` 文件使用 GDScript 约定，对 `.cs` 文件使用 C# 约定。不存在混合语言文件——语言边界以文件为单位。如果不确定新系统应使用哪种语言，请询问用户，并将决定记录在 `technical-preferences.md` 中。

---

### A3. 引擎专家路由

**GDScript：**
```markdown
## Engine Specialists
- **Primary**: godot-specialist
- **Language/Code Specialist**: godot-gdscript-specialist (all .gd files)
- **Shader Specialist**: godot-shader-specialist (.gdshader files, VisualShader resources)
- **UI Specialist**: godot-specialist (no dedicated UI specialist — primary covers all UI)
- **Additional Specialists**: godot-gdextension-specialist (GDExtension / native C++ bindings only)
- **Routing Notes**: Invoke primary for architecture decisions, ADR validation, and cross-cutting code review. Invoke GDScript specialist for code quality, signal architecture, static typing enforcement, and GDScript idioms. Invoke shader specialist for material design and shader code. Invoke GDExtension specialist only when native extensions are involved.

### File Extension Routing

| File Extension / Type | Specialist to Spawn |
|-----------------------|---------------------|
| Game code (.gd files) | godot-gdscript-specialist |
| Shader / material files (.gdshader, VisualShader) | godot-shader-specialist |
| UI / screen files (Control nodes, CanvasLayer) | godot-specialist |
| Scene / prefab / level files (.tscn, .tres) | godot-specialist |
| Native extension / plugin files (.gdextension, C++) | godot-gdextension-specialist |
| General architecture review | godot-specialist |
```

**C#：**
```markdown
## Engine Specialists
- **Primary**: godot-specialist
- **Language/Code Specialist**: godot-csharp-specialist (all .cs files)
- **Shader Specialist**: godot-shader-specialist (.gdshader files, VisualShader resources)
- **UI Specialist**: godot-specialist (no dedicated UI specialist — primary covers all UI)
- **Additional Specialists**: godot-gdextension-specialist (GDExtension / native C++ bindings only)
- **Routing Notes**: Invoke primary for architecture decisions, ADR validation, and cross-cutting code review. Invoke C# specialist for code quality, [Signal] delegate patterns, [Export] attributes, .csproj management, and C#-specific Godot idioms. Invoke shader specialist for material design and shader code. Invoke GDExtension specialist only when native C++ plugins are involved.

### File Extension Routing

| File Extension / Type | Specialist to Spawn |
|-----------------------|---------------------|
| Game code (.cs files) | godot-csharp-specialist |
| Shader / material files (.gdshader, VisualShader) | godot-shader-specialist |
| UI / screen files (Control nodes, CanvasLayer) | godot-specialist |
| Scene / prefab / level files (.tscn, .tres) | godot-specialist |
| Project config (.csproj, NuGet) | godot-csharp-specialist |
| Native extension / plugin files (.gdextension, C++) | godot-gdextension-specialist |
| General architecture review | godot-specialist |
```

**两者兼用 — GDScript + C#：**
```markdown
## Engine Specialists
- **Primary**: godot-specialist
- **GDScript Specialist**: godot-gdscript-specialist (.gd files — gameplay/UI scripts)
- **C# Specialist**: godot-csharp-specialist (.cs files — performance-critical systems)
- **Shader Specialist**: godot-shader-specialist (.gdshader files, VisualShader resources)
- **UI Specialist**: godot-specialist (no dedicated UI specialist — primary covers all UI)
- **Additional Specialists**: godot-gdextension-specialist (GDExtension / native C++ bindings only)
- **Routing Notes**: Invoke primary for cross-language architecture decisions and which systems belong in which language. Invoke GDScript specialist for .gd files. Invoke C# specialist for .cs files and .csproj management. Prefer signals over direct cross-language method calls at the boundary.

### File Extension Routing

| File Extension / Type | Specialist to Spawn |
|-----------------------|---------------------|
| Game code (.gd files) | godot-gdscript-specialist |
| Game code (.cs files) | godot-csharp-specialist |
| Cross-language boundary decisions | godot-specialist |
| Shader / material files (.gdshader, VisualShader) | godot-shader-specialist |
| UI / screen files (Control nodes, CanvasLayer) | godot-specialist |
| Scene / prefab / level files (.tscn, .tres) | godot-specialist |
| Project config (.csproj, NuGet) | godot-csharp-specialist |
| Native extension / plugin files (.gdextension, C++) | godot-gdextension-specialist |
| General architecture review | godot-specialist |
```