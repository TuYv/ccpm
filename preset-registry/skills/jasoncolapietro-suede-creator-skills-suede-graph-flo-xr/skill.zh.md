---
name: suede-graph-flo-xr
description: "Suede Labs Graph-of-Thoughts shipping search for a multi-file repo change. Use when competing implementation plans need one evidence-gated selection before any build. Halts on hazards, collisions, budget exhaustion, or no safe winner. Reads production; never deploys. NOT FOR: bulk independent work (use a separate private worker-fleet pass); findings-only diff review (use suede-code-review); CI or branch-protection wiring (use suede-ci-gate); copy-only shipping (use suede-ship-copy)."
---
# Suede Graph Flo XR

使用捆绑的 `workflows/suede-graph-flo-xr.js` 工作流，为一项涉及多个文件的仓库变更搜索相互竞争的方案。它会在任何实施通道修改工作树之前，基于证据做出选择。

## 输入和预算关卡

启动前，要求提供以下三项输入：

- **仓库** — 仓库的绝对路径。相对路径和 `~` 均按失败处理。
- **范围** — 请求的多文件变更，包括任何受保护路径或约束条件。
- **预算** — `light`、`standard` 或 `deep`。

还应在可用时检测并传递可选上下文：`deploys`（仓库是否有部署界面）、`liveUrl`（只读的生产环境界面）和 `vault`（外部决策/交接上下文路径）。对于不执行部署的仓库，缺少这些信息不会造成阻塞，但不要静默丢弃已知值。

当用户为工作代理指定模型时（`workerModel`：`sonnet`、`opus`、`haiku` 或 `fable`），应将其传入——之后每次工作代理调用都会在该模型上运行，而编排仍使用会话模型。如果省略，工作代理会静默继承会话模型；如果会话使用昂贵的模型，而用户并未选择将其用于工作代理，则应在启动前说明这一点，而不是让默认行为自行决定。一次运行最多可消耗 200 次工作代理调用，因此，未经选择便继承模型是一项无人做出过的成本决策。

如果缺少仓库或范围，则停止。用一行报告缺少的输入，并让用户选择提供仓库路径、描述所需变更，或将单文件编辑转交直接实施，然后等待用户选择。

启动前，说明所选档位和预计最坏情况下的调用次数：`light` 预计并允许总计 **55** 次代理调用，`standard` 预计并允许总计 **110** 次，`deep` 预计并允许总计 **200** 次。不要根据范围推断预算，也不要静默提高上限。如果用户尚未选择预算，请询问并等待。

## 运行时前提条件

捆绑的 JavaScript 工作流是适用于 macOS 的 Claude Code 工作流。它需要 `sandbox-exec` 以及六个已注册的 `suede-graph-flo-xr-*` 代理配置。请安装完整的 `suede-skills` 插件、`suede-agent-workflows` 插件，或使用此仓库的 `install.sh`，该脚本会将配置复制到 `~/.claude/agents`。

Claude Workflow 不提供 Node `process` 全局对象，因此工作流无法推断其包命名空间。调用方技能必须根据此技能的调用方式推导该命名空间，并在每次启动时传入。当调用名称带有插件前缀时，`agentNamespace` 就是该前缀的原样值——完整插件对应 `suede-skills`，专用编排插件对应 `suede-agent-workflows`。通过 `install.sh` 安装或手动复制的、不带前缀的调用名称使用空字符串。这是运行时上下文，而不是用户选项。值缺失或未知会导致在首次代理调用前失败。

仅安装技能文件夹、使用通用技能 CLI 安装，以及安装 Codex 插件，本身都不会注册或执行 Claude Workflow 代理配置。在这些环境中，应将此文件视为编排契约，并将变更转交直接实施；不要声称捆绑的工作流已经运行。若要在手动复制单个技能后于 Claude Code 中启用该工作流，还需将此仓库的 `agents/suede-graph-flo-xr-*.md` 文件复制到 `~/.claude/agents`，并重启 Claude Code。

请求的 Scout 设置命令会在获取或创建工作树之前，将探测 `/usr/bin/sandbox-exec` 作为其第一个子进程。如果调用了该命令且探测失败，Scout 会在执行设置变更之前报告失败。返回的 Scout 证据仍然是模型证明，而不是主机执行回执。任何后续报告的沙箱拒绝也会触发门禁。切勿在沙箱外重试验收命令，以图将该阻断转为通过。

## 运行图搜索

调用：

```js
Workflow({
  scriptPath: "skills/suede-graph-flo-xr/workflows/suede-graph-flo-xr.js",
  args: { repo, scope, agentBudget, agentNamespace, workerModel, deploys, liveUrl, vault }
})
```

