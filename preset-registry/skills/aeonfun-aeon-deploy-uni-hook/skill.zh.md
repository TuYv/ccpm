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
> - ``（空）→ 打印帮助并以 `DEPLOY_HOOK_EMPTY` 退出。
> - `<brief>` → **试运行**：生成、编译、挖掘并模拟。绝不广播。*[默认行为——无前缀]*
> - `arm:<brief>` → **广播**：先执行完整的试运行，然后在模拟通过后进行实际部署。
> - `template:<name>` → 强制使用某种模式：`dynamic` | `noop` | `skim`（预审计模板）或 `freeform`（根据提示构建完整的 Hook）。省略则自动选择：与模板匹配的简述会使用该模板；其他任何内容 → `freeform`。
> - `chain:<name>` → `chains.tsv` 中的任意 Uniswap v4 链（运行 `./hook-deploy.sh chains` 可列出）。默认为 `base-sepolia`。测试网：`base-sepolia`、`unichain-sepolia`、`arbitrum-sepolia`。主网（`testnet: false`，例如 `base`、`ethereum`、`unichain`、`arbitrum`、`optimism`、`polygon`、`bnb`、`avalanche` 等）同时要求使用 `arm:` 和显式指定 `chain:`——该 Skill 默认绝不会以主网为目标。`base-mainnet` 可作为 `base` 的别名。

今天是 ${today}。该 Skill 可将单行简述转化为实时运行的 Uniswap v4 Hook。它以安全性为设计目标：每次部署在广播前都会进行模拟，默认在测试网上执行试运行，并且必须显式使用 `arm:` 才会执行链上操作。

## 为什么采用这种设计

Hook 绑定不可变，而有问题的 Hook 可能会使池无法使用或窃取资金。因此，所有关卡都设置在部署**之前**：两道关卡（先 `dry-run`，再 `arm:`）、强制模拟以及幂等状态。广播之后的所有操作都只是记录已经发生的事情——追加到 `main` 分支上的 `memory/state/hook-deploys.json`，不创建 PR（因为已经没有任何内容可供审查）。Foundry 流程是经过验证的方案——挖掘 CREATE2 盐值，使地址携带正确的 Hook 标志位，然后部署、初始化池、添加流动性并执行一次交换。

## 安全约定（不得跳过）

1. **主网需要三重锁。** 除非 `${var}` 同时包含 `arm:` 和显式的 `chain:<mainnet-name>`，并且实例已将 `HOOK_MAINNET_OK=1` 设置为**仓库变量**，否则绝不能以 `testnet: false` 的链为目标（这是在 `hook-deploy.sh` 内部强制实施的第三重操作员级锁，退出码为 7；应将其存储为变量，而不是密钥——值为 `1` 的密钥会屏蔽运行日志中的每个 `1`，导致交易哈希和链接显示为 `***`）。即使收到要求执行主网部署的已授权消息，从未获准访问主网的实例也无法在那里广播。该 Skill 只能在入站路径受所有者限制的实例上运行（`TELEGRAM_ALLOWED_USER_ID` / 多渠道允许列表）——主网部署会消耗真实 Gas，因此绝不能让不受信任的发送者发起此操作。在主网链上，应先使用 `cast balance` 读取部署者余额；如果余额不足以支付模拟中的 `Estimated amount required`，则中止并返回 `DEPLOY_HOOK_UNDERFUNDED`；`hook-deploy.sh` 还会独立强制执行资金下限（退出码 8）、可选的 `MAX_GAS_GWEI` Gas 价格上限（退出码 9），并在部署者持有的资金超过 `HOOK_MAX_FLOAT_ETH`（默认值为 0.25）时发出警告——部署密钥只能持有用于支付 Gas 的少量浮动资金，绝不能持有 LP 或金库资本。在输出中记录清晰的 `MAINNET` 警告。
2. **每次广播前都要模拟。** 如果模拟发生回滚，则不得广播。报告回滚并以 `DEPLOY_HOOK_SIM_FAILED` 退出。
3. **默认执行试运行。** 只有当 `${var}` 以 `arm:` 开头时才进行广播。
4. **密钥卫生。** 部署者密钥是一次性密钥。绝不能打印它。绝不能将它放在 shell 命令行中——始终通过 `./hook-deploy.sh` 操作，该脚本会在内部从环境变量中读取密钥。
5. **幂等性。** 广播前读取 `memory/state/hook-deploys.json`。如果相同简述在过去一小时内已经部署，则不要重复部署。部署脚本在地址层面同样具有幂等性：它会部署到*规范*地址（针对这个确切的 `(creationCode, flags, PoolManager)`，使用第一个与标志匹配的 CREATE2 盐值）。如果该地址已包含代码，则说明相同的 Hook 已经上线，因此脚本会记录 `ALREADY_DEPLOYED <addr>` 并且不执行任何操作——运行器会报告现有地址，而不是部署副本。（HookMiner 本身会跳过已占用的地址，因此如果没有这项检查，重新运行会悄无声息地将另一个副本部署到新地址。）

