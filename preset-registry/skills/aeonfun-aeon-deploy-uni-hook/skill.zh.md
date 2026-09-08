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
> - `<brief>` → **演练运行**：生成、编译、挖矿并模拟。绝不广播。*[默认，无前缀]*
> - `arm:<brief>` → **广播**：先完成完整的演练运行，然后仅在模拟通过时进行真实部署。
> - `template:<name>` → 强制指定模式：`dynamic` | `noop` | `skim`（预审计模板）或 `freeform`（根据提示构建完整 hook）。省略则自动选择：匹配模板的简述将使用该模板；其他任何内容 → `freeform`。
> - `chain:<name>` → `chains.tsv` 中的任意 Uniswap v4 链（运行 `./hook-deploy.sh chains` 查看列表）。默认 `base-sepolia`。测试网：`base-sepolia`、`unichain-sepolia`、`arbitrum-sepolia`。主网（`testnet: false`，例如 `base`、`ethereum`、`unichain`、`arbitrum`、`optimism`、`polygon`、`bnb`、`avalanche`，...）同时要求 `arm:` 和显式的 `chain:` —— 此 skill 默认绝不以主网为目标。`base-mainnet` 可作为 `base` 的别名。

今天是 ${today}。此 skill 可将一行简述转化为一个在线的 Uniswap v4 hook。它以安全为设计原则：每次部署广播前都会进行模拟，默认在测试网上演练运行，并且需要显式 `arm:` 才会执行链上操作。

## 为什么采用此设计

hook 绑定不可变，错误的 hook 可能导致池子无法使用或盗取资金。因此，防护门槛位于部署**之前**：两道门槛（`dry-run`，然后是 `arm:`）、强制模拟以及幂等状态。广播之后的一切只是记录已经发生的事情——追加到 `main` 上的 `memory/state/hook-deploys.json`，不创建 PR（已经没有任何内容可供审查）。Foundry 流程是经过验证的方案——挖掘 CREATE2 salt，使地址携带正确的 hook 标志位，然后部署、初始化池子、添加流动性并运行一次交换。

## 安全约定（不得跳过）

1. **主网需要三重锁。** 除非 `${var}` 同时具有 `arm:` **和**显式的 `chain:<mainnet-name>`，**并且**实例已将 `HOOK_MAINNET_OK=1` 设置为**仓库变量**（第三道由操作员控制的锁，在 `hook-deploy.sh` 内部强制执行，退出码 7；应将其保存为变量，而不是密钥——值为 `1` 的密钥会将运行日志中的每一个 `1` 都掩码，因此交易哈希和链接会显示为 `***`），否则绝不能以任何 `testnet: false` 链为目标。即使武装消息提出请求，从未获授权使用主网的实例也不能在主网上广播。此 skill 只能运行于其入站路径受所有者限制的实例（`TELEGRAM_ALLOWED_USER_ID` / 多通道允许列表）——主网部署会消耗真实 gas，因此绝不能允许不受信任的发送方调度它。在主网链上，首先使用 `cast balance` 读取部署者余额；若其无法覆盖模拟中的 `Estimated amount required`，则中止（`DEPLOY_HOOK_UNDERFUNDED`）；`hook-deploy.sh` 还会独立执行资金下限检查（退出码 8）、可选的 `MAX_GAS_GWEI` gas 价格上限（退出码 9），并在部署者持有超过 `HOOK_MAX_FLOAT_ETH`（默认值 0.25）时发出警告——部署密钥只能持有 gas 浮动资金，绝不能持有 LP 或金库资金。在输出中记录清晰的 `MAINNET` 警告。
2. **每次广播前都进行模拟。** 如果模拟发生 revert，则不得广播。报告该 revert 并以 `DEPLOY_HOOK_SIM_FAILED` 退出。
3. **演练运行是默认行为。** 仅当 `${var}` 以 `arm:` 开头时才广播。
4. **密钥卫生。** 部署者密钥是一次性密钥。绝不打印它。绝不将其置于 shell 命令行上——始终通过 `./hook-deploy.sh`，由该脚本从环境变量中读取它。
5. **幂等性。** 广播前，读取 `memory/state/hook-deploys.json`。如果相同简述已在过去一小时内完成部署，则不重复部署。部署脚本同样在地址级别保持幂等：它部署到*规范*地址（针对这个确切的 `(creationCode, flags, PoolManager)`，第一个标志位匹配的 CREATE2 salt）。如果该地址已经包含代码，则相同的 hook 已经上线，因此脚本会记录 `ALREADY_DEPLOYED <addr>` 且不执行任何操作——运行器会报告现有地址，而非部署重复副本。（HookMiner 本身会跳过已占用地址，因此若无此检查，重新运行将会静默地在新地址部署另一份副本。）

