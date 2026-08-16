---
name: code-understanding
description: Provides adversarial code comprehension for security research, mapping architecture, tracing data flows, and hunting vulnerability variants to build ground-truth understanding before or alongside static analysis.
user-invocable: false
---
# 代码理解技能

此技能为安全研究提供对抗性代码理解能力。它可以梳理架构、追踪数据流，并在静态分析之前或与之同时搜寻漏洞变体。

## 目的

通过构建关于代码实际工作方式的事实性知识来补充扫描：
- 从攻击者视角快速理解不熟悉的代码库
- 追踪从不可信输入到危险汇点的确切数据流
- 在识别出一种漏洞模式后，找出该模式的所有实例
- 构建应用程序上下文，以提高扫描信号质量和验证准确性

## 何时使用

- **扫描之前**：构建上下文，以便立即理解扫描器结果
- **验证期间**：追踪某个发现项在代码中的真实路径
- **发现问题之后**：在其他位置搜寻相同模式的变体
- **面对不熟悉的代码时**：在开始任何分析之前梳理架构

## 模式

| 模式 | 命令标志 | 目的 |
|------|-------------|---------|
| **梳理** | `--map` | 构建高层上下文：入口点、信任模型、数据路径 |
| **追踪** | `--trace <entry>` | 沿完整调用链追踪一条从源 → 汇点的流 |
| **搜寻** | `--hunt <pattern>` | 在整个代码库中查找某种模式的所有变体 |
| **研读** | `--study <subject>` | 深入研读一个子系统——提取不变量、契约和假设 |
| **讲解** | `--teach` | 深入解释不熟悉的代码、框架或模式 |

这些模式可以组合使用。梳理 → 研读 → 追踪 → 搜寻是自然的攻击推进流程。

---

## [CONFIG] 配置

```yaml
output_dir: resolved by raptor-run-lifecycle start understand
confidence_levels:
  high: "Direct code evidence — quote the line"
  medium: "Inferred from context — state the assumption"
  low: "Speculative — flag explicitly, verify before acting on"
flow_format: source → transform(s) → sink
```

---

## [EXEC] 执行规则

1. 在作出任何断言之前阅读实际代码。不要依赖命名约定或假设。
2. 为每项断言引用确切的代码行（文件路径 + 行号）作为证据。
3. 追踪数据流时，应一直跟踪到它终止为止——不要停在遇到的第一个值得关注的函数处。
4. 搜寻变体时，应搜索整个代码库。不要停在第一个匹配项处。
5. 进行讲解时，应解释其机制，而不仅仅是名称。展示实现该机制的代码。
6. 生成结构化输出（context-map.json、flow-trace.json、variants.json），以便与验证流水线集成。
7. **libexec 脚本：** 严格按照提示中展示的方式运行 `libexec/` 脚本——不要在前面添加 `bash`、`export` 命令、绝对路径或额外的 shell 逻辑。权限系统仅会自动批准以这种确切形式运行的 `libexec/raptor-*` 命令。

---

## [GATES] 强制门控

**GATE-U1 [READ-FIRST]：** 未阅读代码时，绝不要描述代码的工作方式。如果你尚未阅读某个文件，应明确说明，并在继续之前先阅读它。

**GATE-U2 [ATTACKER-LENS]：** 阅读任何代码路径时，都要问：信任在哪里发生转移？哪些地方缺少检查？用户输入在哪里影响执行？这些问题才是分析的驱动力，而不只是“这段代码是否实现了注释所描述的功能”。

**GATE-U3 [FULL-FLOW]：** 追踪数据流时，必须覆盖每一个分支：正常路径、错误路径、中间件、异步处理程序。错误路径中缺失的检查仍然属于检查缺失。

**GATE-U4 [VARIANT-COMPLETE]：** 在搜索完整个代码库之前，变体搜寻不能算完成。如果某种模式出现在一个位置，就应假定它还会出现在其他位置，除非有证据证明并非如此。

**GATE-U5 [EVIDENCE-ONLY]：** 置信度必须与证据相符。高置信度需要引用具体行。中等置信度需要明确说明假设。低置信度必须进行标记，并且在验证之前不得据此采取行动。

---

## [STYLE] 输出格式

- 文件引用：全文使用 `path/to/file.py:42` 格式
- 流程格式：`source (file:line) → transform (file:line) → sink (file:line)`
- 内联置信度：`(confidence: high — file:line)` 或 `(confidence: medium — assumed from X)`
- 不使用红色/绿色状态指示符（其含义取决于视角）
- JSON 输出写入 `$WORKDIR/`，以便进行流水线集成

---

## 与验证流水线集成

**共享清单：** MAP-0 运行 `build_checklist()`，生成 `checklist.json`，其中包含每个文件的 SHA-256 校验和。这与 `/validate` 阶段 0 使用的是同一份清单。覆盖范围跟踪（每个函数的 `checked_by`）会在两个技能之间累计。

**清单项模式**（`checklist.json` → `files[].items[]`）：

| 字段 | 类型 | 值 / 说明 |
|-------|------|----------------|
| `name` | string | 函数/全局变量/宏/类的名称 |
| `kind` | string | `"function"`、`"global"`、`"macro"`、`"class"` |
| `line_start` | int | 该项的第一行 |
| `line_end` | int\|null | 最后一行（如果未知则为 null） |
| `signature` | string | 完整签名（仅限函数） |
| `checked_by` | list[str] | 已审查此项的运行 ID |
| `metadata` | object | 语言特定信息：`visibility`、`params`、`return_type`、`attributes` |

该字段是 `kind`，而不是 `type`。来源：`core/inventory/extractors.CodeItem`。

输出模式与验证流水线的格式（`attack-surface.json`、`attack-paths.json`、`findings.json`）保持一致。

---

## 阶段

| 阶段 | 模式 | 门禁 | 输出 |
|-------|------|---------|--------|
| **映射** | `--map` | U1, U2 | `context-map.json` |
| **追踪** | `--trace` | U1, U2, U3, U5 | `flow-trace-<id>.json` |
| **搜寻** | `--hunt` | U1, U4, U5 | `variants.json` |
| **讲解** | `--teach` | U1, U5 | 无 --- 内联输出 |

有关详细说明，请参阅各阶段对应的文件。

### 可选：运行时探测（仅限映射）

如果目标包含可运行的二进制文件，`map.md` 中的 MAP-7 描述了如何使用 `sandbox(observe=True)` 探测来佐证静态映射。
运行时观测结果会写入 `context-map.json` 的 `runtime_observation` 键下，并包含与入口点和汇点的关联信息
——如果二进制文件实际读取了某个入口点所在的文件，那么该入口点将被标记为 `"runtime-confirmed"`，而不只是通过结构识别得出。

如果目标仅包含库/源代码，或者操作者未获得执行该二进制文件的授权，则跳过此步骤。

---

## 声明

本分析仅用于防御目的、安全研究和经授权的安全测试。