工作流按依赖顺序执行以下操作：

1. **Generate** 根据侦察和研究证据生成相互独立的实施计划。
2. **Score** 从覆盖度、证据、可行性、安全性和效率方面为每个计划评分。
3. **KeepBestN** 以确定性方式裁剪已评分的候选束。
4. **Refute** 使用有证据支持的反对意见攻击保留下来的计划。
5. **Improve** 修复其反驳并非致命的计划。
6. **Aggregate** 组合相互兼容的存活路径，但不合并存在冲突的文件所有权。
7. **Select** 以确定性方式选出唯一的胜者。

只有被 **Select** 选中的计划可以修改文件。被拒绝、裁剪和未选中的思路仅作为证据保留；切勿基于它们进行推测性构建。

## 边界

当预算耗尽时，工作流会在下一次代理调用或整个变更批次之前停止；它不会撤销先前已完成的变更。除非有独立的只读验证器确认存在一个干净、已注册且基于 origin/main 的工作树，位于某个直接的 `${REPO}.worktrees/ship-*` 子目录中，使用相同的 Git 公共目录，并且候选文件不是符号链接且其真实路径仍位于该目录内，否则工作流会在任何变更之前停止。搜索图之前若发现大小写折叠或 Unicode 规范化后的路径别名，则会以失败关闭方式停止。工作流还会因受跟踪的机密、实时目标工作树、受保护的进行中工作冲突、重复的文件所有者、超出容量的安全清单或没有可选计划而停止。Scout 会解析以 NUL 分隔的 Git porcelain 输出，以确保重命名前后的路径都受到保护；使用路径组件边界解析 `lsof -Fn` 的 CWD 字段；并且绝不会仅仅因为已提交的历史记录通过 cherry-landed 方式落地，就丢弃新近的脏状态或实时占用声明。如果选中的 Build 或 Fix 结果被阻塞、缺少上下文、报告了疑虑、执行失败，或报告没有任何变更路径，也会在进入下一个验证阶段之前停止。停止时，用一行指出阻塞原因并提供 2–4 个适用的解决方案（例如：缩小范围、豁免受保护的进行中工作、解决冲突、选择更高的预算或提供缺失的上下文），然后等待。停止期间不得重新启动或执行变更。

### 解读搜索停止状态

过去，无论空搜索因何结束，都会报告 `no safe graph winner`，因此基础设施偶发故障和真正的证据冲突会输出相同的一行。现在，停止信息会指出具体发生了哪种情况，而 `haltDetail` 会包含其背后的计数：

| 原因 | 含义 |
|---|---|
| `every candidate lost its score to an agent failure` | 此次运行中的所有思路都未曾获得评分。这是基础设施问题，而非证据问题——请重新运行。 |
| `no candidate reached Select` | 搜索因其他原因在上游已无候选项；请查看 `graph.dropped`。 |
| `every finalist lost its score before Select` | 曾存在最终候选项，但它们因未获评分而被剪枝。 |
| `every finalist was pruned before Select` | 最终候选项因与评分无关的原因被剪枝。 |
| `every finalist carries a degraded or missing score` | 最终候选项在没有有效评分的情况下到达了 Select。 |
| `every finalist failed deterministic plan eligibility` | 真实拒绝。`haltDetail.eligibilityRejections` 会列出所有原因。 |
| `no safe graph winner` | 以上情况均不符合——请查看图。 |

`haltDetail.infrastructureDegraded` 与原因相互独立：两者可以同时为
true。通过原因了解是什么阻止了 Select，并通过该标志了解为其提供候选池的环节
发生了何种降级。

评分调用是只读且幂等的，因此传输层故障会触发重试：
每次调用最多重试两次，且整个运行期间的重试次数上限为智能体额度的 5%；一旦
剩余预算降至预留底线（额度的 20%），则完全拒绝重试。
格式错误的评分永远不会重试——schema 在工具层强制执行，因此
无效评分是一项应予保留的判断，而不是一次需要重新建立连接的故障。每次
尝试以及每次被拒绝的重试都会记录到 `graph.scoreRetries` 中，而
`scoreReliability` 会包含在每次运行的结果中，无论运行是否中止：即使一次偶发故障
导致两个最终候选项丢失，而运行随后仍继续交付，该运行也依然会被标记为降级。

