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

除非项目说明提供了包装命令，否则请以 `npx hyperframes ...` 运行命令。存在包装命令时必须遵从。该 CLI 需要 Node.js 22 或更高版本以及 FFmpeg。

## 开发循环

1. **脚手架：** `npx hyperframes init <project>` 或捕获一个网站。在非 TTY 模式下，传入 `--non-interactive --example=<name>`。
2. **寻找现成方案：** 在手动编写动画之前，先搜索是否已有可实现该效果的原语：`npx hyperframes catalog --query "reveal a headline one line at a time"`。描述你想要的效果，而不是你设想的实现机制。使用 `npx hyperframes add <name>` 安装（参见 `/hyperframes-registry`）。仅当没有任何方案适用时再手动编写。
3. **编写：** 使用 `/hyperframes-core` 编写合成内容。
4. **在编辑期间快速获取反馈：** 完成第一版 HTML 后以及结构变更后，运行 `npx hyperframes lint`。
5. **运行最终检查关卡：** 运行 `npx hyperframes check`；它会在打开浏览器前重新运行 lint。不要额外在前面执行冗余的独立 lint 命令。添加 `--snapshots` 以获取带注释的概览帧和问题裁剪图。
6. **检查子合成：** 当 `index.html` 挂载 `data-composition-src` 时，捕获中点快照并检查每个已挂载的场景。
7. **打开最终 Studio 预览：** 运行 `npx hyperframes preview --background`，确认该 URL 返回 HTTP 200，将时间线项目 URL 交给用户，并询问是否需要修改或渲染。在审核结束前保持其运行。
8. **仅在获批后渲染：** 迭代时使用草稿质量，交付时使用高质量。
9. **验证输出：** 确认文件存在、非空，并且时长合理。

## 强制性的创作者编辑交叉引用

- 在编写或诊断缩放、推近/拉远、重新构图、镜头
  移动或任何关键帧动画之前，先阅读 `/hyperframes-keyframes`。
- 在执行 `hyperframes keyframes` 之前，阅读 `/hyperframes-keyframes`；该命令会显示动画轨迹，但不会诊断片段剪切。
- 对于剪切、修剪、拼接、重排或源时间调整，请阅读
  `/hyperframes-core` 并使用其中的片段/时间线约定。
- 对于淡入/淡出、交叉淡化、轨道增益、音量自动化、压低背景音、
  旁白留白或已放置音频上的 FX，请阅读 `/hyperframes-audio`。当片段放置或画面时序也发生变化时，同时加载 core。
- 仅使用 `/media-use` 获取/生成媒体或预处理派生资源。
  从 `/hyperframes-core` → `references/creator-editing-recipes.md` 复制创作者编辑标记。

```bash
# Fast iteration check; repeat while authoring as needed.
npx hyperframes lint

# Required final gate; includes lint.
npx hyperframes check
npx hyperframes preview --background
npx hyperframes render --quality high --output out.mp4
test -s out.mp4
ffprobe -v error -show_format out.mp4
```

`check` 会先运行 lint，然后使用一个浏览器会话和一次定位遍历来审查运行时错误、失败请求、布局、`*.motion.json` 断言以及 WCAG 对比度。持续存在的问题会阻止退出码正常返回；短暂的入场或退场问题仅供参考。使用 `--strict` 使警告也成为阻断条件。为兼容性保留 `validate`、`inspect` 和 `layout` 作为别名，但它们不得出现在新的说明或脚本中。

## 两种不同的预览界面

不要混淆这些状态：

| 界面                   | 可以打开的时机                                       | 用途                                                                           |
| ---------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------ |
| 故事板面板             | 在合成检查之前，仅当 `storyboard: yes` 时             | 审阅计划卡片和线框草图。打开 `?view=storyboard#project/<name>`。                |
| 最终合成预览           | 在 `check` 通过后                                    | 在渲染前审阅已组装的时间线。打开 `#project/<name>`。                            |

早期面板并不代表最终视频已获批准。渲染始终需要由 `hyperframes-core/references/review-loop.md` 定义的最终批准。

## 子合成冒烟测试

静态审计无法捕获每一种挂载失败。当项目使用子合成时，请为每个宿主槽位捕获至少一个可见的中点：