## 输入与配置

- **模板：** `skills/deploy-uni-hook/templates/` — `DynamicFeeHook.sol`、`NoOpHook.sol`、`HookFeeHook.sol`（已预审计），`Hook.sol` + `Hook.t.sol` + `hook.env.example`（自由形式脚手架、行为测试门禁、清单），以及 `DeployHook.s.sol`、`MockERC20.sol`、`foundry.toml`、`chains.tsv`。
- **链配置：** `skills/deploy-uni-hook/templates/chains.tsv` 是唯一事实来源 — 以 TAB 分隔的 `name  chainId  testnet  poolManager  stateView  rpc  explorer  alchemy`，每条 Uniswap v4 链占一行（暂存于 `hook-deploy.sh` 旁，由后者读取）。`memory/uni-deployments.md` 是供人阅读的对应副本。要添加链，请向 `chains.tsv` 追加一行。
- **经过身份验证的 RPC：** `rpc` 列是公共端点。当设置了 `ALCHEMY_API_KEY` 且该行包含 `alchemy` slug 时，`hook-deploy.sh` 会改用 `https://<slug>.g.alchemy.com/v2/$ALCHEMY_API_KEY` — 对主网模拟 + 广播而言，可信 RPC 至关重要（不诚实的公共 RPC 可能伪造无异常的模拟结果）。优先级：`RPC_URL`（覆盖，用于测试）> Alchemy 密钥 + slug > 公共 `rpc`。RPC 路径（密钥所在位置）绝不会被打印 — 日志仅显示主机。
- **部署辅助脚本：** `skills/deploy-uni-hook/hook-deploy.sh` — 唯一获准的广播路径（隐藏密钥）。
- **状态：** `memory/state/hook-deploys.json` — 幂等性 + 部署账本。

### 模板选择器（未提供 `template:` 时）

| 简述中提及 | 模式 |
|---|---|
| fee、volatility、dynamic、surge | `dynamic` |
| skim、hook fee、take a cut、revenue | `skim` |
| "minimal" / "starter" / "empty" | `noop` |
| 其他任何内容（模板未覆盖的新颖逻辑） | `freeform` |

## 步骤

1. **解析 `${var}`。** 提取 `arm:` 标志、可选的 `template:`、可选的 `chain:` 以及自由文本简述。简述为空 → 使用该语法以 `DEPLOY_HOOK_EMPTY` 退出。

2. **解析链。** 链名称通过 `chains.tsv` 解析（默认为 `base-sepolia`）；`hook-deploy.sh` 会将其映射到官方 `PoolManager` + RPC，因此你应传入名称，而不是地址。运行 `./hook-deploy.sh chains` 查看列表，或读取 `chains.tsv`。如果名称不在注册表中，则以 `DEPLOY_HOOK_BAD_CHAIN` 退出。查找对应行的 `testnet` 列：如果其值为 `false`（主网），则强制执行双重选择加入 — 要求 `${var}` 中同时包含 `arm:` 和显式的 `chain:`，否则以 `DEPLOY_HOOK_BAD_CHAIN` 退出。支持所有 Uniswap v4 链（Base、Ethereum、Unichain、Arbitrum、Optimism、Polygon、BNB、Avalanche、Robinhood、Worldchain、Ink、Soneium、Celo、X Layer 及其测试网）。

