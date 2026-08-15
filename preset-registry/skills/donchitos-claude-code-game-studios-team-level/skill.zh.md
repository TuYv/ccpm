---
name: team-level
description: "Orchestrate level design team: level-designer + narrative-director + world-builder + art-director + systems-designer + qa-tester for complete area/level creation."
argument-hint: "[level name or area to design] [--review full|lean|solo]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Edit, Bash, Task, AskUserQuestion, TodoWrite
model: sonnet
---
调用此技能时：

**决策点：** 在每个步骤转换时，使用 `AskUserQuestion` 将子智能体的提案作为可选项呈现给用户。先在对话中写出智能体的完整分析，然后使用简洁的标签记录决策。必须获得用户批准后，才能进入下一步。

## 阶段 0：确定审查模式

1. 如果参数中传入了 `--review [mode]`，则使用该模式。
2. 否则，读取 `production/review-mode.txt`——使用其中写明的模式。
3. 否则，默认为 `lean`。

模式：
- `full`——按说明生成所有总监和负责人关卡
- `lean`——跳过总监关卡，除非它们属于 PHASE-GATE 类型（CD-PHASE-GATE、TD-PHASE-GATE、PR-PHASE-GATE、AD-PHASE-GATE）
- `solo`——完全跳过所有总监关卡的生成；在没有任何智能体关卡的情况下运行此技能

存储最终确定的模式，以供后续所有阶段使用。

1. **读取参数**，获取目标关卡或区域（例如 `tutorial`、
   `forest dungeon`、`hub town`、`final boss arena`）。

2. **收集上下文**：
   - 读取位于 `design/gdd/game-concept.md` 的游戏概念
   - 读取位于 `design/gdd/game-pillars.md` 的游戏支柱
   - 读取 `design/levels/` 中现有的关卡文档
   - 读取 `design/narrative/` 中相关的叙事文档
   - 读取该区域所属地区/阵营的世界构建文档

## 如何委派

使用 Task 工具将每位团队成员生成为子智能体：
- `subagent_type: narrative-director`——叙事目的、角色、情感弧线
- `subagent_type: world-builder`——背景设定、环境叙事、世界规则
- `subagent_type: level-designer`——空间布局、节奏、遭遇、导航
- `subagent_type: systems-designer`——敌人组合、战利品表、难度平衡
- `subagent_type: art-director`——视觉主题、色彩方案、照明、资产需求
- `subagent_type: accessibility-specialist`——导航清晰度、色盲安全性、认知负荷
- `subagent_type: qa-tester`——测试用例、边界测试、试玩检查清单

始终在每个智能体的提示词中提供完整上下文（游戏概念、游戏支柱、现有关卡文档、叙事文档）。

3. **按顺序协调关卡设计团队**：

### 步骤 1：叙事 + 视觉方向（narrative-director + world-builder + art-director，并行）

同时生成全部三个智能体——在等待任何结果之前，先发出全部三个 Task 调用。

生成 `narrative-director` 智能体，以：
- 定义该区域的叙事目的（这里会发生哪些故事节点？）
- 确定关键角色、对话触发条件和背景设定元素
- 明确情感弧线（玩家在进入、游历和离开时应有何感受？）

生成 `world-builder` 智能体，以：
- 提供该区域的背景设定（历史、阵营分布、生态）
- 定义环境叙事机会
- 明确会影响该区域玩法的任何世界规则

生成 `art-director` 智能体，以：
- 确立该区域的视觉主题目标——这些是布局的输入，而不是布局的输出
- 定义该区域的色温和照明氛围（它与相邻区域有何不同？）
- 明确形状语言方向（棱角分明的堡垒？有机洞穴？衰败的宏伟建筑？）
- 指明用于引导玩家辨别方向的主要视觉地标
- 如果 `design/art/art-bible.md` 存在，则读取该文件——所有方向都应以既定的美术圣经为依据

**第 1 步中由美术指导制定的视觉目标必须作为明确约束传递给第 2 步的关卡设计师**。布局决策必须在视觉方向的框架内进行，而不是先于视觉方向确定。

**关卡门禁**：使用 `AskUserQuestion` 展示第 1 步的全部三项输出（叙事简报、世界观基础、视觉方向目标），并在进入第 2 步之前获得确认。

### 第 2 步：布局与遭遇设计（关卡设计师）
启动 `level-designer` 智能体，并将第 1 步的完整输出作为上下文：
- 叙事简报（来自叙事指导）
- 世界观基础（来自世界构建师）
- **视觉方向目标（来自美术指导）**——布局必须在这些目标的框架内进行，不得与之冲突

关卡设计师应：
- 设计空间布局（关键路径、可选路径、秘密区域）——确保主要路线与第 1 步的视觉地标目标保持一致
- 定义节奏曲线（紧张高潮、休息区域、探索区域）——与叙事指导制定的情感弧线相协调
- 根据难度递进安排遭遇
- 设计环境谜题或导航挑战
- 定义用于寻路的兴趣点和地标——这些必须与美术指导指定的视觉地标相匹配
- 指定入口、出口以及与相邻区域的连接

**相邻区域依赖项检查**：布局生成后，检查 `design/levels/` 中关卡设计师引用的每个相邻区域。如果任何被引用区域的 `.md` 文件不存在，则指出该缺失项：
> “关卡将 [area-name] 作为相邻区域引用，但 `design/levels/[area-name].md` 不存在。”

使用 `AskUserQuestion` 提供以下选项：
- (a) 使用占位引用继续——在关卡文档中将该连接标记为 UNRESOLVED，并将其列入总结报告的开放跨关卡依赖项部分
- (b) 暂停并先运行 `/team-level [area-name]` 以建立该区域

