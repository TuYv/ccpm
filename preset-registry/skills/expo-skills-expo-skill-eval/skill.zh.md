---
name: expo-skill-eval
description: Evaluate Expo skills in this repo end-to-end - trigger accuracy, generated code quality, and runtime screenshots on iOS simulator and Android emulator via Expo Go (web optional). Use when the user wants to eval an Expo skill, test that a skill produces working code, benchmark a skill with device screenshots, or verify a skill's output renders correctly.
version: 1.0.0
license: MIT
allowed-tools: "Read(~/.cache/expo-skill-eval/**), Read(/tmp/expo-skill-eval-*/**), Read(/private/tmp/expo-skill-eval-*/**), Write(/tmp/expo-skill-eval-*/**), Write(/private/tmp/expo-skill-eval-*/**), Edit(/tmp/expo-skill-eval-*/**), Edit(/private/tmp/expo-skill-eval-*/**), Bash(python3 /tmp/expo-skill-eval-*), Bash(python3 /private/tmp/expo-skill-eval-*), Bash(python3 *expo-skill-eval/scripts/*), Bash(tee /tmp/expo-skill-eval-*), Bash(tee /private/tmp/expo-skill-eval-*), Bash(bash *expo-skill-eval/scripts/*)"
---
# Expo 技能评估

评估 `plugins/expo/skills/` 中技能的触发准确性、生成代码质量和/或在 Expo Go 中的运行时渲染效果。

要求：安装了 Xcode（iOS 模拟器）的 macOS、至少配置了一个 AVD 的 Android SDK，以及 `bun`。不假定存在任何其他设备工具。

工作区根目录：`/private/tmp/expo-skill-eval-<skill-name>/iteration-N/`（例如 `/private/tmp/expo-skill-eval-expo-ui/iteration-4/`）。

## 开始之前——明确范围

**在开展任何流水线工作之前，预先确认以下所有事项——不要跳过任何一项**（仅当请求中已明确说明某项选择时，才跳过该项）。按照以下顺序，将它们分批放入 `AskUserQuestion` 调用中，每次调用不超过 4 个问题：

1. 要评估**哪个技能**（如果请求中未明确说明）。
2. **提示词**——使用哪些提示词驱动评估。内置提示词（来自技能的评估用例）默认**全部预选**；可以移除任意提示词、添加自定义文本提示词，或**根据上传的截图进行构建**（技能必须复现的目标 UI）。请参阅下面的**提示词**。
3. **验证内容**——提供包含三个选项的多选：运行时 + 截图 / 触发准确性 / 代码检查（无设备）。请参阅下面的*验证内容*。
4. **Expo SDK**——最新版本（默认，自动检测）或固定版本。
5. **运行器**——Expo Go（默认）或开发构建。
6. **平台**——iOS / Android / web（始终提供全部三个选项）。
7. `claude -p` 的**权限标志**——skip-permissions（默认）或 accept-edits。
8. **查看器交付方式**——仅本地（默认）或发布可共享的 Artifact。
9. **如果选择了触发准确性**——确认已禁用（或未安装）已发布的 `expo` 插件。

下面详细说明了各项。第 4–6 项（SDK、运行器、平台）自然适合放在同一个 `AskUserQuestion` 调用中。

**如果请求中未明确要评估的技能**，请列出 `plugins/expo/skills/` 中的可用技能，并询问要评估哪一个。

**加载待测技能的方式——两种机制，每个阶段使用一种**（不要全局只选一种）：执行器运行通过**文件路径**引用它（`SKILL_PATH = plugins/expo/skills/<skill>/SKILL.md`，显式读取），而触发评估则将它作为**插件**加载（`--plugin-dir plugins/expo`，以便模型可以根据其描述自动选择它）。两者都指向仓库内的*本地版本*——这正是你要评估的版本。启动评估工具会话本身**不需要**任何特殊标志（评估工具会根据仓库路径找到该技能）；这些机制适用于它所生成的 `claude -p` 子进程。有关每个阶段为何采用不同方式，请参阅步骤 1 和步骤 3。**一项运行前检查（当评估范围包含触发评估时为必需）：**如果已安装/启用*已发布的* `expo` 插件，请在启动评估工具**之前**（通过 `/plugin`）将其禁用，并在完成后重新启用。只需禁用一次，这是一项全局配置更改，当前会话及其生成的 `claude -p` 子进程都会继承该更改。触发评估之所以必须如此：该阶段通过 `--plugin-dir` 加载本地技能，而另一个已安装的 `expo` 会与其冲突——模型可能会触发*已发布的* `expo:expo-ui`，而由于检测只能看到工具调用名称，你可能会在不知情的情况下对已发布版本的描述进行评分，而不是对本地修改进行评分（这种冲突也可能直接导致错误）。**执行器 / 运行时 / 静态**阶段则不受影响——它们通过本地 `SKILL_PATH` 读取待测技能，并且不使用 `--plugin-dir`——因此，不包含触发评估的运行可以跳过禁用操作。禁用 `expo` **不会**禁用 `expo-skill-eval`（它是一个独立的项目技能，不属于 `expo` 插件），因此评估工具仍然可用。

**在开始前将此事项明确告知用户并请求确认**——就像确认要评测哪个技能一样。当触发评测在范围内时，请在开始第 1 步*之前*，让用户确认已禁用（或未安装）已发布的 `expo` 插件；如果该插件仍处于启用状态，请暂停，并让用户通过 `/plugin` 将其禁用。在用户确认之前，不要运行触发评测——评测工具无法自行可靠地检测已安装的插件（读取全局插件配置或运行 `claude plugin list` 都会触发提示），因此这需要手动确认，而不是自动检查。

**选择提示词——内置提示词、自定义提示词或目标截图。** 提示词是驱动执行器（启用技能和不启用技能）的*输入*；它们与你要*验证*的内容是分开的。使用 `AskUserQuestion` 让用户确认这些提示词（如果请求中已经指定了提示词，则跳过）：

- **内置提示词**——通过阅读待测试技能（其 `SKILL.md` 和 `references/`）以及 `references/runtime-matrix.md` 生成的代表性提示词，涵盖该技能的标准用例。（如果技能已在 `evals/evals.json` 中附带评测用例，也要将其中的 `prompt` 字段纳入——但大多数技能没有，因此通常需要自行推导。）**预先选中全部提示词**，以便默认运行能够覆盖该技能的标准用例；允许用户取消选择任何提示词。
- **自定义文本提示词**——由用户输入的一次性提示词。不要为此占用一个专门的选项槽位：`AskUserQuestion` 会自动添加一个**“输入其他内容”**选项，用户在那里输入的任何内容都会成为一个自定义文本用例。
- **根据上传的截图构建**——用户提供**目标截图**（要复现的 UI）的路径。执行器会被告知打开该截图——`claude -p` 会使用其 Read 工具读取 PNG——并构建一个与之匹配的应用；该用例会将路径记录为 `reference_image`，评分时会将生成的应用与该目标进行比较（第 6 步）。这是对 UI 技能最有力的视觉测试：“构建*这个*。”