3. **确认已暂存的工具链 + 项目。** 工作流会在本次运行前预先暂存所有内容（`scripts/stage-deploy-uni-hook.sh`）：`$PATH` 中的 Foundry、位于 `$HOOKBUILD_DIR`（默认为 `$HOME/hookbuild`）且已预构建的 v4 项目，其中包含全部三个模板 + `MockERC20.sol` + `DeployHook.s.sol` + v4 库，以及已复制到仓库根目录的 `./hook-deploy.sh`。**不要**在运行期间安装 Foundry 或克隆这些库 — 沙箱会阻止这些操作。检查 `command -v forge`，并确认 `$HOOKBUILD_DIR` 存在；如果任一项缺失，则降级为 `DEPLOY_HOOK_NO_TOOLCHAIN`（输出生成的源代码 + 计划）。

4. **构建 Hook（以需求说明为准）。**
   - **模板模式**（`dynamic` / `noop` / `skim`）：在 `$HOOKBUILD_DIR/src/<Hook>.sol` 中，仅编辑 `// --- AEON:LOGIC START ---` 与 `// --- AEON:LOGIC END ---` 之间的区域。保持回调签名和标志集不变。如果默认实现已经符合需求说明，则无需修改。
   - **自由格式模式**（其他任何模式）：将完整的 Hook 写入 `$HOOKBUILD_DIR/src/Hook.sol`——替换 `// --- AEON:BODY ... ---` 区域。规则：保留合约名称 `Hook` 和 `constructor(IPoolManager)`；根据提示的需要实现相应的 v4 回调，每个回调都必须使用完全一致的 `IHooks` 签名、`onlyPoolManager` 和正确的选择器返回值。不要手动设置标志——系统会根据你实现的回调自动推导标志。如果回调返回非零 delta，请在 `$HOOKBUILD_DIR/hook.env` 中设置 `HOOK_RETURNS_DELTA`；对于费用覆盖 Hook，请在其中设置 `HOOK_POOL_FEE=dynamic`。
     - **还要编写行为测试。** 在 `$HOOKBUILD_DIR/test/Hook.t.sol` 中，将 `// --- AEON:ASSERT ... ---` 区域替换为 `test_*` 函数，用于断言 Hook 的具体预期行为——而不只是“不会回滚”。对于需求说明中的每条规则，至少编写一个正向用例和一个反向用例：Hook 必须拒绝的交换应写成 `_expectSwapRevert(zeroForOne, amount, Hook.SomeError.selector)`（此辅助函数会为你解包 v4 的 `WrappedError`——不要直接使用 `vm.expectRevert`，因为它无法匹配该包装错误）；Hook 必须允许的交换应直接调用 `_swap(...)`；任何 getter 或记账逻辑都应写成 `assertEq(hook.someGetter(...), expected)`。不要编辑 `setUp()` 或辅助函数——只能编辑 `AEON:ASSERT` 区域。如果需求说明中没有可拒绝的行为，仍需断言 Hook 所改变的可观察状态。

5. **模拟 + 审计（始终执行）。** 传入模式、类型和链（省略链时默认为 `base-sepolia`）：
   ```bash
   ./hook-deploy.sh simulate <kind> <chain>
   ```
   对于 `freeform`，在进行任何部署之前，会按顺序运行以下三道关卡：
   1. **静态审计**——根据回调推导标志；检查合约名称是否为 `Hook`、是否至少有 1 个回调、每个回调是否都带有 `onlyPoolManager`、`test/Hook.t.sol` 是否至少有 1 个 `test_` 函数，并扫描危险模式（`selfdestruct`/`delegatecall` 会导致硬性失败；`tx.origin`/原始 value-call/内联 `assembly` 会输出警告以供审查）。失败时以 `DEPLOY_HOOK_AUDIT_FAILED` 退出（绝不部署）。
   2. **行为测试**——`forge test --fork-url <chain> --match-contract HookBehaviorTest` 会在分叉环境中运行代理编写的断言。测试失败或无法编译时，以 `DEPLOY_HOOK_TEST_FAILED` 退出（绝不部署）。这可以证明 Hook 确实实现了提示中要求的行为。
   3. **分叉模拟**——`forge script` 会进行编译、挖掘 salt、在内存中部署、初始化池、添加流动性，并针对目标链的分叉执行一次交换。
   如果发生编译错误，请修复后重试（最多 3 次）。如果模拟发生回滚，则以 `DEPLOY_HOOK_SIM_FAILED` 退出。记录挖掘出的 Hook 地址、推导出的标志以及 `Estimated amount required`。在主网上，将该估算值与部署者余额进行比较（`cast balance <addr> --rpc-url <rpc>`）；如果余额不足以覆盖估算值，则以 `DEPLOY_HOOK_UNDERFUNDED` 退出。
   对于自由格式 Hook，在启用部署前，还要**阅读生成的 `Hook.sol` 并分析其安全性**：是否有任何回调会让调用者窃取资金、使池不可用（无条件回滚）或触发重入？如果不确定，请停在试运行阶段并报告相关隐患。

