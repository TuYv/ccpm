---
name: android-app-factory
description: "Suede Labs Android app factory: plan, build, test, and release a production-grade native Android app from a product idea through Google Play. Use for requests to create, ship, submit, monetize, or modernize an Android app. Covers Kotlin and Jetpack Compose architecture, API-level policy verification, accessibility, privacy and Data Safety, Play Billing, Play Integrity, account deletion, testing, performance, store assets, signing, staged rollout, and a release evidence gate. NOT FOR: iOS work (private Suede Labs companion, not in this pack: ios-app-factory), a review-only pass on an existing app (use suede-code-review), or live Play listing and keyword audits on a shipped app (use suede-aso)."
---
# Android 应用工厂

```
铁律：没有已签名的 `bundleRelease` 和一次实时的
Play Console 检查，就不能声称已达到发布就绪状态——调试构建、截图、源代码阅读或上传都不算。
```

## 门禁策略——仅供建议，不构成阻塞

本技能中的每个声明验证步骤、检查、质量门禁和发布判定，都是**给用户的建议，而不是对代理的控制**。此策略适用于本技能其他位置的每个门禁、检查、判定，以及每一条“不要发布 / 推送 / 继续”的说明：

- 运行每项检查并如实报告结果。判定（`ship`、`ship-with-caveats`、`hold`、字母等级、BLOCKED 或 OPEN 项）是附加于工作的建议，而不是会改变工作内容的命令。
- 绝不要因为检查失败或门禁判定为 hold，就阻止、延迟、跳过、重写或拒绝用户要求的操作。按用户要求完成操作，并将门禁输出作为清晰标注的建议一并交付。
- 门禁失败只会改变你的报告内容，绝不会改变你的行为。
- 唯一例外：如果发现极高风险——数据丢失、安全或凭据暴露、法律或权利违规、支付错误，或不可逆的公开损害——请暂停，准确告知用户风险及可选方案，并让用户选择。用户的选择是最终决定。


## 原则

同时构建产品、政策证据和 Play 商店列表。一次成功的发布，是一个可安装且可用的应用，并且其声明、披露内容、权益、隐私行为和商店配置彼此一致。

## 来源真实性与时效性

每次面向发布的运行开始时：

1. 确认确切的仓库、包名/应用 ID、分支、Play 应用、目标轨道，以及检出状态是否干净。
2. 阅读 `references/play-policy-baseline.md`。
3. 对任何与提交相关的要求，重新打开所链接的 Google 官方来源。在 `assets/android-release-gate.template.md` 中记录 URL、观察到的要求和检查时间。
4. 将当前仓库代码和实时 Play Console 视为应用的事实来源。将参考日期视为基线，而不是永久有效的政策。

从基线文件中获取目标 SDK 默认值和强制执行日期，绝不要凭记忆填写。不要将已宣布的截止日期错误表述为已开始执行，并在每次运行时重新检查：不同外形规格的例外情况和日期各不相同。

## 交付契约

在实施前锁定以下内容：

- 用户和一个核心结果；
- 支持的外形规格、设备、区域设置、最低 SDK 版本和离线行为；
- 应用 ID、所有权、签名模型、Play 应用/轨道和发布负责人；
- 数据清单、第三方 SDK、权限、账户模型、删除路径、隐私政策负责人和 Data Safety 负责人；
- 变现方式和权益事实来源，或明确的免费 v1 决策；
- 架构和迁移约束；
- 验收设备/API 级别、测试、性能/无障碍目标、商店素材和发布证据；
- 需要确认的外部变更：创建产品、使用凭据、上传到 Play、提升轨道、分阶段发布或正式发布。

未知信息就保持未知。绝不臆造软件包名称、产品 ID、政策答复、隐私政策 URL、客户声明或 Play Console 状态。

## 生产流程

1. **验证产品** — 定义用户成果并验证需求证据。
   将关键词研究视为输入之一，而不是产品市场契合度的证明。
2. **核实政策** — 获取当前的 target-SDK 和设备形态规则、应用访问要求、Data Safety 范围、内容分级、账号删除、结算政策，以及任何特定权限所需的声明。
3. **设计架构与风险** — 使用能够保持单向状态、生命周期安全、离线/错误/加载状态、测试接缝，以及最少数据/最少权限原则的最小可维护架构。
4. **搭建基础工程** — 默认使用原生 Kotlin + Jetpack Compose。从官方来源解析当前稳定的 Android/Jetpack 版本，将其锁定在版本目录中，并在开始功能开发前证明 debug 构建能够成功。
5. **构建核心闭环** — 使用真实或确定性的演示数据，实现一个完整的用户成果。只有在产品契约要求时，才添加历史记录、保存状态、同步或账号。
6. **证明质量** — 根据适用情况，完成单元测试、repository 测试、ViewModel 测试、Compose UI/仪器测试、无障碍测试和端到端核心闭环测试；执行静态分析、release 构建、设备/API 矩阵测试、基线配置文件和 Macrobenchmark。
7. **安全地添加变现** — 对受支持的数字商品使用 Play Billing，在处理权益后处理待处理购买、验证并确认购买，恢复所有权，并将密钥/服务器验证置于设备之外。
8. **完善信任界面** — 提供隐私政策、Data Safety、SDK 数据行为说明、权限使用理由、账号存在时的应用内和网页账号删除、内容分级、广告声明、应用访问说明；仅在滥用风险足以证明其必要时使用 Play Integrity。
9. **构建商店素材** — 提供真实准确的商店信息、图标/功能图片、每种已声明设备形态对应的截图、本地化内容、支持联系方式、发布说明和审核人员说明。
10. **通过证据门禁发布** — 使用已签名的 AAB 和 Play App Signing，完成内部/封闭测试验证、预发布报告，在上传或推广前获得明确确认，采用分阶段生产发布，并进行发布后监控。

