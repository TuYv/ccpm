---
name: kleros-curate
description: "Interact with Kleros Curate registries across Ethereum Mainnet, Gnosis Chain, and Sepolia. Use when the user mentions Curate, Light Curate/LightGeneralizedTCR/LGTCR, Stake Curate/PermanentGTCR/PGTCR, Scout, token-curated registry/TCR, token lists, address/CDN tags, Goldsky, MetaEvidence, Verify Your List, or Curate calls such as addItem, removeItem, challengeItem, challengeRequest, and fundAppeal. Covers registry discovery and queries; policy/schema inspection; submissions, removals, challenges, evidence, appeals, rewards, execution; factory deployment; and frontend verification on all three networks. Also trigger for registry/list operations paired with Kleros, arbitrator, dispute, juror, or PNK context, and whenever the user names or tests kleros-curate. Do NOT use for non-Kleros registries or generic IPFS uploads without Curate context; route standalone uploads to kleros-ipfs-upload."
---
# Kleros Curate

Kleros Curate 是一个用于专属、由政策驱动的注册表的去中心化验证系统。注册表由存储在 IPFS 上的政策文档进行治理——每次提交都会根据该政策进行评判，如果发生争议，陪审员会查阅该政策。

**存款/挑战/仲裁周期：**

1. 提交者提出一个项目，并锁定提交存款，作为该项目符合注册表政策的保证。
2. 项目进入挑战窗口（每个注册表都可以配置，通常持续数天到数周）。任何人都可以在此窗口期间审核提交。
3. 如果在窗口期内没有人发起挑战，项目将被接受，提交者的存款会全额退还——符合要求的提交无需承担永久性的收录成本。
4. 如果挑战者认为该提交违反政策，则会锁定挑战存款并发起 Kleros 争议。公正的 Kleros 陪审员会阅读政策并作出裁决。
5. 胜者获得败者的存款作为赏金。双向质押机制奖励准确判断，并遏制双方的无理挑战。

**为什么使用 Curate：**

- **通过策展获利**：用户可以通过在可挑战的注册表中找出不合规条目来获利。尤其是在 Stake Curate 中，成功的挑战者可以收回挑战存款，并赢得该项目的质押。
- **创建你自己的验证市场**：项目几乎可以针对任何可验证的标准创建 Curate 列表，自行定义政策、存款、挑战窗口、仲裁员/法庭以及治理方式。最终形成一个快速、低开销的注册表，为公共 Curate 视图或自定义前端提供支持。

**为什么链上优先很重要：**

存款金额、仲裁成本、MetaEvidence URI 和挑战窗口都属于实时链上状态——当注册表治理者更新参数时，这些值也会发生变化。任何缓存值或估算值都可能带来风险：提交错误存款金额的代理会导致其交易回滚。执行操作前始终读取实时值。

**三种合约类型：**

- **Light Curate (LGTCR)** — `LightGeneralizedTCR`：采用乐观挑战窗口和原生代币存款，是部署最广泛的类型。在 Ethereum、Gnosis 和 Sepolia 上的大多数 Curate 注册表中使用。
- **Stake Curate (PGTCR)** — `PermanentGTCR`：永久性 ERC20 质押（移除项目时不会退还），以 Goldsky 子图作为主要数据源，采用不同的状态模型（Submitted / Reincluded / Disputed / Absent + 提取流程）。可通过 PGTCR 特有的标志性读取调用进行识别（参见 `references/stake-curate.md`）。
- **Scout** — 部署在 Gnosis 上的 LGTCR 合约，专用于 4 个知名注册表（合约地址标签、代币列表、地址标签、CDN 映射）。Scout 是 LGTCR 上的覆盖层，并不是独立的合约类型。使用 Scout 时始终需要同时参考 `references/scout-registries.md`（Scout 专属上下文）和 `references/light-curate.md`（LGTCR 合约操作）。

## 不可妥协的规则

