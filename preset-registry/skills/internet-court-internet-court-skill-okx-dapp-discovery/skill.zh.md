---
name: okx-dapp-discovery
description: |
  Plugin router for 20 third-party DeFi protocols (Polymarket, Aave, Hyperliquid, PancakeSwap, Morpho, Raydium, Curve, Compound, Pendle, Lido, ether.fi, GMX, Kamino, Orca, Meteora, Clanker, pump.fun, Uniswap) and their protocol-native tokens (HYPE, HLP, eETH, weETH, stETH, wstETH, LDO, GHO, CAKE, CRV, COMP, RAY, ETHFI, GLP, kToken, PT-* / YT-*, $CLANKER). Resolves DApp/token → plugin → installs → forwards.

  Fires on: (1) named DApp + action verb (swap/deposit/stake/long/borrow/buy/sell/snipe/farm/claim, EN or ZH 买/卖/换/存/质押/借/做多/做空/狙击); (2) 2+ DApp comparison ("Aave vs Compound", "Lido vs ether.fi"); (3) Polymarket UpDown (`<COIN> 5min updown`, `5 分钟涨跌`, `预测市场`); (4) protocol-native token + action verb ("deposit USDC into HLP", "PT-stETH on Pendle"); (5) pump.fun WRITE verbs (buy/sell/snipe/ape/swap or 买/卖/狙击/梭哈/帮我买). See body for full rules.
license: MIT
metadata:
  author: okx
  version: "4.2.1"
  homepage: "https://web3.okx.com"
---
# OKX DApp 发现

面向第三方 DeFi 协议的 DApp 发现与直接插件路由。当用户提到特定 DApp 或询问有哪些可用选项时，此技能会对提示词进行评分，将其解析为匹配的插件，按需安装该插件，并将用户的**原始**提示词转发到已安装插件的 quickstart 中，从而实现透明引导。它不会枚举 DApp 具体信息，也不会重复插件自身的路由逻辑；每个已安装的插件都拥有自己的 quickstart、命令索引和协议知识。完整的支持列表（20 个插件）位于 §5；不在其中的 DApp 则会进入 §6 的目录探测流程。

> **参考资料：** §2 的原生代币表是路由所需的最低信息——完整的每个协议 ≥75 / 50–74 / 不安装关键词列表位于 `references/protocol-keywords.md`。**中文查询：**在应用以下任何规则之前，请先阅读 `references/keyword-glossary.md`——该文件是本文规则所引用的中文别名、原生代币短语、触发动词和路由示例的权威来源。

---

## §1 — 此技能的触发条件

### 会触发

1. **指定 DApp + 操作动词** —— DApp 名称的优先级高于所有通用动词。英文动词（swap、deposit、stake、long、short、borrow、lend、buy、sell、snipe、farm、claim、ape）+ 中文对应表达（见术语表 §2）。
2. **比较 2 个或更多受支持的 DApp，并且意图是进行选择** —— “Aave 和 Compound 哪个更适合稳定币”、“X 和 Y 哪个更好”、“X 和 Y 有什么区别”。优先进行路由，而不是依据训练数据回答——插件文档通常更新得更及时。
3. **Polymarket UpDown / 预测市场意图** —— `<COIN> 5min updown`、`prediction market`、`place a bet on Polymarket`（中文：见术语表 §4）。不包括价格/图表查询——触发此条件时不要转交给 `okx-dex`。
4. **仅出现协议原生代币 + 操作动词** —— “buy HYPE”、“deposit USDC into HLP”、“PT-stETH on Pendle”、“stake LDO”、“swap to eETH”。代币到 DApp 的映射见 §2 的表格。
5. **pump.fun 写入意图** —— 对 pump.fun 代币/地址执行 buy/sell/snipe/ape/swap（中文：见术语表 §5）→ `pump-fun-plugin`。这是常规插件安装，不属于市场操纵——插件会自行执行安全控制。

### 不会触发