```bash
npx hyperframes snapshot --at <t1>,<t2>,<t3>
```

将微小的未样式化内容、画布大小的图标、缺失的主视觉元素或时间线注册超时视为阻塞渲染的挂载缺陷。请参阅 `hyperframes-core/references/sub-compositions.md` 了解相应的修复方法。

## Agent 约定

- **在手动编写动画之前先搜索目录。** `npx hyperframes catalog --query "<the beat, in plain English>"`。搜索完全在本地进行：没有托管层级、没有账户，并且查询文本绝不会发送到任何地方。默认情况下，它根据与条目名称、标题和描述共享的词汇进行排序，因此会漏掉任何未复用目录自身措辞的表达。改用 `--on-device` 按语义排序（参见下面的离线层级）。
- **即使视频不是英文，也要用英文查询。** 两个层级都索引英文目录，因此使用其他文字系统的查询不会产生可搜索词，并且不会返回任何内容。请用英文描述动作；屏幕上的文案保持为视频所需的任何语言。`No searchable words in query` 的含义正是如此，并不表示缺少组件，因此不要将其报告为目录缺口。
- **读取由哪个层级作答；绝不要根据是否出现结果来推断。** 使用 `--json` 时，封套包含 `query`、`tier`（`on-device` 或 `words`）、`tier_detail`、`dropped`、`unindexed`、`shown`、`total` 和 `results`；作答层级生成分数时还会包含 `top_score`，而当请求的层级无法运行时会包含 `warnings`。`words` 上的弱结果是预期行为；`on-device` 上的相同结果则是一个错误。`top_score` 仅适用于 on-device，且其背后没有阈值：排序器会针对每个查询以某种顺序返回整个目录，因此应将其视为证据，而非通过或失败的判定。
- **`dropped` 和 `unindexed` 是注册表与设备端索引之间相反方向的偏差，改写查询无法修复其中任何一个。** `dropped` 统计此注册表无法安装的已排序名称，因此丢失的是最强匹配项。`unindexed` 统计索引完全看不到的注册表动作，任何查询都永远无法返回它们。刷新注册表并不能解决任一问题：其清单带有 24 小时 TTL，并会自行修复；而向量是单独发布的构件，获取到 `~/.hyperframes/catalog/` 中。当 `unindexed` 大于零时，使用 `--on-device` 重新运行会重新获取该索引，因此这才是应提供给用户的补救方法。纯粹的过度覆盖偏差（`dropped` 大于零而 `unindexed` 为零）不会触发重新获取；清除 `~/.hyperframes/catalog/` 是解决这种情况的唯一方法。两个计数统计的都是名称而非结果，因此任一个都可能超过 `total`。
- **当搜索没有返回任何值得安装的内容时，请明确说明。** `npx hyperframes feedback --search-miss "<the query you ran>" --wanted "<the move you needed>" --tier <the tier that answered>`。你不必自行拼装该命令：`catalog --query` 会输出已预填的版本，并且每个 `--json` 搜索封套都会将其作为 `report_gap` 携带，其中的查询和层级已经正确——填写 `--wanted` 并发送即可。这是唯一会将查询发送到任何地方的路径，而且它特意设计为独立命令，正是为了让普通的 `catalog --query` 能够保持不发送任何内容的承诺。**无论在哪个层级，只要结果没有实现所需功能，就进行报告**；不要等待设备端层级，它需要经同意下载 33 MB，因此在大多数 agent 运行中处于关闭状态——等待它意味着永远不会报告。层级会随报告一同提交，因此词汇未命中与语义未命中仍可区分，无需你判断究竟遇到了哪一种。返回的是目录尚未拥有的动作列表，直接读取而不是从安装计数中猜测，因此重要的措辞是你想要的效果，而不是你想象中的条目名称。它不携带评分，也绝不会计入评分指标。
- **提供离线层级；绝不要静默启用它。** 一次性下载约 33 MB（固定到特定修订版本的 `bge-small-en-v1.5` 量化 ONNX 构建及其分词器）以及来自注册表的目录向量，二者都会缓存在 `~/.hyperframes/` 下，且都不会添加到项目或任何包中。缓存后，它会按语义排序且不会发送任何内容。明确说出大小，并让对方决定；在对方同意后，再传入 `--on-device`（配合 `-y` 跳过提示）。交互式询问仅在 TTY 上触发，而在 `--json` 下完全不会输出相关内容，因此在 agent 运行中，你必须亲自向用户提出此选项。

