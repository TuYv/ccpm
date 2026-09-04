---
name: doc-gen
license: MIT
description: >-
  Documentation generator with three modes: function-level (JSDoc/docstrings),
  module-level (directory READMEs), and API reference (endpoints/exports).
  Reads existing project doc style and matches it. Never generates docs that
  just restate what the signature already says.
user-invocable: true
auto-trigger: false
trigger_keywords:
  - document
  - docs
  - docstring
  - jsdoc
  - readme
  - api docs
last-updated: 2026-03-20
---
# /doc-gen — 文档生成器

## 何时使用

- 为一个文件或一组文件中的函数添加 JSDoc/docstring
- 为模块或目录编写 README
- 为 HTTP API 或导出的库接口编写文档

模式根据目标自动检测：
- **文件路径** → 函数级模式
- **目录路径** → 模块级模式
- **路由文件或 API 目录** → API 参考模式
- **显式覆盖**：`/doc-gen --mode function|module|api [target]`

## 命令

| 命令 | 行为 |
|---|---|
| `/doc-gen [file]` | 为单个文件生成函数级文档 |
| `/doc-gen [directory]` | 为目录生成模块级 README |
| `/doc-gen --api [target]` | 为端点或导出生成 API 参考 |
| `/doc-gen --mode [mode] [target]` | 强制使用特定模式 |
| `/doc-gen --dry-run [target]` | 显示将要文档化的内容但不实际写入 |

## 协议

### 阶段 1：检测风格

1. 阅读 CLAUDE.md 以了解文档规范
2. 在目标区域搜索已有的文档注释——注意密度、语气、使用的标签和行长度
3. 无已有文档时的默认：TS/JS 使用 JSDoc（`@param`、`@returns`、`@throws`、`@example`）；Python 使用 Google 风格；其他语言使用各自惯用格式

在所有生成的文档中一致地应用检测到的风格。

### 阶段 2：分析目标

#### 函数级模式

对每个函数：

1. 阅读完整函数体，而不只是签名
2. 分类：
   - **琐碎**：简单的 getter/setter、名称一目了然的单行包装函数——跳过
   - **非琐碎**：记录用途、参数语义（而非类型——TS 已有类型信息）、返回值保证、抛出/错误、副作用、不明显的边界情况，以及用法不明显时的 `@example`
3. 使用检测到的风格编写

**核心规则：**每条文档必须在签名已表达的信息之外补充信息。做不到，就跳过。

#### 模块级模式

1. 读取目录中的所有文件（一层深度）
2. 识别：问题域、关键导出、内部文件、外部依赖，以及哪些地方导入了此模块
3. README 结构：`# {Module Name}` | 一段式描述 | `## Key Exports` 表格（名称、描述）| `## Architecture`（仅在内部结构不明显时）| `## Usage`（真实导入路径）| `## Dependencies`（仅不明显的）
4. 如果 README 已存在，更新而非替换——保留你的分析未覆盖的章节

#### API 参考模式

对 HTTP 端点：方法 + 路径、描述、路径/查询/请求体参数（含类型）、响应结构与状态码、错误、认证级别，以及对非琐碎端点提供 curl/fetch 示例。

对导出的库：名称与种类（function/class/constant/type）、描述、带语义说明的参数/属性、带保证说明的返回类型、导入与用法示例。

组织为一份带目录的参考文档。

### 阶段 3：编写

1. 一致地应用检测到的风格
2. 函数级：在每个函数上方插入文档注释
3. 模块级：在目标目录中写入或更新 README.md
4. API 参考：写入 `docs/api/` 或路由文件旁边
5. 编写完成后运行 typecheck（格式错误的 JSDoc 可能导致 TS 错误）

### 阶段 4：验证

重新阅读每条文档注释。对每条自问："它是否在签名之外补充了信息？"如果没有，删除它。检查准确性：参数名、返回类型、副作用，以及示例是否真的能够编译/运行。

## 情境关卡

**披露：**"正在为 [target] 生成文档。源文件将被修改。"
**可逆性：**琥珀色——向源文件添加 JSDoc/docstring；可对被修改的文件执行 `git checkout` 撤销。
**信任关卡：**
- 任意：对未记录的函数进行增量式文档生成。
- 熟悉（5 次以上会话）：重写已有 docstring，可能丢弃原有内容。

## 质量关卡

- 每条文档注释都在签名之外补充信息；否则删除
- 文档与实际代码行为一致——错误的文档比没有文档更糟
- 风格全程与项目现有规范保持一致
- 不写 `@param name - The name` 这类凑数内容；参数名不言自明时省略该参数
- 插入后 typecheck 通过
- 至少有一些函数因琐碎而被跳过——如果每个函数都写了文档，说明你过度文档化了

## 退出协议

```
=== Doc-Gen Report ===
Mode: {function-level | module-level | api-reference}
Target: {path}
Style: {detected style}
Documented: {N functions ({M} skipped as trivial) | README.md ({N} exports) | {N} endpoints}
Skipped: {item}: {reason}
```

```
---HANDOFF---
- Generated {mode} docs for {target}
- Matched existing {style} convention
- {what was skipped and why}
- Reversibility: amber — undo with `git checkout` on modified source files
---
```