这些规则适用于所有 Curate 类型。它们始终处于上下文中；参考文件可能不会重复说明这些规则。

- **绝不猜测 / 臆造 / 近似估算**金额、地址、架构或参数。
- 对于存款、仲裁成本、挑战存款、申诉状态和 MetaEvidence URI，**链上状态 + 链上日志是唯一可信来源**。
- **绝不假设存在“标准代币架构”**——只有该注册表当前的 MetaEvidence 才是权威依据。
- **绝不重写架构**：`item.json.columns` 必须逐字复制自 MetaEvidence；只有 `values` 是动态的。
- **绝不上传或提交半成品**：不得包含格式错误的 JSON、损坏的 MetaEvidence、占位值、不受支持的字段类型或无法访问的策略文件。
- **绝不编写不受支持的 MetaEvidence 字段类型**：对于 URL 字段使用 `type: "link"`，而不是 `url`；上传前验证每个 `metadata.columns[].type`。
- **生产环境注册表需要 logo**：不得部署缺少 `metadata.logoURI` 的生产环境列表。
- **强烈建议注册表策略使用 PDF 文档**。只有在用户**明确接受审查和兼容性风险**后，才可使用非 PDF 策略。
- **绝不包含存款或费用的“典型范围”或估算值**——只报告实时读取的值。
- 在声明任何地址是或不是合约之前，**先执行 `eth_getCode`**。

## 你使用的是哪种 Curate 形态？

**步骤 1 — 关键词扫描（零成本）**

- 提及“Verify Your List”、列表验证、列表集合、前端可见性，或让已部署的注册表可被发现
  → **验证目标是 Light Curate (LGTCR)**，适用于全部三个受支持的网络
  → 阅读 `references/verify-your-list.md` 和 `references/light-curate.md`；对于验证目标，不要询问通用的形态问题。只有当实时验证策略要求时，才单独检测被列出注册表的形态。

- 提及“Scout”、“token list”、“address tags”、“CDN”
  → **Scout**（叠加在 Light Curate 之上——位于 Gnosis 上的 LGTCR 合约）
  → 阅读 `references/scout-registries.md` 和 `references/light-curate.md`（两者都是必需的；Scout 在 LGTCR 操作之上增加了上下文）

- 提及“PGTCR”、“Stake Curate”、“PermanentGTCR”、“Goldsky”
  → **Stake Curate (PGTCR)**
  → 阅读 `references/stake-curate.md`

- 提及“Curate”、“LGTCR”、“LightGeneralizedTCR”、“Light Curate”、“addItem”、“registry”，或未提供形态提示
  → **Light Curate (LGTCR)**（也是默认形态）
  → 阅读 `references/light-curate.md`

**步骤 2 — 有歧义时（仅提及“Curate”且没有形态提示）**

- **交互式会话**：提出一个问题——“你要使用哪种 Curate 形态？Light Curate（乐观挑战窗口、原生代币存款）、Stake Curate（永久 ERC20 质押、Goldsky 子图），还是 Scout（用于合约 / 代币标记的 4 个 Gnosis 注册表）？”

- **单次执行 / 非交互式**：默认使用 Light Curate，然后逐步纠正：
  - 如果用户提供了合约地址：检查它是否匹配 4 个已知的 Scout 注册表地址之一 → 加载 Scout overlay（阅读 `references/scout-registries.md` 和 `references/light-curate.md`）
  - 如果合约检查显示出 PGTCR 特征 → 切换到 Stake Curate（阅读 `references/stake-curate.md` 以获取特征调用）
  - 否则：继续使用 Light Curate

**步骤 3 — 合约类型验证（如果提供了地址）**

有关标志性调用，请参阅 flavor reference 文件 — SKILL.md 此处不嵌入函数签名（合约类型检测属于各 flavor 的 reference 文件）。

## 操作索引

**向注册表提交项目** → `references/light-curate.md` (LGTCR) 或 `references/stake-curate.md` (PGTCR)

