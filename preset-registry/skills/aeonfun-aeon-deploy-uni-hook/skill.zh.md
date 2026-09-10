---
name: deploy-uni-hook
description: "Generate, simulate, audit, and deploy a Uniswap v4 hook + test pool from a brief, on any Uniswap v4 chain (every testnet and mainnet) - pre-audited templates or a from-scratch freeform hook (flags auto-derived; static audit + dangerous-pattern scan + a behavioral forge test + fork sim gate the deploy). Dry-run by default; explicit arm: to broadcast; testnet default, mainnet behind a double opt-in; records the deploy to main. Every deployed hook inherits a mandatory 10 bps AeonFee protocol fee."
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
> - `<brief>` → **dry-run**：生成、编译、挖掘并模拟。绝不广播。*[默认 — 无前缀]*
> - `arm:<brief>` → **broadcast**：先完成完整的 dry-run，模拟通过后再真正部署。
> - `template:<name>` → 强制指定模式：`dynamic` | `noop` | `skim`（经过预审计的模板）或 `freeform`（根据提示词构建完整 hook）。省略时自动选择：简述匹配某个模板则使用该模板；其他情况 → `freeform`。
> - `chain:<name>` → `chains.tsv` 中的任意 Uniswap v4 链（运行 `./hook-deploy.sh chains` 列出）。默认为 `base-sepolia`。测试网：`base-sepolia`、`unichain-sepolia`、`arbitrum-sepolia`。主网（`testnet: false`，例如 `base`、`ethereum`、`unichain`、`arbitrum`、`optimism`、`polygon`、`bnb`、`avalanche` 等）需要同时指定 `arm:` 和显式的 `chain:` —— 此 skill 默认绝不指向主网。`base-mainnet` 可作为 `base` 的别名接受。

今天是 ${today}。此 skill 将一行简述转换为一个可运行的 Uniswap v4 hook。它以安全为设计目标：每次部署都会在广播前进行模拟，默认在测试网上执行 dry-run，并且需要显式的 `arm:` 才能上链。

## 为什么这样设计

Hook 绑定是不可变的，而一个有问题的 hook 可能使池无法运行或窃取资金。因此，部署前设置了多重闸门：其中两个是 `dry-run` 和 `arm:`，还有强制模拟以及幂等状态。广播之后的一切都只是记录已经发生的事情——在 `main` 上追加写入 `memory/state/hook-deploys.json`，不创建 PR（已经没有内容需要审查）。Foundry 流程经过验证——挖掘 CREATE2 salt，使地址携带正确的 hook-flag 位，部署、初始化池、添加流动性，然后执行一次 swap。

## 安全契约（不得跳过）

1. **主网需要三重锁。** 除非 `${var}` 同时包含 `arm:` 和显式的 `chain:<mainnet-name>`，并且实例设置了 `HOOK_MAINNET_OK=1` 这一**仓库变量**（由 `hook-deploy.sh` 内部强制执行，退出码 7），否则绝不指向 `testnet: false` 的链；应将其存储为变量而不是 secret——值为 `1` 的 secret 会遮蔽运行日志中的每一个 `1`，因此交易哈希和链接会显示为 `***`。即使一条已 armed 的消息要求主网部署，从未授权主网的实例也不能在那里广播。此 skill 只能运行在其入站路径受所有者控制（`TELEGRAM_ALLOWED_USER_ID` / 多渠道 allowlist）的实例上——主网部署会消耗真实 gas，因此不可信的发送者绝不能触发它。在主网上，先使用 `cast balance` 读取 deployer 余额；如果余额不足以覆盖模拟中的 `Estimated amount required`，则中止（`DEPLOY_HOOK_UNDERFUNDED`）。`hook-deploy.sh` 还会独立强制资金下限（退出码 8）、可选的 `MAX_GAS_GWEI` gas-price 上限（退出码 9），并在 deployer 持有的资金超过 `HOOK_MAX_FLOAT_ETH`（默认 0.25）时发出警告——部署密钥只能持有 gas 周转金，绝不能持有 LP 或 treasury 资金。在输出中记录清晰的 `MAINNET` 警告。
2. **每次广播前都进行模拟。** 如果模拟回滚，则不得广播。报告回滚信息并以 `DEPLOY_HOOK_SIM_FAILED` 退出。
3. **dry-run 是默认模式。** 只有当 `${var}` 以 `arm:` 开头时才广播。
4. **密钥卫生。** deployer 密钥是 burner。绝不打印它。绝不要将它放在 shell 命令行中——始终通过 `./hook-deploy.sh`，由脚本从环境变量中读取。
5. **幂等性。** 广播前，读取 `memory/state/hook-deploys.json`。如果过去一小时内已经部署过完全相同的简述，则不要重新部署。部署脚本在地址层面同样具备幂等性：它会部署到*规范*地址（针对这一精确的 `(creationCode, flags, PoolManager)`，第一个匹配 flag 的 CREATE2 salt 所对应的地址）。如果该地址已经有代码，则表示相同的 hook 已经上线，脚本会记录 `ALREADY_DEPLOYED <addr>` 并且不执行任何操作——runner 会报告现有地址，而不是部署重复实例。（HookMiner 本身会跳过已占用的地址，因此如果没有此检查，重新运行会悄悄地在新地址部署另一个副本。）