Claude 注册的智能体配置会强制实施工具隔离：本地读取器
没有 shell、写入或 Web 工具；公共 Web 读取器没有本地文件或 shell
工具；补丁作者没有变更工具；而应用器/验证器仅拥有
Bash 和结构化输出能力。补丁作者返回统一 diff，由一个受限的
应用器应用它们；另一个单独预留了预算的受限验证器会在每次 Build 或 Fix Apply 后
立即比较精确的路径集合和 diff 摘要，之后才会进行任何读取器或 Gate 调用。补丁验证会在 Apply 前拒绝
符号链接、gitlink、二进制补丁、重命名、复制和文件类型转换。Gate
仅允许在 macOS `sandbox-exec` 下运行已列入白名单的本地验证
命令，不允许网络访问；主机读取范围仅限于运行时/系统根目录、工作树、其 `.git` 公共目录
（该目录会在精确的 Gate 约束环境内重新推导），以及本次运行的私有临时根目录。模型报告的
公共目录绝不会被插入沙箱权限中。写入范围仅限于已知的生成产物
和该私有临时根目录。白名单包括针对 Node、Python、Go、Rust、Make、Swift Package Manager 的
有界项目本地检查，以及将派生数据置于私有临时根目录下的 Xcode 模拟器构建
和离线 Gradle 验证。嵌套模块的 `build` 根目录仅根据该模块
`src` 树下选定的文件推导；如果符号链接或 realpath 可能逃逸出
工作树，则会被拒绝。Gate 后还会运行第二次 diff 证明，并对
二进制 Git diff 以及每个报告文件的模式、大小和字节内容进行哈希计算，其中包括
未跟踪的新增文件。

成功应用阻塞项补丁，并不意味着该阻塞项在语义上已被清除。
原始阻塞项仍保留在 `fixedBlockersPendingVerification` 中。Gate
尝试会记录其确切的命令集和报告的输出，但无法证明这些命令确实已运行，
因为 Workflow API 不会公开可信的必需工具执行回执。因此，工作流会根据智能体
报告设置 `claimedPassed`，强制设置 `passed:false`，设置 `gateVerified:false`，
并将判定和交接状态保持为 `hold`。只有拥有不可变执行回执的可信外部运行器
才能提升该证据的可信等级。

这些控制措施具有明确的信任边界。`bashCommandClamp` 会在智能体调用
Bash 命令时对其进行约束；Claude Workflow 不提供必需工具调用回执，
因此结构化验证器响应仍然是模型声明，而不是证明 Bash 已运行的
加密学证据。同样，`authority`、`allowedRepo`、`allowedFiles` 和
`allowedCommands` 是审计元数据，而不是文件系统权限。本地读取工具
与 Web 工具相互分离，但 Workflow API 并未对其实施路径沙箱限制。
在任何对安全敏感的交接中都应报告这些事实，并且不要将结果描述为
已通过主机认证。

生产环境检查是只读的。此技能绝不会部署、发布、发行、推送、合并、
更改凭据、删除或还原受保护的工作，也不会声称已完成线上验证。
它不会替用户选择预算，也不会判定可以跳过缺失的范围。其发布判定
只是提供给用户的证据，并不构成执行外部操作的权限。

## 交接与完成

读取工作流返回的 `runKey`，即来自其隔离工作树且经过验证的唯一
`ship-<UUID>` 叶节点。对于已完成的运行，使用返回的交接 Markdown。
如果在 Scout 之后停止，则根据结构化结果和图追踪记录编写如实的停止交接，
而无需再消耗一次智能体调用；应包括停止前已完成的所有 Build 或 Fix 通道。
如果 Scout 在 `runKey` 验证之前返回了无效路径，则报告停止情况，
但不要编写以运行键命名的交接文件。否则，将其保存到目标仓库根目录下的
`.suede-graph-flo-xr/${runKey}/handoff.md`，然后验证该文件是否存在：

```bash
test -f ".suede-graph-flo-xr/${runKey}/handoff.md"
```

报告该路径、所选计划（如有）、Gate 结果、已更改的文件、运行的命令
以及明确的注意事项。本地图执行完成并不能证明已完成部署。

## 第三方许可证

`workflows/suede-graph-flo-xr.js` 中的操作图和思维状态模型改编自
苏黎世联邦理工学院的 Graph of Thoughts。完整的上游 BSD 声明、条件、
免责声明和要求的引用均随此技能一同提供，位于
`LICENSE.graph-of-thoughts-BSD.txt`。每次以源代码或二进制形式
再分发该工作流时，都必须保留此文件。

## 路由

- 高容量、定义明确且相互独立的工作器任务 → 单独执行一次私有
  工作器集群流程。
- 仅对现有差异进行发现项审查 → `suede-code-review`。
- CI、必需检查或分支保护配置 → `suede-ci-gate`。
- 仅文案搜索和发布准备情况检查 → `suede-ship-copy`。
- 从 `suede-code-review`、`suede-ci-gate` 或 `suede-ship-copy`：将具有一个
  已选定变更型胜出方案的多文件实施计划搜索路由回 `suede-graph-flo-xr`。