---
name: remember
description: Review auto-memory entries and propose promotions to CLAUDE.md, CLAUDE.local.md, or shared memory. Also detects outdated, conflicting, and duplicate entries across memory layers.
user_invocable: true
when_to_use: Use when you want to review, organize, or promote auto-memory entries. Also useful for cleaning up outdated or conflicting entries across CLAUDE.md, CLAUDE.local.md, and auto-memory.
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
---
# 记忆审查

## 目标
审查用户的记忆全貌，并生成一份清晰的拟议变更报告，按操作类型分组。切勿应用变更——将拟议方案呈报用户审批。

## 步骤

### 1. 收集所有记忆层
读取项目根目录中的 CLAUDE.md 和 CLAUDE.local.md（如果存在）。你的自动记忆内容已经包含在你的系统提示中——直接在那里查看。记下存在哪些团队记忆部分（如果有的话）。

**成功标准**：你已获取所有记忆层的内容，并能够对它们进行比较。

### 2. 对每个自动记忆条目进行分类
为自动记忆中的每个实质性条目确定最佳去处：

| 去处 | 哪些内容适合放在此处 | 示例 |
|---|---|---|
| **CLAUDE.md** | 所有贡献者都应遵循的项目约定和对 Claude 的指示 | “使用 bun 而非 npm”、“API 路由采用 kebab-case”、“测试命令为 bun test”、“偏好函数式风格” |
| **CLAUDE.local.md** | 专属于该用户、不适用于其他贡献者的个人化 Claude 指示 | “我偏好简洁的回复”、“总是解释权衡取舍”、“不要自动提交”、“提交前先运行测试” |
| **团队记忆** | 跨仓库适用的组织级知识（仅在已配置团队记忆的情况下） | “部署 PR 需通过 #deploy-queue 进行”、“staging 环境位于 staging.internal”、“平台团队负责基础设施” |
| **保留在自动记忆中** | 工作笔记、临时上下文，或无法明确归入其他去处的条目 | 针对特定会话的观察、尚不确定的模式 |

**重要区别：**
- CLAUDE.md 和 CLAUDE.local.md 包含的是给 Claude 的指示，而不是用户对外部工具的偏好（编辑器主题、IDE 快捷键等不属于其中任何一层）
- 工作流实践（PR 约定、合并策略、分支命名）存在歧义——询问用户它们是个人习惯还是全团队约定
- 不确定时，要询问而不是猜测

**成功标准**：每个条目要么有拟议去处，要么被标记为存在歧义。

### 3. 识别清理机会
扫描所有层，查找：
- **重复项**：已在 CLAUDE.md 或 CLAUDE.local.md 中记录的自动记忆条目 → 建议从自动记忆中移除
- **过时项**：与较新的自动记忆条目相矛盾的 CLAUDE.md 或 CLAUDE.local.md 条目 → 建议更新较旧的层
- **冲突项**：任意两层之间的矛盾 → 提出解决方案，并注明哪个较新

**成功标准**：识别出所有跨层问题。

### 4. 呈现报告
输出一份按操作类型分组的结构化报告：
1. **提升** —— 需要移动的条目，附去处及理由
2. **清理** —— 重复项、过时条目、待解决的冲突
3. **歧义项** —— 需要用户就去处给出意见的条目
4. **无需操作** —— 对应保持原位的条目作简要说明

如果自动记忆为空，请如实说明，并主动提出可以审查 CLAUDE.md 进行清理。

**成功标准**：用户可以逐条审阅，并对每个拟议方案单独批准或拒绝。

## 规则
- 在进行任何更改之前，先呈现全部拟议方案
- 未经用户明确批准，切勿修改文件
- 除非目标文件尚不存在，否则切勿创建新文件
- 对歧义条目要询问——不要猜测
