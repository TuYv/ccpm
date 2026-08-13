---
name: wizard
description: Generate an interactive bash wizard that walks a human through steps only they can perform. Use when provisioning infrastructure, setting up credentials or CI secrets, walking an unfamiliar third-party dashboard, or running a one-off migration or cutover. Don't invoke this for steps the agent can perform itself.
---
# 向导

**向导** 是一个 bash 脚本，逐步引导人工完成一项手工流程，这些流程手工操作很繁琐，而且每次都向 AI 重新解释也很繁琐。它会打开每个 URL，准确告知要点击和复制的内容，抓取这些值，将其写入相应位置（`.env`、GitHub secrets），在每个阶段进行确认，并显示剩余的阶段数。它可以配置第三方服务、运行一次性迁移，或将项目从一种状态迁移到另一种状态。

精妙的 UX 已由 [template.sh](template.sh) 解决——按阶段推进的进度、确认闸门、跨平台 URL 打开（包括 WSL）、隐藏式密钥输入、幂等 `.env` upsert、`gh secret`/`gh variable` 写入，以及结束总结。**你的任务仅仅是定义流程范围并编写其阶段。**位于 `STAGES` 标记上方的库在每个向导中都完全相同；这种一致性是重点——切勿手动编辑它。

向导默认是临时性的——为一次运行构建，保存到 scratch 或 `scripts/` 路径，任务完成后删除。只有当用户需要一个可重复执行、应保留在仓库中的设置路径时才提交它。

## 流程

### 1. 定义流程范围

梳理人工必须执行的每一个手工步骤以及沿途需要抓取的每个值。先阅读仓库——不要空问：

- 对于设置：`.env`、`.env.example`、`.env.*`、`README`、`docker-compose*`、框架配置，以及 `.github/workflows/*`（每个 `secrets.*` / `vars.*` 引用都是向导必须产出的值）。
- 对于迁移或转换：当前状态、目标状态，以及两者之间的不可逆操作。

然后向用户展示阶段的有序列表及每个阶段产出的值，并进行确认——用户可以添加、删除或调整顺序。

**完成标准：**每个阶段都按顺序命名，并且对每个你已知的抓取值，清楚知道 (a) 人工从哪里获取、(b) 写入到哪里（`.env`、GitHub secret、两者都写或都不写——某些阶段只是纯操作）、以及 (c) 是否为敏感值（隐藏输入）或公开值。

### 2. 映射每个阶段的路径

为每个阶段编写人工操作的精确路径：要打开哪个 URL、在那儿执行什么、在哪里显示某个值、该值对应哪个变量——例如“Dashboard → Developers → API keys → Reveal test key → copy”。当你并不真正知道当前 UI 或精确命令时，要说明这一点并向用户提问或查阅文档——切勿编造可能不存在的步骤。

**完成标准：**每个阶段都能追溯到一个陌生人也能照着做的具体指令。

### 3. 编写向导

将 `template.sh` 复制到目标路径。将示例阶段替换为每个步骤一个 `stage`，按依赖顺序排列。使用库助手——`stage`、`say`/`step`、`open_url`、`ask`/`ask_secret`、`write_env`、`set_secret`/`set_var`、`pause`/`confirm`——并将 `TOTAL_STAGES` 设置为你编写的阶段数。

坚持模板设定：在请求某个值之前先打开 URL，对所有敏感项使用 `ask_secret`，对每个持久化值执行 `write_env`，只对 CI 实际需要的值使用 `set_secret`，并在任何不可逆操作前执行 `confirm`。每个 `stage` 都会清屏，因此仅显示当前步骤——保持单个阶段聚焦一个任务，这样人工需要的内容就不会因滚动而离开视线。不要修改标记上方的库。

### 4. 验证并交付

- `bash -n <script>`；如可用请运行 `shellcheck`。
- `chmod +x <script>`。
- 不要自己端到端运行它——它会打开浏览器并阻塞等待人工输入。改为静态追踪：步骤 1 中的每个值都被抓取并落到步骤 1 规定的位置，并且每个 `set_secret` 名称与 CI 中的 `secrets.*` 引用完全一致。
- 告知用户如何运行它。如果它是可复用的设置路径，请提交并在 README 中链接该脚本，使下一位使用者运行脚本，而不是向 AI 询问。
