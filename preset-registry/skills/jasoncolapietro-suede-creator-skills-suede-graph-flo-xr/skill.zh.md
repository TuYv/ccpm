---
name: suede-graph-flo-xr
description: "Suede Thought Graph shipping search for a multi-file repo change. Use when competing implementation plans need one evidence-gated selection before any build. Halts on hazards, collisions, budget exhaustion, or no safe winner. Reads production; never deploys. NOT FOR: bulk independent work (use a separate private worker-fleet pass); findings-only diff review (use suede-code-review); CI or branch-protection wiring (use suede-ci-gate); copy-only shipping (use suede-ship-copy)."
---
# Suede Graph Flo XR

使用捆绑的 `workflows/suede-graph-flo-xr.js` 工作流，为一项涉及多个文件的仓库变更搜索相互竞争的方案。它会在任何实现通道修改工作树之前，基于证据做出选择。

## 输入与预算门控

启动前，要求提供以下三项输入：

- **仓库** — 仓库的绝对路径。相对路径和 `~` 将按失败关闭原则处理。
- **范围** — 请求的多文件变更，包括任何受保护路径或约束。
- **预算** — `light`、`standard` 或 `deep`。

如果存在，还要检测并传递可选上下文：`deploys`（仓库是否具有部署界面）、`liveUrl`（只读生产环境界面）以及 `vault`（外部决策/交接上下文路径）。对于不进行部署的仓库，缺少这些上下文不会造成阻塞，但不要静默丢弃已知值。

当用户为工作智能体指定模型（`workerModel`：`sonnet`、`opus`、`haiku` 或 `fable`）时，传递该模型——之后每次工作智能体调用都将在该模型上运行，而编排仍使用会话模型。如果省略，工作智能体会静默继承会话模型；如果会话使用的是昂贵模型，而用户并未选择将它用于工作智能体，则应在启动前明确说明，而不是让默认行为替用户做出决定。一次运行最多可能消耗 200 次工作智能体调用，因此，继承一个未经选择的模型就等于做出了一个无人决定的成本决策。

如果缺少仓库或范围，则停止。在一行中报告缺失的输入，并提出可提供仓库路径、描述所需变更，或将单文件编辑转交直接实现，然后等待用户选择。

启动前，说明所选档位及预计的最坏情况调用次数：`light` 预计并允许总计 **55** 次智能体调用，`standard` 预计并允许总计 **110** 次，`deep` 预计并允许总计 **200** 次。不要根据范围推断预算，也不要静默提高上限。如果用户尚未选择预算，请询问并等待。

## 运行时先决条件

捆绑的 JavaScript 工作流是适用于 macOS 的 Claude Code 工作流。它需要 `sandbox-exec` 以及六个已注册的 `suede-graph-flo-xr-*` 智能体配置文件。请安装完整的 `suede-skills` 插件、`suede-agent-workflows` 插件，或使用此仓库的 `install.sh`；该脚本会将配置文件复制到 `~/.claude/agents`。

Claude Workflow 不提供 Node `process` 全局对象，因此工作流无法推断其软件包命名空间。调用方技能必须根据此技能的调用方式推导该命名空间，并在每次启动时传递它。当被调用的名称带有插件前缀时，`agentNamespace` 就是该前缀的原文——对于完整插件是 `suede-skills`，对于专注于编排的插件是 `suede-agent-workflows`。通过 `install.sh` 安装或手动复制、且不带前缀的裸调用名称使用空字符串。这是运行时上下文，不是用户选项。缺失或未知的值会导致流程在首次智能体调用前失败。

工作流也无法定位其自身捆绑的辅助脚本。请传递 `helperDir`：被调用技能的 `workflows/helpers` 目录的绝对路径（对于此安装，为 `<skill base directory>/workflows/helpers`）。受约束的 Bash 命令会运行这些 `.cjs` 辅助脚本——每次派生进程的约束无法验证多行或长度超过约 400 个字符的规则，因此无法使用内联 `node -e` 载荷。路径缺失或包含空白字符会导致流程在首次智能体调用前失败；辅助文件缺失则表现为 Scout 设置失败。携带载荷的辅助调用通过固定前缀（辅助脚本路径加工作树、临时根目录或基础 SHA）而非精确字符串获准执行；每个辅助脚本都会验证其余 argv，而差异证明——不是约束机制——仍然负责检查实际应用的内容是否与选定的变更包一致。

所选补丁以有界的 base64 分块形式暂存到此次运行的私有临时根目录中，再传递给应用器，因为限制验证器无法解析携带数千字节内联载荷的命令。每次追加都携带其偏移量和 FNV-1a 校验和，而 `--apply` 会在解码前验证总长度和载荷校验和，因此输错的分块会立即失败并给出重试说明，而不会生成损坏的补丁。

仅安装技能文件夹、使用通用 skills CLI 安装或安装 Codex 插件，本身都不会注册或执行 Claude Workflow 智能体配置文件。在这些环境中，应将此文件视为编排契约，并将变更交由直接实现；不要声称已运行随附的工作流。若要在手动复制单个技能后于 Claude Code 中启用该工作流，还需将此仓库的 `agents/suede-graph-flo-xr-*.md` 文件复制到 `~/.claude/agents`，然后重启 Claude Code。

