---
name: deploy-uni-hook
description: "Generate, simulate, audit, and deploy a Uniswap v4 hook + test pool from a brief, on any Uniswap v4 chain (every testnet and mainnet) - pre-audited templates or a from-scratch freeform hook (flags auto-derived; static audit + dangerous-pattern scan + a behavioral forge test + fork sim gate the deploy). Dry-run by default; explicit arm: to broadcast; testnet default, mainnet behind a double opt-in; records the deploy to main."
metadata:
  title: Deploy Uni Hook
  category: crypto
  var: "arm: to broadcast (default is a dry-run), template:dynamic|noop|skim to force a mode, chain:<name> to pick a chain (default base-sepolia), then the hook brief. Empty prints the grammar."
  tags:
    - crypto
    - dev
    - onchain
  requires:
    - HOOK_DEPLOYER_PRIVATE_KEY?
    - ALCHEMY_API_KEY?
    - ETHERSCAN_API_KEY?
  capabilities:
    - onchain_writes
    - writes_external_host
    - sends_notifications
---
> **${var}** — hook 简述。语法：`[arm:][template:<name>] [chain:<name>] <brief>`
> - ``（空）→ 打印帮助并以 `DEPLOY_HOOK_EMPTY` 退出。
> - `<brief>` → **dry-run**：生成、编译、挖掘并模拟执行。绝不广播。*[默认 — 无前缀]*
> - `arm:<brief>` → **广播**：先完成完整的 dry-run，通过模拟后再进行真实部署。
> - `template:<name>` → 强制指定模式：`dynamic` | `noop` | `skim`（经过预审计的模板）或 `freeform`（根据提示构建完整 hook）。省略时自动选择：与某个模板匹配的简述使用该模板；其他情况使用 `freeform`。
> - `chain:<name>` → `chains.tsv` 中的任意 Uniswap v4 链（运行 `./hook-deploy.sh chains` 查看列表）。默认为 `base-sepolia`。测试网：`base-sepolia`、`unichain-sepolia`、`arbitrum-sepolia`。主网（`testnet: false`，例如 `base`、`ethereum`、`unichain`、`arbitrum`、`optimism`、`polygon`、`bnb`、`avalanche` 等）必须同时提供 `arm:` 和显式的 `chain:` —— 此 skill 默认绝不会指向主网。`base-mainnet` 被接受为 `base` 的别名。

今天是 ${today}。此 skill 将一行简述转换为一个可运行的 Uniswap v4 hook。它以安全为设计目标：每次部署都会在广播前进行模拟，测试网默认使用 dry-run，并且必须显式提供 `arm:` 才会执行链上操作。

## 为什么这样设计

hook 绑定是不可变的，一个错误的 hook 可能导致池无法运行或窃取资金。因此，门禁都位于部署之前：两个门禁（`dry-run` 然后是 `arm:`）、强制模拟，以及幂等状态。广播之后的所有操作都只是记录已经发生的事情 —— 追加到 `memory/state/hook-deploys.json` 的 `main` 分支，不创建 PR（已经没有内容需要审查）。Foundry 流程经过验证 —— 挖掘 CREATE2 salt，使地址携带正确的 hook 标志位，部署、初始化池、添加流动性，然后执行一次 swap。

## 安全契约（不得跳过）