不要为缺失的相邻区域虚构内容。

**关卡门禁**：使用 `AskUserQuestion` 展示第 2 步的布局（包括任何尚未解决的相邻区域依赖项），并在进入第 3 步之前获得确认。

### 第 3 步：系统集成（系统设计师）
启动 `systems-designer` 智能体，以：
- 指定敌人组合和遭遇公式
- 定义战利品表和奖励放置
- 根据玩家的预期等级/装备平衡难度
- 设计任何区域专属机制或环境危害
- 指定资源分布（生命值补给、存档点、商店）

**关卡门禁**：使用 `AskUserQuestion` 展示第 3 步的输出，并在进入第 4 步之前获得确认。

### 第 4 步：制作概念 + 无障碍设计（美术指导 + 无障碍专家，并行）

**注意**：美术指导的方向性阶段（视觉主题、色彩目标、氛围）已在第 1 步完成。本阶段负责特定地点的制作概念——在布局最终确定后，每个具体空间应该是什么样子？

使用第 2 步最终确定的布局启动 `art-director` 智能体：
- 为关键空间（入口、关键遭遇区域、地标、出口）制作特定地点的概念规范
- 指定哪些美术资产是该区域独有的，哪些是从全局资源池共享的
- 定义每个关键空间的视线和照明设置（这些设置现在以布局为依据，而非仅具方向性）
- 指定该区域布局所特有的 VFX 需求（天气体积、粒子、大气效果）
- 标记布局与第 1 步目标产生视觉方向冲突的任何地点——将这些作为制作风险提出

并行启动 `accessibility-specialist` 代理以：
- 审查关卡布局的导航清晰度（玩家能否在不只依赖颜色的情况下辨明方向？）
- 检查关键路径的引导标识是否除颜色外还使用了形状/图标/声音提示
- 审查所有谜题机制的认知负荷——标记任何需要同时记住 3 种以上状态的内容
- 检查关键玩法区域是否为色盲玩家提供了足够的对比度
- 输出：无障碍问题列表，并标注严重程度（BLOCKING / RECOMMENDED / NICE TO HAVE）

等待两个代理均返回结果后再继续。

**门禁条件**：使用 `AskUserQuestion` 展示第 4 步的两项结果。如果 accessibility-specialist 返回了任何 BLOCKING 问题，请突出显示这些问题并提供以下选项：
- (a) 返回 level-designer 和 art-director，在第 5 步之前重新设计被标记的元素
- (b) 将其记录为已知的无障碍缺陷，并继续执行第 5 步，同时在最终报告中明确记录该问题

在用户确认所有 BLOCKING 无障碍问题之前，不得继续执行第 5 步。

### 第 5 步：QA 规划（qa-tester）
启动 `qa-tester` 代理以：
- 为关键路径编写测试用例
- 识别边界情况和极端情况（跳过流程、软锁）
- 为该区域创建试玩检查清单
- 定义关卡完成的验收标准

4. **编制关卡设计文档**，将所有团队输出整合到
   关卡设计模板格式中。

收集完所有子代理的输出后，通过 Task 启动 `level-designer`，以编制并撰写最终文档：
- 传入：所有子代理的原始输出、关卡简述、游戏支柱、GDD 相关章节
- 要求 level-designer：编制为关卡设计文档格式，然后在写入前请求用户批准（"May I write the compiled level design to design/levels/[level-name].md?"）
- 编排器不会直接调用 Write 来写入最终文档。

5. **保存至** `design/levels/[level-name].md`（由 level-designer 子代理在获得用户批准后处理——见上文）。

6. **输出摘要**，包含：区域概述、遭遇数量、预估资产
   列表、叙事节拍、所有跨团队依赖项或待解决问题、尚未解决的
   跨关卡依赖项（已引用但尚未设计的相邻区域，每项均标记为 UNRESOLVED），以及无障碍问题及其解决状态。

## 文件写入协议

所有文件写入操作（关卡设计文档、叙事文档、测试检查清单）均委派给
通过 Task 启动的子代理。每个子代理都会执行 "May I write to [path]?"
协议。此编排器不会直接写入文件。

判定：**COMPLETE**——关卡设计文档已生成，且所有团队输出均已编入其中。
判定：**BLOCKED**——一个或多个代理受阻；已生成部分报告，并列出未解决事项。

## 后续步骤

- 运行 `/design-review design/levels/[level-name].md` 以验证已完成的关卡设计文档。
- 设计获批后，运行 `/dev-story` 以实现关卡内容。
- 运行 `/qa-plan` 为此关卡生成 QA 测试计划。

## 错误恢复协议

如果任何已生成的代理（通过 Task）返回 BLOCKED、报错或无法完成：

1. **立即告知**：在继续执行依赖阶段之前，向用户报告“[AgentName]: BLOCKED — [reason]”
2. **评估依赖关系**：检查后续阶段是否需要被阻塞代理的输出。如果需要，则在没有用户输入的情况下，不要继续越过该依赖点。
3. **通过 AskUserQuestion 提供选项**，选项包括：
   - 跳过此代理，并在最终报告中注明缺失内容
   - 缩小范围后重试
   - 在此停止，优先解决阻塞问题
4. **始终生成部分报告**——输出所有已完成的内容。绝不要因为某个代理被阻塞而丢弃已完成的工作。

常见阻塞问题：
- 输入文件缺失（未找到 story、缺少 GDD）→ 重定向到创建该文件的 skill
- ADR 状态为 Proposed → 不要实施；先运行 `/architecture-decision`
- 范围过大 → 通过 `/create-stories` 拆分为两个 story
- ADR 与 story 之间的指令冲突 → 明确指出冲突，不要猜测