**质疑 / 移除项目** → flavor reference 文件

**提交证据** → flavor reference 文件

**为上诉提供资金** → flavor reference 文件

**部署新的注册表（工厂）** → flavor reference 文件（工厂部分）

**获取 MetaEvidence（策略 + schema）** → `references/shared-metaevidence.md`

**计算存款金额** → `references/shared-deposits.md`

**构建 item.json** → `references/shared-item-json.md`

**验证 / 使已部署的列表在 Curate 前端可见** -> `references/verify-your-list.md`

**上传到 IPFS** → `references/shared-ipfs-upload.md`

**ABI / 函数签名** → `references/shared-abi-fragments.md`
  grep: `grep -n "function\|event" references/shared-abi-fragments.md`

**搜寻注册表地址 + seed 模板** → `references/scout-registries.md`
  grep: `grep -n "0x\|ATQ\|Address Tags\|Tokens\|CDN" references/scout-registries.md`

## 常见工作流

**提交一个项目（任意 flavor）：**
1. `references/shared-metaevidence.md` — 获取 schema（列）和策略 URI
2. `references/shared-item-json.md` — 构建 item.json payload
3. `references/shared-ipfs-upload.md` — 将 item.json 上传到 IPFS，获取 CID
4. `references/shared-deposits.md` — 计算准确的 msg.value
5. flavor reference（`light-curate.md` 或 `stake-curate.md`）— 发送 addItem 交易

**质疑或移除一个项目：**
1. `references/shared-metaevidence.md` — 获取适用的策略（移除使用清除策略；质疑使用注册策略）
2. `references/shared-ipfs-upload.md` — 将证据 JSON 上传到 IPFS
3. `references/shared-deposits.md` — 计算质疑存款金额
4. flavor reference — 发送质疑或 removeItem 交易

**部署新的注册表：**
1. `references/shared-metaevidence.md` - 准备有效的 MetaEvidence JSON（策略 URI + 列 schema + logoURI）
2. `references/shared-ipfs-upload.md` — 将 MetaEvidence JSON 上传到 IPFS
3. `references/shared-abi-fragments.md` - 获取已知的工厂/仲裁器地址和部署 ABI
4. flavor reference — 调用工厂部署函数
5. `references/verify-your-list.md` - 如果需要前端可见性，将新的注册表提交到 network 的 list-of-lists

**部署后的前端可见性：**
- 部署注册表不会自动使其在 Curate 前端可见。
- 验证列表可以提高其可见性，使其能够在前端中被找到，并将其标记为面向用户的已列出注册表。
- 提交到 list-of-lists 并非强制要求，但对于公共注册表而言强烈推荐。仅当列表有意保持隐身/私有时才跳过此步骤。
- 在 Ethereum Mainnet、Gnosis Chain 和 Sepolia 上，规范验证注册表是 Light Curate。
  使用 `references/verify-your-list.md` 获取特定链的地址和验证安全措施，然后遵循标准 LGTCR 提交流程。被列出的注册表可以是其他 Curate flavor，前提是实时验证策略允许这样做。

## 参考文件

这 9 个文件会按需加载——仅在当前任务需要时加载。上面的操作索引会指向每项操作对应的文件。加载不必要的参考文件会浪费上下文。

**`references/light-curate.md`**  
Light Curate (LightGeneralizedTCR) 的端到端操作：需要向用户询问的最少输入、通过 `eth_getCode` 和特征读取进行注册表发现、MetaEvidence 获取、item.json 构建、提交 item、质疑 / 移除 item、提交证据、为上诉提供资金、通过工厂部署新的注册表。进行任何 LGTCR 合约交互时都要阅读此文件——处理 Scout 时始终与 `references/scout-registries.md` 一起阅读。