- **概念性问题 / “X 是什么” / “X 是否安全” / 关于某个受支持 DApp 的单名称信息查询**，且没有操作或比较意图——交由模型回答。（比较 2 个或更多 DApp **会**触发——见模式 2。）
- **pump.fun 读取意图** —— 开发者历史、捆绑/狙击检测（该名词本身）、谁进行了 ape、相似代币、联合曲线进度（中文：见术语表 §5）→ `okx-dex`。
- **仅有通用动词**（deposit/stake/borrow/swap/yield/APY），**没有** DApp 名称，**也没有**协议原生代币 → `okx-defi`（收益）或 `okx-agentic-wallet`（交换）。
- **仅有通用代币代码**（ETH/BTC/USDC/USDT/SOL/BNB/MATIC/AVAX/DAI/WBTC）——这些不是协议原生代币；应根据实际动词进行路由。
- **对 DApp 的只读分析**（“分析 Uniswap 上周的交换量”），且没有操作或比较意图。

### 不适用场景

未指定 DApp 的交换 → `okx-agentic-wallet`。通用收益发现 → `okx-defi`。价格/图表/PnL → `okx-dex`。钱包授权/余额 → `okx-agentic-wallet`。持仓概览 → `okx-defi`。pump.fun 只读研究 → `okx-dex`。

---

## §2 — 信号检测（唯一事实来源）

根据以下信号对提示进行评分，然后应用 §3。

### 置信度层级

| 层级 | 条件 | §3 结果 |
|------|-----------|------------|
| **95–100** | 明确出现协议名称、领域、API、合约或独特功能 | 安装（步骤 1/2） |
| **75–94** | 协议特定的工作流，并带有强生态线索 | 安装（步骤 1/2） |
| **50–74** | 通用 DeFi 工作流、线索较弱，可能匹配其他 DApp | 澄清（步骤 4）— 不要安装 |
| **< 50** | 只有通用术语，没有协议信号 | 步骤 3（已命名但未命中表格）或步骤 5（未命名） |

### 单独出现时不会提高置信度的信号

- **通用动词：** swap、lend、borrow、APY、farm、long、short、liquidity、bridge、stake、deposit、withdraw、mint（中文：词汇表 §2）。
- **通用代币符号：** ETH、BTC、USDC、USDT、SOL、BNB、MATIC、AVAX、ARB、OP、DOGE、XRP、WBTC、DAI。

### 单独出现即可触发 ≥ 75 的协议原生代币 / 短语（无需 DApp 名称）

| 代币 / 短语 | 路由至 |
|---|---|
| HYPE、HLP | Hyperliquid |
| CAKE、veCAKE、Syrup、IFO | PancakeSwap（默认使用 V3 AMM） |
| CRV、crvUSD、veCRV、3pool、tricrypto | Curve |
| COMP、Comet | Compound V3 |
| RAY | Raydium |
| ORCA、Whirlpool | Orca |
| Meteora DLMM、Meteora bin/vault/DAMM（`MET` 单独出现时过于通用 — 需要 "Meteora"） | Meteora |
| ETHFI、eETH、weETH | ether.fi |
| LDO、stETH、wstETH | Lido |
| GLP、esGMX、GM token | GMX V2 |
| GHO、aToken | Aave V3 |
| kToken | Kamino Lend |
| PT-*、YT-*、"PT <token>"、"YT <token>"（以空格分隔）、vePENDLE、SY token | Pendle |
| $CLANKER、clanker.world | Clanker |
| "X 5min" / "X 15min" / "X up or down" / "5min updown"（X = BTC/ETH/SOL/XRP/BNB/DOGE/HYPE；中文：词汇表 §4） | Polymarket |

每个协议完整的 ≥75 / 50–74 / 不安装关键词扩展：`references/protocol-keywords.md`（中文：词汇表 §1/§3）。

### 讨论 / 比较标记（由 §3 的步骤 0 和步骤 2 使用）

英文：`what do you think`、`which is better`、`vs`、`compare`、`comparison`、`differences`、`tradeoffs`、`should I use X or Y`、`pros and cons`、`explain`、`tell me about`、`what is`、`how does X work`。中文：词汇表 §6。

