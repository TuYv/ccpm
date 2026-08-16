---
name: privacy-guard
description: Prevents private infrastructure details (node hostnames, internal project names, local usernames and personal emails, absolute home paths, private and VPN IP ranges) from leaking into public repositories through commits, PRs, docs or release artifacts. Use when working in a public or soon-to-be-public repo, before commits or releases, when writing deployment docs for an OSS project, or when the user asks to "set up the privacy guard", "install privacy-guard", "check for leaks", "protect this public repo". Bootstraps a pre-commit hook backed by a gitignored local denylist plus gitleaks.
argument-hint: "[setup <repo-path> | check | update-denylist]"
---
# privacy-guard

防止在公共仓库（或以后可能公开的仓库）中意外发布私有基础设施的详细信息。包含两道防线：始终生效的 Claude 会话行为规则，以及针对每个仓库的技术关卡：由被 git 忽略的本地拒绝列表支持的 pre-commit hook，再加上 gitleaks。

## 威胁模型

公共仓库是边界。任何描述私有基础设施的信息，无论以何种形式，都不得越过该边界：提交的文件、提交消息、分支名称、PR 和 issue 正文、发布说明、已发布的产物、截图。

**敏感信息，绝不能出现在公共仓库中：**
- 节点主机名和内部别名（工作站、VPS、客户端计算机）
- 从未公开发布的内部项目和服务实例名称
- 本地用户名、个人和工作电子邮件地址
- 个人域名和内部服务 URL
- 主目录和内部挂载点的绝对路径
- 私有网络 IP 范围和 VPN 地址空间（例如 Tailscale CGNAT 范围
  `100.64.0.0/10`）
- cookie 文件、令牌、凭据（gitleaks 也会涵盖这些内容）

**不属于敏感信息，可以出现在公共文档中：**
- 使用通用名称指代的公共产品和技术（Tailscale、Docker、n8n）
- 维护者的公开 GitHub 用户名
- 以通用形式描述的部署模式（“可通过私有网络访问／位于 VPN 后方的 Docker 主机”）

具体的敏感令牌列表由你维护，并且始终保持私密。此 skill 附带
`references/denylist-template.txt`，这是一个仅包含占位符的起始模板：在私有位置（私有 dotfiles 仓库、私有笔记仓库）填写该文件，并将填写后的副本视为用于传播的种子。绝不要将填写后的版本提交到公共仓库。

## 行为规则（公共仓库中的 Claude 会话）

1. 绝不要将内部令牌写入已提交的文件。私有部署详细信息应记录在私有仓库或被 git 忽略的 `.local/` 目录中，绝不能记录在公共仓库的文档中。
2. 用户在对话中提及内部名称，并不代表授权将其写入仓库：对话是私密的，仓库不是。
3. 每次提交前：重新检查 diff，查找拒绝列表中的令牌。hook 是安全网，而不是第一道检查。
4. 这也适用于文件之外的内容：提交消息、分支名称、PR 和 issue 的标题与正文、CHANGELOG 条目、已发布的产物。
5. 如果敏感令牌已经进入公开的 git 历史记录：立即告知用户（是否轮换，以及是否使用 BFG 或 filter-repo 重写历史记录，由用户决定），不要只是从最新版本中将其删除。

## 针对每个仓库的设置（`setup <repo-path>`）

在目标仓库的根目录中：

1. 将 `references/check_privacy.sh` 复制到 `scripts/check_privacy.sh` 并赋予其可执行权限。
   它必须保持为**副本**：在此处修复后重新复制，绝不要在那里直接编辑。有关为何需要通过检查来保证这条规则，请参阅下文的*保持副本为最新状态*。
2. 使用你的私有种子（首次运行时也可使用
   `references/denylist-template.txt`）创建 `.local/privacy-denylist.txt`，并根据此仓库的上下文调整模式。
3. 确保 `.gitignore` 包含 `.local/`。
4. 将 `references/pre-commit-snippet.yaml` 中的配置块添加到 `.pre-commit-config.yaml`
   （gitleaks + privacy-denylist）。
5. 运行 `pre-commit install`；如果仓库使用 push hook，则添加 `--hook-type pre-push`。
6. 验证：创建一个包含拒绝列表中某个令牌的临时文件，**暂存该文件**，并检查
   `scripts/check_privacy.sh <file>` 是否以代码 1 退出。未填写的拒绝列表（仅包含注释）会使 hook 静默地不执行任何操作，因此此步骤能确认防护机制确实已经启用。也要检查相反情况——不包含任何令牌的文件必须以代码 0 退出——否则你只能证明脚本可以失败，而不能证明它能够作出区分。

> **在该文件中放入一个令牌，而不是一个模式。** 拒绝列表包含扩展正则表达式，
   > 而且其中大多数都有锚点（`\bexample\b`）。逐字写入该文本并不能让它匹配
   > 自身：这样文件中会包含字面意义上的反斜杠，模式什么也匹配不到，而
   > 脚本会以状态码 0 退出——这会被解读为“防护未启用”，但实际上是
   > 测试有误。去掉锚点，使用该模式原本要捕获的裸字符串。2026-08-09
   > 在为三个仓库启用防护时进行的测量显示：29 个模式中有 6 个碰巧能匹配
   > 自身的文本，因此选取拒绝列表的第一行会产生“未启用防护”的错误判断。
   >
   > 出于同样的原因，暂存也很重要：`check_privacy.sh` 读取 `git diff --cached`，因此
   > 未暂存的文件没有新增行，脚本会报告没有检查任何内容。

