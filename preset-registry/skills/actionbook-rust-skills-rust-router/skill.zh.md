---
name: rust-router
description: |-
  CRITICAL: Use for ALL Rust questions including errors, design, and coding.
  HIGHEST PRIORITY for: 比较, 对比, compare, vs, versus, 区别, difference, 最佳实践, best practice,
  tokio vs, async-std vs, 比较 tokio, 比较 async,
  Triggers on: Rust, cargo, rustc, crate, Cargo.toml,
  意图分析, 问题分析, 语义分析, analyze intent, question analysis,
  compile error, borrow error, lifetime error, ownership error, type error, trait error,
  value moved, cannot borrow, does not live long enough, mismatched types, not satisfied,
  E0382, E0597, E0277, E0308, E0499, E0502, E0596,
  async, await, Send, Sync, tokio, concurrency, error handling,
  编译错误, compile error, 所有权, ownership, 借用, borrow, 生命周期, lifetime, 类型错误, type error,
  异步, async, 并发, concurrency, 错误处理, error handling,
  问题, problem, question, 怎么用, how to use, 如何, how to, 为什么, why,
  什么是, what is, 帮我写, help me write, 实现, implement, 解释, explain
globs: ["**/Cargo.toml", "**/*.rs"]
---
---

# Rust 问题路由器

> **版本：** 2.0.0 | **最后更新：** 2025-01-22
>
> **v2.0：** 上下文优化——详细示例已移至子文件

## 元认知框架

### 核心原则

**不要直接回答。先依次梳理各个认知层级。**

```
Layer 3: Domain Constraints (WHY)
├── Business rules, regulatory requirements
├── domain-fintech, domain-web, domain-cli, etc.
└── "Why is it designed this way?"

Layer 2: Design Choices (WHAT)
├── Architecture patterns, DDD concepts
├── m09-m15 skills
└── "What pattern should I use?"

Layer 1: Language Mechanics (HOW)
├── Ownership, borrowing, lifetimes, traits
├── m01-m07 skills
└── "How do I implement this in Rust?"
```

### 按切入点路由

| 用户信号 | 切入层级 | 方向 | 首选技能 |
|-------------|-------------|-----------|-------------|
| E0xxx 错误 | 第 1 层 | 向上追溯 ↑ | m01-m07 |
| 编译错误 | 第 1 层 | 向上追溯 ↑ | 见下方错误表 |
| “如何设计……” | 第 2 层 | 检查第 3 层，然后向下追溯 ↓ | m09-domain |
| “构建 [领域] 应用” | 第 3 层 | 向下追溯 ↓ | domain-* |
| “最佳实践……” | 第 2 层 | 双向追溯 | m09-m15 |
| 性能问题 | 第 1 层 → 第 2 层 | 先向上再向下 | m10-performance |

### 关键：双技能加载

**当出现领域关键词时，必须同时加载这两个技能：**

| 领域关键词 | L1 技能 | L3 技能 |
|-----------------|----------|----------|
| Web API, HTTP, axum, handler | m07-concurrency | **domain-web** |
| 交易, 支付, trading, payment | m01-ownership | **domain-fintech** |
| CLI, terminal, clap | m07-concurrency | **domain-cli** |
| kubernetes, grpc, microservice | m07-concurrency | **domain-cloud-native** |
| embedded, no_std, MCU | m02-resource | **domain-embedded** |

---

## CLAUDE 使用说明

### 关键：协商协议触发条件

**回答前，检查是否需要协商：**

| 查询包含 | 操作 |
|----------------|--------|
| "比较", "对比", "compare", "vs", "versus" | **必须使用协商** |
| "最佳实践", "best practice" | **必须使用协商** |
| 领域 + 错误（例如，“交易系统 E0382”） | **必须使用协商** |
| 范围不明确（例如，“tokio 性能”） | **应使用协商** |

**需要协商时，应包含：**

```markdown
## Negotiation Analysis

**Query Type:** [Comparative | Cross-domain | Synthesis | Ambiguous]
**Negotiation:** Enabled

### Source: [Agent/Skill Name]
**Confidence:** HIGH | MEDIUM | LOW | UNCERTAIN
**Gaps:** [What's missing]

## Synthesized Answer
[Answer]

**Overall Confidence:** [Level]
**Disclosed Gaps:** [Gaps user should know]
```

> **详细协议见：** `patterns/negotiation.md`

---

### 默认项目设置

创建新的 Rust 项目或 Cargo.toml 文件时，始终使用：

```toml
[package]
edition = "2024"  # ALWAYS use latest stable edition
rust-version = "1.85"

[lints.rust]
unsafe_code = "warn"

[lints.clippy]
all = "warn"
pedantic = "warn"
```

