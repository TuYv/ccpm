---
name: terraform-skill
description: Use when writing, reviewing, or debugging Terraform/OpenTofu modules, tests, CI, scans, or state ops - diagnoses failure mode (identity churn, secrets, blast radius, CI drift, state corruption) with version-aware guards.
license: Apache-2.0
metadata:
  author: Anton Babenko
  version: 1.17.1
---
# Claude Terraform Skill

面向 Terraform 和 OpenTofu、以诊断为先的指导。核心文件定义工作流；深入内容位于按需加载的参考资料中。

## 响应规范

每个 Terraform/OpenTofu 响应都必须包含：

1. **假设与最低版本要求** — 运行时（`terraform` 或 `tofu`）、确切版本、providers、状态 backend、执行路径（本地/CI/Cloud/Atlantis）、环境关键程度。如果用户未提供这些信息，请明确说明所作假设。
2. **所处理的风险类别** — 以下一项或多项：身份变动、密钥泄露、影响范围、CI 漂移、合规缺口、状态损坏、provider 升级风险、测试盲区。
3. **所选修复方案与权衡** — 选择了什么、牺牲了什么，以及原因。
4. **验证计划** — 根据运行时和风险等级定制的确切命令（`fmt -check`、`validate`、`plan -out`、策略检查）。
5. **回滚说明** — 对于任何破坏性或会改变状态的变更：如何撤销，以及应保留哪些证据。

如果没有经过审查的 plan 构件和批准，绝不建议直接在生产环境中执行 apply。

在运行 `terraform destroy`（无论是定向还是完整销毁）之前，必须先运行 `terraform plan -destroy`，并向用户展示所有将被删除的资源——包括通过 locals 或 `for_each` 引入的隐式依赖项。继续操作前必须获得明确确认。执行 destroy 时绝不使用 `-auto-approve`。

## 工作流

1. **获取执行上下文** — 运行时+版本、provider、backend、执行路径、环境关键程度。
2. **使用下方路由表诊断故障模式**。如果意图跨越多个类别，则加载相应的多个参考资料。
3. **仅加载匹配的参考文件** — 不要预先加载任务不需要的深入内容。
4. **提出带有风险控制措施的修复方案** — 说明该方案为何能解决此故障模式、仍可能出现哪些问题，以及防护措施（测试/批准/回滚）。
5. **生成构件** — HCL、迁移块（`moved`、`import`）、CI 变更、策略规则。
6. **在最终确定前进行验证** — 运行根据风险等级定制的验证命令。
7. **在末尾输出响应规范**。

## 生成前先诊断