## 输入与配置

- **模板：** `skills/deploy-uni-hook/templates/` - `AeonFee.sol`（每个 hook 都继承的强制性 10 bps 协议费基础）、`DynamicFeeHook.sol`、`NoOpHook.sol`、`HookFeeHook.sol`（已预审计）、`Hook.sol` + `Hook.t.sol` + `hook.env.example`（自由形式脚手架、行为测试门槛、清单），以及 `DeployHook.s.sol`、`MockERC20.sol`、`foundry.toml`、`chains.tsv`。
- **链配置：** `skills/deploy-uni-hook/templates/chains.tsv` 是唯一事实来源 — 采用 TAB 分隔，字段为 `name  chainId  testnet  poolManager  stateView  rpc  explorer  alchemy`，每个 Uniswap v4 链一行（与读取它的 `hook-deploy.sh` 放在同一目录）。`memory/uni-deployments.md` 为人工阅读而镜像此文件。要添加链，请向 `chains.tsv` 追加一行。
- **经过身份验证的 RPC：** `rpc` 列是公共端点。当设置了 `ALCHEMY_API_KEY` 且该行具有 `alchemy` slug 时，`hook-deploy.sh` 会改用 `https://<slug>.g.alchemy.com/v2/$ALCHEMY_API_KEY` — 可信 RPC 对主网模拟和广播很重要（恶意公共 RPC 可以伪造通过的模拟）。优先级：`RPC_URL`（覆盖，用于测试）> Alchemy 密钥 + slug > 公共 `rpc`。RPC 路径（密钥所在位置）绝不会被打印 — 日志仅显示主机。
- **部署辅助工具：** `skills/deploy-uni-hook/hook-deploy.sh` — 唯一获准的广播路径（隐藏密钥）。
- **状态：** `memory/state/hook-deploys.json` — 幂等性与部署账本。

### 模板选择器（未给出 `template:` 时）

| 简述提及 | 模式 |
|---|---|
| fee、volatility、dynamic、surge | `dynamic` |
| skim、hook fee、take a cut、revenue | `skim` |
| “minimal” / “starter” / “empty” | `noop` |
| game、leaderboard、points、crown、loyalty | `freeform`（游戏规则在 Labs 路由中） |
| 其他任何情况（模板未涵盖的新逻辑） | `freeform` |

## 强制性 AeonFee（每个 hook）

此 skill 部署的每个 hook 都继承 `AeonFee`（`templates/AeonFee.sol`）：在 `afterSwap` 中，从交换的未指定（输出）货币收取**强制性** 10 bps（0.10%）协议费，并将其路由至 `AEON_FEE_RECIPIENT`（`0xF1E958db7D1e4C074377946018Ad645db4FB158e`）。费率和接收方均为编译时常量，且 `afterSwap` **不是** virtual，因此任何 hook 都不能降低、跳过或重定向该费用。hook 通过 `_afterSwapExtra` 添加自身的交换后逻辑（该逻辑在费用**之后**运行），其收取的任何 hook 费用均在这 10 bps **之上叠加**。

由于该费用是一个返回 delta 的 `take()`，每个 aeon hook 的地址都带有 `AFTER_SWAP + AFTER_SWAP_RETURNS_DELTA`（`0x44`）— 因此**没有 aeon hook 可由 Uniswap Labs 自动路由**；每个都需要 allowlist / UniswapX filler（参见下文的 Labs 路由）。这是为不可绕过的费用所作出的有意权衡。

## Labs 路由