---

## §3 — 决策流程（自上而下，匹配第一项即停止）

> **面向用户的语言 — 重要。** 层级、分数、“置信度”、“Top-5”以及此框架都是**内部**决策逻辑。**绝不要**向用户提及它们 — 用户只能看到*结果*（建议、安装、澄清问题或发现表格）。✅ “我会为此设置 Aave V3 — 现在开始安装。” / “你想的是 Aave 还是 Morpho？两者都符合。” ❌ “我给你的消息评出的 Polymarket 置信度是 95。”首先，对于任何中文提示，请阅读 `references/keyword-glossary.md`。

### 步骤 0 — 覆盖检查

**优先处理发现查询：**如果提示只是询问有哪些可用选项（"what dapps are available"、"which DApps do you support"、"有什么dapp"；中文：词汇表 §9），且没有具体的操作意图 → 直接显示 §5 的发现表格。**停止。**

否则，提示中是否包含以下任意一项：① Resolver 表格中的 DApp 名称（§5，包括中文别名词汇表 §1）；② 协议原生代币 / 短语（§2 表格）；③ Polymarket 原生短语？

- **①②③ 均不满足，但提示词将某个 _其他_ 协议/DApp 指定为操作目的地**（§5 中未列出的专有名词场所）→ **步骤 3**（目录探测）。绝不能让已命名但未知的 DApp 落入步骤 5 的通用安装流程。
- **完全未指定任何 DApp/场所** → 转到步骤 4 / 5。
- **满足（①②③）** → 已命名的 DApp / 原生代币 **优先于所有通用动词**（swap/stake/lend/borrow/deposit/withdraw/LP/farm/mint/pool；中文：术语表 §2）。不要转交给 `okx-agentic-wallet`、`okx-defi`、`okx-dex` 或任何通用 skill —— **但以下四种例外情况优先于安装**：

  **(a) swap 交易对例外** —— 当动词是市场侧 DEX 动词（`swap`/`exchange`/`sell`；中文：术语表 §2），且交易对的任一侧是协议原生代币、另一侧是通用 ticker，同时**没有出现明确的 DApp 名称**时 → 转交给 `okx-agentic-wallet`。（当出现 DApp 名称时 —— "on Lido"、"on Curve" —— 无论原生代币位于哪一侧，都以安装为准。）

  | → `okx-agentic-wallet`（例外情况） | → 安装该协议（步骤 1） |
  |---|---|
  | "swap USDC for stETH" | "stake ETH for stETH" / "stake on Lido" |
  | "swap stETH to USDC" | "unstake stETH on Lido for ETH" |
  | "swap to wstETH" | "wrap stETH into wstETH" |
  | "swap 100 USDC for HYPE" | "deposit USDC into HLP" / "ETH long on Hyperliquid" |
  | "sell my HYPE for USDC" | "supply HYPE to HLP" |
  | "swap SOL to RAY" | "provide liquidity in RAY/SOL pool on Raydium" |
  | "swap BNB for CAKE" | "stake CAKE on PancakeSwap" / "use Syrup Pool" |
  | "swap USDC for crvUSD" | "deposit into 3pool on Curve" |

  *启发式规则：* 通过市场操作获取原生代币（`swap … for/to <native>`），或卖出原生代币（`swap <native> to/for <generic>`、`sell <native>`）→ dex-swap；**使用**协议功能（`stake`/`mint`/`deposit`/`borrow`/`LP`/`open position`/`wrap`/`unwrap`/`unstake`/`redeem`）→ 安装。

  **(b) 讨论优先（优先于覆盖规则）** —— 存在讨论/比较标记（§2）**且没有操作动词** → 转到步骤 2 的澄清分支，不要安装。（"Tell me about Pendle" → 澄清；"Buy PT-stETH on Pendle" → 存在操作动词，安装。）

  **(c) pump.fun 分流** —— READ/分析意图 → `okx-dex`（停止）；WRITE/交易意图 → `pump-fun-plugin`（→ 步骤 1）。（术语表 §5；完整分流规则见 `references/protocol-keywords.md`。）

  **(d) 超出范围的变体保护** —— 如果匹配到的 DApp 根据其 §5 Notes 带有超出范围的信号（Morpho **Blue** / MetaMorpho / LLTV / vault curator / allocator），不要安装；告知用户该变体超出范围，并建议使用 `okx-defi` 进行通用收益操作。**停止。**

  否则 → 强信号，转到步骤 1。

