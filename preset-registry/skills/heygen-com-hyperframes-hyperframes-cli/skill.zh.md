---
name: hyperframes-cli
description: >
  Use the HyperFrames CLI development loop: init, add, catalog, capture, lint, check, snapshot,
  compare, grade-compare, preview, play, present, beats, keyframes, single or batch render, publish,
  cloud, cloudrun, feedback, lambda, doctor, browser, info, upgrade, skills, compositions, docs,
  benchmark, telemetry, transcribe, auth, tts, and remove-background. Also use when diagnosing build
  or render failures. validate, inspect, and layout are deprecated aliases; use check. Covers local,
  HeyGen-hosted cloud, AWS Lambda, and Google Cloud Run rendering.
---
# HyperFrames CLI

运行命令时使用 `npx hyperframes ...`，除非项目说明提供了包装器。存在包装器时，遵循包装器的要求。CLI 要求 Node.js 22 或更高版本以及 FFmpeg。

## 开发循环

1. **搭建：** 使用 `npx hyperframes init <project>` 或捕获网站。在非 TTY 模式下，传递 `--non-interactive --example=<name>`。
2. **寻找动作：** 在手动编写动效之前，先搜索是否已有能实现该效果的图元：`npx hyperframes catalog --query "reveal a headline one line at a time"`。描述你想要的效果，而不是你脑中设想的实现机制。使用 `npx hyperframes add <name>` 安装（参见 `/hyperframes-registry`）。只有在没有合适选项时才手动编写。
3. **编写：** 使用 `/hyperframes-core` 编写合成。
4. **编辑时快速反馈：** 完成第一轮 HTML 后以及结构发生变化后，运行 `npx hyperframes lint`。
5. **运行最终检查：** 运行 `npx hyperframes check`；它会在打开浏览器前重新运行 lint。不要再额外添加一次单独的 lint 调用。添加 `--snapshots` 以生成带注释的概览帧和问题裁剪图。
6. **检查子合成：** 当 `index.html` 挂载 `data-composition-src` 时，捕获中点快照并检查每个已挂载的场景。
7. **打开最终 Studio 预览：** 运行 `npx hyperframes preview`，将时间线项目 URL 提供给用户，并询问是否要修改或渲染。
8. **仅在获得批准后渲染：** 迭代时使用草稿质量，交付时使用高质量。
9. **验证输出：** 确认文件存在、非空且时长合理。

## 创建者编辑交叉引用要求

- 在编写或诊断缩放、推近/拉远、重新构图、摄像机移动或任何关键帧动效之前，先阅读 `/hyperframes-keyframes`。
- 在使用 `hyperframes keyframes` 之前，先阅读 `/hyperframes-keyframes`；该命令会展示动画轨迹，但不会诊断片段剪切。
- 对于剪切、修剪、拼接、重新排序或源时间编辑，请阅读
  `/hyperframes-core` 并使用其中的片段/时间线契约。
- 对于淡入/淡出、交叉淡化、轨道增益、音量自动化、闪避、画外音切割或应用于已放置音频的 FX，请阅读 `/hyperframes-audio`。如果片段放置或画面时间也发生变化，则同时加载 core。
- 仅使用 `/media-use` 来获取/生成媒体或预处理派生资源。
  从 `/hyperframes-core` → `references/creator-editing-recipes.md` 复制创建者编辑标记。

```bash
# Fast iteration check; repeat while authoring as needed.
npx hyperframes lint

# Required final gate; includes lint.
npx hyperframes check
npx hyperframes preview
npx hyperframes render --quality high --output out.mp4
test -s out.mp4
ffprobe -v error -show_format out.mp4
```

`check` 会先运行 lint，然后使用一次浏览器会话和一次定位遍历来审计运行时错误、请求失败、布局、`*.motion.json` 断言以及 WCAG 对比度。持续存在的问题会影响退出代码；短暂的入场或出场问题仅提供信息。使用 `--strict` 可将警告纳入检查门槛。`validate`、`inspect` 和 `layout` 仍作为兼容性别名保留，但不得出现在新的说明或脚本中。

## 两种不同的预览界面

不要混淆以下状态：

| 界面                     | 何时可能打开                                             | 用途                                                                            |
| ------------------------ | -------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Storyboard board          | 构图检查之前，且仅当 `storyboard: yes` 时                  | 查看计划卡片和线框草图。打开 `?view=storyboard#project/<name>`。                 |
| Final composition preview | `check` 通过之后                                          | 在渲染前查看组装完成的时间线。打开 `#project/<name>`。                           |