**遵守 `AskUserQuestion` 每个问题最多 4 个选项的限制，并按以下优先级处理**（需要避免的错误：当四个槽位填满后，上传选项被悄然丢弃）：

1. **始终为“根据上传的截图构建”保留一个槽位。** 这是视觉评测的核心，绝不能让它成为被丢弃的选项。
2. **不要显式添加“自定义文本提示词”选项**——自动提供的“输入其他内容”选项已经涵盖了这一需求。
3. 使用内置/代表性提示词填满剩余的 ≤3 个槽位，并将它们**预先选中**。如果内置提示词超过 3 个，请将它们合并为一个预先选中的**“所有内置提示词（默认）”**选项，并在简短的后续问题中让用户选择子集，这样仍能为上传选项留出空间。

将其呈现为**多选**。当用户选择“根据上传的截图构建”时，在后续问题中询问目标图片路径。每个选中的提示词（内置、输入或图片）都会成为一个评测用例（分别在启用技能和不启用技能的情况下运行）。

**始终确认要验证的内容**，除非请求已经明确无歧义。提供以下选项，并允许用户选择一个或多个（根据该技能在 `references/runtime-matrix.md` 中的条目以粗体标出默认选项）：

| 选项 | 作用 | 何时建议作为默认选项 |
|--------|-------------|---------------------------|
| **运行时 + 截图** | 完整流程：fixture → executor → static gate → 在 iOS/Android 上运行应用并截图。runner（Expo Go 或开发构建）是另一个单独的问题——不要在这里指明。 | 对任何会渲染应用屏幕的技能（`references/runtime-matrix.md` 中的 `expo-go`/`dev-build` 行），均为**默认选项**。需要已启动的模拟器/仿真器。 |
| **触发准确率** | 通过 `claude -p` 运行真实提示词，检查技能是否被读取。衡量召回率（仅限应触发的查询）。 | 始终适合作为独立检查。 |
| **代码检查（无需设备）** | `tsc --noEmit` + 感知 diff 的 lint + `expo export`，此外，grader 还会根据你提供的任何自定义预期检查生成的代码。无需设备。 | 对 `static-only` 和 `n/a` 技能均为**默认选项**，也适用于希望在不运行应用的情况下验证代码模式（正确的导入路径、`Host` 包装器等）的任何场景。 |

**将这些选项合并成一个多选问题来呈现——*"你想验证什么？"*** 这些是*评分维度*（如何评判构建出的内容），与**提示词**阶段（要构建什么）不同。用户可以选择任意组合。当提示词是**上传的截图**时（参见**提示词**），请包含**“运行时 + 截图”**，以便 harness 捕获生成的应用，并让 grader 根据目标对其评分。

在提出建议之前，请阅读 `references/runtime-matrix.md` 以确定该技能的默认模式。如果请求已指定模式（例如“只检查它是否会触发”“在设备上运行它”），则跳过该问题并继续。

**预先一次性选择 Expo SDK 版本。** 使用 `bash /abs/path/expo-skill-eval/scripts/latest-sdk.sh` 检测最新版本（它会输出主版本号，例如 `56`；在内部，它使用 `bun` 运行 `npm view expo dist-tags --json`，并通过 `JSON.parse`/`semver` 读取主版本号，而且它受 bash-scripts 规则约束——因此不要自行直接运行 registry 查询，否则会出现提示）。然后使用 `AskUserQuestion` 进行确认：默认采用该最新 SDK，或允许用户固定到较旧版本（例如，为了复现特定版本的问题）。在构建 fixture 的所有位置都使用所选版本——将其作为 `<sdk>` 参数传递给 `make-fixture.sh`，并写入每个 eval case 的 `runtime.sdk`。如果请求已指定版本（“在 SDK 54 上进行 eval”），则跳过检测并使用该版本。

**默认使用最新版本**——它会与 `expo start` 安装到设备上的 Expo Go 保持兼容。如果固定的 SDK 比设备上已安装的 Expo Go *更旧*，`expo start` 会尝试提示“Install the recommended Expo Go version?”；由于没有 TTY（snapshot 脚本从 `/dev/null` 读取 stdin），它会因 `Input is required, but 'npx expo' is in non-interactive mode` 而终止，且**每个 snapshot 都会失败**。因此，只有在你还会预先在模拟器/仿真器上安装匹配的 Expo Go 时，才固定到较旧的 SDK——否则请坚持使用最新版本。

**选择 runner——Expo Go（默认）或开发构建。** 使用 `AskUserQuestion` 询问（如果请求已指定使用哪一种，则跳过）：

- **Expo Go（默认）** — 快照脚本会按原样使用 `expo start --ios` / `expo start --android` 运行应用。速度快（无需原生编译），并且可以运行 Expo Go 捆绑的任何内容（包括 SDK 56+ 上的 `@expo/ui`）。无法运行自定义原生代码（expo-modules、配置插件、Expo Go 中未包含的原生依赖项）。
- **开发构建** — 快照脚本会改用 `expo run:ios` / `expo run:android`，为每个 fixture 编译原生开发客户端。对于输出需要自定义原生代码的 skill（否则会被归为 `static-only` 的情况），请使用此模式。速度慢得多——`expo run` 会对每个 fixture 执行预构建和原生编译（耗时数分钟，尤其是第一次），并且需要完整的 iOS/Android 构建工具链——因此，只有当 skill 确实需要原生代码时才选择此模式。**占用大量磁盘空间：**每个 fixture 的原生构建会占用数 GB 空间。快照阶段会在每个 fixture 完成后运行 `clean-fixture.sh`，将峰值占用量控制在约一个构建的规模，但对于开发构建运行，仍应优先减少评估用例，并使用**单个平台**，同时保留数 GB 的可用空间。`clean-fixture.sh` 会删除每个 fixture 的构建*输出*（`node_modules`、`ios`、`android`、`.expo`、`dist` 以及该 fixture 的 iOS DerivedData），并保留应用源代码和 git。控制开发构建磁盘占用的关键是**减少评估用例 + 使用单个平台**——它只会回收每个 fixture 的构建输出，绝不会触及共享依赖缓存，因此无需重新下载任何内容。

通过 `EXPO_SKILL_EVAL_RUNNER` 环境变量将所选模式传递给快照脚本（默认为 `expo-go`，也可设为 `dev-build`），并在每个评估用例的 `runtime.mode` 中反映该模式（`expo-go` 或 `dev-build`）。参见第 5 步。

