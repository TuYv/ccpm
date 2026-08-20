---
name: wizard
description: Generate an interactive bash wizard that walks a human through steps only they can perform. Use when provisioning infrastructure, setting up credentials or CI secrets, walking an unfamiliar third-party dashboard, or running a one-off migration or cutover. Don't invoke this for steps the agent can perform itself.
---
# 向导

**向导**（wizard）是一段 bash 脚本，它会引导用户逐步完成一项手动操作流程——这种流程如果全靠手工执行会很繁琐，而每次都重新向 AI 解释也同样麻烦。它会打开每个 URL，准确说明需要点击和复制什么，获取相应的值，将它们写入正确的位置（`.env`、GitHub secrets），在每个阶段进行确认，并显示还剩多少个阶段。它可以配置第三方服务、执行一次性迁移，或将项目从一种状态转换到另一种状态。

出色的用户体验已经由 [template.sh](template.sh) 解决：分阶段进度、确认关卡、跨平台 URL 打开（包括 WSL）、隐藏式密钥输入、幂等的 `.env` 更新插入、`gh secret`/`gh variable` 写入，以及结束摘要。**你的工作只是界定流程范围并编写各个阶段。** `STAGES` 标记上方的库代码在每个向导中都完全相同；这种一致性正是其意义所在：绝不要手动编辑它。

默认情况下，向导是临时的：它为单次运行而构建，保存在临时路径或 `scripts/` 路径下，并在任务完成后删除。只有当用户希望在仓库中保留一个可重复使用的设置流程时，才提交它。

## 流程

### 1. 界定流程范围

梳理用户必须执行的每个手动步骤，以及整个过程中需要获取的每个值。先阅读仓库，不要在不了解情况时直接提问：

- 对于设置流程：检查 `.env`、`.env.example`、`.env.*`、`README`、`docker-compose*`、框架配置以及 `.github/workflows/*`（每个 `secrets.*` / `vars.*` 引用都是向导必须生成的值）。
- 对于迁移或转换流程：梳理当前状态、目标状态，以及两者之间不可逆的操作。

然后向用户展示按顺序排列的阶段列表以及每个阶段产生的值，并请求确认：用户可以添加、删除或重新排序。

**完成标准：** 每个阶段均已按顺序命名，并且对于每个获取的值，你都知道：(a) 用户从哪里获取它，(b) 它会被写入哪里（`.env`、GitHub secret、两者兼有或不写入任何位置；有些阶段仅执行操作），以及 (c) 它是密钥（隐藏输入）还是公开值。

### 2. 规划每个阶段的操作路径

对于每个阶段，写出用户需要遵循的精确路径：要打开哪个 URL、在那里执行什么操作、值显示在哪里、它会填入哪个变量。例如：“Dashboard → Developers → API keys → Reveal test key → copy”。如果你确实不了解当前 UI 或确切命令，请明确说明，并询问用户或查阅文档：绝不要编造可能并不存在的步骤。

**完成标准：** 每个阶段都有具体的操作说明，即使是完全陌生的人也能照着完成。

### 3. 编写向导

将 `template.sh` 复制到目标路径。将示例阶段替换为每个步骤对应的一个 `stage`，并按依赖顺序排列。使用库中的辅助函数：`stage`、`say`/`step`、`open_url`、`ask`/`ask_secret`、`write_env`、`set_secret`/`set_var`、`pause`/`confirm`。将 `TOTAL_STAGES` 设置为所编写的阶段数量。

遵循模板设定的标准：先打开 URL，再请求输入对应的值；任何密钥都使用 `ask_secret`；每个需要持久化的值都使用 `write_env`；只有 CI 实际需要的值才使用 `set_secret`；执行任何不可逆操作前都使用 `confirm`。每个 `stage` 都会清空屏幕，因此只显示当前步骤：每个阶段应只聚焦于一项任务，避免用户所需的信息滚动出屏幕。不要修改标记上方的库代码。

### 4. 验证并交接

- `bash -n <script>`；如果可用，运行 `shellcheck`。
- `chmod +x <script>`。
- 不要自行端到端运行它：它会打开浏览器并阻塞等待人工输入。应改为进行静态追踪：确保第 1 步中的每个值都已被捕获并传递到第 1 步所述的位置，并且每个 `set_secret` 名称都与 CI 中的某个 `secrets.*` 引用完全匹配。
- 告知用户如何运行它。如果这是一个可重复使用的设置流程，请将其提交，并在 README 中添加链接，以便下一个人直接运行该脚本，而不是求助于 AI。