1. **主网需要三重锁。** 除非 `${var}` 同时包含 `arm:` 和显式的 `chain:<mainnet-name>`，并且实例设置了作为**仓库变量**的 `HOOK_MAINNET_OK=1`，否则绝不指向 `testnet: false` 的链（这是第三个、由操作员控制的锁，在 `hook-deploy.sh` 内强制执行，退出码为 7；请将其存储为变量而不是 secret —— secret 值 `1` 会掩盖运行日志中的所有 `1`，因此交易哈希和链接会显示为 `***`）。即使一条已启用的消息要求部署到主网，从未授权主网的实例也不能在那里广播。此 skill 只能运行在其入站路径受到所有者限制的实例上（`TELEGRAM_ALLOWED_USER_ID` / 多渠道 allowlist）——主网部署会消耗真实 gas，因此不可信的发送方绝不能调度它。在主网上，首先使用 `cast balance` 读取部署者余额；如果余额不足以覆盖模拟中的 `Estimated amount required`，则中止（`DEPLOY_HOOK_UNDERFUNDED`）。`hook-deploy.sh` 还会独立执行资金下限检查（退出码 8）、可选的 `MAX_GAS_GWEI` gas 价格上限检查（退出码 9），并在部署者持有超过 `HOOK_MAX_FLOAT_ETH`（默认 0.25）的资金时发出警告——部署密钥只能持有 gas 浮存资金，绝不能持有 LP 或金库资金。在输出中记录清晰的 `MAINNET` 警告。
2. **每次广播前都要模拟。** 如果模拟回退，则不得广播。报告回退信息并以 `DEPLOY_HOOK_SIM_FAILED` 退出。
3. **Dry-run 是默认模式。** 只有当 `${var}` 以 `arm:` 开头时才广播。
4. **密钥卫生。** 部署者密钥是 burner 密钥。绝不打印它。绝不能将其放在 shell 命令行中 —— 始终通过 `./hook-deploy.sh`，由脚本从环境变量中读取。
5. **幂等性。** 广播前读取 `memory/state/hook-deploys.json`。如果相同的简述在最近一小时内已经部署，则不要重复部署。部署脚本在地址层面同样具备幂等性：它会部署到*规范*地址（针对这个确切的 `(creationCode, flags, PoolManager)`，第一个与标志匹配的 CREATE2 salt 对应的地址）。如果该地址已经包含代码，则说明相同的 hook 已经上线，脚本会记录 `ALREADY_DEPLOYED <addr>` 并不执行任何操作——运行器报告现有地址，而不是部署副本。（HookMiner 本身会跳过已占用的地址，因此如果没有此检查，重新运行会悄悄地在一个新地址部署另一个副本。）

## 输入和配置

- **模板：** `skills/deploy-uni-hook/templates/` — `DynamicFeeHook.sol`、`NoOpHook.sol`、`HookFeeHook.sol`（已预先审计）、`Hook.sol` + `Hook.t.sol` + `hook.env.example`（自由形式脚手架、行为测试门禁、清单），以及 `DeployHook.s.sol`、`MockERC20.sol`、`foundry.toml`、`chains.tsv`。
- **链配置：** `skills/deploy-uni-hook/templates/chains.tsv` 是唯一事实来源 — TAB 分隔的 `name  chainId  testnet  poolManager  stateView  rpc  explorer  alchemy`，每行一个 Uniswap v4 链（与读取它的 `hook-deploy.sh` 并列）。`memory/uni-deployments.md` 是面向人类的镜像文件。要添加链，请向 `chains.tsv` 追加一行。
- **经过身份验证的 RPC：** `rpc` 列是公共端点。当设置了 `ALCHEMY_API_KEY` 且该行有 `alchemy` slug 时，`hook-deploy.sh` 会改用 `https://<slug>.g.alchemy.com/v2/$ALCHEMY_API_KEY` — 对主网模拟 + 广播而言，可信 RPC 很重要（不诚实的公共 RPC 可以伪造干净的模拟结果）。优先级：`RPC_URL`（覆盖项，用于测试）> Alchemy key + slug > 公共 `rpc`。RPC 路径（密钥所在位置）绝不会被打印 — 日志仅显示主机。
- **部署辅助工具：** `skills/deploy-uni-hook/hook-deploy.sh` — 唯一获准的广播路径（会隐藏密钥）。
- **状态：** `memory/state/hook-deploys.json` — 幂等性 + 部署账本。

### 模板选择器（未提供 `template:` 时）

| 简述提及 | 模式 |
|---|---|
| fee、volatility、dynamic、surge | `dynamic` |
| skim、hook fee、take a cut、revenue | `skim` |
| "minimal" / "starter" / "empty" | `noop` |
| game、leaderboard、points、crown、loyalty | `freeform`（游戏规则在 Labs 路由中处理） |
| 其他任何情况（模板未覆盖的新颖逻辑） | `freeform` |

## Labs 路由