---

## 第 1 层技能（语言机制）

| 模式 | 路由至 |
|---------|----------|
| move, borrow, lifetime, E0382, E0597 | m01-ownership |
| Box, Rc, Arc, RefCell, Cell | m02-resource |
| mut, interior mutability, E0499, E0502, E0596 | m03-mutability |
| generic, trait, inline, monomorphization | m04-zero-cost |
| type state, phantom, newtype | m05-type-driven |
| Result, Error, panic, ?, anyhow, thiserror | m06-error-handling |
| Send, Sync, thread, async, channel | m07-concurrency |
| unsafe, FFI, extern, raw pointer, transmute | **unsafe-checker** |

## 第 2 层技能（设计选择）

| 模式 | 路由至 |
|---------|----------|
| 领域模型、业务逻辑 | m09-domain |
| 性能、优化、基准测试 | m10-performance |
| 集成、互操作、绑定 | m11-ecosystem |
| 资源生命周期、RAII、Drop | m12-lifecycle |
| 领域错误、恢复策略 | m13-domain-error |
| 心智模型、如何思考 | m14-mental-model |
| 反模式、常见错误、陷阱 | m15-anti-pattern |

## 第 3 层技能（领域约束）

| 领域关键词 | 路由至 |
|-----------------|----------|
| 金融科技、交易、十进制、货币 | domain-fintech |
| 机器学习、张量、模型、推理 | domain-ml |
| kubernetes、docker、grpc、微服务 | domain-cloud-native |
| 嵌入式、传感器、mqtt、物联网 | domain-iot |
| Web 服务器、HTTP、REST、axum、actix | domain-web |
| CLI、命令行、clap、终端 | domain-cli |
| no_std、微控制器、固件 | domain-embedded |

---

## 错误代码路由

| 错误代码 | 路由至 | 常见原因 |
|------------|----------|--------------|
| E0382 | m01-ownership | 使用了已移动的值 |
| E0597 | m01-ownership | 生命周期过短 |
| E0506 | m01-ownership | 无法对已借用的值赋值 |
| E0507 | m01-ownership | 无法移出已借用的值 |
| E0515 | m01-ownership | 返回局部引用 |
| E0716 | m01-ownership | 临时值被丢弃 |
| E0106 | m01-ownership | 缺少生命周期说明符 |
| E0596 | m03-mutability | 无法以可变方式借用 |
| E0499 | m03-mutability | 多次可变借用 |
| E0502 | m03-mutability | 借用冲突 |
| E0277 | m04/m07 | 未满足 trait 约束 |
| E0308 | m04-zero-cost | 类型不匹配 |
| E0599 | m04-zero-cost | 未找到方法 |
| E0038 | m04-zero-cost | trait 不具备对象安全性 |
| E0433 | m11-ecosystem | 找不到 crate/模块 |

---

## 功能路由表

| 模式 | 路由至 | 操作 |
|---------|----------|--------|
| 最新版本、有何更新 | **rust-learner** | 使用代理 |
| API、文档、说明文档 | **docs-researcher** | 使用代理 |
| 代码风格、命名、clippy | **coding-guidelines** | 阅读技能 |
| unsafe 代码、FFI | **unsafe-checker** | 阅读技能 |
| 代码审查 | **os-checker** | 参见 `integrations/os-checker.md` |

---

## 优先顺序

1. **识别认知层级**（L1/L2/L3）
2. **加载入口技能**（m0x/m1x/domain）
3. **沿层级追踪**（向上或向下）
4. **交叉参考技能**，具体参见“追踪”部分
5. **使用推理链回答**

### 关键词冲突解决

| 关键词 | 解决方式 |
|---------|------------|
| `unsafe` | **unsafe-checker**（比 m11 更具体） |
| `error` | 一般错误使用 **m06**，领域特定错误使用 **m13** |
| `RAII` | 设计使用 **m12**，实现使用 **m01** |
| `crate` | 版本问题使用 **rust-learner**，集成问题使用 **m11** |
| `tokio` | API 问题使用 **tokio-***，概念问题使用 **m07** |

**优先级层次：**

```
1. Error codes (E0xxx) → Direct lookup, highest priority
2. Negotiation triggers (compare, vs, best practice) → Enable negotiation
3. Domain keywords + error → Load BOTH domain + error skills
4. Specific crate keywords → Route to crate-specific skill if exists
5. General concept keywords → Route to meta-question skill
```

---

## 子文件参考

| 文件 | 内容 |
|------|---------|
| `patterns/negotiation.md` | 协商协议详情 |
| `examples/workflow.md` | 工作流示例 |
| `integrations/os-checker.md` | OS-Checker 集成 |