- 对于 agent 和 CI 调用，优先使用 `--json`。服务端模式的 `render`、`preview` 和 `play` 不提供普通 JSON 输出；`preview --selection --json` 和 `preview --context --json` 是查询模式的例外。
- `doctor --json` 始终以零退出。请根据其载荷进行门控：

  ```bash
  npx hyperframes doctor --json | jq -e '.ok' >/dev/null
  ```

- 非 TTY 模式会自动启用。在该模式下，`init` 需要 `--example`；在 TTY 上使用 `--non-interactive` 来强制确定性行为。
- 在同一个验证循环中的所有命令使用同一个 `HYPERFRAMES_RUN_ID`。
- 当相应的警告、变量或 CI 条件必须阻止渲染时，使用 `--strict`、`--strict-all` 和 `--strict-variables`。
- JSON 路径会将主目录脱敏为 `$HOME`；不要尝试还原该脱敏。
- 当托管云项目接近或超过 200 MB 上传限制时，使用 `cloud render --dry-run --json`，并按照 `references/cloud.md` 中的 `.hyperframesignore` 排查流程操作。绝不要仅因为资源较大就忽略它。
- 不要仅因检查通过就进行渲染。在最终预览处暂停并等待批准。

## Studio 定向编辑

当用户提到“此元素”或当前选择时，查询 Studio 而不是猜测：

```bash
npx hyperframes preview --context --json --context-fields selection
```

可用时使用 `selection.target.hfId`，否则使用其选择器和源文件。如果结果报告 `no-selection`，请用户点击该元素后重新运行。只请求所需的上下文片段；仅在需要计算样式或可编辑文本元数据时使用 `--context-detail full`。完整行为和失败代码详见 `references/preview-render.md`。

## 渲染选项

| 需求                                     | 命令                                                                       |
| ---------------------------------------- | ----------------------------------------------------------------------------- |
| 快速本地迭代                     | `npx hyperframes render --quality draft`                                      |
| 最终本地交付                     | `npx hyperframes render --quality high --output out.mp4`                      |
| 可复现的容器渲染            | `npx hyperframes render --docker --strict --output out.mp4`                   |
| 本地变量驱动的批量渲染       | `npx hyperframes render --batch rows.json --output "renders/{name}.mp4"`      |
| HeyGen 托管的零基础设施渲染 | `npx hyperframes cloud render`                                                |
| 自行管理的分布式 AWS 渲染      | `npx hyperframes lambda render <project> --width 1920 --height 1080 --wait`   |
| 自行管理的分布式 GCP 渲染      | `npx hyperframes cloudrun render <project> --width 1920 --height 1080 --wait` |

Skill 归属会自动处理——上述示例不需要 `--skill`。通过工作流构建的项目（`hyperframes init --skill=<workflow>`）会在 `hyperframes.json` 中记录其所属 skill，之后的每次渲染都会在匿名遥测中继承它：重新渲染、`npm run render` 以及 `--batch` 都一样。仅当项目并非通过工作流创建时，才显式传递 `--skill=<slug>` 来标记项目（其首次渲染随后会将其持久化）。

当用户希望使用托管渲染而无需本地 Chrome、FFmpeg 或 AWS 时，使用云渲染。仅当 AWS 所有权是要求时才使用 Lambda。仅当 GCP 所有权是要求时才使用 Cloud Run。运行任何云端路径之前，请阅读相应的参考文档。

验证渲染成功后，发送一份反馈报告，除非遥测功能已禁用或用户选择退出：

```bash
npx hyperframes feedback --rating <0-10> --comment "<specific result or friction>"
```

