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
> **${var}** — Hook 简述。语法：`[arm:][template:<name>] [chain:<name>] <brief>`
> - ``（空）→ 打印帮助信息并以 `DEPLOY_HOOK_EMPTY` 退出。
> - `<brief>` → **试运行**：生成、编译、挖掘并模拟。绝不广播。*[默认行为——无前缀]*
> - `arm:<brief>` → **广播**：先执行完整的试运行，如果模拟通过，再进行真实部署。
> - `template:<name>` → 强制指定模式：`dynamic` | `noop` | `skim`（预审计模板）或 `freeform`（根据提示构建完整的 Hook）。省略时自动选择：与某个模板匹配的简述将使用该模板；其他任何情况 → `freeform`。
> - `chain:<name>` → `chains.tsv` 中的任意 Uniswap v4 链（运行 `./hook-deploy.sh chains` 查看列表）。默认为 `base-sepolia`。测试网：`base-sepolia`、`unichain-sepolia`、`arbitrum-sepolia`。主网（`testnet: false`，例如 `base`、`ethereum`、`unichain`、`arbitrum`、`optimism`、`polygon`、`bnb`、`avalanche` 等）同时要求使用 `arm:` 并显式指定 `chain:`——该技能默认绝不会以主网为目标。`base-mainnet` 可作为 `base` 的别名。

今天是 ${today}。该技能可将一行简述转换为一个已上线的 Uniswap v4 Hook。它以安全性为核心：每次部署在广播前都会进行模拟；默认在测试网上试运行；并且必须显式使用 `arm:` 才会执行链上操作。

## 为什么这样设计

Hook 绑定不可变，而有问题的 Hook 可能会导致池无法使用或资金被盗。因此，关卡设置在部署之前：两道关卡（先 `dry-run`，再 `arm:`）、强制模拟以及幂等状态。广播之后的所有操作都只是在记录已经发生的事情——追加到 `main` 上的 `memory/state/hook-deploys.json`，无需 PR（已经没有任何内容需要审查）。Foundry 流程是经过验证的方案——挖掘 CREATE2 盐值，使地址携带正确的 Hook 标志位，然后部署、初始化池、添加流动性并执行一次兑换。

## 安全契约（请勿跳过）

1. **主网需要三重锁定。** 除非 `${var}` 同时包含 `arm:` 和显式的 `chain:<mainnet-name>`，并且实例已将 `HOOK_MAINNET_OK=1` 设置为**仓库变量**（这是在 `hook-deploy.sh` 内强制执行的第三道操作员级锁定，退出码为 7；请将其存储为变量，而不是密钥——值为 `1` 的密钥会遮蔽运行日志中的每一个 `1`，导致交易哈希和链接显示为 `***`），否则绝不要以任何 `testnet: false` 链为目标。即使一条已启用广播的消息要求部署到主网，从未获得主网授权的实例也无法在那里广播。该技能只能运行在入站路径受所有者限制的实例上（`TELEGRAM_ALLOWED_USER_ID` / 多渠道允许列表）——主网部署会消耗真实 Gas，因此绝不能允许不受信任的发送者触发部署。在主网链上，首先使用 `cast balance` 读取部署者余额；如果余额不足以支付模拟结果中的 `Estimated amount required`，则中止并返回 `DEPLOY_HOOK_UNDERFUNDED`；`hook-deploy.sh` 还会独立强制执行资金下限（退出码为 8）和可选的 `MAX_GAS_GWEI` Gas 价格上限（退出码为 9），并在部署者持有的资金超过 `HOOK_MAX_FLOAT_ETH`（默认值为 0.25）时发出警告——部署密钥只能持有用于支付 Gas 的少量周转资金，绝不能持有 LP 或资金库资本。在输出中记录清晰的 `MAINNET` 警告。
2. **每次广播前都要模拟。** 如果模拟执行回滚，则不要广播。报告回滚信息并以 `DEPLOY_HOOK_SIM_FAILED` 退出。
3. **默认进行试运行。** 仅当 `${var}` 以 `arm:` 开头时才广播。
4. **密钥安全规范。** 部署者密钥是一次性密钥。绝不要打印该密钥。绝不要将其放在 Shell 命令行中——始终通过 `./hook-deploy.sh` 执行，该脚本会在内部从环境变量中读取密钥。
5. **幂等性。** 广播前读取 `memory/state/hook-deploys.json`。如果相同的简述在过去一小时内已经部署过，则不要重新部署。部署脚本在地址层面也具有幂等性：它会部署到*规范*地址（针对这一确切的 `(creationCode, flags, PoolManager)`，第一个与标志位匹配的 CREATE2 盐值所对应的地址）。如果该地址已存在代码，则说明相同的 Hook 已经上线，因此脚本会记录 `ALREADY_DEPLOYED <addr>` 并且不执行任何操作——运行程序会报告现有地址，而不是部署重复副本。（HookMiner 本身会跳过已占用的地址，因此如果没有此项检查，重新运行时会悄无声息地在新地址部署另一个副本。）