除非地址以 `0x91` 开头，或者 hook 使用 `beforeSwapReturnsDelta`、`afterSwapReturnsDelta` 或 `dynamicFees`，否则 Uniswap Labs 会自动路由一个使用 hook 的池。属于该集合的任何项目都需要[allowlist 表单](https://www.notion.so/uniswaplabs/1aec52b2548b80f78dbef8d2f0d7183e)或 UniswapX filler。由于 AeonFee 使每个 hook 都成为 `afterSwapReturnsDelta` take，**没有模板会自动路由** - 所有模板均需 allowlist。

| 模板 | 标志 | Labs 经典路由器 |
|---|---|---|
| `noop` | `0xC4` (beforeSwap + AeonFee `0x44`) | 允许列表 (`afterSwapReturnsDelta`) |
| 自由形式默认 (`_afterSwapExtra`) | `0x44` (AeonFee) | 允许列表 (`afterSwapReturnsDelta`) |
| `dynamic` | `0x10C4` (`0x10C0` + AeonFee `0x04`) + `DYNAMIC_FEE_FLAG` | 允许列表 (`dynamicFees` + `afterSwapReturnsDelta`) |
| `skim` | `0x44` (AeonFee + 自身 skim，相同位) | 允许列表 (`afterSwapReturnsDelta`) |

**挂钩上的游戏**（自由形式）：10 bps 费用已通过 `take()` 在基础 `afterSwap` 中执行，自由形式主体不得实现 `afterSwap`（将额外逻辑放入 `_afterSwapExtra`）。
1. 强制费用始终会被收取；hook 自己的额外费用也应放入 `_afterSwapExtra`，并在此基础上叠加。
2. 仅当 `hookData` 指定玩家时游戏才运行。空 `hookData`（Labs Universal Router）= 付费交换，无游戏，不回滚。
3. 切勿将游戏编码到 `amountSpecified`、区块号或必需的交换方向中。这些会使路由器回滚，且不会收取任何费用。
4. `sender` 是路由器，不是用户。不要根据 `sender` 关联游戏状态。

除非简要需求明确要求回滚门控，否则不要生成金额后缀 / 区块回显 / 仅精确输出 / 方向门控 hooks。矿工会跳过 `0x91...` 地址。

## 舰队审计规则（来自 aeon.fun hook 审计）

这些是在线舰队中已测得的长期缺陷。自由形式实现不得重现它们。`skim` 模板已经修复。

**费用 / `take()`：**
- 收取未指定 delta 的**绝对值**。精确输出会使该 delta 为负。`if (unspecifiedAmount <= 0) return` 会在每次精确输出交换时静默跳过费用（共享基础 F1）。
- 取负前先扩展为 `int256`。`-type(int128).min` 会 panic 并使该交换无法执行。
- 使用 `poolManager.take(..., feeRecipient, ...)` 向不可变接收方收费。绝不能使用 `address(this)`。不要有 `withdraw()`。托管问题是 CrownClash/LegacyLedger 的 HIGH 级别缺陷。
- 额外的 skim helper 不得复制 `<= 0` 提前返回逻辑（符号守卫的第二个副本）。

**门控**（仅当简要需求要求回滚门控时）：
- 1a. 会自行变化的值（`block.number`）：在区块 N 的头部由 `view` helper 给出的结果，在执行时的 N+1 区块就是错误的。应以执行区块为目标。
- 1b. 会在有人交换时变化的值（价格低字节）：精确匹配加零容差会造成竞争性 DoS。需要一个区间，或者不要门控。
- 1c. 攻击者可以停驻且失败时不推进的共享计数器：这是一种 griefing 原语。
- 2. `unlock` 帧中的合约可以满足谓词；签名交易则不能。这会绑定错误的参与方。
- 5. 切勿将原始 `amountSpecified` 与以代币计价的常量比较。调用者可通过精确输入与精确输出选择指定货币。应使用无量纲边界（tick 变动 / 流动性比例）。
- 6. 两个虚拟储备上的“余额”/“偏斜”/“较重一侧”门控本质上是伪装的原始**价格**门控。`StateLibrary` 给出 `amount0 = L*2^96/sqrtP` 和 `amount1 = L*sqrtP/2^96`，因此 `amount0/amount1 = 1/price`，流动性 `L` 会完全抵消。因此，对两个储备的任何测试（`b0 >= b1`、偏斜区间、“哪一侧更重”）都会简化为将池子的原始价格与隐式 `1.0` 比较；原始价格是以最小单位表示的 `token1/token0`，因此只有对于接近平价的相同小数位代币对，它才约为 1.0。USDC(6d)/WETH(18d) 池会偏离约 8 个数量级；两个 18 位小数代币在价格为 2.0 时就已超出 10% 区间。这样的门控在每个真实代币对上都将永久单向：一整条腿会永远回滚，而“每笔交易都会向 50/50 再平衡”是错误的（全范围头寸在任何价格下按价值计算都已经是 50/50）。修复方法：快照池子**自身**的参考值（`afterInitialize` 时的 `sqrtPriceX96`，或简要需求中明确指定的目标比率），并根据**该值**门控当前价格，绝不要使用硬编码的 1.0。这需要 `afterInitialize` 回调（增加标志位 `0x1000`），因此价格/余额/偏斜 hook 必须将其包含在回调集合中，否则它无法得知自身的起始价格。
- 切勿使用 `balanceOf(poolManager)`：那是 v4 单例的全局库存，不是该池的库存。应使用 `StateLibrary`。
- `sender` 是路由器。不要将其视为交易者。

**测试：**
- fee hook 必须断言 exact-in 和 exact-out 的 take。
- gate 需要一个无 hook 的负向对照（`hooks = address(0)`）。
- 不要跨 `vm.roll` 缓存 `block.number`（via-ir 会将其折叠）。请使用 `vm.getBlockNumber()`。
- price / balance / skew gate MUST be asserted at a price away from 1:1。scaffold 的 `setUp()` pool 从 1:1 开始（`sqrtPriceX96 = 2^96`），这是 raw-price-vs-1.0 gate 无论如何编写都会看起来正确的唯一价格。请调用 `_freshPoolAt(<non-1:1 sqrtPriceX96>)`（`Hook.t.sol` 中的 helper），并在那里断言 BOTH legs：必须保持开放的 leg 未被拒绝，必须关闭的 leg 会 revert。仅在 1:1 下证明的 gate 属于 false pass。



## 步骤

1. **解析 `${var}`。** 提取 `arm:` 标志、可选的 `template:`、可选的 `chain:` 以及自由文本 brief。brief 为空时，以 `DEPLOY_HOOK_EMPTY` 退出，并输出 grammar。

2. **解析 chain。** chain 名称在 `chains.tsv` 中解析（默认为 `base-sepolia`）；`hook-deploy.sh` 会将其映射到官方 `PoolManager` + RPC，因此你应传入 NAME，而不是地址。运行 `./hook-deploy.sh chains` 查看列表，或读取 `chains.tsv`。如果名称不在 registry 中，以 `DEPLOY_HOOK_BAD_CHAIN` 退出。查找该行的 `testnet` 列：如果为 `false`（mainnet），则强制执行双重 opt-in：`${var}` 中必须同时包含 `arm:` 和显式的 `chain:`，否则以 `DEPLOY_HOOK_BAD_CHAIN` 退出。支持每个 Uniswap v4 chain（Base、Ethereum、Unichain、Arbitrum、Optimism、Polygon、BNB、Avalanche、Robinhood、Worldchain、Ink、Soneium、Celo、X Layer 及其 testnet）。

3. **确认已 staged 的 toolchain + project。** workflow 会在本次运行前预先 staging 所有内容（`scripts/stage-deploy-uni-hook.sh`）：`$PATH` 上有 Foundry，`$HOOKBUILD_DIR`（默认为 `$HOME/hookbuild`）中有一个预构建的 v4 project，其中包含全部三个 template + `MockERC20.sol` + `DeployHook.s.sol` + v4 libraries，并且 `./hook-deploy.sh` 已复制到 repo 根目录。不要在运行期间安装 Foundry 或 clone libraries，sandbox 会阻止这些操作。检查 `command -v forge` 以及 `$HOOKBUILD_DIR` 是否存在；如果任一项缺失，则降级为 `DEPLOY_HOOK_NO_TOOLCHAIN`（输出生成的 source + plan）。

4. **构建 hook（由 brief 驱动）。**
   - **Template mode**（`dynamic` / `noop` / `skim`）：在 `$HOOKBUILD_DIR/src/<Hook>.sol` 中，仅编辑 `// --- AEON:LOGIC START ---` 与 `// --- AEON:LOGIC END ---` 之间的区域。保持 callback signatures 和 flag set 不变。如果默认内容已经符合 brief，则保持不变。
   - **Freeform mode**（其他任何值）：将完整 hook 写入 `$HOOKBUILD_DIR/src/Hook.sol`，替换 `// --- AEON:BODY ... ---` 区域。规则：保持 contract 为 `contract Hook is AeonFee`，保持 constructor 为 `constructor(IPoolManager _pm) AeonFee(_pm)`。不要实现 `afterSwap`、`poolManager`、`onlyPoolManager` 或 `NotPoolManager`，它们来自 `AeonFee`，并且 mandatory 10 bps fee 会被自动收取（audit 会拒绝不是 `is AeonFee` 的 Hook，也会拒绝重新声明 `afterSwap` 的 Hook）。对于 post-swap logic，请 override `_afterSwapExtra`（返回 0，或返回 hook 自己 `take` 的额外 delta）。实现 prompt 所需的任何其他 v4 callbacks，每个都必须使用 EXACT `IHooks` signature、`onlyPoolManager` 以及正确的 selector return。不要手动设置 flags，它们会根据 callbacks 自动派生（再加上始终启用的 AeonFee `afterSwap`/`afterSwapReturnsDelta` bits）。如果另一个 callback 返回非零 delta，则在 `$HOOKBUILD_DIR/hook.env` 中设置 `HOOK_RETURNS_DELTA`；对于 fee-override hook，在其中设置 `HOOK_POOL_FEE=dynamic`。遵循 **Labs routing** 和 **Fleet audit rules**：空的 `hookData` 必须成功；game 不得使 vanilla exact-in swap revert；额外的 `take()`（在 `_afterSwapExtra` 中）必须收取 magnitude（exact-in 和 exact-out），并且绝不能 custody；price/balance/skew gate 必须添加 `afterInitialize` callback，并锚定到 pool 自身的 start price（Gates rule 6），绝不能使用隐式的 1.0。
     - **同时编写 behavioral test。** 在 `$HOOKBUILD_DIR/test/Hook.t.sol` 中，将 `// --- AEON:ASSERT ... ---` 区域替换为用于断言 hook **SPECIFIC intended behavior** 的 `test_*` functions，而不仅仅是“does not revert”。brief 中的每条规则至少编写一个 positive 和一个 negative case：编写一个 hook 必须 REJECT 的 swap，形式为 `_expectSwapRevert(zeroForOne, amount, Hook.SomeError.selector)`（该 helper 会为你解包 v4 的 `WrappedError`，不要使用裸 `vm.expectRevert`，它无法匹配该 wrapper）；以及一个必须 ALLOW 的 swap，使用普通的 `_swap(...)`；任何 getter/accounting 都应使用 `assertEq(hook.someGetter(...), expected)`。对于决策取决于 price 或 reserve balance 的 gate，请通过 `_freshPoolAt(<non-1:1 sqrtPriceX96>)` 断言（两条 leg，偏离 parity）——`setUp()` 的 pool 位于 1:1，此类 gate 在该价格下总会看起来正确。不要编辑 `setUp()` 或 helpers，只编辑 `AEON:ASSERT` 区域。如果 brief 没有可拒绝的行为，仍然要断言 hook 所改变的 observable state。

5. **模拟 + 审计（始终执行）。** 传入模式、类型和链（省略链 = `base-sepolia`）：
   ```bash
   ./hook-deploy.sh simulate <kind> <chain>
   ```
   对于 `freeform`，在任何部署前会依次运行以下三个关卡：
   1. **静态审计** - 从回调中推导标志；检查合约是否命名为 `Hook`、是否为 `is AeonFee`（强制收费），并且没有重新声明 `afterSwap`，是否至少包含 1 个回调或 `_afterSwapExtra`，每个回调是否都带有 `onlyPoolManager`，`test/Hook.t.sol` 是否包含至少 1 个 `test_` 函数，并扫描危险模式（`selfdestruct`/`delegatecall` 为硬失败；`tx.origin`/原始 value-call/内联 `assembly` 会打印需要审查的警告）。失败时退出 `DEPLOY_HOOK_AUDIT_FAILED`（绝不部署）。
   2. **行为测试** — `forge test --fork-url <chain> --match-contract HookBehaviorTest` 在分叉环境中运行代理编写的断言。测试失败或无法编译时退出 `DEPLOY_HOOK_TEST_FAILED`（绝不部署）。这证明该 hook 实现了提示词所要求的行为。
   3. **分叉模拟** — `forge script` 会编译、挖掘 salt、在内存中部署、初始化池、添加流动性，并针对目标链的分叉运行一次 swap。
   如果出现编译错误，修复后重试（最多 3 次）。如果模拟发生 revert，退出 `DEPLOY_HOOK_SIM_FAILED`。捕获挖掘出的 hook 地址、推导出的标志以及 `Estimated amount required`。在主网上，将该估算值与部署者余额（`cast balance <addr> --rpc-url <rpc>`）进行比较；如果无法覆盖，则退出 `DEPLOY_HOOK_UNDERFUNDED`。
   对于自由形式 hook，还需在准备执行前**读取生成的 `Hook.sol` 并评估其安全性**：是否有任何回调允许调用者窃取资金、使池失效（无条件 revert）或重入？如有疑虑，停止在 dry-run 并报告该问题。

6. **Dry-run 停止。** 如果 `${var}` 并非以 `arm:` 开头，则在此处停止。报告：模板、挖掘出的地址（及其标志位）、收据的 `routing` 行（自动路由或允许列表 + 原因）、池 key 和模拟结果。退出 `DEPLOY_HOOK_DRY_RUN`。

7. **Arm 检查（仅当为 `arm:` 时）。**
   - 确认 `HOOK_DEPLOYER_PRIVATE_KEY` 已设置（通过 `requires:` 注入）。如果未设置，则降级为 dry-run 报告并退出 `DEPLOY_HOOK_NO_KEY`。
   - 读取 `memory/state/hook-deploys.json`。如果相同的 `(chain, template, brief)` 在过去一小时内已部署，则使用先前地址退出 `DEPLOY_HOOK_IDEMPOTENT`。

8. **广播。**
   ```bash
   ./hook-deploy.sh broadcast <kind> <chain>
   ```
   运行器会打印一份**部署收据**（hook 地址、解码后的标志名称、浏览器深层链接、交易哈希），并且当 `ETHERSCAN_API_KEY` 已在 Etherscan 系列链上设置时，会在浏览器上**自动验证** hook 源码（尽力而为 — 验证失败绝不会导致已完成的部署失败）。如果输出了 `ALREADY_DEPLOYED`，则将报告的地址视为结果（不进行新部署）。从收据或 `$HOOKBUILD_DIR/broadcast/DeployHook.s.sol/<chainId>/run-latest.json` 中读取 hook 地址和交易哈希。

9. **验证。** 使用 `cast`，通过 RPC 上的 `StateView.getSlot0(poolId)` 读回池。确认池存在，且 hook 地址低位等于模板的标志。确认 swap 发出了 hook 事件。

10. **记录部署。** 部署已经在链上完成——这里是只追加的历史记录，不是需要审查的变更，因此**不要**创建 PR 或分支。只需将记录写入 `main` 上的工作树；工作流的运行后提交会将其提交。写入：
    - `memory/state/hook-deploys.json` ——追加此次部署（链、模板、简述、hook 地址、标志位、交易哈希、时间戳、poolId、poolKey）。
    - `output/hooks/<hook-address>.sol` ——从 `$HOOKBUILD_DIR/src/<Hook>.sol` 复制已部署的源代码。
    - 对于 freeform，还要写入 `output/hooks/<hook-address>.t.sol` ——复制 `$HOOKBUILD_DIR/test/Hook.t.sol`（作为部署准入条件的行为测试）。

    不要暂存根目录下的 `./hook-deploy.sh` 或 `./chains.tsv`（运行时副本；二者都被 gitignore 忽略）。

11. **通知并退出。** 发送简短通知（模板、地址、区块浏览器链接、`routing` 类别、dry-run 还是 live）。退出 `DEPLOY_HOOK_OK`（或 `DEPLOY_HOOK_DRY_RUN`）。

## 降级规则

- 没有密钥 → 输出 dry-run 报告，`DEPLOY_HOOK_NO_KEY`。绝不要硬失败。
- Foundry 或暂存项目缺失（`command -v forge` 失败或 `$HOOKBUILD_DIR` 不存在）→ 输出生成的源代码 + 计划，`DEPLOY_HOOK_NO_TOOLCHAIN`。不要尝试在运行期间安装（沙箱禁止安装）。
- 链错误或缺失，或者主网未进行双重确认 → `DEPLOY_HOOK_BAD_CHAIN`。
- 链是主网，但实例未设置 `HOOK_MAINNET_OK=1`（`hook-deploy.sh` 退出码 7）→ `DEPLOY_HOOK_MAINNET_NOT_AUTHORIZED`（绝不广播）。
- 主网余额低于模拟估算值，或部署者没有资金（`hook-deploy.sh` 退出码 8）→ `DEPLOY_HOOK_UNDERFUNDED`（绝不广播）。
- Gas 价格高于 `MAX_GAS_GWEI`（`hook-deploy.sh` 退出码 9）→ `DEPLOY_HOOK_GAS_TOO_HIGH`（绝不广播；等待费用降低后重试）。
- Freeform 静态审计失败（名称错误 / 没有回调 / 缺少 `onlyPoolManager` / 没有 `test_` / 存在 `selfdestruct` / `delegatecall`）→ `DEPLOY_HOOK_AUDIT_FAILED`（绝不部署）。
- Freeform 行为测试失败或无法编译 → `DEPLOY_HOOK_TEST_FAILED`（绝不部署）。
- 模拟回滚 → `DEPLOY_HOOK_SIM_FAILED`（模拟失败后绝不广播）。

## 备注

- 三个模板均已预先验证：每个模板都能在 Base Sepolia 上编译，并模拟完整的部署 + swap。它们都继承 `AeonFee`，因此都带有 return-delta 位，并且属于 allowlist（`dynamic` = 0x10C4；`noop` = 0xC4；`skim` = 0x44）。
- **Freeform** 会根据提示词构建任意 hook，将其写入 `src/Hook.sol`，并将其行为测试写入 `test/Hook.t.sol`。标志位会根据回调自动推导（绝不手动设置）。任何部署之前都会运行三道闸门：静态审计（名称/回调/`onlyPoolManager`/测试是否存在/危险模式扫描）、由 agent 编写的 fork 行为断言 `forge test`，以及 fork 模拟。启用部署前，agent 还会读取生成的源代码，检查盗取资金、阻断功能和重入风险。若某个模板适用，应优先使用匹配的模板（这些模板已经过审计）；新颖逻辑则使用 freeform。
- 每次部署——无论是模板还是 freeform——始终会先在目标链的 fork 上进行模拟，因此会在任何广播之前检查“是否可用”。
- **任何 Uniswap v4 链都可用。** `chains.tsv` 包含所有官方 v4 部署（Base、Ethereum、Unichain、Arbitrum、Optimism、Polygon、BNB、Avalanche、Robinhood、Worldchain、Ink、Soneium、Celo、X Layer，以及各个 Sepolia 测试网），并且已逐一验证其中存在 PoolManager。相同流程适用于所有这些链——只有 `PoolManager`/RPC 不同，并通过名称解析。CREATE2 部署器（`0x4e59…4956C`）是获得已挖掘地址的必要条件；如果某条链不具备该部署器，fork 模拟会在任何广播前安全失败。
- **主网只涉及 Gas。** 部署会将自己的 `MockERC20` 代币（免费）铸造给自身，并使用这些模拟代币为演示池注入初始流动性——主网广播承担的风险**仅有 GAS，绝不会涉及真实资本**。部署的池是 MockA/MockB 演示池；可复用的 hook 合约才是真正的交付物。部署者密钥必须是一个有资金的 burner，且仅持有 Gas 备用金（runner 在超过 `HOOK_MAX_FLOAT_ETH` 时会发出警告）；主网还需要 `HOOK_MAINNET_OK=1` 操作者锁。未来版本可以加入无需密钥的 Base MCP `send_calls` 通道，这样 runner 中就无需存放密钥。
- **已认证的 RPC + 回执 + 验证。** 在主网上，runner 优先使用 Alchemy 端点（`ALCHEMY_API_KEY` + 该链的 `alchemy` slug），而不是公共 RPC，从而避免不可信的公共节点伪造成功的模拟结果。广播后，它会打印回执（地址、已解码的标志位、区块浏览器链接、交易哈希），并且在 Etherscan 系列链上配置了 `ETHERSCAN_API_KEY` 时，自动验证源代码（尽力而为）。以上功能均为可选：未设置任何密钥时，该 skill 仍会使用公共 RPC 运行，但不会进行验证。