除非地址以 `0x91` 开头，或 hook 使用 `beforeSwapReturnsDelta`、`afterSwapReturnsDelta` 或 `dynamicFees`，否则 Uniswap Labs 会自动路由带 hook 的池子。属于该集合的任何内容都需要填写[允许列表表单](https://www.notion.so/uniswaplabs/1aec52b2548b80f78dbef8d2f0d7183e)或使用 UniswapX filler。swap `take()` 无法自动路由：它要求 `afterSwapReturnsDelta`。

| 模板 | 标志 | Labs 经典路由器 |
|---|---|---|
| `noop` | `0x80` | 自动路由 |
| freeform 默认（afterSwap，delta 0） | `0x40` | 自动路由 |
| `dynamic` | `0x10C0` + `DYNAMIC_FEE_FLAG` | 允许列表（`dynamicFees`） |
| `skim` | `0x44` | 允许列表（`afterSwapReturnsDelta`） |

**单个 hook 同时实现游戏 + fee**（freeform）：
1. Fee 始终通过 `take()` 在 `afterSwap` 中执行。设置 `HOOK_RETURNS_DELTA=afterSwap`。这需要允许列表，永远不会自动路由。
2. 仅当 `hookData` 指定玩家时才运行游戏。空的 `hookData`（Labs Universal Router）= 已付费的 swap，不运行游戏，也不回退。
3. 绝不要将游戏编码到 `amountSpecified`、区块编号或必需的 swap 方向中。这些做法会导致路由器回退，并且无法收取任何费用。
4. `sender` 是路由器，而不是用户。不要基于 `sender` 对游戏状态建立索引。

除非简述明确要求回退门控，否则不要生成 amount-suffix / block-echo / exact-out-only / direction-gate hook。这些 hook 无法由 Labs 路由。miner 会跳过 `0x91...` 地址，因此一个原本可自动路由的 hook 不会被意外门控。

## Fleet 审计规则（来自 aeon.fun hook 审计）

这些是在线上 fleet 中已确认的缺陷。Freeform MUST NOT 重新引入这些缺陷。`skim` 模板已经修复。

**Fee / `take()`:**
- 收取未指定 delta 的 MAGNITUDE。Exact-out 会使该 delta 为负数。`if (unspecifiedAmount <= 0) return` 会在每次 exact-output swap 中静默跳过手续费（共享基础 F1）。
- 在取反前先扩展为 `int256`。`-type(int128).min` 会触发 panic，并导致该次 swap 失败。
- `poolManager.take(..., feeRecipient, ...)` 应指向 immutable recipient。绝 NEVER 使用 `address(this)`。不要提供 `withdraw()`。托管问题曾导致 CrownClash/LegacyLedger HIGH 严重性漏洞。
- 额外的 skim helper 不得复制 `<= 0` 的提前返回逻辑（这是 sign guard 的第二个副本）。

**Gates**（仅当 brief 要求 revert-gate 时适用）：
- 1a. 会自行变化的值（`block.number`）：在区块 N 的 head 上回答的 `view` helper，在区块 N+1 执行时就是错误的。应针对执行区块。
- 1b. 会在有人 swap 时变化的值（价格低字节）：精确匹配加零容差会造成 contention DoS。需要使用一个区间，或者不要设置 gate。
- 1c. 攻击者可以停留在某个值上的共享计数器，且失败时不会递进：这是一个 griefing 原语。
- 2. `unlock` frame 中的合约可以满足该谓词；签名交易却无法满足。这会把约束绑定到错误的参与方。
- 5. 永远不要将原始 `amountSpecified` 与以 token 计价的常量比较。调用者通过 exact-in 与 exact-out 选择指定的 currency。应使用无量纲的边界（tick 移动量 / liquidity fraction）。
- 6. 对两个虚拟储备执行的“balance” / “skew” / “heavier-side” gate，本质上都是伪装后的原始价格 gate。`StateLibrary` 给出 `amount0 = L*2^96/sqrtP` 和 `amount1 = L*sqrtP/2^96`，因此 `amount0/amount1 = 1/price`，liquidity `L` 会完全抵消。对两个储备的任何测试（`b0 >= b1`、skew 区间、“哪一侧更重”）最终都会简化为将池子的 RAW price 与隐含的 `1.0` 比较，而 raw price 是以最小单位表示的 `token1/token0`，所以只有相同 decimals 且接近 parity 的交易对才会接近 1.0。USDC(6d)/WETH(18d) 池的价格会偏离约 8 个数量级；两个 18-dec token 的价格达到 2.0 时，也已经超出 10% 区间。这样的 gate 在每个真实交易对上都会永久偏向一侧：其中一整条 leg 会永远 revert，而“每笔交易都会向 50/50 重新平衡”的说法是错误的（full-range position 在任意价格下按价值计算本来就是 50/50）。修复方式：记录池子自己的参考值（在 `afterInitialize` 中记录其 `sqrtPriceX96`，或使用 brief 明确指定的目标比率），并让 gate 将当前价格与该参考值比较，绝不要使用硬编码的 1.0。这需要 `afterInitialize` callback（增加 flag bit `0x1000`），因此 price/balance/skew hook 必须将其包含在 callback 集合中，否则无法获知自身的起始价格。
- 永远不要使用 `balanceOf(poolManager)`：那是 v4 singleton 的全局库存，而不是该池子的库存。使用 `StateLibrary`。
- `sender` 是 router。不要将其视为 trader。

**Tests:**
- fee hook 必须断言 exact-in 和 exact-out 两种情况下的 take。
- gate 需要一个无 hook 的负向对照（`hooks = address(0)`）。
- 不要跨 `vm.roll` 缓存 `block.number`（via-ir 会将其折叠）。使用 `vm.getBlockNumber()`。
- price / balance / skew gate MUST 在偏离 1:1 的价格下进行断言。scaffold 的 `setUp()` pool 从 1:1 开始（`sqrtPriceX96 = 2^96`），这是 raw-price-vs-1.0 gate 无论如何编写都看似正确的唯一价格。调用 `_freshPoolAt(<non-1:1 sqrtPriceX96>)`（`Hook.t.sol` 中的 helper），并在那里断言 BOTH legs：必须保持开放的 leg 不得被拒绝，必须关闭的 leg 应当 revert。仅在 1:1 下证明的 gate 是错误通过。

## 步骤

1. **解析 `${var}`。** 提取 `arm:` 标志、可选的 `template:`、可选的 `chain:` 以及自由文本 brief。brief 为空 → 使用语法退出 `DEPLOY_HOOK_EMPTY`。

2. **解析 chain。** chain 名称在 `chains.tsv` 中解析（默认为 `base-sepolia`）；`hook-deploy.sh` 将其映射到官方的 `PoolManager` + RPC，因此你需要传入名称，而不是地址。运行 `./hook-deploy.sh chains` 查看列表，或读取 `chains.tsv`。如果名称不在注册表中，退出 `DEPLOY_HOOK_BAD_CHAIN`。查看该行的 `testnet` 列：如果为 `false`（主网），则强制执行双重确认 —— `${var}` 中必须同时包含 `arm:` 和显式的 `chain:`，否则退出 `DEPLOY_HOOK_BAD_CHAIN`。支持所有 Uniswap v4 chain（Base、Ethereum、Unichain、Arbitrum、Optimism、Polygon、BNB、Avalanche、Robinhood、Worldchain、Ink、Soneium、Celo、X Layer 及其测试网）。

3. **确认已暂存的工具链 + 项目。** 工作流会在本次运行前预先暂存所有内容（`scripts/stage-deploy-uni-hook.sh`）：`$PATH` 中的 Foundry、位于 `$HOOKBUILD_DIR`（默认为 `$HOME/hookbuild`）的预构建 v4 项目，其中包含全部三个模板 + `MockERC20.sol` + `DeployHook.s.sol` + v4 libraries，以及复制到仓库根目录的 `./hook-deploy.sh`。**不要**在运行过程中安装 Foundry 或克隆 libs —— sandbox 会阻止这些操作。检查 `command -v forge` 以及 `$HOOKBUILD_DIR` 是否存在；如果任一项缺失，则降级为 `DEPLOY_HOOK_NO_TOOLCHAIN`（输出生成的 source + plan）。

4. **构建 hook（由 brief 驱动）。**
   - **模板模式**（`dynamic` / `noop` / `skim`）：在 `$HOOKBUILD_DIR/src/<Hook>.sol` 中，仅编辑 `// --- AEON:LOGIC START ---` 与 `// --- AEON:LOGIC END ---` 之间的区域。保持 callback signatures 和 flag set 不变。如果默认实现已经符合 brief，则保持不变。
   - **自由模式**（其他任何情况）：将完整的 hook 写入 `$HOOKBUILD_DIR/src/Hook.sol` ——替换 `// --- AEON:BODY ... ---` 区域。规则：保留 contract name `Hook` 和 `constructor(IPoolManager)`；实现 prompt 所需的 v4 callbacks，每个 callback 都必须使用 EXACT `IHooks` signature、`onlyPoolManager` 以及正确的 selector return。**不要**手动设置 flags ——它们会根据你实现的 callbacks 自动派生。如果某个 callback 返回非零 delta，则在 `$HOOKBUILD_DIR/hook.env` 中设置 `HOOK_RETURNS_DELTA`；对于 fee-override hook，在其中设置 `HOOK_POOL_FEE=dynamic`。遵循上方的 **Labs routing** 和 **Fleet audit rules**：空的 `hookData` 必须成功；game 不得让 vanilla exact-in swap revert；`take()` 必须声明 `HOOK_RETURNS_DELTA`、收取 magnitude（exact-in 和 exact-out），并且绝不能 custody；price/balance/skew gate 必须添加 `afterInitialize` callback，并锚定到 pool 自身的 start price（Gates rule 6），绝不能隐式使用 1.0。
     - **同时编写 behavioral test。** 在 `$HOOKBUILD_DIR/test/Hook.t.sol` 中，将 `// --- AEON:ASSERT ... ---` 区域替换为用于断言 hook **具体预期行为**的 `test_*` functions ——不能只测试“does not revert”。brief 中的每条规则都至少编写一个正例和一个反例：一个 hook 必须拒绝的 swap，应使用 `_expectSwapRevert(zeroForOne, amount, Hook.SomeError.selector)`（此 helper 会为你解包 v4 的 `WrappedError` ——**不要**使用裸 `vm.expectRevert`，它无法匹配该 wrapper）；一个 hook 必须允许的 swap，应使用普通的 `_swap(...)`；任何 getter/accounting，应使用 `assertEq(hook.someGetter(...), expected)`。对于决策依赖 price 或 reserve balance 的 gate，应通过 `_freshPoolAt(<non-1:1 sqrtPriceX96>)` 进行断言（两条方向都要覆盖，且偏离 parity）——`setUp()` 中的 pool 位于 1:1，在这种情况下此类 gate 总是看起来正确。**不要**编辑 `setUp()` 或 helpers ——只能编辑 `AEON:ASSERT` 区域。如果 brief 没有可拒绝的行为，仍然要断言 hook 所改变的 observable state。

5. **模拟 + 审计（始终执行）。** 传入 mode、kind 和 chain（省略 chain 时使用 `base-sepolia`）：
   ```bash
   ./hook-deploy.sh simulate <kind> <chain>
   ```
   对于 `freeform`，在任何部署之前，按顺序执行以下三个关卡：
   1. **静态审计** — 根据回调推导 flags；检查合约是否命名为 `Hook`、是否至少包含 1 个回调、每个回调是否带有 `onlyPoolManager`、`test/Hook.t.sol` 是否至少包含 1 个 `test_` 函数，并扫描危险模式（`selfdestruct`/`delegatecall` 会直接失败；`tx.origin`/原始 value-call/内联 `assembly` 会打印警告，要求复核）。失败时退出并返回 `DEPLOY_HOOK_AUDIT_FAILED`（绝不部署）。
   2. **行为测试** — `forge test --fork-url <chain> --match-contract HookBehaviorTest` 在 fork 上运行 agent 编写的断言。测试失败或无法编译时退出并返回 `DEPLOY_HOOK_TEST_FAILED`（绝不部署）。这能证明 hook 实现了提示所要求的行为。
   3. **Fork 模拟** — `forge script` 编译、挖掘 salt、在内存中部署、初始化 pool、添加流动性，并在目标 chain 的 fork 上执行一次 swap。
   如果出现编译错误，修复后重试（最多 3 次）。如果模拟发生 revert，退出并返回 `DEPLOY_HOOK_SIM_FAILED`。记录挖掘出的 hook 地址、推导出的 flags 以及 `Estimated amount required`。在 mainnet 上，将该估算值与 deployer 余额进行比较（`cast balance <addr> --rpc-url <rpc>`）；如果余额不足以覆盖该金额，退出并返回 `DEPLOY_HOOK_UNDERFUNDED`。
   对于 freeform hook，在启用之前还要**阅读生成的 `Hook.sol` 并分析其安全性**：是否有任何回调允许调用者窃取资金、使 pool 无法运行（无条件 revert），或发生重入？如果无法确定，请停留在 dry-run 阶段并报告相关疑虑。

6. **停止于 Dry-run。** 如果 `${var}` 不以 `arm:` 开头，则在此处**停止**。报告：template、挖掘出的地址（及其 flag bits）、receipt 中的 `routing` 行（自动路由还是 allowlist + 原因）、pool key 以及模拟结果。退出并返回 `DEPLOY_HOOK_DRY_RUN`。

7. **Arm 检查（仅在使用 `arm:` 时执行）。**
   - 确认已设置 `HOOK_DEPLOYER_PRIVATE_KEY`（它通过 `requires:` 注入）。如果未设置，则降级为 dry-run 报告并退出，返回 `DEPLOY_HOOK_NO_KEY`。
   - 读取 `memory/state/hook-deploys.json`。如果相同的 `(chain, template, brief)` 在最近一小时内已经部署，则退出并返回 `DEPLOY_HOOK_IDEMPOTENT`，并提供之前的地址。

8. **广播。**
   ```bash
   ./hook-deploy.sh broadcast <kind> <chain>
   ```
   runner 会打印一份**部署回执**（hook 地址、解码后的 flag 名称、区块浏览器深层链接、交易哈希），并且当 Etherscan 系列 chain 设置了 `ETHERSCAN_API_KEY` 时，自动在区块浏览器上验证 hook 源代码（尽力而为 —— 验证失败不会导致已完成的部署失败）。如果打印了 `ALREADY_DEPLOYED`，则将报告的地址视为结果（不执行新的部署）。从回执或 `$HOOKBUILD_DIR/broadcast/DeployHook.s.sol/<chainId>/run-latest.json` 中读取 hook 地址和交易哈希。

9. **验证。** 使用 `cast` 通过 RPC 调用 `StateView.getSlot0(poolId)` 读取 pool。确认 pool 存在，并确认 hook 地址的低位与 template 的 flags 相等。确认 swap 触发了 hook event。

10. **记录部署。** 部署已经在链上完成，这是只追加的历史记录，而不是待审查的变更，因此不要创建 PR 或分支。只需将记录写入 `main` 上的工作树；工作流的运行后提交会将其提交。写入：
    - `memory/state/hook-deploys.json` —— 追加此次部署（链、模板、简述、hook 地址、flags、交易哈希、时间戳、poolId、poolKey）。
    - `output/hooks/<hook-address>.sol` —— 从 `$HOOKBUILD_DIR/src/<Hook>.sol` 复制已部署的源代码。
    - 对于自由形式，还需写入 `output/hooks/<hook-address>.t.sol` —— 复制 `$HOOKBUILD_DIR/test/Hook.t.sol`（作为部署准入条件的行为测试）。

    不要暂存根目录下的 `./hook-deploy.sh` 或 `./chains.tsv`（运行时副本；两者都被 gitignore）。

11. **通知并退出。** 发送简短通知（模板、地址、浏览器链接、`routing` 类别、dry-run 还是 live）。退出 `DEPLOY_HOOK_OK`（或 `DEPLOY_HOOK_DRY_RUN`）。

## 降级规则

- 没有密钥 → dry-run 报告，`DEPLOY_HOOK_NO_KEY`。绝不要直接失败。
- Foundry 或暂存项目缺失（`command -v forge` 失败或 `$HOOKBUILD_DIR` 不存在）→ 输出生成的源代码和计划，`DEPLOY_HOOK_NO_TOOLCHAIN`。不要尝试在运行期间安装（沙箱会阻止安装）。
- 链无效/缺失，或主网未完成双重确认 → `DEPLOY_HOOK_BAD_CHAIN`。
- 链是主网，但实例未设置 `HOOK_MAINNET_OK=1`（`hook-deploy.sh` 退出码 7）→ `DEPLOY_HOOK_MAINNET_NOT_AUTHORIZED`（绝不广播）。
- 主网余额低于模拟估算值，或部署者未获资助（`hook-deploy.sh` 退出码 8）→ `DEPLOY_HOOK_UNDERFUNDED`（绝不广播）。
- Gas 价格高于 `MAX_GAS_GWEI`（`hook-deploy.sh` 退出码 9）→ `DEPLOY_HOOK_GAS_TOO_HIGH`（绝不广播；费用下降后重试）。
- 自由形式静态审计失败（名称错误/没有 callback/缺少 `onlyPoolManager`/没有 `test_`/存在 `selfdestruct`/`delegatecall`）→ `DEPLOY_HOOK_AUDIT_FAILED`（绝不部署）。
- 自由形式行为测试失败或无法编译 → `DEPLOY_HOOK_TEST_FAILED`（绝不部署）。
- 模拟回滚 → `DEPLOY_HOOK_SIM_FAILED`（模拟失败后绝不广播）。

## 注意事项

- 三个模板均已预先验证：每个模板都能在 Base Sepolia 上完成完整的部署和 swap 模拟（`dynamic` = 0x10C0 flags，allowlist；`noop` = 0x80，auto-route；`skim` = 0x44，allowlist）。
- **自由形式**会根据提示构建任意 hook，将其写入 `src/Hook.sol`，并将行为测试写入 `test/Hook.t.sol`。Flags 会根据 callbacks 自动派生（绝不手动设置）。部署前会运行三道闸门：静态审计（名称/callbacks/`onlyPoolManager`/测试存在性/危险模式扫描）、agent 编写的 `forge test` 行为断言（在 fork 上运行），以及 fork 模拟。启用部署前，agent 还会读取生成的源代码，检查窃取/阻塞/重入风险。若某个模板适用，优先使用匹配的模板（这些模板已经过审计）；新颖逻辑使用自由形式。
- 每次部署，无论是模板还是自由形式，始终会先在目标链的 fork 上进行模拟，因此会在广播前检查“是否能够正常工作”。
- **任何 Uniswap v4 链都可用。** `chains.tsv` 包含每个官方 v4 部署（Base、Ethereum、Unichain、Arbitrum、Optimism、Polygon、BNB、Avalanche、Robinhood、Worldchain、Ink、Soneium、Celo、X Layer 以及各个 Sepolia 测试网），并且已逐一验证持有 PoolManager。同一流程适用于所有这些链，只有 `PoolManager`/RPC 不同，并通过名称解析。CREATE2 部署器（`0x4e59…4956C`）是获得已挖掘地址所必需的；如果某条链缺少它，fork 模拟会在任何广播前安全失败。
- **主网只涉及 gas。** 部署会向自身铸造 `MockERC20` 代币（免费），并使用这些模拟代币为演示池提供初始流动性，因此主网广播带来的风险只有 GAS，不会涉及真实资金。部署的池是 MockA/MockB 演示池；可复用的 hook 合约才是真正的交付物。部署者密钥必须是一个已获得 gas 资助、仅持有 gas 浮存的 burner（runner 会在超过 `HOOK_MAX_FLOAT_ETH` 时发出警告）；主网还需要 `HOOK_MAINNET_OK=1` 操作者锁。未来版本可以加入无密钥的 Base MCP `send_calls` 通道，这样 runner 中就无需保存密钥。
- **经过认证的 RPC + receipt + verify。** 在主网上，runner 优先使用 Alchemy endpoint（`ALCHEMY_API_KEY` 加链对应的 `alchemy` slug），而不是公共 RPC，这样不诚实的公共节点就无法伪造成功的模拟结果。广播后，它会打印 receipt（地址、解码后的 flags、浏览器链接、交易哈希），并且在 Etherscan 系列链上配置了 `ETHERSCAN_API_KEY` 时，自动验证源代码（尽力而为）。以上功能全部是可选的：未设置任何密钥时，该 skill 仍会使用公共 RPC 运行，但不会进行验证。