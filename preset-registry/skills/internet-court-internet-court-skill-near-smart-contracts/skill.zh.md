---
name: near-smart-contracts
description: NEAR Protocol smart contract development in Rust. Use when writing, reviewing, or deploying NEAR smart contracts. Covers contract structure, state management, cross-contract calls, testing, security, and optimization patterns. Based on near-sdk v5.x with modern macro syntax.
license: MIT
metadata:
  author: near
  version: "1.0.0"
---
# NEAR 智能合约开发

使用 Rust 和 NEAR SDK（v5.x）在 NEAR Protocol 上开发安全高效智能合约的综合指南。

## 适用场景

在以下情况下参考这些指南：

- 使用 Rust 编写新的 NEAR 智能合约
- 审查现有合约代码的安全性和优化情况
- 实现跨合约调用和回调
- 管理合约状态和存储
- 测试和部署 NEAR 合约
- 优化 gas 使用和性能

## 开始使用

### 前置条件

开始开发前，安装所需工具：

```bash
# Install Rust (if not already installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Add wasm32 target for compiling contracts
rustup target add wasm32-unknown-unknown

# Install cargo-near (build, deploy, and manage contracts)
curl --proto '=https' --tlsv1.2 -LsSf https://github.com/near/cargo-near/releases/latest/download/cargo-near-installer.sh | sh

# Install near-cli-rs (interact with NEAR network)
curl --proto '=https' --tlsv1.2 -LsSf https://github.com/near/near-cli-rs/releases/latest/download/near-cli-rs-installer.sh | sh
```

### 创建新项目

> **重要**：创建新项目时**始终**运行 `cargo near new`。**绝不要**手动创建 Cargo.toml、lib.rs 或任何项目文件。该命令会使用正确的配置生成所有必需文件。

```bash
# REQUIRED: Create a new contract project using the official template
cargo near new my-contract

# Navigate to project directory
cd my-contract

# Build the contract
cargo near build

# Run tests
cargo test
```

**`cargo near new` 为强制要求的原因：**
- 生成包含正确依赖项和构建设置的 Cargo.toml
- 使用 `src/lib.rs` 模板创建正确的项目结构
- 在 `tests/` 目录中包含集成测试设置
- 配置包含 `overflow-checks = true` 的 release profile
- 设置用于 WASM 编译的正确 crate-type
- 避免导致构建失败的常见配置错误

**不要：**
- 手动创建 Cargo.toml
- 手动创建 `src/lib.rs`
- 从示例中复制粘贴项目结构
- 跳过此步骤并直接创建文件

### 项目结构

```
my-contract/
├── Cargo.toml          # Dependencies and project config
├── src/
│   └── lib.rs          # Main contract code
├── tests/              # Integration tests
│   └── test_basics.rs
└── README.md
```

### 部署到测试网

```bash
# Create a testnet account (if needed)
near account create-account sponsor-by-faucet-service my-contract.testnet autogenerate-new-keypair save-to-keychain network-config testnet create

# Build in release mode
cargo near build --release

# Deploy to testnet
cargo near deploy my-contract.testnet without-init-call network-config testnet sign-with-keychain send
```

## 按优先级划分的规则类别

| 优先级 | 类别 | 影响 | 前缀 |
| --------- | ---------- | -------- | --------- |
| 1 | 安全与安全性 | 严重 | `security-` |
| 2 | 合约结构 | 高 | `structure-` |
| 3 | 状态管理 | 高 | `state-` |
| 4 | 跨合约调用 | 中高 | `xcc-` |
| 5 | 合约升级 | 中高 | `upgrade-` |
| 6 | 链签名 | 中高 | `chain-` |
| 7 | Gas 优化 | 中 | `gas-` |
| 8 | 产出与恢复 | 中 | `yield-` |
| 9 | 测试 | 中 | `testing-` |
| 10 | 最佳实践 | 中 | `best-` |