早期画板并不代表最终视频已获批准。渲染始终需要 `hyperframes-core/references/review-loop.md` 中定义的最终批准。

## 子构图冒烟测试

静态审计无法捕获每一种挂载失败。当项目使用子构图时，为每个宿主插槽至少捕获一个可见的中点画面：

```bash
npx hyperframes snapshot --at <t1>,<t2>,<t3>
```

将细小的未样式化内容、与画布同尺寸的图标、缺失的主体元素或时间线注册超时视为会阻塞渲染的挂载缺陷。相应的修复方法请参见 `hyperframes-core/references/sub-compositions.md`。

## Agent 约定

- **先搜索目录，再手动编写动效。** `npx hyperframes catalog --query "<the beat, in plain English>"`。搜索完全在本地进行：没有托管层、无需账户，查询文本也不会被发送到任何地方。默认情况下，它根据与条目名称、标题和描述共用的词汇进行排序，因此无法匹配没有复用目录自身措辞的表达。添加 `--on-device` 后则会改为按含义排序（见下方的离线层）。
- **即使视频不是英文，也要使用英文查询。** 两个层都建立在英文目录的索引之上，因此使用其他文字的查询不会产生可搜索词，也不会返回任何结果。用英文描述动效；屏幕上的文案则保持视频所需的语言。`No searchable words in query` 的含义就是如此，并不表示缺少组件，因此不要将其报告为目录缺口。
- **读取实际响应的层；绝不要根据是否出现结果来推断。** 使用 `--json` 时，返回的封装包含 `query`、`tier`（`on-device` 或 `words`）、`tier_detail`、`dropped`、`unindexed`、`shown`、`total` 和 `results`；当响应层产生 `top_score` 时还会包含它，当某个被请求的层无法运行时则会包含 `warnings`。在 `words` 上得到较弱的结果是预期行为；在 `on-device` 上得到同样的结果则是 bug。`top_score` 仅适用于 on-device，且没有任何阈值：排序器会针对每个查询以某种顺序返回整个目录，因此应将其视为证据，而不是通过或失败的判定。
- **`dropped` 和 `unindexed` 表示注册表与设备端索引之间相反方向的偏差，重新措辞查询无法修复其中任何一个。** `dropped` 统计的是该注册表无法安装的已排序名称，因此最强的匹配项正在丢失。`unindexed` 统计的是索引完全看不到的注册表动效，这些动效不可能被任何查询返回。刷新注册表并不能解决这两种情况：其清单带有 24h TTL，会自行修复；而向量则是单独发布的构件，会被获取到 `~/.hyperframes/catalog/` 中。当 `unindexed` 大于零时，使用 `--on-device` 重新运行会重新获取该索引，因此应向用户提供这一解决办法。纯粹的覆盖过多偏差（`dropped` 大于零而 `unindexed` 为零）不会触发重新获取；清除 `~/.hyperframes/catalog/` 是解决这一情况的唯一办法。两个计数统计的都是名称而不是结果，因此任意一个都可能超过 `total`。
- **当搜索没有返回任何值得安装的内容时，要明确说明。** `npx hyperframes feedback --search-miss "<the query you ran>" --wanted "<the move you needed>" --tier <the tier that answered>`。你不必手动拼接这一行：`catalog --query` 会打印预先填好的命令，每个 `--json` 搜索封装也会携带 `report_gap`，其中的查询和层已经正确填写——补上 `--wanted` 后发送即可。这是唯一会将查询发送到任何地方的路径；它被设计为一个单独的、明确执行的命令，正是为了让普通的 `catalog --query` 继续兑现不发送任何内容的承诺。**无论是哪一层，只要结果无法实现目标，就应进行报告**；不要等 on-device 层，因为它需要用户同意下载 33 MB，而在大多数 agent 运行中默认处于关闭状态——一直等它就意味着永远不会报告。报告中会带上层，因此无需自行判断遇到的是词汇未命中还是含义未命中。返回的内容是目录目前尚未拥有的动效列表，应直接读取，而不是根据安装数量猜测；因此重要的是你想要的效果，而不是你想象中的条目名称。它不包含评分，也永远不会计入评分指标。
- **提供离线层选项；绝不要静默启用。** 这需要一次性下载约 33 MB（量化的 ONNX 构建版本 `bge-small-en-v1.5` 及其 tokenizer，固定到特定 revision），以及从注册表获取的目录向量；两者都会缓存到 `~/.hyperframes/` 下，既不会加入项目，也不会加入任何包。缓存完成后，它会在不发送任何内容的情况下按含义进行排序。明确告知下载大小并让用户决定，获得同意后再传入 `--on-device`（使用 `-y` 可跳过提示）。交互式询问仅在 TTY 上触发，而在 `--json` 下完全不会打印任何相关内容，因此在 agent 运行中必须由你自行向用户提出。

