---
name: foldyard
description: Orient yourself in a foldyard dev box and drive it — the host/box split, what the box structurally cannot do, posture modes for credentials, egress and the proxy, worktrees, and why a config or compose change might not have taken effect. Use whenever `fy`/`foldyard` commands appear, when something needs a credential or network access it doesn't have, when a change "doesn't take", or when asked to work on the dev environment itself.
---
# 在 foldyard 开发盒中（以及开发盒本身）工作

Foldyard 会在一个**只挂载此仓库的无根 VM 中运行此项目**。你几乎可以确定自己*在盒中*——也就是该 VM 中的一个容器——而与你协作的人在**主机**（他们的 Mac）上。这种分离解释了下面几乎所有内容。

检查你所在的位置：`fy mode` 会打印当前状态，并说明它读取的是哪一侧。
`fy verify` 会验证边界（如果其中任何一项为假，它会以非零状态退出）。

## 最能帮你节省时间的四个事实

1. **你无法推送。** Git 远程仓库的凭据按设计不会传入盒中。你可以在本地读取并提交；由人来推送。不要试图绕过它——没有什么可以找到的。
2. **你没有真正的机密，也无法授予自己任何机密。** 状态信息位于主机的 home 目录中，在挂载范围之外。`fy mode` 可以在任何位置显示状态；但只有主机能够设置状态。
3. **你的出站流量会经过主机的代理**，并且可能受到允许列表或网络隔离的限制。被阻止的主机意味着这是一个决策，而不是 bug——请提出请求；不要绕过路由。
4. **你拥有的引擎套接字是真实的**，并且被限制在此 VM 内。`docker`/`podman` 命令可以正常工作，并作用于实时开发栈——包括测试套件的 mock 所放行的任何内容。

## 询问工具，不要猜测

Foldyard 可以自省，并且它自身的输出始终是最新的——应优先使用这些输出，而不是任何摘要（包括本文）：

| 问题 | 命令 |
| --- | --- |
| 此环境当前能做什么？ | `fy mode`（状态），`fy state`（期望状态与观测状态） |
| 哪里坏了 / 缺了什么？ | `fy doctor`——每项检查一行，并附带对应的修复方法 |
| 隔离是否完好？ | `fy verify` |
| 此动词的作用是什么？ | `fy --help`、`fy <verb> --help` |
| 按主题离线查看手册 | `fy docs`——然后执行 `fy docs <topic>` |
| 配置允许主机做什么？ | `fy config widenings` |

`fy docs` 提供的是**此安装版本的**文档，因此它不会与当前运行的代码发生偏差。
请从 `fy docs quickstart`、`fy docs modes`、`fy docs networking`、`fy docs security` 开始；ADR（`fy docs adr-0001` …）包含每项设计决策背后的原因。

## 日常动词

`fy up | ps | logs [svc] | shell | down` 用于驱动 compose 栈；`fy box shell | ps` 用于操作开发盒本身；`fy verify` 用于验证隔离环境。使用者仓库通常会在自己的 `just` 配方中封装这些命令——在直接使用 `fy` 之前，先检查仓库的 justfile 和 CLAUDE.md。

## 当你需要某些自己没有的东西时

**凭据**（云令牌、API 密钥）：你无法授予自己这些凭据。请明确说明人类应在其 Mac 上运行的确切命令，以及这样做的原因。状态按轴划分——`fy mode` 会列出此项目声明的轴及其级别，并且高权限级别会按设计通过计时器过期。详情请参阅：
[posture-and-credentials.md](references/posture-and-credentials.md)。

**需要穿过网络隔离墙访问主机**：在**主机上**执行 `fy allow add <host> --level session`。告诉他们主机名以及需要访问它的原因。详情请参阅：
[egress-and-capture.md](references/egress-and-capture.md)。

**盒子中的工具**：它应当写入项目的 `foldyard.toml`（`[[box.tools]]`）中，这样在盒子重建后仍会保留，而不是通过临时的 `apt install` 安装，因为下一次 `fy box down` 就会将其丢弃。`bootstrap-devbox` skill 介绍了如何在盒子内部逐步完善该配置。

## “我改了它，但什么也没发生”

这是这里最常见的一类困惑。完整对照表见：
[when-a-change-doesnt-take.md](references/when-a-change-doesnt-take.md)。最重要的三项是：

- **`foldyard.toml`** — 主机运行的是它**采纳的**副本，而不是你的工作树。除非人在下一次 `fy up`/`fy host` 时回答提示（或运行 `fy config adopt`），否则你的修改不会生效。使用 `fy config status` 检查；使用 `fy config diff` 查看发生了什么变化。
- **Compose 文件** — 它们从**主检出目录**读取，因此在工作树中的修改要等到进入该检出目录后才会生效。
- **正在运行的容器** — 它会继续使用创建时采用的命令和环境。配置发生变化时需要重新创建（`fy up`），而不是重启。

## 开发 foldyard 本身

先阅读 `fy docs`——这是已安装版本自带的手册。源代码位于
<https://github.com/twistco/foldyard>。不要为了“了解其工作原理”而将它克隆到盒子中：你得到的版本会与当前运行的版本不同，而这正是该设计竭力避免的混淆。针对它进行开发的受支持方式是使用**协同开发挂载**
（`fy docs adr-0020`），它会挂载真实的检出目录，并以可编辑模式安装它。