**选择平台——无论是什么 skill，都必须询问。**使用 `AskUserQuestion` 提供 iOS / Android / web（可多选）；默认选择 iOS + Android，但始终要将 web 作为选项提供——不要根据 skill 预先筛选。**对于大多数 skill，Web 都是有效选择**：`@expo/ui` 的*通用*组件（`Host`、`Row`、`Column`、`Button`、`List`，……）可以在 web 上渲染，`expo-dom`、NativeWind/Tailwind、API 路由和普通 React Native 也同样可以。唯一无法在 web 上显示的是*平台特定*的原生树（`@expo/ui/swift-ui` 或 `@expo/ui/jetpack-compose`），它们在那里会渲染为空白——而这种空白本身也是一个有用的信号，因此仍应由用户决定。无论使用哪种 runner，Web 都通过 `snapshot-web.sh`（`expo start --web` + Playwright/Chromium）运行（`expo run` 仅适用于原生平台；不存在 web 开发构建），而且这是经过验证最少的路径。将所选平台集合写入每个评估用例的 `runtime.platforms`，并让 `run_snapshots.py` 遍历这些平台。

**在开始前，仅确认一次 `claude -p` 子进程的运行方式。**使用 `AskUserQuestion` 询问是否可以使用 `--dangerously-skip-permissions` 运行，然后对本次运行中的每个子进程应用相同的答案（切勿在运行中途重复询问）：

- **跳过权限检查（推荐）** — 传递 `--dangerously-skip-permissions`。每个子进程都会在 `/private/tmp/expo-skill-eval-*` 下的一次性 fixture 中以无人值守方式运行，并且可以在不提示的情况下写入文件和运行设置命令。
- **仅接受编辑** — 改为传递 `--permission-mode acceptEdits`。Bash/安装操作会被自动拒绝（无 TTY），因此某些评估可能只生成部分输出。

如果请求中既未指定任一标志，直接使用 `claude -p` 将完全无法写入文件。如果请求已经表明了偏好（“跳过权限检查”“不要使用危险标志”），则无需询问。

**预先一次性确认结果查看器的交付方式。** 发布到 claude.ai 属于对外发布，因此绝不能在运行过程中未经确认突然执行；请在同一个预先发出的 `AskUserQuestion` 中询问（与权限标志问题一起）：

- **仅限本地（默认）** — `generate_viewer.py` 会写入 `viewer.html`，并在本地浏览器中打开它。任何内容都不会离开本机。
- **发布可共享的 Artifact** — 此外，在最后将查看器渲染为 claude.ai Artifact（一个默认私有、用户可与团队成员共享的网页）。只有用户在此明确选择后，才这样做。

如果请求已经说明是否共享/发布，则无需询问。有关发布机制，请参阅 **查看器** 一节。

## 评估用例模式

你需要生成本次运行的评估用例——每个选定的提示对应一个用例——并将它们写入 `<workspace>/iteration-N/evals.json`（查看器会从该位置读取）。每个用例都在标准 skill-creator 评估用例结构的基础上，增加了一个 `runtime` 块和视觉预期：

```json
{
  "id": 1,
  "prompt": "Build me a settings screen with a dark mode toggle and a list of options",
  "expected_output": "Working Expo Router screen",
  "expectations": [
    "Uses Expo Router file-based routing",
    "TypeScript compiles with no errors"
  ],
  "runtime": {
    "mode": "expo-go",
    "platforms": ["ios", "android"],
    "sdk": "56"
  },
  "visual_expectations": [
    "No red error screen or Expo Go error overlay on any platform",
    "A settings screen with a visible toggle control is rendered"
  ]
}
```

- `runtime.mode`：静态门禁通过后评估的运行方式 —
  - `"expo-go"`：在 Expo Go 中运行（`expo start --<platform>`）并截图。速度快，仅使用 JS。**默认。**
  - `"dev-build"`：构建原生开发客户端（`expo run:<platform>`）并截图。适用于输出使用自定义原生代码的 Skill；速度慢得多（每个固件都需要进行原生编译）。
  - `"static-only"`：在静态门禁后停止——适用于不生成 UI 的 Skill，或完全不希望运行设备的情况（CI）。

  请查阅 `references/runtime-matrix.md`，了解哪些仓库 Skill 支持哪些模式。（`dev-build` 让你可以实际运行以前因需要原生代码而只能使用 `static-only` 的 Skill。）
- `runtime.platforms`：`ios`、`android`、`web` 的子集——预先选择（始终提供选择，不受 Skill 限制；参阅 **开始之前**）。默认为 `["ios", "android"]`。
- `runtime.sdk`：固件应用使用的 Expo SDK 主版本——将其设置为预先选择的版本（参阅 **开始之前——明确范围**）。省略则使用最新模板。
- `reference_image`（可选——**图像提示**）：Skill 必须复现的**目标截图**的绝对路径。设置后，执行器会收到指示，要求打开该图像（通过其 Read 工具）并构建匹配的应用；除常规预期外，评分器还会评估生成的应用对该图像的复现程度（第 6 步）。在**提示**阶段通过“根据上传的截图构建”进行设置。

图像提示词用例是设置了 `reference_image` 的普通用例；启用“Runtime + screenshots”，以便测试框架捕获结果并与目标进行比较：

```json
{
  "prompt": "Build an app whose UI matches the attached reference screenshot.",
  "reference_image": "/abs/path/to/target.png",
  "runtime": { "mode": "expo-go", "platforms": ["ios"], "sdk": "56" },
  "visual_expectations": ["Matches the reference's layout, components, and color treatment"]
}
```

## 每个评测用例的流水线