### 步骤 1 — 强信号，恰好一个 DApp ≥ 75
从 §5 设置 `TARGET_PLUGIN`，然后执行 §4（检查是否已安装 → 如有需要则安装 → 读取 SKILL.md → 二进制同意门 → 转发原始提示词）。**停止。**

### 步骤 2 — 强信号，2 个或更多 DApp ≥ 75
- 一个 DApp 是语法上的**操作目标**，其余 DApp 仅出现在比较从句中（"use Morpho to beat Aave's APY"）→ 仅将操作目标视为 ≥75 → 转到步骤 1。
- 某个操作动词（§2 / 术语表 §2/§6）明确指向一个 DApp → 该 DApp → 转到步骤 1。*（操作动词会覆盖同时出现的讨论标记："swap on Curve to compare vs Uniswap" → 安装 `curve-plugin`。）*
- **仅有比较/讨论，没有操作动词** → 不要安装；提出一个问题：*"Want me to set up `<DApp A>`, set up `<DApp B>`, or just discuss the tradeoffs? You can also let OKX pick the best venue (`okx-defi`)."*（1 个 DApp + 讨论标记：*"Set up `<DApp>`, or just discuss what it does first?"*）**停止。**

### 第 3 步 — 已命名 DApp，但不在 §5 表格中
运行 §6 目录探测（约 0.1 秒）。如果存在 `<dappName>-plugin` → 安装并转发。如果不存在 → 展示失败信息（按推断类别列出最接近的同类项 + `okx-defi` 替代方案 + §5 发现表）。不要将 `plugin-store` 作为单独的中转步骤安装。**停止。**

### 第 4 步 — 最高信号分数为 50–74
提出一个聚焦的澄清问题；不要安装。示例：“具体使用 Polymarket，还是其他预测市场？” / “是在 Hyperliquid 上交易永续合约，还是其他交易场所？” / “存入 Aave，还是接受能够提供最佳利率的任意借贷协议（OKX 聚合 DeFi）？” 分数为 50–74 的示例：“我想交易永续合约”（未指定 Hyperliquid）、“存入资金并赚取收益”（Aave/Morpho/okx-defi）、“用我的 ETH 抵押借款”、“在 BNB Chain 上添加流动性”。**停止。**

### 第 5 步 — 未命名 DApp，仅有泛化术语，分数 < 50
根据提示词中的主导动作动词筛选 **Top-5 队列**：

| # | DApp | 垂直领域 | 匹配的动词类别 |
|---|---|---|---|
| 1 | **Polymarket** | 预测 / UpDown | prediction / bet / updown |
| 2 | **Aave V3** | 借贷、GHO、aToken | lend / supply / borrow / generic earn-yield（默认） |
| 3 | **Hyperliquid** | 永续合约、HLP、HYPE | perp / futures / leverage Nx / long Nx / short Nx |
| 4 | **PancakeSwap**（V3 AMM） | BNB Chain AMM 兑换 | swap / exchange（提示涉及 BNB Chain） |
| 5 | **Morpho V1** | 基于 Aave/Compound 的借贷 | lend / borrow / generic earn-yield |

（中文动作动词：见术语表 §7。）然后：
- **恰好匹配 1 项** → 静默安装并转发（步骤 1 的机制）。
- **匹配多项** → 安装排名最高的项；平局时按 **Polymarket > Aave > Hyperliquid > PancakeSwap > Morpho** 的顺序决定。不显示选择器。
- **匹配 0 项**（动作超出 Top-5 覆盖范围 — Solana DEX、流动性质押、PT/YT、meme 发射平台）→ 显示 §5 发现表；不要安装。