保持无问题运行的反馈简洁。对于任何 bug 或阻碍，请在提交前收集一份**复现包**；不要只发送症状摘要。包括可重新运行的命令（相对于项目目录——反馈会提交至公开渠道，因此**不要**粘贴绝对路径、主目录前缀或用户/机器标识符）、预期行为与实际行为、确切错误信息（同时从堆栈跟踪中去除绝对路径——保留文件名 + 行号，删除前导目录）、输出是完成/回退/失败、解决方法，以及复现项目状态。对于评分 ≤ 7 且描述视觉缺陷（黑帧、闪烁、损坏的输出、错误帧、空白输出或其他视觉异常）的情况，还需包含一个 `COMPOSITION_STRUCTURE:` 区块——这是一种保护隐私的结构剖析（元素清单 + 属性存在情况 + 时间线形状），使维护者无需组合 ZIP 文件即可与已知 bug 类别进行模式匹配。代理会通过 composition-census helper 自动填充此内容；人类用户无需手动填写。如果问题未能再次复现，请说明这一点，并且仍需包含最近一次失败的命令和日志。仅在获得同意时使用 `--file-issue`：它会将最小复现发布到一个公开 URL。所需的包格式和隐私警告位于 `references/preview-render.md`。

## 在运行命令前阅读相应的参考文档

以下参考文档及其所属技能是强制性的命令契约，而非可选的背景阅读材料。在运行表格中的命令前，请阅读其对应行。

| 需求                                                                                   | 参考文档                             |
| -------------------------------------------------------------------------------------- | ------------------------------------- |
| `init`、`capture`、`skills`                                                            | `references/init-and-scaffold.md`     |
| `lint`、`check`、运动侧车文件、`snapshot`                                           | `references/lint-validate-inspect.md` |
| 变量驱动的 `compare`、`grade-compare`、`render --batch`                           | `references/compare-and-batch.md`     |
| 现有项目 Studio 节拍网格的 `beats`                                                    | `references/beats.md`                 |
| `preview`、`play`、`render`、`publish`、Studio 上下文、反馈                       | `references/preview-render.md`        |
| `doctor`、浏览器管理                                                                   | `references/doctor-browser.md`        |
| `auth`、HeyGen 托管的云渲染和模板变量                                                 | `references/cloud.md`                 |
| AWS Lambda 部署和渲染                                                                  | `references/lambda.md`                |
| Google Cloud Run 部署和渲染                                                           | `references/cloudrun.md`              |
| `info`、`upgrade`、`compositions`、`docs`、`benchmark`、遥测、媒体预处理 | `references/upgrade-info-misc.md`     |

对于合成变量，还应阅读 `/hyperframes-core` → `references/variables-and-media.md`。对于 `hyperframes add` 和 `hyperframes catalog`，使用 `/hyperframes-registry`。在执行 `hyperframes present` 之前，阅读 `/slideshow`；在执行 `hyperframes keyframes` 之前，阅读 `/hyperframes-keyframes`。对于 TTS、转录、字幕或背景移除的选择，使用 `/media-use`。

专用命令由其所属工作流特意进行文档说明：

```bash
npx hyperframes present <project-dir> --port 3004 --no-open
npx hyperframes beats <project-dir> --json
npx hyperframes keyframes <project-dir> --json
npx hyperframes media-treatment --capabilities
npx hyperframes figma asset KEY:10-20
```

`present` 提供可导航的演示文稿，并支持演讲者与观众同步。`beats` 是在 `references/beats.md` 中定义的独立 Studio 节拍网格工具。`keyframes` 提供可安全跳转的动画和运动路径诊断。`media-treatment` 可发现、应用并清除本地素材上的确定性视觉效果——先使用 `--capabilities` 查看概览，再使用 `--capability <name>` 查看某一类效果；由 `/media-use` 决定简报所要求的处理方式。`figma` 通过 REST API 使用 `asset`、`tokens` 和 `component` 子命令进行导入，并且需要 `FIGMA_TOKEN`；动效和着色器导入没有 REST 端点，仅限代理执行，因此由 `/figma` 负责。

## 不应运行的命令

`hyperframes --help` 中有两个条目不属于创作流程，调用它们只会浪费一次交互：

- `events` 是供技能用于报告其**自身**调用情况的遥测端点，最好通过随附脚本调用。无论传入什么参数，它都会发送匿名事件并以状态码 0 退出。它不是读取遥测数据的方式，代理也没有理由手动调用它。
- `validate`、`inspect` 和 `layout` 是为旧脚本保留的已弃用别名。`check` 才是仍在维护的命令，并且本技能中的每一处引用都以它为准。