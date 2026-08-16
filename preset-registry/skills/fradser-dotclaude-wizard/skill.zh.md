---
name: wizard
description: Generates an interactive bash wizard that walks a human through steps only they can perform. Use when provisioning infrastructure, setting up credentials or CI secrets, walking an unfamiliar third-party dashboard, running a one-off migration or cutover, or the user says "build a wizard" or wants a scripted step-by-step setup. Don't invoke this for steps the agent can perform itself.
---
# 向导

**向导**是一个 bash 脚本，它会引导用户逐步完成一项手动流程——这种流程手工执行很繁琐，每次重新向 AI 解释也同样麻烦。它会打开每个 URL，准确说明需要点击和复制的内容，获取相应的值，将它们写入正确的位置（`.env`、GitHub secrets），在每个阶段进行确认，并显示还剩多少个阶段。它可以配置第三方服务、执行一次性迁移，或将项目从一种状态转换到另一种状态。

出色的用户体验已经由 [template.sh](template.sh) 实现——逐阶段进度展示、确认关卡、跨平台 URL 打开（包括 WSL）、隐藏式机密输入、幂等的 `.env` 更新插入、`gh secret`/`gh variable` 写入，以及结束时的摘要。**你的任务仅仅是界定流程范围并编写各个阶段。** `STAGES` 标记上方的库代码在每个向导中都完全相同；保持这种一致性正是其意义所在——绝不要手动编辑它。

默认情况下，向导是临时性的——为单次运行而构建，保存到临时路径或 `scripts/` 路径，并在任务完成后删除。只有当用户希望将可重复执行的设置流程保留在仓库中时，才提交它。

## 流程

### 1. 界定流程范围

梳理用户必须执行的每一个手动步骤，以及过程中需要获取的每一个值。先阅读仓库——不要在毫无了解的情况下直接询问：

- 对于设置流程：检查 `.env`、`.env.example`、`.env.*`、`README`、`docker-compose*`、框架配置和 `.github/workflows/*`（每个 `secrets.*` / `vars.*` 引用都是向导必须生成的值）。
- 对于迁移或转换流程：明确当前状态、目标状态，以及二者之间不可逆的操作。

然后向用户展示按顺序排列的阶段列表，以及每个阶段产生的值，并请求确认——用户可能会添加、删除或调整顺序。

**完成标准：**每个阶段都已按顺序命名；对于获取的每个值，你都知道：(a) 用户从哪里获取它，(b) 它将被写入哪里（`.env`、GitHub secret、两者都写，或哪里都不写——有些阶段只是执行操作），以及 (c) 它是否属于机密信息（隐藏式输入）或公开信息。

### 2. 规划每个阶段的操作路径

为每个阶段写出用户需要遵循的准确路径：要打开哪个 URL、在那里执行什么操作、值显示在哪里、它将填入哪个变量——例如：“Dashboard → Developers → API keys → Reveal test key → copy”。如果你实际上不知道当前界面或确切命令，就如实说明并询问用户或查阅文档——绝不要虚构可能并不存在的步骤。

**完成标准：**每个阶段都有具体明确的说明，任何陌生人都可以按照这些说明完成操作。

### 3. 编写向导

将 `template.sh` 复制到目标路径。按照依赖顺序，用每个步骤对应的一个 `stage` 替换示例阶段。使用库中的辅助函数——`stage`、`say`/`step`、`open_url`、`ask`/`ask_secret`、`write_env`、`set_secret`/`set_var`、`pause`/`confirm`——并将 `TOTAL_STAGES` 设置为你编写的阶段数量。

达到模板设定的标准：在请求用户提供值之前先打开 URL，对任何机密信息使用 `ask_secret`，对每个需要持久化的值使用 `write_env`，仅对 CI 实际需要的值使用 `set_secret`，并在执行任何不可逆操作之前使用 `confirm`。每个 `stage` 都会清空屏幕，因此只有当前步骤可见——让每个阶段只专注于一项任务，避免用户所需的内容滚动到屏幕之外。不要修改标记上方的库代码。

### 4. 验证并交接

- `bash -n <script>`；如果可用，运行 `shellcheck`。
- `chmod +x <script>`。
- 不要自行端到端运行它——它会打开浏览器并阻塞以等待人工输入。应改为进行静态追踪：确认步骤 1 中的每个值都已被捕获，并传递到步骤 1 指定的位置；同时确认每个 `set_secret` 名称都与 CI 中的某个 `secrets.*` 引用完全匹配。
- 告知用户如何运行它。如果这是一条可重复执行的设置路径，请将其提交，并从 README 链接到它，以便下一个人直接运行该脚本，而不是求助于 AI。