6. **试运行停止。** 如果 `${var}` **不是**以 `arm:` 开头，请在此处停止。报告：模板、挖掘出的地址（包括其标志位）、池键和模拟结果。以 `DEPLOY_HOOK_DRY_RUN` 退出。

7. **武装检查（仅当以 `arm:` 开头时）。**
   - 确认已设置 `HOOK_DEPLOYER_PRIVATE_KEY`（它通过 `requires:` 注入）。如果未设置，则降级为试运行报告，并以 `DEPLOY_HOOK_NO_KEY` 退出。
   - 读取 `memory/state/hook-deploys.json`。如果同一 `(chain, template, brief)` 在过去一小时内已部署，则以 `DEPLOY_HOOK_IDEMPOTENT` 退出，并返回之前的地址。

8. **广播。**
   ```bash
   ./hook-deploy.sh broadcast <kind> <chain>
   ```
   运行器会输出一份**部署收据**（钩子地址、解码后的标志名称、区块浏览器深层链接、交易哈希）；如果在 Etherscan 系列链上设置了 `ETHERSCAN_API_KEY`，还会在区块浏览器上**自动验证**钩子源代码（尽力而为——验证失败绝不会导致已完成的部署失败）。如果输出了 `ALREADY_DEPLOYED`，则将报告的地址视为结果（不执行新的部署）。从收据或 `$HOOKBUILD_DIR/broadcast/DeployHook.s.sol/<chainId>/run-latest.json` 中读取钩子地址和交易哈希。

9. **验证。** 使用 `cast`，通过 RPC 上的 `StateView.getSlot0(poolId)` 回读池。确认池存在，并且钩子地址的低位等于模板的标志位。确认交换已发出钩子事件。

10. **记录部署。** 部署已在链上完成——这是仅追加的历史记录，不是需要审查的变更，因此**不要**创建 PR 或分支。只需将记录写入 `main` 上的工作树；工作流的运行后提交会将其落库。写入：
    - `memory/state/hook-deploys.json` —— 追加本次部署（链、模板、简述、钩子地址、标志、交易哈希、时间戳、poolId、poolKey）。
    - `output/hooks/<hook-address>.sol` —— 从 `$HOOKBUILD_DIR/src/<Hook>.sol` 复制已部署的源代码。
    - 对于自由形式，还需写入 `output/hooks/<hook-address>.t.sol` —— 复制 `$HOOKBUILD_DIR/test/Hook.t.sol`（用于把关部署的行为测试）。

    不要暂存根目录下的 `./hook-deploy.sh` 或 `./chains.tsv`（它们是运行时副本，且都已被 git 忽略）。

11. **通知并退出。** 发送一条简短通知（模板、地址、区块浏览器链接、试运行或实时部署）。以 `DEPLOY_HOOK_OK`（或 `DEPLOY_HOOK_DRY_RUN`）退出。

## 降级规则