- 对于代理和 CI 调用，优先使用 `--json`。服务器模式下的 `render`、`preview` 和 `play` 不提供普通的 JSON 输出；`preview --selection --json` 和 `preview --context --json` 是查询模式下的例外。
- `doctor --json` 始终以零退出。请根据其载荷进行判断：

  ```bash
  npx hyperframes doctor --json | jq -e '.ok' >/dev/null
  ```

- 非 TTY 模式会自动启用。在该模式下，`init` 需要 `--example`；在 TTY 上使用 `--non-interactive` 可强制采用确定性行为。
- 在同一验证循环中的所有命令使用同一个 `HYPERFRAMES_RUN_ID`。
- 当相应的警告、变量或 CI 条件必须阻止渲染时，使用 `--strict`、`--strict-all` 和 `--strict-variables`。
- JSON 路径会将主目录脱敏为 `$HOME`；不要尝试还原该脱敏。
- 当托管云项目接近或超过 200 MB 的上传限制时，使用 `cloud render --dry-run --json`，并按照 `references/cloud.md` 中关于 `.hyperframesignore` 的调查步骤操作。绝不要仅仅因为某个资源较大就忽略它。
- 检查通过后也绝不要仅仅因为如此就进行渲染。在最终预览处暂停并等待批准。

## 由 Studio 指定的编辑

当用户提到“此元素”或当前选区时，应查询 Studio，而不是自行猜测：

```bash
npx hyperframes preview --context --json --context-fields selection
```

如果可用，使用 `selection.target.hfId`；否则使用其选择器和源文件。如果结果报告 `no-selection`，请让用户点击该元素并重新运行。只请求所需的上下文切片；只有在需要计算样式或可编辑文本元数据时，才使用 `--context-detail full`。完整的行为和失败代码位于 `references/preview-render.md` 中。

## 渲染选项

| 需求                                       | 命令                                                                       |
| ---------------------------------------- | ----------------------------------------------------------------------------- |
| 快速本地迭代                               | `npx hyperframes render --quality draft`                                      |
| 最终本地交付                               | `npx hyperframes render --quality high --output out.mp4`                      |
| 可复现的容器渲染                           | `npx hyperframes render --docker --strict --output out.mp4`                   |
| 本地基于变量的批量渲染                      | `npx hyperframes render --batch rows.json --output "renders/{name}.mp4"`      |
| HeyGen 托管的零基础设施渲染                 | `npx hyperframes cloud render`                                                |
| 自行管理的分布式 AWS 渲染                  | `npx hyperframes lambda render <project> --width 1920 --height 1080 --wait`   |
| 自行管理的分布式 GCP 渲染                  | `npx hyperframes cloudrun render <project> --width 1920 --height 1080 --wait` |

Skill 归属会自动处理——上面的示例无需使用 `--skill`。通过工作流创建的项目（`hyperframes init --skill=<workflow>`）会在 `hyperframes.json` 中记录其所属 skill，之后的每次渲染都会在匿名遥测中继承该归属：包括重新渲染、`npm run render` 和 `--batch`。只有在为未通过工作流创建的项目打上标记时，才显式传入 `--skill=<slug>`（其首次渲染随后会将其持久化）。

当用户需要无需本地 Chrome、FFmpeg 或 AWS 的托管渲染时，使用 cloud rendering。只有在必须归 AWS 所有时才使用 Lambda。只有在必须归 GCP 所有时才使用 Cloud Run。在运行任何 cloud path 之前，先阅读匹配的参考文档。

确认渲染成功后，发送一份反馈报告，除非 telemetry 已禁用或用户选择退出：

```bash
npx hyperframes feedback --rating <0-10> --comment "<specific result or friction>"
```