请求的 Scout 设置命令会在获取内容或创建工作树之前，将探测 `/usr/bin/sandbox-exec` 作为其第一个子进程。如果调用了该命令但探测失败，Scout 会在执行设置变更之前报告失败。返回的 Scout 证据仍然是模型证明，而不是主机执行回执。后续报告的任何沙箱拒绝也会使门禁保持阻塞。绝不要在沙箱外重试验收命令，以将这种阻塞状态变为通过。

## 运行图搜索

调用：

```js
Workflow({
  scriptPath: "skills/suede-graph-flo-xr/workflows/suede-graph-flo-xr.js",
  args: { repo, scope, agentBudget, agentNamespace, helperDir, workerModel, deploys, liveUrl, vault }
})
```

工作流按依赖顺序执行以下操作：

1. **Generate** 根据侦察和研究证据生成相互独立的实现计划。
2. **Score** 从覆盖度、证据、可行性、安全性和效率方面为每个计划评分。
3. **KeepBestN** 以确定性方式裁剪已评分的候选束。
4. **Refute** 使用有证据支持的反对意见攻击保留下来的计划。
5. **Improve** 修复那些反驳并非致命的计划。
6. **Aggregate** 合并兼容的存活路径，但不合并存在冲突的文件所有权。
7. **Select** 以确定性方式选出唯一的胜者。

只有由 **Select** 选中的计划才可以修改文件。被拒绝、被裁剪和未被选中的思路只能作为证据；绝不要以推测方式实现它们。

## 边界

当预算耗尽时，工作流会在下一次智能体调用或整个变更批次开始之前停止；它不会撤销先前已完成的变更。除非独立的只读验证器确认存在一个干净、已注册且基于 origin/main 的工作树，该工作树位于一个直接的 `${REPO}.worktrees/ship-*` 子目录中，具有相同的 Git 公共目录，并且候选文件不是符号链接、其真实路径仍位于该工作树内，否则工作流会在任何变更之前停止。大小写折叠或 Unicode 规范化后产生的路径别名会在图搜索之前按失败关闭原则处理。若存在已跟踪的机密、实时目标工作树、受保护的在制工作冲突、重复的文件所有者、溢出的安全清单，或没有可选计划，工作流也会停止。Scout 会解析以 NUL 分隔的 Git porcelain 输出，因此重命名前后的路径都会继续受到保护；它会使用路径组件边界解析 `lsof -Fn` 的 CWD 字段；而且绝不会仅仅因为已提交的历史记录通过 cherry-land 落地，就丢弃新的脏状态声明或实时声明。如果选中的 Build 或 Fix 结果遭到阻塞、缺少上下文、报告了疑虑、执行失败，或未报告任何已更改路径，也会在进入下一验证阶段之前停止。停止时，用一行指出阻塞原因，并提供 2–4 个适用的解决方案（例如：缩小范围、豁免受保护的在制工作、解决冲突、选择更高的预算，或提供缺失的上下文），然后等待。停止期间不要重新启动或执行变更。

### 解读搜索停止原因

空搜索过去无论因何结束，都会报告 `no safe graph winner`，因此基础设施偶发故障和真实的证据冲突会输出同一行信息。现在，停止信息会指明具体发生了哪种情况，而 `haltDetail` 会提供其背后的计数：

| 原因 | 含义 |
|---|---|
| `every candidate lost its score to an agent failure` | 本次运行中没有任何思路得到过评分。这是基础设施问题，而非证据问题——请重新运行。 |
| `no candidate reached Select` | 搜索因其他原因在上游已无候选项；请查看 `graph.dropped`。 |
| `every finalist lost its score before Select` | 存在入围候选项，但它们因未评分而被剪枝。 |
| `every finalist was pruned before Select` | 入围候选项因评分以外的原因被剪枝。 |
| `every finalist carries a degraded or missing score` | 入围候选项到达 Select 时没有有效评分。 |
| `every finalist failed deterministic plan eligibility` | 真实拒绝。`haltDetail.eligibilityRejections` 会列出所有原因。 |
| `no safe graph winner` | 以上情况均不符合——请查看图。 |

`haltDetail.infrastructureDegraded` 与停止原因相互独立：两者可以同时成立。请通过停止原因了解是什么阻止了 Select，并通过该标志了解为其提供候选池的过程发生了什么降级。

评分调用是只读且幂等的，因此传输层故障会触发重试：每次调用最多重试两次，整次运行的重试上限为智能体配额上限的 5%；一旦剩余预算降至预留底线（配额上限的 20%），则完全拒绝重试。格式错误的评分永远不会重试——模式已在工具层强制执行，因此无效评分是应保留的判断结果，而不是需要重新建立的连接。每次尝试和每次被拒绝的重试都会记录在 `graph.scoreRetries` 中，而 `scoreReliability` 会出现在每次运行的结果中，无论运行是否停止：即使某次偶发故障导致两个入围候选项丢失，但运行仍继续并最终交付，该运行依然会被标记为降级。