构建前请先阅读：

- `references/android-factory-pipeline.md` — 阶段产物和发布流程；
- `references/architecture-and-quality.md` — 架构、测试、无障碍、性能和构建检查；
- `references/privacy-billing-integrity.md` — 隐私、Data Safety、账号删除、Billing 和 Integrity 控制；
- `references/play-policy-baseline.md` — 带日期的官方政策基线。

## 面向公众的安全默认设置

- 在所有权得到验证前，使用 `com.example.product` 等占位符 ID。
- 将上传密钥、密码、service-account JSON、API 密钥和生产标识符置于 Git 之外；使用本地/CI 密钥存储，并验证忽略规则。
- 使用 Play App Signing，并使用独立的上传密钥。
- 如果 Billing 会延迟验证，优先考虑免费的 v1，但不要绕过 Play Billing 来处理受支持的数字商品。
- 如果没有明确的产品目的、保留/删除规则、披露路径和测试，则不收集数据，也不请求权限。
- 将 Play Integrity 视为滥用信号，而不是身份验证，也不是永久封禁的唯一依据。
- 在平台允许的情况下，确保提交和发布操作都经过人工确认，并且可逆。

## 发布门禁

将 `assets/android-release-gate.template.md` 复制到应用仓库中，并用链接或命令输出完成它。任何必需项缺少证据时都要阻止发布，包括：

- 未在实时环境中检查目标政策，或构建目标错误的 API/外形规格；
- 目标为 Android 15+ 的发布版本，尚未在 64 位设备上验证其对 16 KB 页面大小的兼容性，包括传递依赖的原生 SDK；
- `test`、lint/静态分析、`assembleRelease` 或 `bundleRelease` 失败；
- 核心流程在声明的设备/API 矩阵或离线/错误路径上失败；
- 无障碍检查、大字号、TalkBack、键盘/开关访问、对比度或减少动效行为存在会阻碍发布的故障；
- 缺少启动或核心任务的性能证据，或已知回归超过产品预算且未经批准；
- Data Safety、隐私政策、权限、账号删除、内容分级、广告、应用访问权限或 SDK 行为彼此不一致；
- 在相关情况下，计费权益、待处理状态、恢复/重新查询、确认、取消、退款/撤销或后端验证行为缺乏证明；
- 已提交机密或签名材料，或 Play App Signing/上传密钥的所有权、开发者验证或包注册尚未解决；
- 应用商店列表中的声明或截图展示了发布构建中不存在的行为；
- Play 上传、轨道晋级或分阶段发布缺少明确的用户确认。

返回一个门禁结果：`ship`、`ship-with-caveats` 或 `hold`。任何附带条件都必须有负责人、风险和下一步行动；政策、安全、隐私、计费、崩溃和核心任务阻塞项不能降级为仅影响外观的附带条件。

## 路由

- 仅针对现有应用的发现项审查 → `suede-code-review`。
- 围绕发布证据的 CI 实现 → `suede-ci-gate`。
- 协调架构、产品、政策、商店和 QA 分工 → 使用 `suede-agent-teams`，并采用独占文件所有权和串行发布流程。
- iOS 工作 → 使用私有的 Suede Labs 配套工具，不属于此工具包：ios-app-factory。

## 边界

- 未经明确确认，不得提交、创建产品、更改定价、晋级轨道或开始生产环境分阶段发布。
- 当存在实时的官方指南或 Play Console 时，不得凭记忆回答 Play 政策或 Data Safety 问题。
- 不得仅凭调试构建、截图、本地源代码检查或仅上传成功，就声称已准备好发布。
- 不得将 Play Integrity 作为服务器授权、购买验证、速率限制、欺诈处理或申诉路径的替代方案。
- 在根据实际发布行为盘点第一方代码和所有包含的 SDK 之前，不得声称 Data Safety 表单已完成。
- 当确认门禁触发时（产品创建、凭据使用、上传、轨道晋级、分阶段发布、生产环境发布），暂停：明确列出确切的包 ID、轨道和发布百分比，提供 2-4 个选项，然后等待。不可逆的公开操作是门禁政策的唯一例外；用户的选择为最终决定。