---

## §4 — 执行机制

> **路径说明（一次）：** 以下 `Read … $HOME/.claude/skills/` 路径是 **Claude-Code 专用**的。在 Codex / OpenCode / OpenClaw / Cursor 上，请替换为对应代理的 skills 目录。（作为 `skills info <skill>` 后续步骤进行跟踪；参见 `references/catalog-probe.md`。）

### 已安装状态检查（与代理无关 — Claude Code、Codex、OpenCode、OpenClaw、Cursor）

```bash
SKILLS_LIST=$(npx skills list 2>/dev/null)

# Single source of truth for the supported plugin set (extend when PM adds new dapps)
SUPPORTED_PLUGINS="polymarket-plugin aave-v3-plugin hyperliquid-plugin pancakeswap-v3-plugin morpho-plugin \
                   raydium-plugin curve-plugin compound-v3-plugin pendle-plugin clanker-plugin \
                   pump-fun-plugin lido-plugin gmx-v2-plugin pancakeswap-clmm-plugin pancakeswap-v2-plugin \
                   etherfi-plugin kamino-lend-plugin kamino-liquidity-plugin orca-plugin meteora-plugin"

INSTALLED_PLUGINS=""
for plugin in $SUPPORTED_PLUGINS; do
  if echo "$SKILLS_LIST" | grep -qE "(^|[[:space:]]|/)${plugin}([[:space:]]|$)"; then
    INSTALLED_PLUGINS="$INSTALLED_PLUGINS $plugin"
  fi
done
```

### 安装（如果缺失）+ 加载

`TARGET_PLUGIN` 从 §5 设置。如果已存在于 `$INSTALLED_PLUGINS` 中，则跳过安装；否则静默安装（幂等，可安全地重复运行）：

```bash
case " $INSTALLED_PLUGINS " in
  *" $TARGET_PLUGIN "*) ;;   # already installed — skip install
  *) npx skills add okx/plugin-store --skill "$TARGET_PLUGIN" --yes --global ;;
esac
```
```
Read file: $HOME/.claude/skills/<plugin-name>/SKILL.md
```

然后**立即使用该插件自身的路由重新处理用户最初的请求**——不要要求用户重复请求，也不要显示安装横幅或入门表格。引导过程应当对用户不可见。

### 二进制征得同意门槛（位于“读取 SKILL.md”和运行其预检之间）

插件的 SKILL.md 文件通常包含“预检依赖”部分，该部分会从 `github.com/okx/plugin-store/releases` 下载预编译二进制文件和 shell 脚本到 `~/.local/bin/`。静默运行这些操作会绕过知情同意，并且可能被环境安全防护机制阻止（从而导致静默失败）。

**步骤 A——检测**以下任一项：`# BINARY_INSTALL:` 标记；`curl … github.com/.*/releases/`；从 `raw.githubusercontent.com` 下载 `launcher.sh` / `update-checker.py`；对下载内容执行 `chmod +x`；将内容通过 `ln -sf` 链接到 `~/.local/bin/` 或任何 PATH 目录。

**步骤 B——如果检测到，不要运行预检中的 `curl`/`chmod`/`ln`/`mkdir`。**向用户展示以下内容并等待明确回复（不要重试，也不要循环）：

> 此插件需要下载并安装预编译二进制文件。  
> 插件：`<name>` v`<version>` · 二进制文件：`<release-URL>` · 脚本：`launcher.sh`、`update-checker.py` · 安装到：`~/.local/bin/.<plugin>-core`（PATH 符号链接）  
> 安全提示：预编译二进制文件和 shell 脚本来自外部 GitHub 仓库，并且会以完整的代理权限运行。  
> 回复 **"yes, install `<plugin>`"** 以继续 · 回复 **"skip install"**（仍可运行只读命令；写入操作将失败）· 或添加针对 `curl … github.com/okx/plugin-store/releases` 的 Bash 权限规则以永久允许。