## 输入与配置

- **模板：** `skills/deploy-uni-hook/templates/` - `AeonFee.sol`（每个 hook 继承的强制性 10 bps 协议费基类）、`DynamicFeeHook.sol`、`NoOpHook.sol`、`HookFeeHook.sol`（已预先审计）、`Hook.sol` + `Hook.t.sol` + `hook.env.example`（自由形式脚手架、行为测试门槛、清单），以及 `DeployHook.s.sol`、`MockERC20.sol`、`foundry.toml`、`chains.tsv`。
- **链配置：** `skills/deploy-uni-hook/templates/chains.tsv` 是唯一事实来源 - TAB 分隔的 `name  chainId  testnet  poolManager  stateView  rpc  explorer  alchemy`，每行对应一条 Uniswap v4 链（与 `hook-deploy.sh` 放在一起，后者会读取该文件）。`memory/uni-deployments.md` 是供人类阅读的镜像文件。要添加链，请在 `chains.tsv` 末尾追加一行。
- **已认证 RPC：** `rpc` 列是公共端点。当设置了 `ALCHEMY_API_KEY` 且该行包含 `alchemy` slug 时，`hook-deploy.sh` 会改用 `https://<slug>.g.alchemy.com/v2/$ALCHEMY_API_KEY`，而不是公共 `rpc` - 可信 RPC 对主网模拟和广播很重要（不可靠的公共 RPC 可能伪造出干净的模拟结果）。优先级：`RPC_URL`（用于测试的覆盖项）> Alchemy key + slug > 公共 `rpc`。RPC 路径（密钥所在位置）绝不会被打印，日志中只显示主机。
- **部署辅助工具：** `skills/deploy-uni-hook/hook-deploy.sh` - 唯一获准的广播路径（会隐藏密钥）。
- **状态：** `memory/state/hook-deploys.json` - 幂等性和部署账本。

### 模板选择器（未提供 `template:` 时）

| Brief 提及内容 | 模式 |
|---|---|
| fee、volatility、dynamic、surge | `dynamic` |
| skim、hook fee、take a cut、revenue | `skim` |
| "minimal" / "starter" / "empty" | `noop` |
| game、leaderboard、points、crown、loyalty | `freeform`（游戏规则通过 Labs 路由处理） |
| 其他情况（模板未覆盖的新颖逻辑） | `freeform` |

## 强制性 AeonFee（每个 hook）

该 skill 部署的每个 hook 都继承 `AeonFee`（`templates/AeonFee.sol`）：在 `afterSwap` 中对 swap 的未指定（输出）货币收取强制性的 10 bps（0.10%）协议费，并将其路由到 `AEON_FEE_RECIPIENT`（`0xF1E958db7D1e4C074377946018Ad645db4FB158e`）。费率和接收方都是编译时常量，且 `afterSwap` **不是** virtual，因此任何 hook 都无法降低、跳过或重定向该费用。hook 通过 `_afterSwapExtra` 添加自己的 post-swap 逻辑（该逻辑在费用之后运行），其收取的任何 hook 费用都会叠加在 10 bps 之上。