### 1. 安全与防护（关键）

- `security-storage-checks` - 始终验证存储操作并检查存款
- `security-access-control` - 使用 `predecessor_account_id` 实现适当的访问控制
- `security-reentrancy` - 防范重入攻击（在外部调用之前更新状态）
- `security-overflow` - 在 Cargo.toml 中使用 `overflow-checks = true` 以防止溢出
- `security-callback-validation` - 验证回调结果并处理失败情况
- `security-private-callbacks` - 将回调标记为 `#[private]` 以防止外部调用
- `security-yoctonear-validation` - 使用带有 `#[payable]` 的函数验证附加存款
- `security-sybil-resistance` - 实现最低存款检查以防止垃圾请求

### 2. 合约结构（高）

- `structure-near-bindgen` - 对合约结构体使用 `#[near(contract_state)]` 宏（替代旧的 `#[near_bindgen]`）
- `structure-initialization` - 使用 `#[init]` 模式实现正确的初始化
- `structure-versioning` - 通过版本控制机制规划合约升级
- `structure-events` - 使用 `env::log_str()` 和结构化事件日志（NEP-297）
- `structure-standards` - 遵循 NEAR Enhancement Proposals（NEPs）标准
- `structure-serializers` - 对数据结构使用 `#[near(serializers = [json, borsh])]`
- `structure-panic-default` - 使用 `#[derive(PanicOnDefault)]` 要求进行初始化

### 3. 状态管理（高）

- `state-collections` - 使用来自 `near_sdk::store` 的 SDK 集合：`IterableMap`、`IterableSet`、`Vector`、`LookupMap`、`LookupSet`、`UnorderedMap`、`UnorderedSet`、`TreeMap`
- `state-serialization` - 状态使用 Borsh，外部接口使用 JSON
- `state-lazy-loading` - 使用 SDK 集合进行延迟加载以节省 gas（按需加载，而不是一次性全部加载）
- `state-pagination` - 对大型数据集使用 `.skip()` 和 `.take()` 实现分页
- `state-migration` - 使用版本控制规划状态迁移策略
- `state-storage-cost` - 请记住：1 NEAR ≈ 100kb 存储空间，合约需要为其存储空间付费
- `state-unique-prefixes` - 为所有集合使用唯一的字节前缀（避免冲突）
- `state-native-vs-sdk` - 原生集合（Vec、HashMap）会加载全部数据；仅对少于 100 条的条目使用

### 4. 跨合约调用（中高）

- `xcc-promise-chaining` - 正确地串联 promises
- `xcc-callback-handling` - 处理所有回调场景（成功、失败）
- `xcc-gas-management` - 为跨合约调用分配适当的 gas
- `xcc-error-handling` - 实现健壮的错误处理
- `xcc-result-unwrap` - 未经检查时，绝不要对 promise 结果使用 unwrap

### 5. 合约升级与迁移（中高）

- `upgrade-migration` - 使用枚举进行状态版本控制，并通过 `#[init(ignore_state)]` 实现 `migrate` 方法
- `upgrade-self-update` - 实现可通过编程方式自行更新的合约模式
- `upgrade-cleanup-old-state` - 始终移除旧的状态结构以释放存储空间
- `upgrade-dao-controlled` - 在生产环境的升级治理中使用多重签名或 DAO

### 6. 链签名（中高）

- `chain-signatures` - 推导外部区块链地址、请求 MPC 签名并构建多链交易
- `chain-callback-handling` - 正确处理 MPC 签名回调
- `chain-gas-allocation` - 为 MPC 调用分配足够的 Gas（yield/resume 模式）

### 7. Gas 优化（中）