**编排模型——在主线程上，你运行 `python3 <orchestrator>`，除此之外几乎不做任何事情。** 每个阶段都由一个小型 Python 编排器驱动；你使用 `Write` 将其写入工作区，并通过 `python3 /private/tmp/expo-skill-eval-<skill>/<phase>.py` 运行（该命令受 `python3` 规则覆盖）。编排器是调用 `scripts/*.sh` 文件的**唯一**位置——始终通过 `subprocess.run(["bash", "<scripts>/<name>.sh", …])` 调用，该命令作为 `python3` 的子进程运行，不需要单独的规则——也是实现并行处理、日志记录和目录创建的唯一位置。因此，在主线程上你只会：使用 **Write** 编写编排器、使用 `python3` **运行**它们、使用 `Read`/`Glob`/`Grep` 工具**检查**输出，以及**启动评分器子代理**。绝不要将命令放入链式、后台或管道式 shell 结构中，也绝不要临时运行 `mkdir`/`ls`/`cat`/`tail`/`echo`——这些操作会触发提示。（单独运行一次 `bash …/scripts/<name>.sh …` 可用于一次性手动调试，例如重新运行某个偶发失败的快照，但流水线本身必须通过编排器运行。）**在前台运行每个编排器**——让工具调用阻塞，直到其完成；编排器已经在各个阶段*内部*实现了并行处理，因此你不需要让不同阶段重叠运行。不要使用 `… & echo "$!"` / `wait` 将某个阶段置于 shell 后台运行（其中的 `&`、`echo` 和 `wait` 片段没有对应规则，会触发提示）。如果你确实必须在继续其他工作的同时运行某个阶段，请对普通的 `python3 <orchestrator> 2>&1 | tee <ws>/…log` 调用使用 **Bash 工具的 `run_in_background` 参数**——绝不要手工编写 shell `&`。**预期仅在最开始出现一次权限提示：**第一次使用 `Write` 写入工作区时。`allowed-tools` 可以抑制 `Bash`/`Read` 的提示，但不能抑制 `Write`/`Edit` 的提示，因此请在第一次提示时选择 **“allow all edits in this directory for the session”**——这会覆盖整个运行期间的所有编排器、`evals.json` 和查看器文件。

### 0. 工作区设置

使用工作区脚本一次性创建本次运行的目录树——**绝不要临时使用 `mkdir`**（直接运行 `mkdir` 会触发提示：不存在 `mkdir` 规则，而且 `"$WORKSPACE/…"` 变量无论如何都无法匹配路径 glob）：

```bash
bash /abs/path/expo-skill-eval/scripts/make-workspace.sh /private/tmp/expo-skill-eval-<skill> iteration-N <num-evals>
```

这会为每个评测创建 `trigger-evals/scratch` 和 `iteration-N/eval-<i>/{with_skill,without_skill}/outputs`。该操作受 `Bash(bash *expo-skill-eval/scripts/*)` 覆盖，并且脚本内部的 `mkdir` 作为脚本的子进程运行（无需单独的规则）。此后，其他所有目录都由需要它们的脚本/编排器（`make-fixture.sh`、执行器编排器的 `os.makedirs`、快照脚本）创建，或者由 `Write` 工具在自动创建父目录时创建——因此你无需再使用任何 `mkdir`。

### 1. 触发评估（仅应触发）

在工作区的 `trigger-evals/` 目录下编写一个 `run_trigger_eval_real.py` 脚本。**仅使用 `"should_trigger": true` 查询**——expo 插件由一组互补的技能构成，因此同一个提示词触发多个技能并不算失败。只衡量召回率：使用实际应调用该技能的提示词，并按触发率评分。

该脚本应针对每个查询运行 `claude -p <query>`（使用 `--output-format=stream-json --verbose --include-partial-messages`，从环境变量中移除 `CLAUDECODE`，并预先确认在**开始之前——明确范围**中指定的权限标志），然后通过监视流中是否出现目标技能的 `Skill` 或 `Read` 工具调用，检测该技能是否被触发。注意：`--include-partial-messages` 要求同时使用 `--output-format=stream-json` 和 `--verbose`——缺少任意一个都会立即导致 CLI 错误。

**加载待测试的技能——向每个触发子进程传递 `--plugin-dir`。** 触发评估衡量的是技能的*描述*是否会促使模型调用它，因此子进程必须加载**本地**技能（包含你的编辑的版本）。`claude -p` 子进程不会继承父会话的 `--plugin-dir`，所以请显式添加它：`--plugin-dir <plugin-root>`，其中 `<plugin-root>` 是拥有该技能的插件目录的**绝对**路径——即包含 `.claude-plugin/plugin.json` 的 `plugins/expo` 祖先目录（例如 `--plugin-dir /Users/.../skills/plugins/expo`）。该路径必须是绝对路径：子进程会从临时的 `scratch/` 工作目录运行，因此相对路径 `plugins/expo` 无法解析——而缺失的插件目录会悄无声息地不加载任何内容，从而伪装成 0% 的触发率。然后监视技能是否以其插件限定名称触发（`<plugin>:<skill>`，例如 `expo:expo-ui`）。有两个注意事项：(1) 如果**已发布的** `expo` 插件也已全局安装，请在本次运行期间将其禁用（通过 `/plugin`），并在运行后重新启用——否则两个 `expo` 副本会在子进程中发生冲突，模型可能会触发*已发布的* `expo:expo-ui`，从而在不知情的情况下对其描述进行评分，而不是对你的本地编辑进行评分（触发检测只能看到工具调用名称，因此无法区分这两个副本；开发检出环境通常不会安装它）。(2) 切勿创建该技能的合成副本——真正加载的副本始终会胜出，因此合成测试工具的评分会是 0%。（执行器不受已安装插件的影响：它们直接读取本地 `SKILL_PATH`，且不传递 `--plugin-dir`。）

从一个空的临时工作目录（例如 `trigger-evals/scratch/`）运行每个查询的子进程，而不是从仓库根目录运行。像“为我构建一个设置页面”这样的应触发提示词可能会让子进程写入文件，而使用 `--dangerously-skip-permissions` 时，这些写入操作原本会落到技能仓库中。触发检测只需要技能的 `Skill`/`Read` 调用出现在流中——不需要夹具——因此任何附带写入的内容都可以直接丢弃。

将每个查询的子进程超时时间设为至少 **300 秒**。180 秒的限制太短——某些查询会导致模型在触发技能之前先开始生成代码，从而使总运行时间超过 3 分钟。

每个 skill 只运行一次触发评估，而不是为每个代码评估用例运行一次。

### 2. 固定测试环境

每次执行器运行都会获得一个全新的 Expo 应用，该应用由 `scripts/make-fixture.sh <app-path> <sdk> [clean|full]` 创建：

```bash
scripts/make-fixture.sh <workspace>/iteration-N/eval-X/<config>/app <sdk>          # blank app (default)
scripts/make-fixture.sh <workspace>/iteration-N/eval-X/<config>/app <sdk> full     # keep example tabs
```

该脚本使用 `bunx create-expo-app -t default@sdk-<version>`（未指定版本时则使用最新模板），针对每个 SDK 版本与变体组合创建一次应用，将其缓存在 `~/.cache/expo-skill-eval/fixtures/` 下，并使用 APFS 写时复制机制克隆缓存——因此，每个变体的首次运行需要承担安装成本，而之后的每次运行都近乎瞬间完成。默认的 `clean` 变体会运行模板的 `reset-project` 脚本，因此执行器会从空白应用开始，输出中的每个屏幕都由执行器创建——这能提供干净得多的评分信号。仅当评估提示假定已有应用时（例如“我有一个包含两个标签页的应用……”）才使用 `full`。该脚本还会在克隆中重置 git，因此应用内的 `git diff` 会准确显示执行器所做的更改（可作为评分器的有用证据）。