- 没有密钥 → 输出试运行报告，`DEPLOY_HOOK_NO_KEY`。绝不要直接失败。
- Foundry 或暂存的项目缺失（`command -v forge` 失败或 `$HOOKBUILD_DIR` 不存在）→ 输出生成的源代码和计划，`DEPLOY_HOOK_NO_TOOLCHAIN`。不要尝试在运行期间安装（沙箱会阻止安装）。
- 链无效或缺失，或者主网未进行双重选择加入 → `DEPLOY_HOOK_BAD_CHAIN`。
- 使用主网链，但实例未设置 `HOOK_MAINNET_OK=1`（`hook-deploy.sh` 退出码为 7）→ `DEPLOY_HOOK_MAINNET_NOT_AUTHORIZED`（绝不广播）。
- 主网余额低于模拟估算值，或部署者账户无资金（`hook-deploy.sh` 退出码为 8）→ `DEPLOY_HOOK_UNDERFUNDED`（绝不广播）。
- Gas 价格高于 `MAX_GAS_GWEI`（`hook-deploy.sh` 退出码为 9）→ `DEPLOY_HOOK_GAS_TOO_HIGH`（绝不广播；费用下降后重试）。
- 自由形式静态审计失败（名称无效／没有回调／缺少 `onlyPoolManager`／没有 `test_`／存在 `selfdestruct`／存在 `delegatecall`）→ `DEPLOY_HOOK_AUDIT_FAILED`（绝不部署）。
- 自由形式行为测试失败或无法编译 → `DEPLOY_HOOK_TEST_FAILED`（绝不部署）。
- 模拟回滚 → `DEPLOY_HOOK_SIM_FAILED`（模拟失败后绝不广播）。

## 注意事项

- 三个模板均已预先验证：每个模板都能在 Base Sepolia 上完成编译，并模拟完整的部署 + 交换流程（`dynamic` = 0x10C0 标志位，`noop` = 0x80，`skim` = 0x44）。
- **自由形式**会根据提示词构建任意钩子并写入 `src/Hook.sol`，同时将其行为测试写入 `test/Hook.t.sol`。标志位会根据回调自动推导（绝不手动设置）。任何部署前都会经过三道关卡：静态审计（名称/回调/`onlyPoolManager`/测试是否存在/危险模式扫描）、在分叉上运行由智能体编写的 `forge test` 行为断言，然后进行分叉模拟。在准备部署前，智能体还会读取生成的源代码，检查盗取资产/锁死/重入风险。如果存在匹配的模板，应优先使用模板（它们已经过审计）；新颖逻辑则使用自由形式。
- 每次部署——无论是模板还是自由形式——始终会先在目标链的分叉上进行模拟，因此任何广播之前都会先检查“能否正常工作”。
- **支持任何 Uniswap v4 链。** `chains.tsv` 包含所有正式的 v4 部署（Base、Ethereum、Unichain、Arbitrum、Optimism、Polygon、BNB、Avalanche、Robinhood、Worldchain、Ink、Soneium、Celo、X Layer 以及各 Sepolia 测试网），并且均已验证持有 PoolManager。所有链都采用相同流程——只有 `PoolManager`/RPC 不同，并通过名称解析。挖掘地址需要 CREATE2 部署器（`0x4e59…4956C`）；如果某条链缺少该部署器，分叉模拟会以关闭方式失败，不会进行任何广播。
- **主网只会消耗 Gas。** 部署流程会为自身铸造自己的 `MockERC20` 代币（免费），并使用这些模拟代币为演示池提供初始流动性——主网广播只会产生 GAS 风险，绝不会涉及真实资本。部署的池是 MockA/MockB 演示池；真正的交付物是可复用的钩子合约。部署者密钥必须是仅持有 Gas 备用资金且已充值的临时密钥（当余额高于 `HOOK_MAX_FLOAT_ETH` 时，运行程序会发出警告）；主网还需要设置 `HOOK_MAINNET_OK=1` 操作员锁。未来版本可以加入无密钥的 Base MCP `send_calls` 通道，这样运行程序中就无需保存任何密钥。
- **经过身份验证的 RPC + 收据 + 验证。** 在主网上，运行程序会优先使用 Alchemy 端点（`ALCHEMY_API_KEY` + 链的 `alchemy` 标识符），而不是公共 RPC，从而避免不可信的公共节点伪造无异常的模拟结果。广播完成后，它会输出收据（地址、已解码的标志位、区块浏览器链接、交易哈希），并且在 Etherscan 系列链上设置了 `ETHERSCAN_API_KEY` 时，会自动验证源代码（尽力而为）。所有这些功能均为选择启用：未设置任何密钥时，该技能仍可通过公共 RPC 运行，但不会进行验证。