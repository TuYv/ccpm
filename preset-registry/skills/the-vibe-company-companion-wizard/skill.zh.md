---
name: wizard
description: Generate an interactive bash wizard that walks a human through steps only they can perform. Use when provisioning infrastructure, setting up credentials or CI secrets, walking an unfamiliar third-party dashboard, or running a one-off migration or cutover. Don't invoke this for steps the agent can perform itself.
---
# 向导

**向导**（wizard）是一个 bash 脚本，用于一步一步地引导人类完成某个手动流程——这类流程手工执行很繁琐，每次向 AI 重新解释一遍同样很麻烦。它会打开每个 URL，明确说明要点击什么、复制什么，捕获各个值，把它们写到相应的位置（`.env`、GitHub secrets），在每个阶段都进行确认，并显示还剩几个阶段。它的用途可能是配置第三方服务、执行一次性迁移，或者把项目从一种状态切换到另一种状态。

令人愉悦的 UX 已经由 [template.sh](template.sh) 解决了：逐阶段进度、确认关卡、跨平台 URL 打开（包括 WSL）、隐藏式机密输入、对 `.env` 的幂等 upsert、`gh secret`/`gh variable` 写入，以及收尾总结。**你的工作只是确定流程范围并编写各个阶段。**每个向导中位于 `STAGES` 标记之上的库都是完全相同的；这种一致性正是关键所在：绝不要手动修改它。

向导默认是一次性的：为单次运行而构建，保存到临时路径或 `scripts/` 路径，任务完成后即删除。只有当用户想要一个应该保留在仓库中的可重复搭建流程时，才提交它。

## 流程

### 1. 确定流程范围

弄清人类必须执行的每一个手动步骤，以及过程中被捕获的每一个值。先阅读仓库，不要什么都不看就直接提问：

- 对于搭建配置：`.env`、`.env.example`、`.env.*`、`README`、`docker-compose*`、框架配置，以及 `.github/workflows/*`（每一处 `secrets.*` / `vars.*` 引用都是向导必须产出的值）。
- 对于迁移或状态转换：当前状态、目标状态，以及两者之间的不可逆操作。

然后向用户展示按顺序排列的阶段列表以及每个阶段产出的值，并请其确认：用户可能会增加、删减或调整顺序。

**完成条件：**每个阶段都按顺序命名，并且对于每个被捕获的值你都清楚：(a) 人类从哪里获取它，(b) 它被写到哪里（`.env`、GitHub secret、两者都写，或不写入任何地方；有些阶段是纯操作），以及 (c) 它是机密（隐藏输入）还是公开值。

### 2. 规划每个阶段的路径

对每个阶段，写出人类要遵循的精确路径：打开哪个 URL、在那里做什么、某个值显示在哪里、填充哪个变量：例如 “Dashboard → Developers → API keys → Reveal test key → copy”。凡是你并不真正了解当前 UI 或确切命令的地方，就要坦率说明，并询问用户或查阅文档：绝不要编造可能并不存在的步骤。

**完成条件：**每个阶段都能落实为陌生人也能照着执行的具体指令。

### 3. 编写向导

把 `template.sh` 复制到目标路径。按依赖顺序，将示例阶段替换为每一步对应一个 `stage`。使用库中的辅助函数：`stage`、`say`/`step`、`open_url`、`ask`/`ask_secret`、`write_env`、`set_secret`/`set_var`、`pause`/`confirm`。将 `TOTAL_STAGES` 设置为你编写的阶段数量。

守住模板设定的标准：在询问某个值之前先打开对应的 URL，对所有机密都使用 `ask_secret`，对每个持久化的值都执行 `write_env`，只对 CI 真正需要的值执行 `set_secret`，并在任何不可逆操作之前先 `confirm`。每个 `stage` 都会清屏，让屏幕上只显示当前步骤：请把每个阶段控制在一项专注的任务上，以免人类需要的内容被滚出屏幕。不要改动标记之上的库代码。

### 4. 验证并交付

- `bash -n <script>`；如有 `shellcheck` 则运行它。
- `chmod +x <script>`。
- 不要自己端到端运行它：它会打开浏览器并阻塞在等待人类输入上。改为进行静态走查：确认步骤 1 中的每个值都被捕获并落到步骤 1 所说的位置，并且每个 `set_secret` 的名称都与 CI 中某处 `secrets.*` 引用完全匹配。
- 告诉用户如何运行它。如果这是一个可重复的搭建流程，就提交它并在 README 中加上链接，这样下一个人就可以直接运行脚本，而不必再去问 AI。