**依次构建固定测试环境，然后再扇出执行器——绝不要并发创建固定测试环境。** `make-fixture.sh` 会共享 `~/.cache/expo-skill-eval/fixtures/` 下按 SDK+变体划分的缓存。如果两次运行都发现缓存尚未建立，并同时调用 `bunx create-expo-app`，bun 的链接步骤就会发生冲突，其中一个会因 `EEXIST` / “could not determine executable to run for package create-expo-app”而失败。因此，在执行器编排器（步骤 3）中，首先逐个创建**所有**固定测试环境——使用一个普通的 Python 循环调用 `subprocess.run(["bash", "<scripts>/make-fixture.sh", app, sdk, variant])`（其中 `sdk` 是预先选定的版本）——*然后*使用 `ThreadPoolExecutor` 扇出 `claude -p` 执行器。顺序创建的开销很低：每个 SDK+变体仅第一个固定测试环境需要承担安装成本，其余都是约 1 秒完成的 APFS 克隆。（并且绝不要使用 `make-fixture.sh A & make-fixture.sh B & wait` 之类的临时 shell 命令来扇出固定测试环境——`&`/`wait` 片段会触发提示；顺序执行的 Python 循环既能避免竞态，也能避免提示。）

### 3. 生成（执行器子代理）

通过 Python 脚本将执行器作为 `claude -p` 子进程调用来运行，**不要**使用 `Agent` 工具。`Agent` 工具会生成拥有独立权限上下文的子代理——在固定测试环境应用内编辑文件时会提示用户。`claude -p` 子进程是一个完全位于权限系统之外的独立进程（与触发评估工具所使用的模式相同）。

将 Python 脚本写入 `/private/tmp/expo-skill-eval-<skill>/run_executors.py`。**首先在顺序循环中创建每次运行所需的固定测试环境**——逐个执行 `subprocess.run(["bash", "<scripts>/make-fixture.sh", app, sdk, variant], …)`（并发创建会导致共享的 bun 缓存发生竞态——参见步骤 2）。**然后**通过 `ThreadPoolExecutor` 并行运行包含 skill 和不包含 skill 的 `claude -p` 调用。两个阶段都在 Python 内部运行（受 `python3` 规则覆盖），因此不会在主线程上以临时 shell 命令的形式运行任何内容。每个执行器提示都必须包含：

- 技能路径（仅用于 with-skill 运行）和评测提示词。
- **图像提示词用例（已设置 `reference_image`）：**目标截图的绝对路径，以及类似这样的指令：“使用 Read 工具打开位于 `<path>` 的参考截图，并构建一个 UI 与其尽可能匹配的应用——包括布局、组件、间距和颜色。”（`claude -p` 可以渲染以这种方式读取的 PNG，因此执行器实际上能够看到目标图像。）
- 固定测试应用路径：“在 `<app-path>` 内进行更改。项目已存在且依赖项已安装。所有文件操作均使用绝对路径。”
- “在写入任何文件之前，先检查项目布局——运行 `ls`，读取 `package.json` 和 `app.json`——以找到正确的路由目录。近期 SDK 的默认模板将 Expo Router 路由放在 `src/app/` 中；旧版模板则使用项目根目录下的 `app/`——请检查并确认此固定测试应用使用的是哪一种。”
- “不要启动开发服务器、启动模拟器或截取屏幕截图——测试工具会在你完成后执行这些操作。”
- 保存所构建内容简短摘要的位置。

`claude -p` 子进程的标志：
- 从环境中移除 `CLAUDECODE`（`env = {k: v for k, v in os.environ.items() if k != "CLAUDECODE"}`）——否则，当嵌套在正在运行的 Claude Code 会话中时，`claude -p` 会无提示地挂起。
- 一个事先与用户确认的权限标志（参见 **开始之前——明确范围**）：`--dangerously-skip-permissions` 或 `--permission-mode acceptEdits`。将选定的标志写入生成的脚本。若仅使用 `claude -p` 而不带这两个标志中的任何一个，它将无法写入文件——因为它没有 TTY 来批准编辑，并且会改为以文本形式输出代码。
- **不要向执行器传递 `--plugin-dir`**（这与触发评测不同）。with-skill 运行已经通过绝对路径 `SKILL_PATH` 读取技能，因此它会直接测试本地内容；而 without-skill 运行必须完全无法使用任何技能——加载插件会让技能自动触发并污染基线。让执行器继续基于路径运行，也能清晰地区分两个问题：执行器衡量的是*内容质量*（技能一旦被读取，是否有用？），触发评测衡量的是*触发能力*（描述是否能让该技能被选中？）。

将每次运行的 stdout/stderr 捕获到固定测试应用旁边的日志文件中，作为评分证据。将每个执行器的超时时间设置为 900 秒——with-skill 运行会在编码前读取多个参考文件，通常需要 5–10 分钟。

### 4. 静态检查关卡

编写 `run_static.py` 并使用 `python3` 运行。对于每个评测/配置应用，它通过 `ThreadPoolExecutor` 调用 `subprocess.run(["bash", "<scripts>/check-static.sh", app, "ios,android"], capture_output=True, …)`（各静态检查关卡彼此独立——应在 Python *内部*并发运行，绝不要使用 shell 的 `&`/`wait`），并将每个结果写入 `eval-<i>/<config>/static.json`（退出码 + 捕获的输出），供评分器使用。

`check-static.sh` 会针对列出的平台运行 `tsc --noEmit`、`expo lint` 和 `expo export`。导出成功可以在不接触设备的情况下发现大多数导入、语法和模块缺失问题；导出失败则会以明确的 FAIL 提前终止第 5 步——记录该结果，并让快照编排器跳过该应用。

### 5. 运行 + 截图（跨评测串行执行）

编写 `run_snapshots.py` 并使用 `python3` 运行。模拟器和仿真器是共享资源，因此该编排器采用**串行**方式运行（无线程池）：对于每个通过静态门禁的应用及每个平台，它会使用 `os.makedirs` 创建 `outputs/` 目录，并调用 `subprocess.run(["bash", "<scripts>/snapshot-<platform>.sh", app, f"{outputs}/<platform>.png", port], env={**os.environ, "EXPO_SKILL_EVAL_RUNNER": runner}, …)`。将端口作为位置参数传递：iOS 使用 `8081`，Android 使用 `8082`——`expo run:ios/android --port N` 受支持，而使用不同端口可让你在将来进行并行化时同时运行两个平台，且不会发生端口冲突。截图会保存到该次运行的 `outputs/` 目录中，以便查看器以内联方式渲染它们。