- `gas-batch-operations` - 批量执行操作以降低交易成本
- `gas-minimal-state-reads` - 最大限度减少状态读写（在内存中缓存）
- `gas-efficient-collections` - 选择适当的集合类型（LookupMap 与 IterableMap）
- `gas-view-functions` - 将只读函数标记为 view（Rust 中的 `&self`）
- `gas-avoid-cloning` - 避免不必要地克隆大型数据结构
- `gas-early-validation` - 尽早使用 `require!`，为无效输入节省 Gas
- `gas-prepaid-gas` - 为跨合约调用附加适当的 Gas（建议：30 TGas）

### 8. Yield 与 Resume（中）

- `yield-resume` - 创建 yield promise、发出 resume 信号、处理超时并管理 yield/resume 之间的状态
- `yield-gatekeeping` - 保护 resume 方法，防止未经授权的调用者访问

### 9. 测试（中）

- `testing-integration-tests` - 使用 `near-sandbox` + `near-api` 进行集成测试
- `testing-unit-tests` - 使用模拟上下文编写全面的单元测试
- `testing-sandbox` - 在测试网/主网之前使用本地 sandbox 环境进行测试
- `testing-edge-cases` - 测试边界条件、溢出和空状态
- `testing-gas-profiling` - 在集成测试中分析 Gas 使用情况
- `testing-cross-contract` - 全面测试跨合约调用和回调
- `testing-failure-scenarios` - 测试 promise 失败和超时场景
- `testing-time-travel` - 使用 `sandbox.fast_forward()` 进行时间敏感型测试

### 10. 最佳实践（中）

- `best-contract-tools` - 使用 `near-sdk-contract-tools` 实现 NEP 标准（FT、NFT 等）以及 NEP-297 结构化事件
- `best-panic-messages` - 提供清晰且可操作的 panic 消息
- `best-logging` - 使用 `env::log_str()` 进行调试和事件发出
- `best-documentation` - 记录公共方法、参数和复杂逻辑
- `best-error-types` - 定义自定义错误类型或使用描述性字符串
- `best-constants` - 使用常量表示 magic number 和配置
- `best-require-macro` - 使用 `require!` 代替 `assert!`，以获得更好的错误消息
- `best-promise-return` - 从跨合约调用中返回 promise，以便进行正确的跟踪
- `best-sdk-crates` - 复用 SDK 导出的 crate（borsh、serde、base64 等）
- `best-account-id-encoding` - 使用 base32 编码 AccountIds，以节省 40% 的存储空间

## 使用方法

阅读各个规则文件，了解详细说明和代码示例：

```
rules/security-storage-checks.md
rules/structure-near-bindgen.md
rules/state-collections.md
rules/xcc-promise-chaining.md
rules/upgrade-migration.md
rules/chain-signatures.md
rules/yield-resume.md
rules/best-contract-tools.md
rules/testing-integration-tests.md
```

每个规则文件包含：

- 简要说明其重要性
- 错误代码示例及说明
- 正确代码示例及说明
- 其他上下文信息和 NEAR 特定注意事项

## 最新工具与版本

### 开发工具

- **cargo-near**：最新版本 - 构建、部署和管理合约（`cargo near build`、`cargo near deploy`）
- **near-cli-rs**：最新版本 - NEAR 命令行界面（`near contract call`、`near contract view`）
- **rustc**：最新稳定版 - Rust 编译器
- **near-sandbox**：最新版本 - 用于集成测试的本地沙盒环境
- **near-api-rs**：最新版本 - 用于与 NEAR 交互的 Rust API 客户端（在测试中取代 near-workspaces-rs）
- **omni-transaction-rs**：最新版本 - 为多个区块链构建交易（Bitcoin、Ethereum 等）

### SDK 版本

- **near-sdk-rs**：v5.x（v6.x 将支持结构化错误）
- **near-sdk-contract-tools**：最新版本 - 用于 NEP 标准（FT、NFT、Storage Management）的派生宏

### 主要功能