设计属性：拒绝列表不会被提交，因为发布该列表会暴露它所保护的那些
令牌。因此，对于外部贡献者和 CI，该钩子不会执行任何操作。通用机密信息
（密钥、令牌）仍由 gitleaks 覆盖，它会在所有环境中运行。

### 变体：使用版本化 Git 钩子的仓库

如果目标仓库设置了 `core.hooksPath`（提交到仓库中的共享 `.githooks/` 目录），
按照设计，`pre-commit install` 会拒绝运行：*"由于设置了 `core.hooksPath`，谨慎拒绝安装钩子"*。
不要为了给该框架腾出位置而取消此设置，否则会禁用仓库现有的依赖钩子。
应改为用以下内容替换第 4 步和第 5 步，从现有钩子中针对已暂存文件列表调用
`check_privacy.sh`：

```sh
files=()
while IFS= read -r -d '' f; do files+=("$f"); done \
    < <(git diff --cached --name-only -z --diff-filter=d)
if [ ${#files[@]} -gt 0 ]; then
    bash scripts/check_privacy.sh "${files[@]}" || exit 1
fi
```

`-z`/`read -d ''` 组合可确保包含空格的文件名保持完整，而 `|| exit 1` 才是让
钩子真正阻止提交的关键：如果忽略脚本的退出码，防护就只会报告问题，却仍然
允许提交通过。

有两个后果值得向用户明确说明。没有该框架时，每次提交都不会有任何机制调用 gitleaks，
因此应改为在 CI 中运行它。此外，该框架的暂存步骤不再改变此检查所看到的内容：
它读取 `git diff --cached`，所以无论如何查看的都是已暂存的 blob。
另一方面，这确实会造成功能损失，应该明确指出：如果令牌仅存在于未暂存的
编辑中，它将不再被报告，而旧的全文件形式能够发现它。由于它并未被提交，
提交前防护不对此发出警告也说得通，但与以前相比，检查范围确实更窄了。

## 拒绝列表维护（`update-denylist`）

当出现新的敏感令牌时（新节点、新实例、新域名）：
1. 更新你的私有种子，它是唯一事实来源；
2. 将其传播到该节点上每个活跃公共仓库的 `.local/privacy-denylist.txt`。

## 保持副本最新（`check-sync.sh`）

有意将 `check_privacy.sh` 复制到每个仓库中：仓库必须能够独立支持未安装此插件的
外部贡献者和 CI。复制的代价是版本漂移，而这里的漂移是**不可见的**——落后一个月的
副本看起来与当前副本完全一样。实际观察到的情况是：一个副本缺失某项修复已达一个月，
同时还包含一项无人回馈到上游的本地改进，而这两种情况都没有任何机制能够暴露出来。

有两点使其具备可见性。每个副本的标头中都带有其**版本和来源**，
因此可以确定副本的位置。此外：

```sh
references/check-sync.sh REPO...     # 0 all current, 1 any divergence, 2 usage
```

它通过 **git** 查询仓库发布了哪些副本（`ls-files`），而不是查询文件系统，也不依赖
硬编码路径：这回答了真正的问题（“这个仓库分发什么”），并且无论副本位于何处都能
给出答案。共有四种判定结果，其中最后一种最为重要：

- `OK` — 与规范副本逐字节完全相同。
- `BEHIND` — 版本较旧，或者根本没有版本行（即副本早于该行本身）。
- `DIVERGED` — **版本相同，内容不同**。这是最糟糕的情况，因为版本声称自己是最新的，
  实际却并非如此。应将更改提交到上游并重新复制；如果保留该更改，下一次同步会在没有
  提示的情况下将其还原。
- `NONE` — 仓库未发布任何副本。明确报告此结果，而不是略过不提，因为沉默会被理解为
  “最新”。

当你修改此 skill 时，以及当某个仓库的防护机制表现与文档不符时，请运行它。
它只比较仓库*发布*的内容；一个存在但未被跟踪的副本，并不是能够传递给其他人的
防护机制。

## 已知限制

- 该防护机制在客户端运行：它只保护从拥有拒绝列表的节点所创建的提交。
- `check-sync.sh` 会与随*当前*插件检出版本一起发布的副本进行比较，而其中涉及
  **三个**不会自行保持一致的副本：源仓库、marketplace 克隆，以及安装在
  `~/.claude/plugins/cache/<marketplace>/<plugin>/<version>/` 下的插件。在插件缓存
  过期的节点上，它会以旧的规范副本为基准，自信地报告各仓库均为最新。对两个节点的
  测量结果表明：marketplace 克隆落后五天、28 个提交，而已安装的插件则落后两个次要
  版本。在相信一次无异常的运行结果之前，请刷新这两者：

  ```sh
  claude plugin marketplace update <marketplace>
  claude plugin update <plugin>@<marketplace>    # restart to apply
  ```
- 它扫描的是提交所添加的行，而不是整个文件：已提交的令牌会继续通过检查，直到有人
  将其移除。这是有意为之（扫描整个文件会阻碍以后对某个文件的每次编辑，即使该文件
  合理地提及了其自身拒绝列表中的令牌，并使 `--no-verify` 成为唯一出路），但这意味着
  该防护机制只会阻止新的泄漏，并不会审计历史记录。若要进行审计，请手动使用 grep，
  根据拒绝列表检查受跟踪的文件树。
- 它不涵盖手动粘贴到 GitHub Web UI 中的内容。只有行为规则涵盖这种情况。
- 单词边界模式（`\bfoo\b`）可能会在哈希值和 ID 中产生误报。该钩子会打印匹配的行，
  因此请根据具体情况进行判断。