Claude 注册的智能体配置会强制实施工具隔离：本地读取智能体不能使用 shell、写入或 Web 工具；公共 Web 读取智能体不能使用本地文件或 shell 工具；补丁编写智能体不能使用修改工具；应用和验证智能体则只能使用 Bash 和结构化输出。补丁编写智能体返回统一差异，一个受约束的应用器负责应用这些差异；另一个单独预留预算的受约束验证器会在每次 Build 或 Fix Apply 后、任何读取智能体或 Gate 调用之前，立即比较精确的路径集合与差异摘要。补丁验证会在 Apply 之前拒绝符号链接、gitlink、二进制补丁、重命名、复制和文件类型转换。Gate 仅允许在 macOS `sandbox-exec` 下运行已列入允许列表的本地验证命令，禁止网络访问；主机读取范围仅限于运行时/系统根目录、工作树、在精确的 Gate 约束环境内重新派生的工作树 `.git` 公共目录，以及本次运行的私有临时根目录。模型报告的公共目录绝不会被插入沙箱权限配置。写入范围仅限于已知的生成产物和该私有临时根目录。允许列表包括针对 Node、Python、Go、Rust、Make、Swift Package Manager 的有界项目本地检查，以及将派生数据置于私有临时根目录下的 Xcode 模拟器构建和离线 Gradle 验证。嵌套模块的 `build` 根目录只能从该模块 `src` 树下选定的文件派生；如果符号链接或真实路径可能逃逸出工作树，则会被拒绝。Gate 完成后还会执行第二次差异证明，对二进制 Git 差异以及每个已报告文件的模式、大小和字节进行哈希计算，其中包括未跟踪的新增文件。

成功应用阻断项补丁并不意味着该阻断项在语义上已被清除。
原始阻断项仍保留在 `fixedBlockersPendingVerification` 中。Gate
尝试会记录其确切的命令集和报告的输出，但无法证明
这些命令确实运行过，因为 Workflow API 不会提供可信的必需工具
执行回执。因此，工作流会根据智能体报告设置 `claimedPassed`，
强制设置 `passed:false`，设置 `gateVerified:false`，并将裁决
和交接状态保持为 `hold`。只有拥有不可变
执行回执的可信外层运行器才能提升该证据的可信等级。

这些控制措施具有明确的信任边界。当智能体调用 Bash 命令时，`bashCommandClamp`
会对其进行约束；Claude Workflow 不提供
必需工具调用回执，因此结构化的验证器响应仍然只是模型的
证言，而不是 Bash 确实运行过的加密证明。同样，
`authority`、`allowedRepo`、`allowedFiles` 和 `allowedCommands` 是审计
元数据，而不是文件系统权限。本地读取工具与 Web
工具相互分离，但 Workflow API 并未对其实施路径沙箱限制。在任何
安全敏感的交接中都应报告这些事实，且不得将结果描述为经主机认证。

生产环境检查是只读的。此 Skill 绝不会部署、发布、
发行、推送、合并、更改凭据、删除或还原受保护的
工作，也不会声称已完成线上验证。它不会替用户选择预算，也不会
认定可以跳过缺失的范围。其发布裁决是提供给用户的证据，
而不是执行外部操作的授权。

## 交接与完成

读取工作流返回的 `runKey`，即其隔离工作树中经过验证且唯一的 `ship-<UUID>` 叶节点。
对于已完成的运行，使用返回的交接
Markdown。对于 Scout 之后的中止，在不额外消耗一次智能体调用的情况下，根据结构化
结果和图追踪记录编写如实的中止交接；其中应包括中止前已完成的任何 Build
或 Fix 通道。如果 Scout 在 `runKey` 验证前返回无效路径，
则报告中止，但不要编写以运行键命名的
交接文件。否则，将其保存到目标仓库根目录下的
`.suede-graph-flo-xr/${runKey}/handoff.md`，然后验证该文件存在：

```bash
test -f ".suede-graph-flo-xr/${runKey}/handoff.md"
```

报告该路径、选定的计划（如有）、Gate 结果、已更改的文件、运行的命令
以及明确的注意事项。本地图运行完成并不能证明已完成部署。

## 第三方许可证

`workflows/suede-graph-flo-xr.js` 中的操作图和思维状态模型改编自
苏黎世联邦理工学院的 Graph of Thoughts。完整的上游 BSD 声明、条款、
免责声明和要求的引用随此 Skill 一同提供，位于
`LICENSE.graph-of-thoughts-BSD.txt`。每次以源代码或二进制形式
重新分发该工作流时，都必须附带此文件。

## 路由

- 高容量、定义明确且相互独立的工作器任务 → 单独执行一次私有
  工作器集群处理。
- 仅对现有差异进行发现项审查 → `suede-code-review`。
- CI、必需检查或分支保护配置 → `suede-ci-gate`。
- 仅文案搜索和发布准备情况检查 → `suede-ship-copy`。
- 从 `suede-code-review`、`suede-ci-gate` 或 `suede-ship-copy`：将包含一个
  已选定变更执行胜出方案的多文件实施计划搜索路由回
  `suede-graph-flo-xr`。