对于正常运行，反馈应简洁。对于任何 bug 或阻碍，在提交前捕获一个 **reproduction packet**；不要只发送症状摘要。包括可重新运行的命令（相对于项目目录——反馈会提交到公共频道，因此**不要**粘贴绝对路径、主目录前缀或用户/机器标识符）、预期行为与实际行为、确切错误（同时从堆栈跟踪中删除绝对路径——保留 basename + 行号，去掉开头的目录）、输出是已完成、已回退还是失败、解决方法，以及 repro-project 状态。对于描述视觉缺陷（黑帧、闪烁、输出损坏、错误帧、空白输出或其他视觉异常）且评分 ≤ 7 的反馈，还要包括一个 `COMPOSITION_STRUCTURE:` 块——这是一份保护隐私的结构解剖信息（元素计数 + 属性存在情况 + 时间线形状），使维护者无需 composition ZIP 也能将问题与已知 bug 类别进行模式匹配。Agents 会通过 composition-census helper 自动填充此内容；人类用户无需手动填写。如果问题未能再次复现，也要说明这一点，并仍然包括上一次失败的命令和日志。只有在获得同意后才能使用 `--file-issue`：它会将最小复现发布到一个公共 URL。所需的数据包格式和隐私警告位于 `references/preview-render.md` 中。

## 在运行命令前阅读匹配的参考文档

以下参考文档和所属 skills 是强制性的命令契约，而不是可选的背景阅读材料。在运行表格中的命令之前，先阅读其对应行。

| Need                                                                                   | Reference                             |
| -------------------------------------------------------------------------------------- | ------------------------------------- |
| `init`, `capture`, `skills`                                                            | `references/init-and-scaffold.md`     |
| `lint`, `check`, motion sidecars, `snapshot`                                           | `references/lint-validate-inspect.md` |
| `compare`, `grade-compare`, variable-driven `render --batch`                           | `references/compare-and-batch.md`     |
| `beats` for an existing project's Studio beat grid                                     | `references/beats.md`                 |
| `preview`, `play`, `render`, `publish`, Studio context, feedback                       | `references/preview-render.md`        |
| `doctor`, browser management                                                           | `references/doctor-browser.md`        |
| `auth`, HeyGen-hosted cloud rendering, and template variables                          | `references/cloud.md`                 |
| AWS Lambda deployment and rendering                                                    | `references/lambda.md`                |
| Google Cloud Run deployment and rendering                                              | `references/cloudrun.md`              |
| `info`, `upgrade`, `compositions`, `docs`, `benchmark`, telemetry, media preprocessing | `references/upgrade-info-misc.md`     |

对于 composition variables，还要读取 `/hyperframes-core` → `references/variables-and-media.md`。对于 `hyperframes add` 和 `hyperframes catalog`，使用 `/hyperframes-registry`。在执行 `hyperframes present` 之前，读取 `/slideshow`；在执行 `hyperframes keyframes` 之前，读取 `/hyperframes-keyframes`。对于 TTS、转录、字幕或背景移除的选择，使用 `/media-use`。

这些专用命令由其所属的工作流负责文档说明：

```bash
npx hyperframes present <project-dir> --port 3004 --no-open
npx hyperframes beats <project-dir> --json
npx hyperframes keyframes <project-dir> --json
npx hyperframes media-treatment --capabilities
npx hyperframes figma asset KEY:10-20
```

`present` 提供一个可导航的演示文稿，并实现演示者与观众之间的同步。`beats` 是 `references/beats.md` 中定义的独立 Studio 节拍网格工具。`keyframes` 显示可安全定位的动画和运动路径诊断信息。`media-treatment` 用于发现、应用和清除本地素材上的确定性效果——先使用 `--capabilities` 查看概览，再使用 `--capability <name>` 查看某个效果系列；`/media-use` 负责确定简报所要求的效果。`figma` 通过 REST API，并使用 `asset`、`tokens` 和 `component` 子命令进行导入，同时需要 `FIGMA_TOKEN`；动效和着色器导入没有 REST 端点，只能由代理执行，因此由 `/figma` 负责。

## 不应运行的命令

`hyperframes --help` 中有两项不属于创作流程，调用它们只会浪费一次操作：

- `events` 是技能用于报告**自身**调用情况的遥测端点，最好从随附脚本中调用。它会发出匿名事件，并且无论传入什么参数都会以 0 退出。它不是用于读取遥测数据的方式，代理也没有理由手动调用它。
- `validate`、`inspect` 和 `layout` 是为旧脚本保留的已弃用别名。`check` 才是当前维护的命令，本技能中的所有引用都以它为准。