如果未检测到二进制文件模式，则继续执行，不要打断用户。

### 注意事项

- **会话激活：**新安装的插件会通过上面的 `Read` 立即激活。插件自身的主动关键词触发器会在下次会话启动时注册——为了确保未来会话能够独立路由，用户可以重启一次。当前无需重启。
- **失败模式：**如果 `npx skills add` 失败（网络/注册表问题），请告知用户：“我无法安装 `<plugin-name>`——请检查网络，或手动运行 `npx skills add okx/plugin-store --skill <plugin-name> --yes --global`，然后再次请求我。”

---

## §5——插件解析器表

面向用户的 DApp 名称 → plugin-store ID。请在 §4 之前根据此表设置 `TARGET_PLUGIN`。**Notes** 列是默认解析/消歧的唯一依据。

| 面向用户的 DApp | 插件 ID | 备注（默认值 / 消歧） |
|---|---|---|
| Polymarket | `polymarket-plugin` | |
| Aave / Aave V3 | `aave-v3-plugin` | 当前仅支持 V3 |
| Hyperliquid (DEX) | `hyperliquid-plugin` | 去掉 “DEX” 后缀 |
| PancakeSwap（默认） | `pancakeswap-v3-plugin` | 普通的 “PancakeSwap” → V3 AMM |
| PancakeSwap V3 CLMM | `pancakeswap-clmm-plugin` | 需要出现 CLMM / concentrated / LP NFT 信号 |
| PancakeSwap V2 | `pancakeswap-v2-plugin` | 需要明确出现 V2 / classic / MasterChef 信号 |
| Morpho（V1 Optimizer） | `morpho-plugin` | 普通的 “Morpho” → V1 Optimizer。Morpho Blue / MetaMorpho / LLTV / vault curator / allocator → **不要安装**（不在支持范围内） |
| Raydium | `raydium-plugin` | |
| Curve | `curve-plugin` | |
| Compound V3 | `compound-v3-plugin` | 普通的 “Compound” 静默解析为 → V3（V1/V2 不在支持范围内） |
| Pendle | `pendle-plugin` | |
| Clanker | `clanker-plugin` | |
| pump.fun（交易） | `pump-fun-plugin` | 点号 → 连字符；分析类动词 → `okx-dex` |
| Lido | `lido-plugin` | 去掉点号 |
| GMX V2 | `gmx-v2-plugin` | 普通的 “GMX” 静默解析为 → V2（V1 不在支持范围内） |
| ether.fi（Stake） | `etherfi-plugin` | 去掉点号 |
| Kamino Lend | `kamino-lend-plugin` | 普通的 “Kamino” → Lend |
| Kamino Liquidity | `kamino-liquidity-plugin` | 需要明确出现 “Liquidity” / “DLMM” / “CLMM” / “vault” / “LP” / “concentrated liquidity” |
| Orca | `orca-plugin` | |
| Meteora（DLMM） | `meteora-plugin` | |

**未命中（已指定 DApp，但不在此表中）：**应用 §6（目录探测）。如果存在 `<dappName>-plugin`，则安装它；否则使用下面的发现表、最接近的同类建议以及 `okx-defi` 替代方案呈现失败信息——不要静默降级。

**发现表**（步骤 5 得到 0 个 Top-5 匹配项，或未命中回退时显示）：