| 故障类别 | 症状 | 主要参考资料 |
|------------------|----------|--------------------|
| **身份变动** | 重构后资源地址发生变化、`count` 索引变动、缺少 `moved` 块 | [代码模式：count 与 for_each 对比](references/code-patterns.md#count-vs-for_each-deep-dive)、[代码模式：moved 块](references/code-patterns.md#moved-blocks-terraform-11)、[代码模式：LLM 错误](references/code-patterns.md#llm-mistake-checklist--code-patterns) |
| **密钥泄露** | 密钥出现在默认值、状态、日志或 CI 构件中 | [安全与合规](references/security-compliance.md)、[代码模式：只写参数](references/code-patterns.md#write-only-arguments-terraform-111)、[状态管理](references/state-management.md) |
| **影响范围** | stack 过大、生产与非生产环境共享状态、不安全的 apply | [状态管理](references/state-management.md)、[模块模式](references/module-patterns.md) |
| **级联销毁** | 定向销毁删除的资源超出预期；引用目标资源的 locals 会使所有 `for_each` 使用者成为隐式依赖项 | 响应规范：先执行 plan-destroy；[状态管理：安全销毁](references/state-management.md#safe-destroy-protocol) |
| **CI 漂移** | 本地 plan ≠ CI plan、未审查构件便执行 apply、版本未固定 | [CI/CD 工作流](references/ci-cd-workflows.md)、[代码模式：版本](references/code-patterns.md#version-management) |
| **合规缺口** | 缺少策略阶段、没有批准模型、没有证据保留机制 | [安全与合规](references/security-compliance.md)、[CI/CD 工作流](references/ci-cd-workflows.md) |
| **测试盲区** | 仅通过 plan 验证计算值、对 set 类型建立索引、混淆 mock 与真实环境 | [测试框架](references/testing-frameworks.md) |
| **状态损坏 / 恢复** | 锁无法释放、backend 迁移、漂移协调 | [状态管理](references/state-management.md) |
| **Provider 升级风险** | 包含破坏性变更的 provider 版本升级、模块版本未固定 | [代码模式：版本](references/code-patterns.md#version-management)、[模块模式](references/module-patterns.md) |
| **Provider 生命周期** | 在状态中仍有资源时移除 provider、孤立资源、`removed` 块的使用 | [状态管理：移除 Provider](references/state-management.md#provider-removal) |
| **Bootstrap / 编排误用** | 使用 `null_resource` + `local-exec` 进行 bootstrap、使用 `remote-exec` 运行设置脚本、provisioner 的 stdout 将密钥泄露到 CI 日志中 | [代码模式：将 Provisioner 作为最后手段](references/code-patterns.md#provisioners-as-last-resort) |
| **导航 / 安全重命名盲区** | 无法按语义定位符号定义/引用、将值符号重命名当作盲目的文本替换、仅使用 grep 的重构遗漏引用、虚构 `rg` shim | [代码智能](references/code-intelligence-lsp.md#terraform-ls-capability-matrix) |
| **跨云 / Provider 映射** | “X 在 Azure/GCP 中的等价项是什么”、为每种云选择 backend/auth 模型 | [状态管理：跨云等价项](references/state-management.md#cross-cloud-equivalents) |

## 何时使用此技能

**以下情况应激活：** 创建或审查 Terraform/OpenTofu 配置或模块、设置或调试测试、规划多环境部署结构、实施 IaC CI/CD、选择模块模式或状态组织方式、配置或迁移远程状态后端。

**以下情况不要使用：** Claude 已经掌握的基础 HCL 语法问题、提供商 API 参考（请链接到文档）、与 Terraform/OpenTofu 无关的云平台问题。

## 核心原则

### 模块层次结构

| 类型 | 何时使用 | 范围 |
|------|-------------|-------|
| **资源模块** | 单个由相关资源组成的逻辑组 | VPC + 子网、SG + 规则 |
| **基础设施模块** | 为特定用途组织的资源模块集合 | 单个区域/账户中的多个资源模块 |
| **组合** | 完整的基础设施 | 跨多个区域/账户 |

流程：资源 → 资源模块 → 基础设施模块 → 组合。

### 目录布局

```
environments/   # prod/ staging/ dev/  — per-env configurations
modules/        # networking/ compute/ data/ — reusable modules
examples/       # minimal/ complete/ — docs + integration fixtures
```

将**环境**与**模块**分离。同时将 `examples/` 用作文档和测试夹具。保持模块小巧且职责单一。

有关架构原则、命名约定以及变量/输出契约，请参阅[模块模式](references/module-patterns.md)。

### 命名约定（摘要）

- 使用描述性的资源名称（`aws_instance.web_server`，而不是 `aws_instance.main`）
- 仅为真正的单例资源保留 `this`
- 为变量添加上下文前缀（`vpc_cidr_block`，而不是 `cidr`）
- 标准文件：`main.tf`、`variables.tf`、`outputs.tf`、`versions.tf`

有关示例，请参阅[模块模式：变量命名](references/module-patterns.md)和[代码模式：块排序](references/code-patterns.md#block-ordering--structure)。

### 块排序（摘要）

资源块：先放置 `count`/`for_each` → 参数 → `tags` → `depends_on` → `lifecycle`。
变量块：`description` → `type` → `default` → `validation` → `nullable` → `sensitive`。

有关完整规则和示例，请参阅[代码模式：块排序与结构](references/code-patterns.md#block-ordering--structure)。

## 测试策略

### 决策矩阵：应使用哪种测试方法？

| 情况 | 方法 | 工具 | 成本 |
|-----------|----------|-------|------|
| 快速语法检查 | 静态分析 | `validate`、`fmt` | 免费 |
| 提交前验证 | 静态分析 + 代码检查 | `validate`、`tflint`、`trivy`、`checkov` | 免费 |
| Terraform 1.6+、简单逻辑 | 原生测试框架 | `terraform test` | 免费至低 |
| 低于 1.6，或具备 Go 专业经验 | 集成测试 | Terratest | 低至中 |
| 注重安全性/合规性 | 策略即代码 | OPA、Sentinel | 免费 |
| 成本敏感型工作流 | 模拟提供商（1.7+） | 原生测试 + 模拟 | 免费 |
| 多云、复杂场景 | 完整集成测试 | Terratest + 真实基础设施 | 中至高 |

### 原生测试规则（1.6+）

编写测试代码之前：通过 Terraform MCP 验证资源模式，确保断言针对真实属性。

- `command = plan` — 速度快，仅适用于由输入派生的值
- `command = apply` — **计算值**（ARN、生成的名称）和**集合类型的嵌套块**必须使用
- 集合类型的块不能用 `[0]` 索引 — 请使用 `for` 表达式，或通过 `command = apply` 将其具体化
- 常见的集合类型：S3 加密规则、生命周期转换、IAM 策略语句

有关静态分析流水线、原生测试模式、Terratest 集成、模拟提供程序以及完整的 LLM 错误检查清单，请参阅[测试框架](references/testing-frameworks.md)。

## Count 与 For_Each — 快速规则

| 场景 | 使用 | 原因 |
|----------|-----|-----|
| 布尔条件（创建/不创建） | `count = condition ? 1 : 0` | 可选的单实例开关 |
| 项目可能被重新排序或移除 | `for_each = toset(list)` | 稳定的资源地址 |
| 按键引用 | `for_each = map` | 命名访问 |
| 多个命名资源 | `for_each` | 更好的标识稳定性 |

**绝不要**将列表索引用作长期标识 — 移除中间元素会导致其后的所有地址重新排列。有关决策矩阵、安全迁移操作手册、`moved` 块模式以及计划阶段值未知时的失败情况，请参阅[代码模式：count 与 for_each](references/code-patterns.md#count-vs-for_each-deep-dive)。

## 使用 Locals 管理依赖关系

在 local 中使用 `try()`，优先采用条件资源的属性而不是其父资源的属性，是一种专用但非常有价值的模式 — 它无需显式 `depends_on` 即可强制采用正确的删除顺序。常见用途：VPC + 辅助 CIDR 关联 + 子网。

有关完整模式和详细示例，请参阅[代码模式：使用 Locals 管理依赖关系](references/code-patterns.md#locals-for-dependency-management)。

## 模块开发

标准布局：

```
my-module/
├── README.md       # Usage documentation
├── main.tf         # Primary resources
├── variables.tf    # Typed inputs with descriptions
├── outputs.tf      # Output values
├── versions.tf     # required_version + required_providers
├── examples/
│   ├── minimal/
│   └── complete/
└── tests/
    └── module_test.tftest.hcl   # or Go for Terratest
```

**变量契约**：始终提供 `description`，始终使用显式 `type`，对复杂约束使用 `validation`，对机密信息使用 `sensitive = true`，优先使用带类型默认值的 `optional()`（1.3+），而不是无类型的 `map(any)`。

**输出契约**：始终提供 `description`，标记敏感输出，公开稳定的子集（而不是整个提供程序对象）。

有关完整的契约模式、模块发布检查清单和 LLM 错误检查清单，请参阅[模块模式](references/module-patterns.md)。

## CI/CD

流水线阶段：**验证** → **测试** → **计划** → **应用**（包含环境保护）。

成本控制：在 PR 验证中使用模拟提供程序，仅在主分支或定时任务中进行真实云集成，为测试资源添加标签，并自动清理。

防止漂移：固定运行时和提供程序版本，提交 `.terraform.lock.hcl`，应用计划阶段中**经过审查的计划产物**（不要在应用作业中重新运行 `plan`），并在每条通往应用阶段的路径上运行策略/安全阶段。

有关 GitHub Actions、GitLab CI 和 Atlantis 模板以及 LLM 错误检查清单，请参阅 [CI/CD 工作流](references/ci-cd-workflows.md)。

## 安全与合规

**必要检查：**

```bash
trivy config .
checkov -d .
```

**不要：** 将密钥存储在变量或 `.tfvars` 中、使用默认 VPC、跳过加密、将安全组向 `0.0.0.0/0` 开放、在 `aws_security_group` 中使用内联 `ingress`/`egress` 块。

**应该：** 从云密钥管理器（AWS Secrets Manager / Azure Key Vault / GCP Secret Manager）获取密钥，或在 1.11+ 上使用 `write_only` 参数；创建专用 VPC；强制实施静态加密和 TLS；使用最小权限的安全组；使用单独的 `aws_vpc_security_group_{ingress,egress}_rule` 资源（例如 AWS provider v5+）。

将变量标记为 `sensitive = true` 只会在显示时进行遮蔽——其值仍然存在于状态中。在 1.11+ 上使用 `write_only` / `*_wo`，或通过运行时查找使密钥材料完全不进入 Terraform。

有关 trivy/checkov 流水线、状态文件强化、合规性映射以及 LLM 错误检查清单，请参阅[安全与合规](references/security-compliance.md)。

## 状态管理

**切勿在团队环境或生产环境中使用本地状态。** 远程后端可提供自动锁定、加密、版本控制、审计日志记录和安全协作。

### 选择远程后端

AWS 示例（Azure `azurerm` / GCP `gcs` / TF Cloud 语法：请参阅[状态管理：选择远程后端](references/state-management.md#choosing-a-remote-backend)）：

```hcl
terraform {
  backend "s3" {
    bucket        = "my-terraform-state"
    key           = "prod/vpc/terraform.tfstate"
    region        = "us-east-1"
    encrypt       = true
    use_lockfile  = true   # Native S3 locking, 1.10+
  }
}
```

在 Terraform < 1.10 上，使用 `dynamodb_table = "terraform-state-lock"` 代替 `use_lockfile`。Azure Storage、GCS 和 Terraform Cloud 均提供内置锁定——有关语法，请参阅状态管理参考文档。有关如何在不同后端及其锁定模型之间进行选择，请参阅[选择远程后端](references/state-management.md#choosing-a-remote-backend)。

### 状态组织

| 模式 | 适用场景 | 示例路径 |
|---------|----------|--------------|
| **按环境** | 每个环境由不同团队负责 | `prod/terraform.tfstate`、`staging/...` |
| **按组件** | 生命周期相互独立 | `prod/vpc/`、`prod/eks/`、`prod/rds/` |
| **混合**（推荐） | 同时兼具两者的优势 | `prod/networking/`、`prod/compute/`、`staging/networking/` |

在以下情况下拆分状态：由不同团队负责、更新频率不同或资源数量 >500。在以下情况下合并状态：资源紧密耦合、资源数量 <100、生命周期相同。

有关锁定、迁移、多团队隔离、灾难恢复以及 LLM 错误检查清单，请参阅[状态管理](references/state-management.md)。

## 版本管理

| 组件 | 策略 | 示例 |
|-----------|----------|---------|
| Terraform 运行时 | 固定次版本 | `required_version = "~> 1.9"` |
| Providers | 固定主版本 | `version = "~> 5.0"` |
| Modules（生产环境） | 固定精确版本 | `version = "5.1.2"` |
| Modules（开发环境） | 允许补丁版本更新 | `version = "~> 5.1"` |

有意提交 `.terraform.lock.hcl`。将提供程序/运行时升级与功能变更放在不同的 PR 中。有关约束语法和升级工作流，请参阅[代码模式：版本管理](references/code-patterns.md#version-management)。

## 现代 Terraform 功能（1.0+）

| 功能 | 最低版本 | 常见用途 |
|---------|-------------|------------|
| `try()` | 0.13+ | 安全回退，取代 `element(concat())` |
| `nullable = false` | 1.1+ | 防止 `null` 在无提示的情况下覆盖默认值 |
| `moved` 块 | 1.1+ | 重构时无需销毁并重新创建 |
| 带默认值的 `optional()` | 1.3+ | 带类型的对象属性 |
| `import` 块 | 1.5+ | 声明式导入，可在 VCS 中审查 |
| `check` 块 | 1.5+ | 运行时断言 |
| 原生 `terraform test` | 1.6+ | 内置测试框架 |
| 模拟提供程序 | 1.7+ | 零成本单元测试 |
| `removed` 块 | 1.7+ | 声明式移除资源 |
| 提供程序定义的函数 | 1.8+ | 提供程序特定的转换（要求提供程序声明函数） |
| 跨变量验证 | 1.9+ | 在 `validation` 块中引用其他 `var.*` |
| `write_only` 参数 | 1.11+ | 密钥永不存储在状态中 |
| S3 原生锁文件 | 1.10+ | 无需 DynamoDB 即可锁定状态 |

在使用某项功能之前，请验证最低运行时版本。有关完整表格以及每项功能对应的常见 LLM 错误模式，请参阅[代码模式：功能防护表](references/code-patterns.md#feature-guard-table--version-floor--common-llm-errors)。

## 特定于运行时的指导

- **Terraform 1.0-1.5（OpenTofu 从 1.6 开始）**：使用 Terratest 进行集成测试，仅进行静态分析和计划验证（无原生测试）。
- **1.6+**：可使用原生 `terraform test` / `tofu test`——将简单的单元测试迁移到原生测试，复杂集成测试继续使用 Terratest。
- **1.7+**：模拟提供程序可降低测试成本——单元测试使用模拟，最终集成测试使用真实运行。
- **1.10+**：S3 原生锁文件（`use_lockfile`）是新配置的正确默认选择——不再需要 DynamoDB 锁。
- **1.11+**：用于处理密钥的 `write_only` 参数可避免凭证进入状态。
- **Terraform 与 OpenTofu**：两者均受支持。有关许可证、治理和功能差异，请参阅[快速参考：Terraform 与 OpenTofu](references/quick-reference.md#terraform-vs-opentofu-comparison)。

## 代码智能（terraform-ls）

为 HCL 提供语义导航。terraform-ls 是可选的；如果未安装，下面每一行都会降级为明确披露的 `rg` + Read 回退方案。

这是通用代码智能规范中自包含的 terraform-ls 层——请直接应用下表中的规则。推荐搭配使用：`code-intelligence` 插件（同样来自 `antonbabenko/agent-plugins` 市场）包含通用规范（位置锚定、降级门槛、披露格式、防虚假垫片），并提供 `/code-intelligence:doctor` 用于就绪状态检查。如果已安装该插件，请遵循其通用协议；即使未安装，此技能仍完全自包含。

| 目标 | 使用方式 | 权衡 |
|------|-----|----------|
| 查找定义/所有引用 | terraform-ls `goToDefinition` / `findReferences` | 需要 `init` + 位置锚点 |
| 重命名值符号（变量/局部值/输出/提供程序别名） | 手动：`findReferences` -> 对每个文件重新执行 Read -> 编辑 -> `validate` | 无重命名提供程序 |
| 重命名资源/模块地址 | 使用 `moved` 块，并通过 `plan` 确认销毁数量为 0 | 文本重命名会强制销毁并重新创建 |
| 精确文本/已知名称/`.tfvars`/非 HCL | `rg` + Read | 无语义作用域 |

✅ 支持：`goToDefinition`、`findReferences`、`documentSymbol`、`hover`、`workspaceSymbol`。
❌ 不支持：`goToImplementation`、调用层次结构、重命名提供程序。不要调用这些功能后，再将其缺失报告为发现的问题。

- ✅ 前提条件：PATH 中存在本地 `terraform`/`tofu`，且已运行 `terraform init`；冷启动时可能需要重试一次。
- ✅ LSP 调用基于位置锚定（`file:line:character`）——先使用 `rg` 确定锚点，切勿仅使用符号名称。
- ❌ 在通过[降级门槛](references/code-intelligence-lsp.md#degradation-gate)之前，不要声称“LSP 已损坏，改用 rg”；如替换了工具，请在第一行披露。

深入阅读：[代码智能](references/code-intelligence-lsp.md#terraform-ls-capability-matrix)。

## 参考文件

渐进式披露——此处提供要点，按需深入了解：

- [测试框架](references/testing-frameworks.md)——静态分析、原生测试、Terratest、模拟提供程序
- [模块模式](references/module-patterns.md)——结构、变量/输出契约、`terraform_remote_state` 规则、发布检查清单
- [CI/CD 工作流](references/ci-cd-workflows.md)——GitHub Actions、GitLab CI、Atlantis、成本控制
- [安全与合规](references/security-compliance.md)——trivy/checkov、密钥处理、合规映射
- [状态管理](references/state-management.md)——后端、锁定、迁移、多团队协作、恢复
- [代码模式](references/code-patterns.md)——块排序、`count`/`for_each` 深入解析、现代功能、版本管理、局部值
- [代码智能](references/code-intelligence-lsp.md) - terraform-ls 功能、基于位置锚定的调用、手动重命名、降级门槛
- [快速参考](references/quick-reference.md)——命令速查表、流程图、故障排除

## 许可证

Apache License 2.0。完整条款请参阅 LICENSE。

**版权所有 © 2026 Anton Babenko**