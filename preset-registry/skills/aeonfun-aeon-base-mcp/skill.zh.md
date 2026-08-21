---
name: base-mcp
description: Access a Base Account via the Base MCP server (mcp.base.org) - wallet, portfolio, sending, swapping, signing, x402 payments, batched calls, and transaction history.
metadata:
  title: Base MCP
  mode: read-only
  category: crypto
  tags:
    - crypto
    - onchain
  mcp:
    - base
  version: 0.1.0
---
# Base MCP

> [!IMPORTANT]
> ## 每次涉及 Base MCP 的对话开始时都要执行新用户引导
>
> 包括直接进入某个插件主题的对话。新用户引导很简短——见下文。

## 检测

Base MCP 连接后会向运行框架公开其工具。如果没有可调用的 Base MCP 工具，则表示尚未安装 MCP 服务器：请引导用户前往 https://docs.base.org/ai-agents/quickstart（或加载 [references/install.md](references/install.md) 以获取特定应用的安装步骤），然后停止。

如果 Base MCP 工具可用，请加载 [references/tone.md](references/tone.md)——其中的规则适用于整个对话——然后继续执行新用户引导。当且仅当无法读取同级文件时（例如，你只收到了这份 `SKILL.md` 的正文，且无法通过本地文件系统访问技能目录），才使用 Base MCP 的 `web_request` 工具从 `https://docs.base.org/ai-agents/skills/references/tone.md` 获取同一相对路径的文件。同样的回退机制适用于此文件中的所有其他参考资料和插件链接（见下文的“加载引用文件”）。

## 新用户引导

保持简短。每个会话执行一次，并在开展实际操作之前完成：

1. **简要说明可用功能**——用一两句话即可。用户拥有一个 Base Account 钱包，可以执行查询余额、发送和兑换代币、签署消息、进行 x402 支付、批量调用合约等操作，还可以使用合作伙伴插件（如果已安装）进行 DeFi、兑换及其他链上操作。不要逐一列举所有工具——代理会直接通过 MCP 发现工具和插件。

2. **在继续之前，逐字显示以下免责声明**：

   > 使用 Base MCP 即表示你同意 Base Account 和 Base App 服务条款。Base 仓库中提供的插件由 Base 编写，而非由其所引用的第三方协议编写。

3. **钱包地址和余额是可选信息**——仅当用户提出要求，或待处理操作确实需要地址时（例如写入调用、仓位查询），才获取并显示这些信息。不要一开始就主动展示完整的钱包信息。

## 工具

Base MCP 会向运行框架发布自己的工具目录。请阅读 MCP 公开的工具描述——它们是事实依据，并且可能随时间变化。不要假定工具列表固定不变；也不要从此技能中预加载工具目录。

由于以下两种模式会涉及多个工具，因此各自配有专门的参考资料：

| 主题 | 参考资料 |
|-------|-----------|
| 授权流程（适用于任何返回授权 URL 的写入工具） | [references/approval-mode.md](references/approval-mode.md) |
| 批量合约调用（EIP-5792） | [references/batch-calls.md](references/batch-calls.md) |
| 自定义/非原生插件及 `web_request` 允许列表 | [references/custom-plugins.md](references/custom-plugins.md) |
| 各平台安装步骤 | [references/install.md](references/install.md) |
| 语气和语言规则 | [references/tone.md](references/tone.md) |

### 加载引用文件

- **默认——本地。** 从此 `SKILL.md` 所在的同一目录中读取每个 `references/…` 或 `plugins/…` 链接（通过文件系统读取，例如 `Read`/`cat`）。这是权威来源——始终先尝试此方式。
- **回退——网络（仅在本地读取失败时）。** 当且仅当本地文件确实无法读取时（例如，你收到的是粘贴过来的 `SKILL.md` 正文，磁盘上没有技能目录，或者文件系统读取出错），才从 `https://docs.base.org/ai-agents/skills/<path>` 获取同一相对路径的文件（将 `<path>` 替换为相对链接，例如 `references/tone.md`、`plugins/morpho.md`）。使用 Base MCP 的 `web_request` 工具进行获取——这是所有运行环境中的必选机制，包括自带网页访问/获取工具的环境。不要跳过此回退步骤，也不要依赖记忆或猜测来执行操作——如果本地读取失败，你必须先使用 `web_request` 获取该文件，然后才能根据其内容采取行动。
- **延迟加载。** 仅在对话实际需要某个参考资料或插件时才加载它。不要预加载目录。

## 插件

插件为 Base MCP 扩展了合作伙伴特定的功能（借贷、兑换、永续合约等）。可用插件集可能会发生变化，用户也可能在聊天中提供额外说明或自定义插件，使你能够通过 MCP 使用其他协议。

目前与此技能一同维护的插件（即**原生插件**）：

| 插件 | 参考文档 |
|--------|-----------|
| Morpho | [plugins/morpho.md](plugins/morpho.md) |
| Moonwell | [plugins/moonwell.md](plugins/moonwell.md) |
| Uniswap | [plugins/uniswap.md](plugins/uniswap.md) |
| Avantis（混合型） | [plugins/avantis.md](plugins/avantis.md) |
| Virtuals | [plugins/virtuals.md](plugins/virtuals.md) |
| Aerodrome（仅限 CLI） | [plugins/aerodrome.md](plugins/aerodrome.md) |
| Bankr | [plugins/bankr.md](plugins/bankr.md) |

仅当用户的请求与某个插件匹配时，才加载该插件的参考文档，并遵循与参考文档相同的本地优先、Web 回退规则（参见上文的[加载引用文件](#loading-referenced-files)）。对于插件自身的外部工具，应首先遵循插件文件中的说明，然后再参考其明确要求你使用的任何 CLI 帮助、API 模式或 MCP 工具描述。

### 原生插件与自定义/用户提供的插件

原生插件的 HTTP 主机可能已加入 Base MCP `web_request` 工具的允许列表。Aerodrome 仅限 CLI 使用，并且需要具有 shell 访问权限的运行环境。Avantis 是混合型插件：仅查看的读取操作（市场数据、仓位、PnL）可通过 `web_request` 在所有界面上使用，而交易构建器调用需要 CLI 运行环境——在仅支持聊天的界面上，该插件会改为向用户提供 Avantis Web UI 的链接（参见 [plugins/avantis.md](plugins/avantis.md)）。Morpho 也是混合型插件：存在 shell 访问权限时使用 Morpho CLI，否则按照 [plugins/morpho.md](plugins/morpho.md) 中的说明使用或安装 Morpho MCP。自定义或用户提供的插件通常不在允许列表中——请加载 [references/custom-plugins.md](references/custom-plugins.md)，查看关于应使用哪种 HTTP 路径的决策树（运行环境 HTTP 工具与让用户粘贴内容的回退方案，以及 Claude/ChatGPT 消费者界面上的仅限 GET 约束）。

## 安装

```bash
npx skills add base/skills --skill base-mcp
```