## 输入和配置

- **模板：** `skills/deploy-uni-hook/templates/` — `DynamicFeeHook.sol`、`NoOpHook.sol`、`HookFeeHook.sol`（已预审计），`Hook.sol` + `Hook.t.sol` + `hook.env.example`（自由形式脚手架、行为测试门禁、清单），以及 `DeployHook.s.sol`、`MockERC20.sol`、`foundry.toml`、`chains.tsv`。
- **链配置：** `skills/deploy-uni-hook/templates/chains.tsv` 是唯一事实来源 — 以 TAB 分隔的 `name  chainId  testnet  poolManager  stateView  rpc  explorer  alchemy`，每条 Uniswap v4 链对应一行（该文件与读取它的 `hook-deploy.sh` 一同放置）。`memory/uni-deployments.md` 为人工查阅提供了对应副本。要添加一条链，请向 `chains.tsv` 追加一行。
- **经过身份验证的 RPC：** `rpc` 列是公共端点。当设置了 `ALCHEMY_API_KEY` 且对应行包含 `alchemy` slug 时，`hook-deploy.sh` 会改用 `https://<slug>.g.alchemy.com/v2/$ALCHEMY_API_KEY` — 对主网模拟和广播而言，可信的 RPC 至关重要（不诚实的公共 RPC 可能伪造一次无问题的模拟）。优先级：`RPC_URL`（覆盖值，用于测试）> Alchemy 密钥 + slug > 公共 `rpc`。包含密钥的 RPC 路径绝不会被打印 — 日志仅显示主机。
- **部署辅助脚本：** `skills/deploy-uni-hook/hook-deploy.sh` — 唯一获准的广播路径（隐藏密钥）。
- **状态：** `memory/state/hook-deploys.json` — 幂等性 + 部署账本。

### 模板选择器（未提供 `template:` 时）

| 简述中提到 | 模式 |
|---|---|
| 费用、波动性、动态、激增 | `dynamic` |
| 抽成、钩子费用、分成、收入 | `skim` |
| “最小” / “入门” / “空” | `noop` |
| 游戏、排行榜、积分、皇冠、忠诚度 | `freeform`（游戏规则参见 Labs 路由） |
| 其他任何内容（模板未覆盖的新颖逻辑） | `freeform` |

## Labs 路由