由于该费用通过返回值增量 `take()` 实现，因此**每个** aeon hook 的地址都携带 `AFTER_SWAP + AFTER_SWAP_RETURNS_DELTA`（`0x44`），所以**没有任何 aeon hook 可由 Uniswap Labs 自动路由**；每个 hook 都需要加入 allowlist / 使用 UniswapX filler（见下文 Labs 路由）。这是为了确保费用永远无法被绕过而做出的有意取舍。

## Labs 路由

Uniswap Labs 会自动路由 hooked pool，除非地址以 `0x91` 开头，或者 hook 使用了 `beforeSwapReturnsDelta`、`afterSwapReturnsDelta` 或 `dynamicFees`。属于该集合的任何 hook 都需要使用[allowlist 表单](https://www.notion.so/uniswaplabs/1aec52b2548b80f78dbef8d2f0d7183e)或 UniswapX filler。由于 AeonFee 使每个 hook 都成为 `afterSwapReturnsDelta` take，**没有任何模板可以自动路由**，所有模板都需要加入 allowlist。

| 模板 | 标志位 | Labs 经典路由器 |
|---|---|---|
| `noop` | `0xC4`（beforeSwap + AeonFee `0x44`） | allowlist（`afterSwapReturnsDelta`） |
| freeform 默认（`_afterSwapExtra`） | `0x44`（AeonFee） | allowlist（`afterSwapReturnsDelta`） |
| `dynamic` | `0x10C4`（`0x10C0` + AeonFee `0x04`）+ `DYNAMIC_FEE_FLAG` | allowlist（`dynamicFees` + `afterSwapReturnsDelta`） |
| `skim` | `0x44`（AeonFee + 自有 skim，使用相同位） | allowlist（`afterSwapReturnsDelta`） |

**钩子上的游戏**（freeform）：10 bps 的费用已经通过 `take()` 在基础 `afterSwap` 中执行；freeform 主体不得实现 `afterSwap`（将额外逻辑放入 `_afterSwapExtra`）。
1. 强制费用始终会被收取；钩子自己的额外费用也放入 `_afterSwapExtra`，并叠加在强制费用之上。
2. 只有当 `hookData` 中指定了玩家时，游戏才会运行。空的 `hookData`（Labs Universal Router）表示付费交换，不运行游戏，也不回退。
3. 永远不要将游戏编码到 `amountSpecified`、区块号或必需的交换方向中。这些条件会使路由器回退并且无法收取任何费用。
4. `sender` 是路由器，而不是用户。不要基于 `sender` 关联游戏状态。

除非 brief 明确要求回退门控，否则不要生成 amount-suffix / block-echo / exact-out-only / direction-gate 钩子。矿工会跳过 `0x91...` 地址。

## Fleet 审计规则（来自 aeon.fun 钩子审计）

以下是根据线上 Fleet 测得的长期缺陷。Freeform 不得重新引入这些缺陷。`skim` 模板已经修复。

**费用 / `take()`：**
- 收取未指定增量的绝对值。Exact-out 会使该增量为负数。`if (unspecifiedAmount <= 0) return` 会在每次精确输出交换时静默跳过费用（共享基础实现 F1）。
- 在取反之前先扩展为 `int256`。`-type(int128).min` 会触发 panic，并导致该交换失败。
- 使用 `poolManager.take(..., feeRecipient, ...)` 将费用发送给不可变接收方。绝不要使用 `address(this)`。不要提供 `withdraw()`。CrownClash/LegacyLedger 的资产托管问题属于高危问题。
- 额外的 skim 辅助函数不得复制 `<= 0` 的提前返回逻辑（这是第二份符号检查）。

**门控**（仅当 brief 要求回退门控时）：
- 1a. 会自行变化的值（`block.number`）：在区块 N 的区块头调用的 `view` 辅助函数，在区块 N+1 执行时会得到错误结果。目标应当是执行区块。
- 1b. 会在有人交换时变化的值（价格低位字节）：精确匹配且容差为零会造成竞争型 DoS。需要设置一个范围，或者不要进行门控。
- 1c. 攻击者可以停留在某个值上的共享计数器，且失败时不会递进：这会形成可用于骚扰的原语。
- 2. `unlock` 帧中的合约可以满足该谓词；签名交易无法满足。这会将约束绑定到错误的一方。
- 5. 永远不要将原始 `amountSpecified` 与代币计价的常量比较。调用方可以通过 exact-in 与 exact-out 选择指定的货币。应使用无量纲的边界（tick 移动量 / 流动性比例）。
- 6. 基于两个虚拟储备的“余额”/“偏斜”/“较重一侧”门控，本质上都是伪装的原始价格门控。`StateLibrary` 给出 `amount0 = L*2^96/sqrtP` 和 `amount1 = L*sqrtP/2^96`，因此 `amount0/amount1 = 1/price`，流动性 `L` 会完全抵消。对两个储备进行任何测试（`b0 >= b1`、偏斜范围、“哪一侧更重”）最终都会简化为将池子的原始价格与隐含的 `1.0` 比较；而原始价格是最小单位下的 `token1/token0`，所以只有相同小数位数且接近平价的代币对才会接近 `1.0`。USDC（6 位小数）/WETH（18 位小数）池的数值会相差约 8 个数量级；两个 18 位小数代币的价格即使为 2.0，也已经超出 10% 的范围。此类门控在每个真实代币对上都会永久偏向一个方向：其中一整条交易路径会永远回退；“每笔交易都会将池子重新平衡到 50/50”的说法是错误的（全范围仓位在任何价格下按价值计算本来就是 50/50）。修复方式：在 `afterInitialize` 中保存池子自身的参考值（其 `sqrtPriceX96`），或使用 brief 中明确指定的目标比率，并将当前价格与该值进行门控比较，绝不要硬编码为 `1.0`。这需要 `afterInitialize` 回调（增加标志位 `0x1000`），因此价格/余额/偏斜钩子必须将其包含在回调集合中，否则无法知道自身的起始价格。
- 永远不要使用 `balanceOf(poolManager)`：那是 v4 单例的全局库存，并不对应这个池子。使用 `StateLibrary`。
- `sender` 是路由器。不要将其视为交易者。

**测试：**
- 费用钩子必须断言 exact-in 和 exact-out 上的 take。
- 门控逻辑需要一个无钩子反例（`hooks = address(0)`）。
- 不要跨 `vm.roll` 缓存 `block.number`（via-ir 会将其折叠）。请使用 `vm.getBlockNumber()`。
- 价格 / 余额 / 偏斜门控逻辑 MUST 在远离 1:1 的价格下进行断言。脚手架的 `setUp()` 池从 1:1 开始（`sqrtPriceX96 = 2^96`），这是唯一一个无论原始价格与 1.0 的门控逻辑如何编写，看起来都正确的价格。请调用 `_freshPoolAt(<non-1:1 sqrtPriceX96>)`（`Hook.t.sol` 中的辅助函数），并在那里断言 BOTH legs：必须保持开放的 leg 不被拒绝，必须关闭的 leg 发生回退。只在 1:1 下验证的门控逻辑属于错误通过。



## 步骤

1. **解析 `${var}`。** 提取 `arm:` 标志、可选的 `template:`、可选的 `chain:` 和自由文本 brief。brief 为空时，使用该语法以 `DEPLOY_HOOK_EMPTY` 退出。

2. **解析链。** 链名称在 `chains.tsv` 中解析（默认为 `base-sepolia`）；`hook-deploy.sh` 将其映射到官方 `PoolManager` + RPC，因此你需要传递名称，而不是地址。运行 `./hook-deploy.sh chains` 查看列表，或读取 `chains.tsv`。如果名称不在注册表中，则以 `DEPLOY_HOOK_BAD_CHAIN` 退出。查找对应行的 `testnet` 列：如果为 `false`（主网），则强制执行双重 opt-in —— `${var}` 中必须同时包含 `arm:` 和显式的 `chain:`，否则以 `DEPLOY_HOOK_BAD_CHAIN` 退出。支持所有 Uniswap v4 链（Base、Ethereum、Unichain、Arbitrum、Optimism、Polygon、BNB、Avalanche、Robinhood、Worldchain、Ink、Soneium、Celo、X Layer 及其测试网）。

3. **确认已暂存的工具链 + 项目。** 工作流会在本次运行前预先暂存所有内容（`scripts/stage-deploy-uni-hook.sh`）：`$PATH` 中的 Foundry、位于 `$HOOKBUILD_DIR` 的预构建 v4 项目（默认为 `$HOME/hookbuild`），其中包含全部三个模板 + `MockERC20.sol` + `DeployHook.s.sol` + v4 库，以及已复制到仓库根目录的 `./hook-deploy.sh`。不要在运行过程中安装 Foundry 或克隆库 —— 沙箱会阻止这些操作。检查 `command -v forge` 以及 `$HOOKBUILD_DIR` 是否存在；如果任一项缺失，则降级为 `DEPLOY_HOOK_NO_TOOLCHAIN`（输出生成的源代码 + 计划）。

4. **构建钩子（由 brief 驱动）。**
   - **模板模式**（`dynamic` / `noop` / `skim`）：在 `$HOOKBUILD_DIR/src/<Hook>.sol` 中，仅编辑 `// --- AEON:LOGIC START ---` 和 `// --- AEON:LOGIC END ---` 之间的区域。保持回调签名和标志集不变。如果默认实现已经符合 brief，则保留不变。
   - **自由模式**（其他任何情况）：将完整钩子写入 `$HOOKBUILD_DIR/src/Hook.sol`，替换 `// --- AEON:BODY ... ---` 区域。规则：保留 `contract Hook is AeonFee`，以及构造函数 `constructor(IPoolManager _pm) AeonFee(_pm)`。不要实现 `afterSwap`、`poolManager`、`onlyPoolManager` 或 `NotPoolManager` —— 它们来自 `AeonFee`，并且强制的 10 bps 费用会自动收取（审计会拒绝不包含 `is AeonFee` 的 Hook，也会拒绝重新声明 `afterSwap` 的 Hook）。对于 swap 后逻辑，重写 `_afterSwapExtra`（返回 0，或返回一个由钩子自身 `take` 的额外 delta）。实现提示词所需的任何其他 v4 回调，每个都必须使用 EXACT `IHooks` 签名、`onlyPoolManager` 和正确的 selector 返回值。不要手动设置标志 —— 它们会根据你的回调自动派生（以及始终启用的 AeonFee `afterSwap`/`afterSwapReturnsDelta` 位）。如果另一个回调返回非零 delta，则在 `$HOOKBUILD_DIR/hook.env` 中设置 `HOOK_RETURNS_DELTA`；对于费用覆盖钩子，在其中设置 `HOOK_POOL_FEE=dynamic`。遵循 **Labs 路由** 和 **Fleet 审计规则**：空的 `hookData` 必须成功；游戏不得使 vanilla exact-in swap 发生回退；额外的 `take()`（在 `_afterSwapExtra` 中）必须对 exact-in 和 exact-out 收取 magnitude，并且绝不能托管资金；价格/余额/偏斜门控逻辑必须添加 `afterInitialize` 回调，并锚定到池自身的起始价格（门控规则 6），绝不能隐式使用 1.0。
     - **同时编写行为测试。** 在 `$HOOKBUILD_DIR/test/Hook.t.sol` 中，将 `// --- AEON:ASSERT ... ---` 区域替换为用于断言钩子 SPECIFIC intended behavior 的 `test_*` 函数，而不只是测试“不会发生回退”。对于 brief 中的每条规则，至少编写一个正例和一个反例：使用 `_expectSwapRevert(zeroForOne, amount, Hook.SomeError.selector)` 断言钩子 MUST REJECT 的 swap（该辅助函数会为你解包 v4 的 `WrappedError` —— 不要使用裸 `vm.expectRevert`，它无法匹配该包装器）；使用普通的 `_swap(...)` 断言钩子 MUST ALLOW 的 swap；对于任何 getter/记账逻辑，使用 `assertEq(hook.someGetter(...), expected)`。对于决策依赖价格或储备余额的门控逻辑，请通过 `_freshPoolAt(<non-1:1 sqrtPriceX96>)` 进行断言（两条 leg，偏离 parity）——`setUp()` 的池处于 1:1，此类门控逻辑在该价格下总会看起来正确。不要编辑 `setUp()` 或辅助函数 —— 只能编辑 `AEON:ASSERT` 区域。如果 brief 没有可拒绝的行为，仍然断言钩子改变的可观察状态。

5. **模拟 + 审计（始终执行）。** 传入模式、类型和链（省略链时默认为 `base-sepolia`）：
   ```bash
   ./hook-deploy.sh simulate <kind> <chain>
   ```
   对于 `freeform`，在任何部署之前，会按顺序运行以下三个门禁：
   1. **静态审计** - 从回调派生 flags；检查合约是否命名为 `Hook`、是否为 `AeonFee`（强制收费），且未重新声明 `afterSwap`；是否至少有一个回调或 `_afterSwapExtra`；每个回调是否都带有 `onlyPoolManager`；`test/Hook.t.sol` 是否至少有一个 `test_` 函数；并扫描危险模式（`selfdestruct`/`delegatecall` 会直接失败；`tx.origin`/原始 value-call/内联 `assembly` 会打印警告，要求进行审查）。失败时退出并返回 `DEPLOY_HOOK_AUDIT_FAILED`（绝不部署）。
   2. **行为测试** - `forge test --fork-url <chain> --match-contract HookBehaviorTest` 在分叉链上运行由 agent 编写的断言。测试失败或无法编译时退出并返回 `DEPLOY_HOOK_TEST_FAILED`（绝不部署）。这用于证明 hook 实现了提示要求的行为。
   3. **分叉模拟** - `forge script` 编译、挖掘 salt、在内存中部署、初始化池、添加流动性，并针对目标链的分叉运行一次 swap。
   
   如果发生编译错误，则修复后重试（最多 3 次）。如果模拟发生回退，则退出并返回 `DEPLOY_HOOK_SIM_FAILED`。记录挖掘出的 hook 地址、派生出的 flags 以及 `Estimated amount required`。在主网上，将该估算值与部署者余额进行比较（`cast balance <addr> --rpc-url <rpc>`）；如果余额不足以覆盖估算值，则退出并返回 `DEPLOY_HOOK_UNDERFUNDED`。
   
   对于 freeform hook，在进入 arm 状态之前，还要**阅读生成的 `Hook.sol` 并分析其安全性**：是否有回调允许调用者窃取资金、阻塞池（无条件回退）或重入？如果无法确定，则停留在 dry-run 阶段并报告相关疑虑。

6. **停止 Dry-run。** 如果 `${var}` 没有以 `arm:` 开头，则在此处停止。报告：模板、挖掘出的地址（及其 flag 位）、receipt 中的 `routing` 行（自动路由还是 allowlist + 原因）、池 key 以及模拟结果。退出并返回 `DEPLOY_HOOK_DRY_RUN`。

7. **Arm 检查（仅在使用 `arm:` 时执行）。**
   - 确认已设置 `HOOK_DEPLOYER_PRIVATE_KEY`（它通过 `requires:` 注入）。如果未设置，则降级为 dry-run 报告，并退出并返回 `DEPLOY_HOOK_NO_KEY`。
   - 读取 `memory/state/hook-deploys.json`。如果相同的 `(chain, template, brief)` 在过去一小时内已经部署，则退出并返回 `DEPLOY_HOOK_IDEMPOTENT`，并附带之前的地址。

8. **广播部署。**
   ```bash
   ./hook-deploy.sh broadcast <kind> <chain>
   ```
   runner 会打印**部署 receipt**（hook 地址、解码后的 flag 名称、区块浏览器深层链接、交易哈希），并且当 Etherscan 系列链上设置了 `ETHERSCAN_API_KEY` 时，会在区块浏览器上**自动验证** hook 源码（尽力而为——验证失败不会导致已完成的部署失败）。如果打印了 `ALREADY_DEPLOYED`，则将报告的地址视为结果（不进行新的部署）。从 receipt 或 `$HOOKBUILD_DIR/broadcast/DeployHook.s.sol/<chainId>/run-latest.json` 中读取 hook 地址和交易哈希。

9. **验证。** 使用 `cast` 通过 RPC 调用 `StateView.getSlot0(poolId)` 读取池状态。确认池存在，并确认 hook 地址的低位与模板的 flags 相等。确认 swap 发出了 hook 事件。

10. **记录部署。** 部署已经在链上完成，这是只追加的历史记录，不是待审查的变更，因此**不要**打开 PR 或创建分支。只需将记录写入 `main` 上的工作树；工作流的运行后提交会将其提交。写入：
    - `memory/state/hook-deploys.json` ——追加此次部署（chain、template、brief、hook address、flags、tx hashes、timestamp、poolId、poolKey）。
    - `output/hooks/<hook-address>.sol` ——从 `$HOOKBUILD_DIR/src/<Hook>.sol` 复制已部署的源代码。
    - 对于 freeform，还需写入 `output/hooks/<hook-address>.t.sol` ——复制 `$HOOKBUILD_DIR/test/Hook.t.sol`（作为部署准入条件的行为测试）。

    不要暂存根目录下的 `./hook-deploy.sh` 或 `./chains.tsv`（运行时副本；两者都被 gitignore）。

11. **发布到公开 hook 列表（仅限实时主网部署）。** 如果这是一次真实广播（不是 dry-run），且目标是注册表支持的主网链（`ethereum base robinhood monad bnb arbitrum unichain`），请将该 hook 列入 `aeonfun/univ4-hooks`，使其显示在 aeon hook 市场中。复用 `submit-hook` skill 的辅助程序——它会从地址解码 flags、格式化条目、重新生成注册表，并打开 PR（没有推送权限时则使用 issue 作为后备方案）：
    ```bash
    python3 skills/submit-hook/submit-univ4.py \
      --address "$HOOK_ADDR" --chain "$CHAIN" \
      --name "$NAME" --category "$CATEGORY" --klass "$KLASS" \
      --template "$TEMPLATE" --stage deployed --source aeon --verified \
      --date "$(date -u +%F)" \
      --mechanic "$MECHANIC" --plain "$PLAIN" --rule "$RULE1" --rule "$RULE2"
    ```
    按照 `skills/submit-hook/SKILL.md` 中的说明，准确地从 brief 推导 `name`/`category`/`klass`/`mechanic`/`plain`/`rules`。这是尽力而为的操作：提交失败绝不能导致已完成的部署失败——记录错误并继续。dry-run、testnet 或不受支持的链应完全跳过此步骤。

12. **通知并退出。** 发送简短通知（template、地址、区块浏览器链接、`routing` 类别、dry-run 还是 live，以及打开的 hook-list PR URL）。退出状态为 `DEPLOY_HOOK_OK`（或 `DEPLOY_HOOK_DRY_RUN`）。

## 降级规则

- 没有密钥 → dry-run 报告，`DEPLOY_HOOK_NO_KEY`。绝不硬失败。
- 缺少 Foundry 或暂存项目（`command -v forge` 失败或 `$HOOKBUILD_DIR` 不存在）→ 输出生成的源代码和计划，`DEPLOY_HOOK_NO_TOOLCHAIN`。不要尝试在运行期间安装（沙箱会阻止安装）。
- chain 无效/缺失，或主网部署未获得双重授权 → `DEPLOY_HOOK_BAD_CHAIN`。
- 目标为主网，但实例未设置 `HOOK_MAINNET_OK=1`（`hook-deploy.sh` 退出码为 7）→ `DEPLOY_HOOK_MAINNET_NOT_AUTHORIZED`（绝不广播）。
- 主网余额低于模拟估算值，或部署者没有资金（`hook-deploy.sh` 退出码为 8）→ `DEPLOY_HOOK_UNDERFUNDED`（绝不广播）。
- Gas price 高于 `MAX_GAS_GWEI`（`hook-deploy.sh` 退出码为 9）→ `DEPLOY_HOOK_GAS_TOO_HIGH`（绝不广播；手续费下降后重试）。
- Freeform 静态审计失败（名称错误/没有 callback/缺少 `onlyPoolManager`/没有 `test_`/包含 `selfdestruct`/包含 `delegatecall`）→ `DEPLOY_HOOK_AUDIT_FAILED`（绝不部署）。
- Freeform 行为测试失败或无法编译 → `DEPLOY_HOOK_TEST_FAILED`（绝不部署）。
- 模拟执行回滚 → `DEPLOY_HOOK_SIM_FAILED`（模拟失败后绝不广播）。

## 注意

- 三个模板均已预先验证：每个模板都能在 Base Sepolia 上完成完整的部署 + swap 模拟。它们都继承 `AeonFee`，因此都携带 return-delta 位，并且属于 allowlist（`dynamic` = 0x10C4；`noop` = 0xC4；`skim` = 0x44）。
- **Freeform** 会根据提示在 `src/Hook.sol` 中构建任意 hook，并在 `test/Hook.t.sol` 中生成其行为测试。Flags 会根据回调自动推导（绝不会手动设置）。任何部署之前都会运行三个门禁：静态审计（名称/回调/`onlyPoolManager`/测试是否存在/危险模式扫描）、由代理编写的基于 fork 的 `forge test` 行为断言，以及 fork 模拟。代理还会在启用部署之前读取生成的源代码，检查窃取资金、阻塞和重入风险。若某个模板适用，应优先使用匹配的模板（这些模板已经过审计）；对于新颖逻辑则使用 freeform。
- 每次部署，无论是模板还是 freeform，始终会先在目标链的 fork 上进行模拟，因此会在任何广播之前检查“它是否能正常工作”。
- **任何 Uniswap v4 链都可以使用。** `chains.tsv` 包含每个官方 v4 部署（Base、Ethereum、Unichain、Arbitrum、Optimism、Polygon、BNB、Avalanche、Robinhood、Worldchain、Ink、Soneium、Celo、X Layer，以及 Sepolia 测试网），并且已验证这些链持有 PoolManager。同一流程可在所有这些链上运行，只有 `PoolManager`/RPC 不同，并通过名称解析。要获得已挖出的地址，必须使用 CREATE2 deployer（`0x4e59…4956C`）；如果某条链缺少它，fork 模拟会在任何广播之前安全失败。
- **主网仅涉及 GAS。** 部署会将自己的 `MockERC20` 代币铸造给自身（免费），并使用这些 mock 代币为演示池提供初始流动性，因此主网广播带来的风险仅为 GAS，绝不会涉及真实资金。部署的池是 MockA/MockB 演示池；可复用的 hook 合约才是真正的交付物。部署者密钥必须是持有纯 gas 余额的已注资 burner；当余额高于 `HOOK_MAX_FLOAT_ETH` 时，runner 会发出警告。主网还需要 `HOOK_MAINNET_OK=1` 操作者锁。未来版本可以添加无需密钥的 Base MCP `send_calls` 通道，这样 runner 中就无需存放密钥。
- **经过身份验证的 RPC + receipt + verify。** 在主网上，runner 优先使用 Alchemy endpoint（`ALCHEMY_API_KEY` + 链的 `alchemy` slug），而不是公共 RPC，因此不可信的公共节点无法伪造成功的模拟结果。广播后，它会打印 receipt（地址、解码后的 flags、区块浏览器链接、交易哈希），并且在 Etherscan 系列链上配置了 `ETHERSCAN_API_KEY` 时，会自动验证源代码（尽力而为）。所有这些功能都是可选的：未设置任何密钥时，该 skill 仍会使用公共 RPC 运行，但不会进行验证。