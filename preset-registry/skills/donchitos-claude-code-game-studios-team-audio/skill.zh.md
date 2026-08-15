---
name: team-audio
description: "Orchestrate audio team: audio-director + sound-designer + technical-artist + gameplay-programmer for full audio pipeline from direction to implementation."
argument-hint: "[feature or area to design audio for] [--review full|lean|solo]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Edit, Bash, Task, AskUserQuestion, TodoWrite
model: sonnet
---
如果未提供参数，则输出用法指引并退出，不生成任何代理：
> 用法：`/team-audio [feature or area]` — 指定要为其设计音频的功能或区域（例如 `combat`、`main menu`、`forest biome`、`boss encounter`）。此处不要使用 `AskUserQuestion`；直接输出指引。

当使用参数调用此技能时，通过结构化流水线协调音频团队。

**决策点：** 在每个步骤转换时，使用 `AskUserQuestion` 将子代理的提案以可选项的形式呈现给用户。先在对话中写出代理的完整分析，然后使用简洁的标签记录决策。必须获得用户批准后才能进入下一步。

## 阶段 0：确定审查模式

1. 如果参数中传入了 `--review [mode]`，则使用该模式。
2. 否则读取 `production/review-mode.txt` — 使用其中写明的模式。
3. 如果仍未确定，则默认为 `lean`。

模式：
- `full` — 按照说明生成所有总监和负责人关卡
- `lean` — 跳过总监关卡，除非它们属于 PHASE-GATE 类型（CD-PHASE-GATE、TD-PHASE-GATE、PR-PHASE-GATE、AD-PHASE-GATE）
- `solo` — 完全跳过所有总监关卡的生成；运行技能时不使用任何代理关卡

存储最终确定的模式，供后续所有阶段使用。

1. **读取参数**，确定目标功能或区域（例如 `combat`、`main menu`、`forest biome`、`boss encounter`）。

2. **收集上下文**：
   - 阅读 `design/gdd/` 中与该功能相关的设计文档
   - 如果存在，则阅读声音规范 `design/gdd/sound-bible.md`
   - 阅读 `assets/audio/` 中现有的音频资产列表
   - 阅读该区域已有的所有声音设计文档

## 如何委派任务

使用 Task 工具将每位团队成员生成为子代理：
- `subagent_type: audio-director` — 声音特征、情感基调、音频调色板
- `subagent_type: sound-designer` — 音效规格、音频事件、混音组
- `subagent_type: technical-artist` — 音频中间件、总线结构、内存预算
- `subagent_type: [primary engine specialist]` — 验证该引擎的音频集成模式
- `subagent_type: gameplay-programmer` — 音频管理器、游戏玩法触发器、自适应音乐

始终在每个代理的提示词中提供完整上下文（功能描述、现有音频资产、设计文档引用）。

3. **按顺序协调音频团队**：

### 步骤 1：音频方向（audio-director）
生成 `audio-director` 代理以：
- 定义此功能/区域的声音特征
- 指定情感基调和音频调色板
- 设定音乐方向（自适应分层、分轨、过渡）
- 定义音频优先级和混音目标
- 建立所有自适应音频规则（战斗强度、探索、紧张感）

### 步骤 2：声音设计与音频无障碍（并行）
生成 `sound-designer` 代理以：
- 为每个音频事件创建详细的音效规格
- 定义声音类别（环境、UI、游戏玩法、音乐、对白）
- 指定每种声音的参数（音量范围、音高变化、衰减）
- 规划音频事件列表及其触发条件
- 定义混音组和闪避规则

并行启动 `accessibility-specialist` 代理，以：
- 识别哪些音频事件承载关键玩法信息（受到伤害、附近有敌人、目标完成），并需要为听障玩家提供视觉替代方案
- 明确字幕要求：哪些音频事件需要字幕、文本格式以及屏幕显示时长
- 检查是否不存在仅通过音频传达的游戏状态（所有状态都必须有视觉后备方案）
- 审查音频事件列表，找出可能会对听觉敏感玩家造成影响的事件（高频警报、突发巨响事件）
- 输出：集成到音频事件规范中的音频无障碍要求列表

### 步骤 3：技术实现（并行）
启动 `technical-artist` 代理，以：
- 设计音频中间件集成方案（Wwise/FMOD/原生方案）
- 定义音频总线结构和路由
- 明确各平台音频资产的内存预算
- 规划流式加载与预加载资产的策略
- 设计所有音频响应式视觉效果

并行启动**主要引擎专家**（来自 `.claude/docs/technical-preferences.md` 的引擎专家），以验证集成方案：
- 提议的音频中间件集成方式是否符合该引擎的惯用做法？（例如，Godot 的内置 AudioStreamPlayer 与 FMOD、Unity 的 Audio Mixer 与 Wwise、Unreal 的 MetaSounds 与 FMOD）
- 是否应使用任何特定于引擎的音频节点/组件模式？
- 固定使用的引擎版本中，是否存在会影响集成计划的已知音频系统变更？
- 输出：要与技术美术计划合并的引擎音频集成说明

如果未配置引擎，则跳过启动该专家。

### 步骤 4：代码集成（gameplay-programmer）
启动 `gameplay-programmer` 代理，以：
- 实现音频管理器系统或审查现有系统
- 将音频事件接入玩法触发器
- 实现自适应音乐系统（如有规定）
- 设置音频遮挡/混响区域
- 为音频事件触发器编写单元测试

4. **汇编音频设计文档**，整合所有团队输出。

5. **保存至** `design/audio/audio-[feature].md`。

   注意：如果 `design/audio/` 不存在，负责撰写文档的子代理应创建该目录（写入文件时将自动创建该目录）。

6. **输出摘要**，其中包括：音频事件数量、预估资产数量、
   实现任务以及团队成员之间尚未解决的问题。

判定：**COMPLETE** — 音频设计文档已生成，团队流程已完成。

如果流程因某项依赖未解决而停止（例如，关键无障碍缺口或缺失的 GDD 未经用户解决）：

判定：**BLOCKED** — [原因]

## 文件写入协议

所有文件写入操作（音频设计文档、SFX 规范、实现文件）均委派给
通过 Task 启动的子代理。每个子代理都会执行“May I write to [path]?”
协议。此编排器不直接写入文件。

## 后续步骤

- 在开始实现之前，与音频总监一起审查音频设计文档。
- 音频设计获批后，使用 `/dev-story` 实现音频管理器和事件系统。
- 创建音频资产后运行 `/asset-audit`，以验证命名和格式合规性。

## 错误恢复协议

如果任何生成的代理（通过 Task）返回 BLOCKED、报错或无法完成：

1. **立即告知**：在继续执行依赖阶段之前，向用户报告“[AgentName]: BLOCKED — [原因]”
2. **评估依赖关系**：检查后续阶段是否需要被阻塞代理的输出。如果需要，则在获得用户输入之前，不要越过该依赖节点继续执行。
3. **通过 AskUserQuestion 提供选项**：
   - 跳过此代理，并在最终报告中注明缺失内容
   - 缩小范围后重试
   - 在此处停止，优先解决阻塞问题
4. **始终生成部分报告**——输出所有已完成的内容。绝不要因为某个代理被阻塞而丢弃已有工作。

常见阻塞问题：
- 输入文件缺失（未找到故事、缺少 GDD）→ 转至用于创建该文件的技能
- ADR 状态为 Proposed → 不要实施；先运行 `/architecture-decision`
- 范围过大 → 通过 `/create-stories` 拆分为两个故事
- ADR 与故事中的指令冲突 → 明确指出冲突，不要猜测