- **统一的宏语法**：`#[near(contract_state)]` 取代 `#[near_bindgen]` + 派生宏
- **灵活的序列化**：数据结构可使用 `#[near(serializers = [json, borsh])]`
- **存储集合**：`near_sdk::store::IterableMap`、`IterableSet`、`LookupMap`、`LookupSet`、`Vector`、`UnorderedMap`、`UnorderedSet`、`TreeMap`
- **简化的跨合约调用**：使用 `Promise::new()` 和 `.then()` 的高级 Promise API
- **内置 NEP 支持**：FT（NEP-141）、NFT（NEP-171）及其他标准
- **结果处理**：使用 `#[handle_result]` 处理返回 `Result<T, E>` 且不会触发 panic 的方法
- **Yield/Resume**：合约可以暂停执行，并等待外部服务恢复执行
- **链签名**：为其他区块链（Bitcoin、Ethereum、Solana 等）签署交易
- **Contract Tools**：用于 Owner、Pause、基于角色的访问控制模式的派生宏

## 资源

- NEAR 文档：<https://docs.near.org>
- 智能合约快速入门：<https://docs.near.org/smart-contracts/quickstart>
- 合约剖析：<https://docs.near.org/smart-contracts/anatomy/>
- NEAR SDK Rust：<https://docs.near.org/tools/sdk>
- SDK Rust 参考：<https://docs.rs/near-sdk>
- 存储与集合：<https://docs.near.org/smart-contracts/anatomy/collections>
- 最佳实践：<https://docs.near.org/smart-contracts/anatomy/best-practices>
- 跨合约调用：<https://docs.near.org/smart-contracts/anatomy/crosscontract>
- Yield 与 Resume：<https://docs.near.org/smart-contracts/anatomy/yield-resume>
- 合约升级：<https://docs.near.org/smart-contracts/release/upgrade>
- 链签名：<https://docs.near.org/chain-abstraction/chain-signatures>
- 链签名实现：<https://docs.near.org/chain-abstraction/chain-signatures/implementation>
- 安全最佳实践：<https://docs.near.org/smart-contracts/security/welcome>
- 集成测试：<https://docs.near.org/smart-contracts/testing/integration-test>
- NEP-297 事件：<https://github.com/near/NEPs/blob/master/neps/nep-0297.md>
- NEAR 标准（NEP）：<https://github.com/near/NEPs>
- NEAR 示例：<https://github.com/near-examples>
- 沙盒测试：<https://github.com/near/near-sandbox>
- NEAR API Rust：<https://github.com/near/near-api-rs>
- Omni Transaction RS：<https://github.com/near/omni-transaction-rs>
- Contract Tools：<https://github.com/near/near-sdk-contract-tools>

## 存储成本参考

| 存储 | 成本 | 备注 |
|---------|------|-------|
| 1 byte | 0.00001 NEAR | 每 0.1 NEAR 约可存储 10kb |
| 100 KB | ~1 NEAR | 近似参考值 |
| AccountId | 64+ bytes | 使用 base32 编码可节省 40% |
| 合约代码 | 可变 | 由合约账户支付 |

## SDK 集合参考

| 集合 | 可迭代 | 可清除 | 有序 | 范围 | 使用场景 |
|------------|----------|-------|---------|-------|----------|
| `Vector` | 是 | 是 | 是 | 是 | 支持索引访问的有序列表 |
| `LookupMap` | 否 | 否 | 否 | 否 | 快速键值存储，无需迭代 |
| `LookupSet` | 否 | 否 | 否 | 否 | 快速成员检查 |
| `IterableMap` | 是 | 是 | 是 | 否 | 支持迭代的键值存储 |
| `IterableSet` | 是 | 是 | 是 | 否 | 支持迭代的集合 |
| `UnorderedMap` | 是 | 是 | 否 | 否 | 键值存储，迭代顺序不固定 |
| `UnorderedSet` | 是 | 是 | 否 | 否 | 集合，迭代顺序不固定 |
| `TreeMap` | 是 | 是 | 是 | 是 | 支持范围查询的有序键值存储 |