**在每个夹具运行后回收磁盘空间——这对于 `dev-build` 运行至关重要。** 为某个应用捕获完所有选定平台的截图后（并且在构建下一个夹具之前），调用 `subprocess.run(["bash", "<scripts>/clean-fixture.sh", app])`。每次 `expo run:<platform>` 都会留下数 GB 的原生构建输出（iOS Pods + DerivedData、Android Gradle 构建）；如果不进行清理，评测 × 配置 × 迭代产生的文件会不断累积，并在运行途中填满磁盘（你看到的不稳定现象其实就是磁盘被填满）。`clean-fixture.sh` 会删除体积较大且可重新生成的目录（`node_modules`、`ios`、`android`、`.expo`、`dist`）以及该夹具的 iOS DerivedData，同时保留应用源代码和 git，以便评分器的 `git diff` 仍然可用。通过串行截图和逐夹具清理，峰值磁盘占用可维持在约一个夹具的构建大小，而不是所有夹具的总和。（这对 `expo-go` 运行也无害——只是几乎没有什么可回收的内容。）

`runner` 是预先作出的选择（默认为 `expo-go`，也可以是 `dev-build`）。快照脚本会遵循 `EXPO_SKILL_EVAL_RUNNER`：`expo-go` 使用 `expo start --<platform>` 启动（并执行 Expo Go 安装/深层链接流程）；`dev-build` 使用 `expo run:<platform> --port <port>` 启动，它会编译并安装原生开发客户端，同时跳过 Expo Go 相关步骤。脚本已将 `dev-build` 的超时时间默认设置为 900 秒，但如果首次原生编译需要更长时间，请提高 `EXPO_SKILL_EVAL_BUNDLE_TIMEOUT`。`make-fixture.sh` 会在每个夹具中预先安装 `expo-dev-client`，以便在 `expo run` 尝试通过深层链接打开应用之前注册开发客户端 URL scheme。

**快照脚本始终捕获初始路由 `/`。** 它们通过深层链接打开应用并截取一张屏幕截图——无法点击或导航。请设计评测提示词，使受测功能呈现在根路由上。如果执行器将主 UI 放在某个导航操作之后（例如在索引页上放置一个“打开设置”按钮），快照将完全无法捕获该功能，并且所有视觉预期都会失败。

每个 `snapshot-<platform>.sh` 都会**在启动时释放其 Metro 端口**（终止先前运行崩溃后遗留在该端口上的所有陈旧进程），并在退出时关闭 Metro——因此你完全不需要自行运行 `lsof`/`kill`/`pkill` 来清理端口（这些操作会触发提示，而且脚本已经处理好了）。随后，它会启动 Metro，等待 Metro 日志中出现“Bundled”行，等待系统稳定，截取屏幕截图，然后关闭 Metro。如果没有已启动的模拟器，iOS 会启动最新的可用 iPhone 模拟器；如果没有连接设备，Android 会启动第一个 AVD（这是较慢的路径——只需启动一次，即可在整个迭代过程中复用）。Android 首先会**回收卡死或处于 `offline` 状态的仿真器**（先执行优雅的 `adb emu kill`，然后强制终止并重置 adb），防止半死不活的实例破坏本次运行，并使用**硬件 GPU**（`-gpu host`，在 Apple Silicon 上由 Metal 加速）启动。如果 `host` 会导致仿真器在某台机器上自行中止（qemu 在 gfxstream/Metal 深处触发 `SIGABRT`——在高负载下的 Apple Silicon 上可能发生），请将 `snapshot-android.sh` 中的 `GPU_MODE` 编辑为软件模式（`guest` 渲染可靠但速度较慢——请增加稳定等待时间；避免使用 `swiftshader_indirect`，它在 arm64 上**会在启动时卡死**）。仅当 `platforms` 包含 web 时，才会运行 `snapshot-web.sh`。每个脚本都会在截图旁写入一份 Metro 日志（`<name>.metro.log`）——请将其包含在评分器的输入中。如果脚本以非零状态退出，它仍会尽最大努力截取屏幕截图（错误屏幕也是证据）。**dev-build 重新启动：**Metro 启动后，脚本会分别通过 `xcrun simctl launch`（iOS）和 `adb shell am start -n <pkg>/.MainActivity`（Android）重新启动应用——两者都可避免 URL scheme 深层链接在首次启动时触发的“Open in X?”系统对话框。

捕获完本次迭代的所有截图后，始终生成查看器——将工作区根目录传给仓库中已检入的脚本：

```bash
python3 /abs/path/expo-skill-eval/scripts/generate_viewer.py /private/tmp/expo-skill-eval-<skill>
```

该脚本会将 `viewer.html` 写入工作区根目录（位于 `iteration-N/` 上一级），并自行在浏览器中打开它（通过 `webbrowser.open`）——因此不需要单独执行 `open` 命令（也不需要 `Bash(open:*)` 规则）。请参阅下方的 **查看器** 部分。

### 6. 评分

在前台启动一个评分器子代理。其提示词必须包含：

- 评测用提示词、预期列表，以及评测用例中的 visual_expectations。
- `agents/visual-grader.md` 中的说明（截图评分、红框检测）。
- 作为输入的截图文件、Metro 日志，以及第 4 步生成的 `static.json`。
- **图像提示词用例**（用例包含 `reference_image`）：还要包括**目标截图**（`reference_image`）、`references/design-rubric.md`，以及固件的 `git diff`。指示评分器将生成的截图与目标进行比较，并输出下方的 `reference_match` + `quality` 块。

评分器会在输出文件旁写入具有以下结构的 `grading.json`：
```json
{
  "score": 8.5,
  "max_score": 9,
  "expectations": [
    {"text": "...", "passed": true, "evidence": "..."}
  ],
  "reference_match": {
    "score": 7, "max": 10,
    "evidence": "ios.png vs target.png: same two-section grouped list + toggle; accent color differs (blue vs target's green); row spacing tighter than target"
  },
  "quality": {
    "dimensions": [
      {"name": "Layout & hierarchy", "score": 2, "max": 3, "evidence": "ios.png: …"}
    ],
    "subtotal": 17,
    "max": 24,
    "summary": "…"
  },
  "user_notes_summary": {"needs_review": false, "notes": ""}
}
```
视觉预期应放入同一个 `expectations` 数组中，证据需指明截图文件，并描述其中可见的内容。`reference_match` 块（生成的应用与目标截图的还原接近程度）和 `quality` 块（依据 `references/design-rubric.md` 给出的设计标准分数）**仅针对图像提示词用例**输出——或在明确要求质量评分时输出。对于纯文本提示词运行，应省略这两个块。

## 推进阶段

按以下顺序构建并调试流水线——每个阶段本身都能独立发挥作用：