**`references/stake-curate.md`**  
Stake Curate (PermanentGTCR) 的端到端操作：PGTCR 特征检测（区分 PGTCR 与 LGTCR）、ERC20 授权 + 质押存款流程、以 Goldsky 子图作为主要 MetaEvidence 来源并在链上回退、PGTCR 状态模型（Submitted / Reincluded / Disputed / Absent）、item 提取流程、部署工厂。进行任何 PGTCR 合约交互时都要阅读此文件。

**`references/scout-registries.md`**  
针对 4 个已知 Gnosis 注册表（Tokens / Address Tags / Contract Domain Names / CDN）的 Scout 专用覆盖层。包含：用于基于地址路由的 4 个注册表合约地址、以种子为优先的提交模式（从现有种子模板填充，然后提交）、每个注册表的 item.json 模板、图像指南、激励信息。始终与 `references/light-curate.md` 一起阅读——在合约层面，Scout 就是 LGTCR；此文件在其基础上增加仅适用于 Scout 的上下文。

**`references/verify-your-list.md`**  
使已部署注册表在 Curate 前端中可见并完成验证的三网络工作流程。包含规范的 Ethereum Mainnet、Gnosis Chain 和 Sepolia `LightGeneralizedTCR` 验证地址，明确区分交易目标与要列出的注册表，并委托标准的 LGTCR MetaEvidence、item.json、IPFS、存款、模拟和请求最终化流程。

**`references/shared-metaevidence.md`**  
适用于所有 Curate 类型的共享 MetaEvidence 获取流程：使用正确的 topic0 调用 `eth_getLogs` 方法、选择最新的适用 MetaEvidence、LGTCR 注册与清除分类、PGTCR 的 Goldsky 子图路径、MetaEvidence JSON 结构、策略 URI 提取以及 MetaEvidence 编写 guardrail。为任何注册表获取 MetaEvidence 之前，无论其类型如何，都要先阅读此文件。

**`references/shared-deposits.md`**  
涵盖所有 Curate 类型的共享存款计算：LGTCR 提交存款公式、LGTCR 质疑存款公式、PGTCR 质押与仲裁存款的区别（ERC20 质押独立于原生代币仲裁成本）、`arbitrationCost()` 读取模式、`msg.value` 组装规则。在计算任何存款或构造任何交易 value 之前，都要先阅读此文件。

**`references/shared-item-json.md`**  
严格的 item.json 构建规则：`columns + values` 模式格式、逐字复制规则（从 MetaEvidence 中复制 columns，不得修改——只有 values 是动态部分）、GTCR 字段类型白名单、禁止使用的别名、占位符拒绝、上传前验证，以及通过 `NewItem` 事件采样来验证提交前的字段顺序。在为任何 Curate 注册表构建 item payload 之前，都要先阅读此文件。

**`references/shared-abi-fragments.md`**  
所有 Curate 合约共用的 ABI 片段：`LightGeneralizedTCR` 的读写函数签名、`PermanentGTCR` 的读写函数签名、`IArbitrator` 接口 ABI、关键事件签名（`MetaEvidence`、`ItemStatusChange`、`RequestSubmitted` 等）、已知的 LightGTCRFactory 地址，以及已知的 Kleros V1 仲裁器地址。使用 `grep -n "function\|event\|address"` 浏览此文件。当你需要函数选择器、calldata 编码或事件主题哈希时阅读此文件。

**`references/shared-ipfs-upload.md`**  
Curate 工作流共用的 IPFS 上传指南：持久性理由（链上锚定后，外部 pin 可能会消失）、通过 `kleros-ipfs-upload` skill 和 Kleros x402 端点实现的必要推荐路径、`/ipfs/<CID>` 格式规则（构建 URL 时避免双斜杠），以及针对任何经用户批准的外部 pin 来源的明确风险警告。  
在 Curate 工作流中的任何 IPFS 上传步骤之前阅读此文件。

## 反馈

**此 skill 中是否有损坏或令人困惑的地方？** 请报告：获取 [feedback/SKILL.md](../feedback/SKILL.md) ——这有助于维护者修复智能体悄悄遇到的问题。