> 以下第三方 DApp 可路由——哪一个符合你的意图？
>
> | 类别 | DApp |
> |----------|-------|
> | 预测市场 | **Polymarket** |
> | 借贷 | **Aave V3**、**Compound V3**、**Kamino Lend**、**Morpho V1 Optimizer** |
> | 永续合约 / 杠杆 | **Hyperliquid**、**GMX V2** |
> | AMM / 兑换（Solana） | **Raydium**、**Orca**、**Meteora DLMM**、**Kamino Liquidity** |
> | AMM / 兑换（BNB Chain） | **PancakeSwap V3 AMM**、**PancakeSwap V3 CLMM**、**PancakeSwap V2** |
> | AMM / 兑换（多链） | **Curve** |
> | 流动性质押 | **Lido**、**ether.fi** |
> | 收益交易（PT/YT） | **Pendle** |
> | Meme 发射平台（交易） | **pump.fun**、**Clanker** |
>
> 对于跨协议寻找最佳收益、再平衡或领取奖励，`okx-defi`（OKX 聚合 DeFi）更合适。对于 pump.fun 研究/扫描（开发者历史、捆绑交易者、Rug 检查），请参阅 `okx-dex`。如需使用未列出的 DApp（小众 / 尚未收录），请说出其名称，我会通过 §6 探测更广泛的目录。

---

## §6 —— 目录探测（仅用于未命中回退）

仅当用户指定的 DApp 不在 §5（步骤 3）中时使用。对于表中的 DApp，根据 §5 设置 `TARGET_PLUGIN` 并跳过此步骤。通过 GitHub Contents API 探测（约 0.1 秒，无需克隆）。设计原理、`jq` 回退方案（无 `python3` 时）以及已知限制：`references/catalog-probe.md`。

```bash
# Normalize the user-named DApp to a plugin-store-style ID prefix (lowercase, no dots)
DAPP_LOWER=$(echo "<DApp name as user typed it>" | tr 'A-Z' 'a-z' | tr -d '.')

CATALOG=$(curl -fsSL --max-time 5 "https://api.github.com/repos/okx/plugin-store/contents/skills" 2>/dev/null \
          | python3 -c "import sys,json; print('\n'.join(p['name'] for p in json.load(sys.stdin)))" 2>/dev/null)

if [ -n "$CATALOG" ]; then
  # Prefix match — catalog suffixes vary (-plugin, -ai, -v2-plugin, bare). See references/catalog-probe.md.
  MATCHES=$(echo "$CATALOG" | grep -E "^${DAPP_LOWER}(-|$)" || true)
  COUNT=$(echo "$MATCHES" | grep -c . 2>/dev/null || echo 0)
  case "$COUNT" in
    0) TARGET_PLUGIN="" ;;                                   # not in catalog → failure handling below
    1) TARGET_PLUGIN=$(echo "$MATCHES" | head -1)
       npx skills add okx/plugin-store --skill "$TARGET_PLUGIN" --yes --global ;;  # then read SKILL.md + forward
    *) TARGET_PLUGIN=""                                      # multiple variants — ask which; do NOT auto-install
       # User-facing: "I found multiple plugins matching '<dapp>': $MATCHES — which would you like?"
       ;;
  esac
else
  # GitHub API unreachable — fall back to clone-and-install probe with the most common suffix
  if npx skills add okx/plugin-store --skill "${DAPP_LOWER}-plugin" --yes --global 2>/dev/null; then
    TARGET_PLUGIN="${DAPP_LOWER}-plugin"
  else
    TARGET_PLUGIN=""
  fi
fi
```

**探测失败时**（`TARGET_PLUGIN=""`，计数为 0）——不要默默跳过。应清晰地说明：

1. 指出具体的 DApp，并说明目前还不存在 `<dappName>-plugin`。
2. 展示第 §5 节的发现表。
3. **按推断类别列出最接近的同类项**——借贷类 → Aave V3 / Compound V3 / Morpho；Solana 兑换类 → Raydium / Orca / Meteora；多链兑换类 → Curve；永续合约类 → Hyperliquid / GMX V2。列出最相似的 1–2 个。
4. 如果意图是通用收益、借贷或质押，提供 `okx-defi` 这一替代方案。
5. **将选择权交还给用户**——不要自动选择同类项。

> 示例：“我检查了 plugin-store 目录，但目前还没有 `foo-plugin`。最接近的受支持替代方案是 <closest-by-category>。或者，如果你愿意让 OKX 选择最佳场所，我可以通过 `okx-defi` 为你完成路由。完整的受支持集合：[发现表]。你更倾向于哪一种？”