1. **静态**：仅执行第 1–4 步（所有内容均使用 `runtime.mode: "static-only"`）。无需设备；适合 CI。
2. **iOS**：将 `snapshot-ios.sh` 加入循环。`simctl` 是最便于脚本化的目标。
3. **Android**：添加 `snapshot-android.sh`。模拟器启动是最慢的环节——在整个会话期间保持一个模拟器持续运行。
4. **Web**：对于以 Web 为目标的技能，添加 `snapshot-web.sh`（通过 `bunx` 使用 Playwright；首次运行会下载 Chromium）。

## 实用说明

- **临时位置**：所有评测工作区均位于 `/private/tmp/expo-skill-eval-<skill-name>/iteration-N/` 下。本次运行中的所有操作——`Read`、`Write`、`Edit` 和 `Bash`——均受 `allowed-tools` frontmatter 约束，因此正确加载的技能可以在不弹出提示的情况下运行。
- **权限规则形式（此技能为何能保持不弹出提示）**：规则的*语法*非常重要，并且两个工具系列的行为不同：
  - **`Bash(...)` 规则——路径范围限定为技能自身的代码（不允许宽泛的解释器调用）。** `Bash(python3 /private/tmp/expo-skill-eval-*)`（外加 `/tmp` 别名）用于运行你在工作区下生成的 Python 编排器；`Bash(python3 *expo-skill-eval/scripts/*)` 用于运行仓库中已检入的 `scripts/generate_viewer.py`；`Bash(tee /private/tmp/expo-skill-eval-*)`（加上 `/tmp`）允许 `python3 … 2>&1 | tee <workspace>/…log` 在不弹出提示的情况下写入日志；`Bash(bash *expo-skill-eval/scripts/*)` 仅运行此技能的 `scripts/*.sh`。由于每个路径都被固定限定，规避限制的入口仍会被拒绝：`python3 -c …`、`bash -c …`、`tee /etc/…`，以及在其他任何位置运行代码都**不会**匹配（已通过实证验证——范围限定规则允许 `bash <dir>/run.sh`，但会阻止 `bash -c …` 和任何其他路径）。脚本内部调用的命令——`bunx`、`xcrun simctl`、`adb`、`git`、`mkdir`、`expo`——是脚本的子进程，而不是 Bash 工具调用，因此不需要规则。不要从主线程临时运行 `mkdir`/`ls`/`find`/`cat`/`grep`（它们没有对应规则，会弹出提示——而且原始的 `mkdir "$WORKSPACE/…"` 无法匹配路径 glob，因为路径是一个尚未展开的变量）：使用 `make-workspace.sh`（第 0 步）创建目录树，让编排器创建自己的目录（`os.makedirs`），并且**使用 `Read`/`Glob`/`Grep` 工具检查结果**（无需 Bash 规则）。
  - **Bash 规则匹配（已测试，但并不直观）：** Bash 规则是针对命令字符串的 gitignore 风格 glob。`*` 匹配任意长度的字符序列，**包括 `/` 和空格**，并且可以在**模式中间**使用——因此 `Bash(python3 /private/tmp/expo-skill-eval-*)` 可以匹配 `python3 /private/tmp/expo-skill-eval-x/run.py 2>&1`，而 `Bash(bash *expo-skill-eval/scripts/*)` 可以匹配 `bash /any/abs/path/expo-skill-eval/scripts/foo.sh args`。先前尝试中遇到过两个问题：`**` 会被**按字面量匹配**（切勿在 Bash 规则中使用它），而 `:*` 后缀仅在紧跟命令标记时有效（`Bash(python3:*)`）——在部分路径之后则**无效**（`Bash(python3 /path-:*)` 不匹配）。复合命令会按 `|`、`&&`、`||`、`;`、`&` 拆分，并且每一段都需要有自己的匹配规则。
  - **`Read` 规则会抑制提示；`Write`/`Edit` 规则则*不会*。** 这是 Claude Code 的一种非对称行为（不是模式错误，也不是重载问题——在同一会话中，来自相同 frontmatter 的 `Bash`/`Read` 规则显然正常工作，但 `Write` 仍然会弹出提示）：无论 `allowed-tools` 如何设置，文件创建/编辑始终要经过 Claude Code 的编辑审批流程。frontmatter 仍将 `Read`/`Write`/`Edit` 的范围限制为 `…/expo-skill-eval-*/**`（同时包括 `/tmp` 和 `/private/tmp` 两种形式，因为 macOS 不会自动解析该符号链接），以此作为文档说明和防护措施，但这些 `Write`/`Edit` 条目本身无法消除提示。**实际影响：**运行开始时，工作区会出现**一次** Write 提示——选择 **"Yes, allow all edits in this directory for the session"**，此后该工作区下的所有编排器 / `evals.json` / 查看器写入操作都会静默完成。真正让文件写入不再弹出提示的是这一次目录批准，而不是规则。
  - **编辑 frontmatter 后需要重载——必须完全重启，而不是使用 `/reload-skills`。** `allowed-tools` 仅在会话开始加载技能时读取一次；`/reload-skills` 会重新加载技能*正文*，但**无法**可靠地刷新权限规则。编辑此文件后，**完全退出 Claude Code 并启动一个新会话**，然后重新运行该技能——否则，即使磁盘上的文件正确，陈旧的（已缓存）规则集仍会继续弹出提示。
  - **评分器子代理**在自己的权限上下文中运行，仍然会针对文件访问弹出提示——这是预期行为，与主线程的规则相互独立。
