---
name: m11-ecosystem
description: "Use when integrating crates or ecosystem questions. Keywords: E0425, E0433, E0603, crate, cargo, dependency, feature flag, workspace, which crate to use, using external C libraries, creating Python extensions, PyO3, wasm, WebAssembly, bindgen, cbindgen, napi-rs, cannot find, private, crate recommendation, best crate for, Cargo.toml, features, crate 推荐, 依赖管理, 特性标志, 工作空间, Python 绑定"
user-invocable: false
---
## 当前依赖项（自动注入）

!`grep -A 100 '^\[dependencies\]' Cargo.toml 2>/dev/null | head -30 || echo "No Cargo.toml found"`

---

# 生态系统集成

> **第 2 层：设计选择**

## 核心问题

**哪个 crate 最适合这项工作，以及应如何集成？**

添加依赖项之前：
- 是否有标准解决方案？
- 维护状态如何？
- API 稳定性如何？

---

## 集成决策 → 实现

| 需求 | 选择 | Crates |
|------|--------|--------|
| 序列化 | 基于派生宏 | serde, serde_json |
| 异步运行时 | tokio 或 async-std | tokio（最流行） |
| HTTP 客户端 | 易用 | reqwest |
| HTTP 服务器 | 现代 | axum, actix-web |
| 数据库 | SQL 或 ORM | sqlx, diesel |
| CLI 解析 | 基于派生宏 | clap |
| 错误处理 | 应用与库 | anyhow, thiserror |
| 日志记录 | 门面模式 | tracing, log |

---

## 思考提示

添加依赖项之前：

1. **它是否得到了良好维护？**
   - 最近是否有提交？
   - 是否积极响应 issue？
   - 破坏性变更是否频繁？

2. **范围是什么？**
   - 你需要完整的 crate，还是只需要某项功能？
   - feature flags 能否减少臃肿？

3. **它如何集成？**
   - 基于 trait 还是具体类型？
   - 同步还是异步？
   - 它要求哪些 bounds？

---

## 向上追溯 ↑

追溯至领域约束（第 3 层）：

```
"Which HTTP framework should I use?"
    ↑ Ask: What are the performance requirements?
    ↑ Check: domain-web (latency, throughput needs)
    ↑ Check: Team expertise (familiarity with framework)
```

| 问题 | 追溯至 | 询问 |
|----------|----------|-----|
| 框架选择 | domain-* | 哪些约束很重要？ |
| 使用库还是自行构建 | domain-* | 部署模型是什么？ |
| API 设计 | domain-* | 使用者是谁？ |

---

## 向下追溯 ↓

追溯至实现（第 1 层）：

```
"Integrate external crate"
    ↓ m04-zero-cost: Trait bounds and generics
    ↓ m06-error-handling: Error type compatibility

"FFI integration"
    ↓ unsafe-checker: Safety requirements
    ↓ m12-lifecycle: Resource cleanup
```

---

## 快速参考

### 语言互操作

| 集成 | Crate/工具 | 使用场景 |
|-------------|------------|----------|
| C/C++ → Rust | `bindgen` | 自动生成绑定 |
| Rust → C | `cbindgen` | 导出 C 头文件 |
| Python ↔ Rust | `pyo3` | Python 扩展 |
| Node.js ↔ Rust | `napi-rs` | Node 插件 |
| WebAssembly | `wasm-bindgen` | 浏览器/WASI |

### Cargo Features

| Feature | 用途 |
|---------|---------|
| `[features]` | 可选功能 |
| `default = [...]` | 默认 features |
| `feature = "serde"` | 条件依赖项 |
| `[workspace]` | 多 crate 项目 |

## 错误代码参考

| 错误 | 原因 | 修复方法 |
|-------|-------|-----|
| E0433 | 找不到 crate | 添加到 Cargo.toml |
| E0603 | 私有项 | 查看 crate 文档 |
| 未启用 Feature | 可选 feature | 在 `features` 中启用 |
| 版本冲突 | 依赖项不兼容 | `cargo update` 或固定版本 |
| 类型重复 | crate 版本不同 | 在 workspace 中统一 |

---

## Crate 选择标准

| 标准 | 良好迹象 | 警示迹象 |
|-----------|-----------|--------------|
| 维护情况 | 最近有提交 | 已多年不活跃 |
| 社区 | Issue/PR 活跃 | 无人响应 |
| 文档 | 有示例和 API 文档 | 文档极少 |
| 稳定性 | 遵循语义化版本控制 | 频繁出现破坏性变更 |
| 依赖 | 少量且广为人知 | 繁重且冷门 |

---

## 反模式

| 反模式 | 不良原因 | 更好的做法 |
|--------------|---------|--------|
| `extern crate` | 已过时（2018+） | 直接使用 `use` |
| `#[macro_use]` | 污染全局作用域 | 显式导入 |
| 通配符依赖 `*` | 不可预测 | 指定具体版本 |
| 依赖过多 | 供应链风险 | 评估必要性 |
| 将所有依赖都置于本地 | 维护负担 | 信任 crates.io |

---

## 相关技能

| 场景 | 参见 |
|------|-----|
| 错误类型设计 | m06-error-handling |
| Trait 集成 | m04-zero-cost |
| FFI 安全性 | unsafe-checker |
| 资源管理 | m12-lifecycle |