Uniswap Labs 会自动路由挂载了钩子的池，除非地址以 `0x91` 开头，或者钩子使用了 `beforeSwapReturnsDelta`、`afterSwapReturnsDelta` 或 `dynamicFees`。属于该集合的任何钩子都需要填写[白名单表单](https://www.notion.so/uniswaplabs/1aec52b2548b80f78dbef8d2f0d7183e)，或者使用 UniswapX filler。交换中的 `take()` 无法自动路由：它需要 `afterSwapReturnsDelta`。

| 模板 | 标志 | Labs 经典路由器 |
|---|---|---|
| `noop` | `0x80` | 自动路由 |
| 自由形式默认值（afterSwap，delta 0） | `0x40` | 自动路由 |
| `dynamic` | `0x10C0` + `DYNAMIC_FEE_FLAG` | 白名单（`dynamicFees`） |
| `skim` | `0x44` | 白名单（`afterSwapReturnsDelta`） |

**在一个钩子中同时实现游戏 + 费用**（自由形式）：
1. 费用始终通过 `take()` 在 `afterSwap` 中执行。设置 `HOOK_RETURNS_DELTA=afterSwap`。这需要加入白名单，绝不会自动路由。
2. 仅当 `hookData` 指定玩家时才运行游戏。空的 `hookData`（Labs Universal Router）= 付费交换、不运行游戏、不回滚。
3. 切勿将游戏编码到 `amountSpecified`、区块号或强制交换方向中。这些做法会导致路由器回滚，并且无法收取任何费用。
4. `sender` 是路由器，而不是用户。不要以 `sender` 作为游戏状态的键。

除非简述明确要求回滚门禁，否则不要生成金额后缀 / 区块回显 / 仅限精确输出 / 方向门禁钩子。这些钩子无法通过 Labs 路由。地址挖掘器会跳过 `0x91...` 地址，避免原本可自动路由的钩子被意外设为门禁。

## 舰队审计规则（来自 aeon.fun 钩子审计）

以下是在实时舰队中发现的长期缺陷。Freeform 绝不能重现这些缺陷。`skim` 模板已经修补。

**费用 / `take()`：**
- 对未指定增量的绝对值收费。Exact-out 会使该增量为负。`if (unspecifiedAmount <= 0) return` 会悄无声息地跳过每笔精确输出兑换的费用（shared-base F1）。
- 在取负之前扩宽为 `int256`。`-type(int128).min` 会触发 panic 并导致该笔兑换无法执行。
- 使用 `poolManager.take(..., feeRecipient, ...)` 将费用发送给不可变的接收方。绝不能使用 `address(this)`。不得有 `withdraw()`。托管问题正是 CrownClash/LegacyLedger 的 HIGH 级漏洞。
- 额外的 skim 辅助函数不得复制 `<= 0` 提前返回逻辑（即符号守卫的第二份副本）。

**门控**（仅当需求明确要求 revert-gate 时）：
- 1a. 会自行变化的值（`block.number`）：在区块头 N 由 `view` 辅助函数返回的结果，到 N+1 执行时就是错误的。应以执行区块为目标。
- 1b. 会在有人兑换时变化的值（价格低字节）：精确匹配 + 零容差会导致争用型 DoS。需要设置容差区间，否则不要进行门控。
- 1c. 攻击者可以将其停驻、且失败时不会递增的共享计数器：这是一种骚扰攻击原语。
- 2. `unlock` 帧中的合约可以满足该谓词；签名交易则不能。这会绑定错误的主体。
- 5. 绝不要将原始 `amountSpecified` 与以代币计价的常量进行比较。调用者可以通过 exact-in 与 exact-out 选择指定的币种。应使用无量纲边界（tick 变动 / 流动性比例）。
- 绝不要使用 `balanceOf(poolManager)`：那是 v4 单例的全局库存，而不是此池的库存。应使用 `StateLibrary`。
- `sender` 是路由器。不要将其视为交易者。

**测试：**
- 费用钩子必须对 exact-in 和 exact-out 都断言 take 操作。
- 门控需要一个无钩子的负向对照（`hooks = address(0)`）。
- 不要跨 `vm.roll` 缓存 `block.number`（via-ir 会将其折叠）。应使用 `vm.getBlockNumber()`。



## 步骤

1. **解析 `${var}`。** 提取 `arm:` 标志、可选的 `template:`、可选的 `chain:` 以及自由文本需求说明。需求说明为空 → 使用语法信息退出 `DEPLOY_HOOK_EMPTY`。

2. **解析链。** 链名称在 `chains.tsv` 中解析（默认为 `base-sepolia`）；`hook-deploy.sh` 会将其映射到官方 `PoolManager` + RPC，因此应传入名称，而不是地址。运行 `./hook-deploy.sh chains` 查看列表，或读取 `chains.tsv`。如果该名称不在注册表中，则退出 `DEPLOY_HOOK_BAD_CHAIN`。查找对应行的 `testnet` 列：如果值为 `false`（主网），则强制执行双重选择加入——要求 `${var}` 中同时包含 `arm:` 和显式的 `chain:`，否则退出 `DEPLOY_HOOK_BAD_CHAIN`。支持所有 Uniswap v4 链（Base、Ethereum、Unichain、Arbitrum、Optimism、Polygon、BNB、Avalanche、Robinhood、Worldchain、Ink、Soneium、Celo、X Layer 及其测试网）。

3. **确认预暂存的工具链和项目。** 工作流已在本次运行之前预暂存所有内容（`scripts/stage-deploy-uni-hook.sh`）：`$PATH` 上的 Foundry、位于 `$HOOKBUILD_DIR`（默认为 `$HOME/hookbuild`）且已预构建的 v4 项目，其中包含全部三个模板 + `MockERC20.sol` + `DeployHook.s.sol` + v4 库，以及已复制到仓库根目录的 `./hook-deploy.sh`。不要在运行期间安装 Foundry 或克隆这些库——沙箱会阻止此类操作。检查 `command -v forge`，并确认 `$HOOKBUILD_DIR` 存在；如果任一项缺失，则降级为 `DEPLOY_HOOK_NO_TOOLCHAIN`（输出生成的源代码 + 计划）。

4. **构建钩子（由需求说明驱动）。**
   - **模板模式**（`dynamic` / `noop` / `skim`）：在 `$HOOKBUILD_DIR/src/<Hook>.sol` 中，仅编辑 `// --- AEON:LOGIC START ---` 与 `// --- AEON:LOGIC END ---` 之间的区域。保持回调签名和标志集不变。如果默认实现已符合需求说明，则无需修改。
   - **自由模式**（其他任何值）：将完整的钩子写入 `$HOOKBUILD_DIR/src/Hook.sol`——替换 `// --- AEON:BODY ... ---` 区域。规则：保留合约名称 `Hook` 和 `constructor(IPoolManager)`；实现提示所需的任意 v4 回调，每个回调都必须使用与 `IHooks` 完全一致的签名、`onlyPoolManager` 和正确的选择器返回值。不要手动设置标志——系统会根据你实现的回调自动推导标志。如果某个回调返回非零增量，请在 `$HOOKBUILD_DIR/hook.env` 中设置 `HOOK_RETURNS_DELTA`；对于费用覆盖钩子，请在该文件中设置 `HOOK_POOL_FEE=dynamic`。遵循上文的 **Labs 路由规则**和 **Fleet 审计规则**：空的 `hookData` 必须成功；游戏不得使普通的精确输入交换回退；`take()` 必须声明 `HOOK_RETURNS_DELTA`、按数额收费（精确输入和精确输出），并且绝不能托管资金。
     - **还要编写行为测试。** 在 `$HOOKBUILD_DIR/test/Hook.t.sol` 中，将 `// --- AEON:ASSERT ... ---` 区域替换为用于断言钩子特定预期行为的 `test_*` 函数——不能仅测试“不回退”。对于需求说明中的每条规则，至少编写一个正向用例和一个反向用例：钩子必须拒绝的交换应写成 `_expectSwapRevert(zeroForOne, amount, Hook.SomeError.selector)`（此辅助函数会为你解包 v4 的 `WrappedError`——不要使用裸的 `vm.expectRevert`，它无法匹配该包装器）；钩子必须允许的交换应写成普通的 `_swap(...)`；任何 getter/记账逻辑应写成 `assertEq(hook.someGetter(...), expected)`。不要编辑 `setUp()` 或辅助函数——只能编辑 `AEON:ASSERT` 区域。如果需求说明中没有可拒绝的行为，仍需断言钩子所更改的可观察状态。

5. **模拟 + 审计（始终执行）。** 传入模式、类型和链（省略链时默认为 `base-sepolia`）：
   ```bash
   ./hook-deploy.sh simulate <kind> <chain>
   ```
   对于 `freeform`，会在任何部署之前按顺序运行以下三道关卡：
   1. **静态审计**——根据回调推导标志；检查合约名称是否为 `Hook`、是否至少有 1 个回调、每个回调是否都带有 `onlyPoolManager`、`test/Hook.t.sol` 是否至少包含 1 个 `test_` 函数，并扫描危险模式（`selfdestruct`/`delegatecall` 会导致硬失败；`tx.origin`/原始 value-call/内联 `assembly` 会输出警告，提示进行审查）。失败时以 `DEPLOY_HOOK_AUDIT_FAILED` 退出（绝不部署）。
   2. **行为测试**——`forge test --fork-url <chain> --match-contract HookBehaviorTest` 会在分叉链上运行代理编写的断言。测试失败或无法编译时，以 `DEPLOY_HOOK_TEST_FAILED` 退出（绝不部署）。这可证明钩子的行为符合提示要求。
   3. **分叉模拟**——`forge script` 会进行编译、挖掘盐值、在内存中部署、初始化池、添加流动性，并针对目标链的分叉执行一次交换。
   遇到编译错误时，修复后重试（最多 3 次）。如果模拟发生回退，则以 `DEPLOY_HOOK_SIM_FAILED` 退出。记录挖掘出的钩子地址、推导出的标志以及 `Estimated amount required`。在主网上，将该估算值与部署者余额进行比较（`cast balance <addr> --rpc-url <rpc>`）；如果余额不足以覆盖该估算值，则以 `DEPLOY_HOOK_UNDERFUNDED` 退出。
   对于自由模式钩子，还应在启用前**读取生成的 `Hook.sol` 并分析其安全性**：是否有任何回调允许调用者窃取资金、使池无法使用（无条件回退）或重入？如果无法确定，请停在试运行阶段并报告相关疑虑。

6. **Dry-run 停止。** 如果 `${var}` **没有**以 `arm:` 开头，请在此停止。报告：模板、挖掘出的地址（及其 flag 位）、receipt 中的 `routing` 行（自动路由还是 allowlist + 原因）、池 key，以及模拟结果。退出 `DEPLOY_HOOK_DRY_RUN`。

7. **Arm 检查（仅当为 `arm:` 时）。**
   - 确认已设置 `HOOK_DEPLOYER_PRIVATE_KEY`（它通过 `requires:` 注入）。如果未设置，则降级为 dry-run 报告，并退出 `DEPLOY_HOOK_NO_KEY`。
   - 读取 `memory/state/hook-deploys.json`。如果相同的 `(chain, template, brief)` 在最近一小时内已部署，则携带之前的地址退出 `DEPLOY_HOOK_IDEMPOTENT`。

8. **广播。**
   ```bash
   ./hook-deploy.sh broadcast <kind> <chain>
   ```
   runner 会输出一份**部署 receipt**（hook 地址、解码后的 flag 名称、区块浏览器深层链接、交易哈希），并且当 Etherscan 系列链上设置了 `ETHERSCAN_API_KEY` 时，会在区块浏览器上**自动验证** hook 源码（尽力而为——验证失败绝不会导致已完成的部署失败）。如果输出了 `ALREADY_DEPLOYED`，则将报告的地址视为结果（不进行新的部署）。从 receipt 或 `$HOOKBUILD_DIR/broadcast/DeployHook.s.sol/<chainId>/run-latest.json` 中读取 hook 地址和交易哈希。

9. **验证。** 使用 `cast`，通过 RPC 上的 `StateView.getSlot0(poolId)` 读取池状态。确认池存在，并确认 hook 地址的低位与模板的 flags 相等。确认 swap 发出了 hook 事件。

10. **记录部署。** 部署已经在链上完成——这里是只追加的历史记录，不是需要审核的变更，因此**不要**打开 PR 或创建分支。只需在 `main` 上将记录写入工作树；工作流的运行后提交会将其落盘。写入：
    - `memory/state/hook-deploys.json` — 追加此次部署（chain、template、brief、hook 地址、flags、交易哈希、时间戳、poolId、poolKey）。
    - `output/hooks/<hook-address>.sol` — 从 `$HOOKBUILD_DIR/src/<Hook>.sol` 复制已部署的源代码。
    - 对于 freeform，还要写入 `output/hooks/<hook-address>.t.sol` — 复制 `$HOOKBUILD_DIR/test/Hook.t.sol`（用于准许此次部署的行为测试）。

    不要暂存根目录下的 `./hook-deploy.sh` 或 `./chains.tsv`（运行时副本；两者都被 gitignore）。

11. **通知并退出。** 发送一条简短通知（模板、地址、区块浏览器链接、`routing` 类别、dry-run 还是 live）。退出 `DEPLOY_HOOK_OK`（或 `DEPLOY_HOOK_DRY_RUN`）。

## 降级规则

- 没有 key → dry-run 报告，`DEPLOY_HOOK_NO_KEY`。绝不要直接失败。
- Foundry 或暂存项目缺失（`command -v forge` 失败或 `$HOOKBUILD_DIR` 不存在）→ 输出生成的源代码 + 计划，`DEPLOY_HOOK_NO_TOOLCHAIN`。不要尝试在运行过程中安装（沙箱会阻止安装）。
- 链错误或缺失，或在没有双重 opt-in 的情况下部署到主网 → `DEPLOY_HOOK_BAD_CHAIN`。
- 是主网链，但实例未设置 `HOOK_MAINNET_OK=1`（`hook-deploy.sh` 退出码 7）→ `DEPLOY_HOOK_MAINNET_NOT_AUTHORIZED`（绝不广播）。
- 主网余额低于模拟估算值，或部署者未注资（`hook-deploy.sh` 退出码 8）→ `DEPLOY_HOOK_UNDERFUNDED`（绝不广播）。
- Gas 价格高于 `MAX_GAS_GWEI`（`hook-deploy.sh` 退出码 9）→ `DEPLOY_HOOK_GAS_TOO_HIGH`（绝不广播；待费用下降后重试）。
- Freeform 静态审计失败（名称错误 / 没有 callback / 缺少 `onlyPoolManager` / 没有 `test_` / `selfdestruct` / `delegatecall`）→ `DEPLOY_HOOK_AUDIT_FAILED`（绝不部署）。
- Freeform 行为测试失败或无法编译 → `DEPLOY_HOOK_TEST_FAILED`（绝不部署）。
- 模拟回滚 → `DEPLOY_HOOK_SIM_FAILED`（模拟失败后绝不广播）。

## 注意事项

- 三个模板均已预先验证：每个模板都能在 Base Sepolia 上编译，并模拟完整的部署 + 交换流程（`dynamic` = 0x10C0 标志位，允许列表；`noop` = 0x80，自动路由；`skim` = 0x44，允许列表）。
- **Freeform** 会根据提示词构建任意 hook，写入 `src/Hook.sol`，并将其行为测试写入 `test/Hook.t.sol`。标志位会根据回调自动推导（绝不会手动设置）。任何部署前都会运行三道门禁：静态审计（名称/回调/`onlyPoolManager`/是否存在测试/危险模式扫描）、代理在分叉链上编写的 `forge test` 行为断言，然后是分叉模拟。代理还会在启用部署前读取生成的源代码，检查盗取资金、导致合约瘫痪和重入风险。若某个模板适用，优先使用匹配的模板（这些模板已经过审计）；对于新颖逻辑，则使用 freeform。
- 每次部署——无论是模板还是 freeform——都会先在目标链的分叉上进行模拟，因此会在任何广播前检查“它是否能正常工作”。
- **任何 Uniswap v4 链都可用。** `chains.tsv` 包含所有官方 v4 部署（Base、Ethereum、Unichain、Arbitrum、Optimism、Polygon、BNB、Avalanche、Robinhood、Worldchain、Ink、Soneium、Celo、X Layer，以及各个 Sepolia 测试网），并且已逐一验证持有 PoolManager。所有链都运行相同的流程——只有 `PoolManager`/RPC 不同，这些信息会根据名称解析。要获得已挖出的地址，必须使用 CREATE2 部署器（`0x4e59…4956C`）；如果某条链缺少该部署器，分叉模拟会在任何广播前安全失败。
- **主网仅涉及 gas。** 部署会将自己的 `MockERC20` 代币铸造给自身（免费），并使用这些模拟代币为演示池提供初始流动性——主网广播带来的风险仅为 GAS，绝不会涉及真实资金。部署的池是 MockA/MockB 演示池；可复用的 hook 合约才是真正的交付物。部署器密钥必须是已注入资金、仅持有 gas 余额的 burner（运行器会在超过 `HOOK_MAX_FLOAT_ETH` 时发出警告）；主网还需要 `HOOK_MAINNET_OK=1` 操作者锁。未来版本可以加入无密钥的 Base MCP `send_calls` 通道，从而无需在运行器中存放密钥。
- **经过身份验证的 RPC + 回执 + 验证。** 在主网上，运行器优先使用 Alchemy 端点（`ALCHEMY_API_KEY` + 对应链的 `alchemy` slug），而不是公共 RPC，这样不诚实的公共节点就无法伪造干净的模拟结果。广播后，运行器会输出回执（地址、已解码的标志位、区块浏览器链接、交易哈希），并且在 Etherscan 系列链上配置了 `ETHERSCAN_API_KEY` 时，自动验证源代码（尽力而为）。所有这些功能都是可选的：如果未设置任何密钥，该 skill 仍会使用公共 RPC 运行，但不会验证。