- **调用评测脚本——每次仅执行一条独立命令，绝不串联。** 使用绝对路径，将每个脚本作为单独的 Bash 调用执行：`bash /abs/path/expo-skill-eval/scripts/snapshot-ios.sh arg1 arg2`（受 `Bash(bash *expo-skill-eval/scripts/*)` 覆盖）。不要将其与 `&`、`&&`、`||`、`;`、`wait`、`tail`、`head` 或 `echo` 组合使用——复合命令会逐段检查，而这些额外的命令段没有对应规则，因此即使 `bash …/scripts/…` 部分被允许，整条命令仍会弹出提示。（唯一允许的管道是 `… 2>&1 | tee <workspace>/…log`，因为范围限定的 `tee` 规则涵盖了它。）需要并行处理或截断输出？请将逻辑放入 Python 编排器（受 `python3 /…/expo-skill-eval-*` 覆盖），由它通过 `ThreadPoolExecutor` 跨线程使用 `subprocess` 运行脚本。使用 `Read`/`Glob`/`Grep` 工具检查结果，而不是 `cat`/`ls`/`grep`。**通用规则：在此技能的严格范围限制下，代理临时拼出的任何 shell 命令都会弹出提示——解决方法是将它移入脚本/编排器（或使用范围限定的 `tee`），绝不要扩大规则范围。**
- **检查输出（截图、日志、文件）——使用工具，而不是 shell。** 使用 **Glob** 工具查找文件（例如 `/private/tmp/expo-skill-eval-<skill>/iteration-N/**/ios.png`）；使用 **Read** 工具查看文件——Read 会以可视化方式渲染 PNG，这正是确认截图是否成功渲染所需要的功能。使用 **Grep** 搜索文件内容。切勿为此使用 `find`/`ls`/`cat`：它们会弹出提示，并且 `find … -exec …` 被有意设为*不允许*，因为其 `-exec` 可以运行任何内容（例如 `-exec rm`）。这些工具的使用范围已受限制，且不会弹出提示；每当你原本想输入 `find`/`ls`/`cat` 时，都应改用这些工具。
- **生成的 Python 脚本**：将编排/聚合脚本写入工作区下（例如 `/private/tmp/expo-skill-eval-<skill>/aggregate.py`），并使用 `python3` 运行它们（受 `Bash(python3 /private/tmp/expo-skill-eval-*)` 覆盖）。查看器是例外——它使用仓库中已检入的 `scripts/generate_viewer.py`，通过 `Bash(python3 *expo-skill-eval/scripts/*)` 运行。`Write` 会自动创建父目录，但首次使用时会弹出提示——只需批准工作区目录一次（参见上方关于 `Write`/`Edit` 的说明）。捕获输出时，可以让脚本自行写入日志，也可以使用 `python3 … 2>&1 | tee <workspace>/…log`（受范围限定的 `tee` 规则覆盖）；使用 `Read` 工具读取日志。不要使用 `python3 -c …` 进行设置（范围限定规则仅匹配工作区脚本的*路径*，因此单独使用 `-c` 会弹出提示）。

- **触发评测与已安装插件**：在流中检测实际安装的 skill 名称（例如 `expo:expo-ui`）——安装真实插件后，合成副本测试工具的得分始终为 0%，因为模型会选择真实 skill，而不是合成副本。
- **基准测试聚合**：将每次运行的 `grading.json` 和 `timing.json` 保存到 `eval-<N>/<config>/run-1/` 下。在工作区中编写 Python 聚合脚本，并使用 `python3` 运行。
- **Expo Go 的能力上限**：任何需要自定义原生代码的功能（expo-module、App Clips、brownfield）都无法在 Expo Go 中运行。对于这些功能，请使用 `static-only` 模式——在为某个 skill 编写评测用例之前，请参阅 `references/runtime-matrix.md`（注意：`@expo/ui` 在 SDK 56+ 上*确实*可以在 Expo Go 中运行）。
- **API 路由类 skill**：不要使用截图，而应在 Metro 运行期间使用 `curl` 请求该路由进行验证；将响应记录为输出文件以供评分。
- **计时数据**：每次执行器运行后，立即将 token 数量和持续时间记录到 `timing.json` 中——之后无法恢复这些数据。要捕获 token 数量，请在执行器的 `claude -p` 调用中添加 `--output-format=stream-json --verbose`，并解析日志中的 `message_start` / `message_delta` 事件。若不使用这些标志，日志中只会包含自然语言文本，而经过的秒数将是唯一可恢复的指标。
- **首次启动对话框**：Expo Go 偶尔会在全新的模拟器上显示一次性提示。如果截图捕获的是对话框而不是应用，请重新运行快照脚本（它会重新打开 URL），然后重新截图。

## 查看器

截图完成后，始终生成并打开 HTML 查看器，以便用户无需提出请求即可立即查看结果。查看器是已检入的 `scripts/generate_viewer.py`——以工作区根目录作为参数运行：

```bash
python3 /abs/path/expo-skill-eval/scripts/generate_viewer.py /private/tmp/expo-skill-eval-<skill>
```

它会生成一个自包含的 `/private/tmp/expo-skill-eval-<skill>/viewer.html`，并自行在浏览器中打开该文件（`webbrowser.open`）。它会渲染：
- 每次迭代对应一个标签页（工作区根目录下的 `iteration-*`；使用 `localStorage` 记住最后激活的标签页）。
- 对于每个评测用例（从 `<iteration>/evals.json` 读取）：并排显示 with_skill / without_skill 两列，每列均显示静态门禁状态、分数、各平台截图（点击可缩放；以 base64 `data:` URI 的形式嵌入，使文件能够自包含）、带有 PASS/FAIL 徽章的预期结果列表，以及审核者备注。
- 对于**图像提示词用例**（包含 `reference_match` / `quality` 的 `grading.json`）：在生成的截图旁显示**目标截图**、`reference_match` 分数（生成结果与目标的对比）、每种配置的 `quality` 评分标准（每个维度对应一个进度条，显示其得分/满分以及小计），以及摘要栏中与正确性差值并列显示的 **quality 差值**（with_skill − without_skill 小计）。
- 包含 with_skill 百分比、without_skill 百分比和差值的摘要栏。
- 当 `trigger-evals/trigger_results.json` 存在时，显示触发准确率表格。
- 使用深色背景，并通过颜色标示分数（绿色 ≥85%，琥珀色 ≥65%，低于该值则为红色）。

### 发布查看器（仅在预先选择加入的情况下）

本地 `viewer.html` 始终会生成。**仅当用户在预先确认时选择了“发布可共享的 Artifact”**，才在最后将其额外渲染为 claude.ai Artifact——切勿在未获得该选择加入许可的情况下发布（它会面向外部，而且已发布的页面可能会被缓存/编入索引）。具体机制：

- `Artifact` 工具会将文件包装在其自身的 `<!doctype html>…<head></head><body>` 骨架中，因此传给它的文件必须**仅包含页面内容**——可以包含内联 `<style>`/`<script>`、base64 `data:` 图像以及 `<title>`，但其自身**不能**包含 `<!DOCTYPE>/<html>/<head>/<body>` 标签（完整的独立文档会被重复包装，从而导致渲染错误）。
- 添加 `--artifact` 后，脚本会输出适用于 Artifact 的变体：`python3 /abs/path/expo-skill-eval/scripts/generate_viewer.py /private/tmp/expo-skill-eval-<skill> --artifact` 会写入 `viewer_artifact.html`（内容相同，但移除了骨架，并且不会打开浏览器）。将该文件而非独立版本传给 `Artifact` 工具（`favicon: "📊"`）。
- 查看器已是自包含的（base64 截图、内联 CSS/JS），因此符合 Artifact CSP 的要求（不使用外部主机）。

## 参考资料

- `references/runtime-matrix.md` — 各 Skill 的运行时适用性（expo-go 与仅静态模式、平台说明）。
- `agents/visual-grader.md` — 面向评分器子代理的截图评分说明。