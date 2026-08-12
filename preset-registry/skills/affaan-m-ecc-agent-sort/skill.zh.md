---
name: agent-sort
description: Build an evidence-backed ECC install plan for a specific repo by sorting skills, commands, rules, hooks, and extras into DAILY vs LIBRARY buckets using parallel repo-aware review passes. Use when ECC should be trimmed to what a project actually needs instead of loading the full bundle.
---
# Agent 分类

当仓库需要项目特定的 ECC 功能面，而不是默认的完整安装时，请使用此技能。

目标不是猜测什么“感觉有用”，而是根据实际代码库中的证据对 ECC 组件进行分类。

## 使用场景

- 项目只需要 ECC 的一部分，而完整安装产生的干扰过多
- 仓库的技术栈很明确，但没人想逐一手动筛选技能
- 团队希望基于 grep 证据而非主观意见，作出可重复的安装决策
- 需要将每次都会加载的日常工作流功能面与可搜索的库/参考功能面分开
- 仓库逐渐偏离到了错误的语言、规则或钩子集合，需要进行清理

## 不可妥协的规则

- 将当前仓库作为事实依据，而不是采用通用偏好
- 每项 DAILY 决策都必须引用具体的仓库证据
- LIBRARY 并不意味着“删除”，而是“保持可访问，但默认不加载”
- 不要安装当前仓库无法使用的钩子、规则或脚本
- 优先使用 ECC 原生功能面；不要引入第二套安装系统

## 输出

按以下顺序生成这些产物：

1. DAILY 清单
2. LIBRARY 清单
3. 安装计划
4. 验证报告
5. 如果项目需要，可选生成 `skill-library` 路由器

## 分类模型

仅使用两个分类：

- `DAILY`
  - 此仓库的每个会话都应加载
  - 与仓库的语言、框架、工作流或操作功能面高度匹配
- `LIBRARY`
  - 值得保留，但不值得默认加载
  - 应当仍可通过搜索、路由器技能或选择性手动使用来访问

## 证据来源

进行任何分类之前，先使用仓库本地证据：

- 文件扩展名
- 包管理器和锁文件
- 框架配置
- CI 和钩子配置
- 构建/测试脚本
- 导入和依赖清单
- 明确描述技术栈的仓库文档

可用的命令包括：

```bash
rg --files
rg -n "typescript|react|next|supabase|django|spring|flutter|swift"
cat package.json
cat pyproject.toml
cat Cargo.toml
cat pubspec.yaml
cat go.mod
```

## 并行审查阶段

如果可以使用并行子代理，请将审查拆分为以下阶段：

1. Agents
   - 对 `agents/*` 进行分类
2. Skills
   - 对 `skills/*` 进行分类
3. Commands
   - 对 `commands/*` 进行分类
4. Rules
   - 对 `rules/*` 进行分类
5. Hooks and scripts
   - 对钩子功能面、MCP 健康检查、辅助脚本和操作系统兼容性进行分类
6. Extras
   - 对上下文、示例、MCP 配置、模板和指导文档进行分类

如果无法使用子代理，则按顺序执行相同的审查阶段。

## 核心工作流

### 1. 阅读仓库

在对任何内容进行分类之前，先确定实际的技术栈：

- 使用的语言
- 使用的框架
- 主要包管理器
- 测试技术栈
- lint/格式化技术栈
- 部署/运行时功能面
- 已有的操作集成

### 2. 构建证据表

对于每个候选功能面，记录：

- 组件路径
- 组件类型
- 建议分类
- 仓库证据
- 简短理由

使用以下格式：

```text
skills/frontend-patterns | skill | DAILY | 84 .tsx files, next.config.ts present | core frontend stack
skills/django-patterns   | skill | LIBRARY | no .py files, no pyproject.toml       | not active in this repo
rules/typescript/*       | rules | DAILY | package.json + tsconfig.json            | active TS repo
rules/python/*           | rules | LIBRARY | zero Python source files             | keep accessible only
```

### 3. 确定 DAILY 与 LIBRARY

在以下情况下提升为 `DAILY`：

- 仓库明确使用了匹配的技术栈
- 该组件足够通用，能够在每个会话中提供帮助
- 仓库已经依赖相应的运行时或工作流

在以下情况下下调为 `LIBRARY`：

- 该组件不属于当前技术栈
- 仓库以后可能会需要它，但并非每天都需要
- 它会增加上下文开销，却没有即时相关性

### 4. 制定安装计划

将分类转化为具体操作：

- DAILY skills -> 安装或保留在 `.claude/skills/` 中
- DAILY commands -> 仅在仍然有用时保留为显式垫片
- DAILY rules -> 仅安装匹配的语言规则集
- DAILY hooks/scripts -> 仅保留兼容的项
- LIBRARY surfaces -> 使其可通过搜索或 `skill-library` 访问

如果仓库已经使用选择性安装，请更新现有计划，而不是另建一套系统。

### 5. 创建可选的库路由器

如果项目需要一个可搜索的库入口，请创建：

- `.claude/skills/skill-library/SKILL.md`

该路由器应包含：

- 对 DAILY 与 LIBRARY 的简要说明
- 分组后的触发关键词
- 库引用内容的存放位置

不要在路由器中重复每个 skill 的完整正文。

### 6. 验证结果

应用计划后，验证：

- 每个 DAILY 文件都存在于预期位置
- 没有遗留仍处于启用状态的过时语言规则
- 没有安装不兼容的 hooks
- 最终安装内容确实与仓库技术栈匹配

返回一份简明报告，其中包括：

- DAILY 数量
- LIBRARY 数量
- 已移除的过时入口
- 待确认的问题

## 移交

如果下一步是交互式安装或修复，请移交给：

- `configure-ecc`

如果下一步是清理重叠项或审查目录，请移交给：

- `skill-stocktake`

如果下一步是进行更广泛的上下文精简，请移交给：

- `strategic-compact`

## 输出格式

按以下顺序返回结果：

```text
STACK
- language/framework/runtime summary

DAILY
- always-loaded items with evidence

LIBRARY
- searchable/reference items with evidence

INSTALL PLAN
- what should be installed, removed, or routed

VERIFICATION
- checks run and remaining gaps
```