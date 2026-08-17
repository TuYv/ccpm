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

除非项目说明提供了封装器，否则请以 `npx hyperframes ...` 的形式运行命令。如存在封装器，请遵循其要求。CLI 需要 Node.js 22 或更高版本以及 FFmpeg。

## 开发循环

1. **搭建：**运行 `npx hyperframes init <project>` 或捕获一个站点。在非 TTY 模式下，请传入 `--non-interactive --example=<name>`。
2. **寻找合适的动效：**在手动创作动效之前，先搜索是否已有可实现该效果的原语：`npx hyperframes catalog --query "reveal a headline one line at a time"`。请描述你想要的效果，而不是你设想的实现机制。使用 `npx hyperframes add <name>` 安装（参见 `/hyperframes-registry`）。只有在没有合适选项时才手动创作。
3. **创作：**使用 `/hyperframes-core` 编写合成内容。
4. **在编辑时快速获取反馈：**完成第一版 HTML 后以及进行结构性更改后，运行 `npx hyperframes lint`。
5. **执行最终检查关卡：**运行 `npx hyperframes check`；它会在打开浏览器前重新运行 lint。不要在前面添加多余的独立 lint 调用。添加 `--snapshots` 可生成带标注的概览帧和问题区域裁剪图。
6. **检查子合成：**当 `index.html` 挂载 `data-composition-src` 时，捕获中点快照并检查每个已挂载的场景。
7. **打开最终 Studio 预览：**运行 `npx hyperframes preview`，将时间轴项目 URL 交给用户，并询问是需要修改还是渲染。
8. **仅在批准后渲染：**迭代时使用草稿质量，交付时使用高质量。
9. **验证输出：**确认文件存在、非空，并且时长合理。

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

`check` 会先运行 lint，然后使用一个浏览器会话和一次定位过程来审查运行时错误、失败的请求、布局、`*.motion.json` 断言以及 WCAG 对比度。持续存在的问题会影响退出代码；仅在进入或退出期间短暂出现的问题只作为提示信息。使用 `--strict` 可让警告也影响检查结果。为保持兼容性，`validate`、`inspect` 和 `layout` 仍作为别名保留，但不得出现在新的说明或脚本中。

## 两种不同的预览界面

不要混淆以下状态：

| 界面                      | 可打开的时机                                           | 用途                                                                              |
| ------------------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------- |
| 故事板面板                | 仅当 `storyboard: yes` 时，在合成检查之前              | 审阅规划卡片和线框草图。打开 `?view=storyboard#project/<name>`。                  |
| 最终合成预览              | `check` 通过后                                         | 在渲染前审阅已组装的时间轴。打开 `#project/<name>`。                              |

早期分镜板并不代表最终视频已获批准。渲染始终需要获得 `hyperframes-core/references/review-loop.md` 中定义的最终批准。

## 子合成冒烟测试

静态审计无法捕获所有挂载失败。当项目使用子合成时，请为每个宿主插槽至少捕获一个可见的中间时间点：

```bash
npx hyperframes snapshot --at <t1>,<t2>,<t3>
```

应将微小且无样式的内容、画布大小的图标、缺失的主视觉元素或时间线注册超时视为会阻塞渲染的挂载缺陷。相应的修复方法请参阅 `hyperframes-core/references/sub-compositions.md`。

## 代理约定

- **在手动编写动效之前搜索目录。** `npx hyperframes catalog --query "<the beat, in plain language>"`。搜索完全在本地进行：没有托管层级，不需要账户，查询文本也绝不会发送到任何地方。默认情况下，它会根据与条目的名称、标题和描述共有的词汇进行排序，因此，如果某种表述没有复用目录自身的措辞，就可能无法匹配。添加 `--on-device` 可改为按语义排序（请参阅下文的离线层级）。
- **查看由哪个层级提供了结果；绝不要根据是否出现结果来推断。** 使用 `--json` 时，响应信封包含 `query`、`tier`（`on-device` 或 `words`）、`tier_detail`、`dropped`、`unindexed`、`shown`、`total` 和 `results`；当提供结果的层级会生成评分时，还会包含 `top_score`；当请求的层级无法运行时，则会包含 `warnings`。`words` 层级返回较弱的结果是正常现象；`on-device` 层级返回同样弱的结果则属于错误。`top_score` 仅适用于设备端层级，且背后没有任何阈值：对于每个查询，排序器都会按某种顺序返回整个目录，因此应将其视为证据，而不是通过或失败的判定。
- **`dropped` 和 `unindexed` 表示注册表与设备端索引之间方向相反的偏差，改写查询无法修复其中任何一个。** `dropped` 统计的是已参与排序、但此注册表无法安装的名称，因此丢失的恰恰是最强匹配项。`unindexed` 统计的是注册表中索引完全不可见的动效，因此任何查询都不可能返回它们。刷新注册表无法解决这两种问题：其清单具有 24 小时的 TTL，并且会自行修复；而向量则是一个单独发布的工件，会提取到 `~/.hyperframes/catalog/` 中。当 `unindexed` 大于零时，使用 `--on-device` 重新运行会重新提取该索引，因此应将此方法提供给用户。纯粹的覆盖过度偏差（`dropped` 大于零而 `unindexed` 为零）不会触发重新提取；这种情况下，唯一的解决方法是清除 `~/.hyperframes/catalog/`。这两个数值统计的都是名称而非结果，因此任一数值都可能超过 `total`。
- **当搜索没有返回任何值得安装的内容时，请明确说明。** `npx hyperframes feedback --search-miss "<the query you ran>" --wanted "<the move you needed>" --tier <the tier that answered>`。你无需自行拼装这条命令：`catalog --query` 会输出预填充的命令，并且每个 `--json` 搜索信封都会将其放在 `report_gap` 中，其中查询和层级已经正确填写——补充 `--wanted` 后发送即可。这是唯一会将查询发送到任何地方的途径，并且它特意设计为一条单独的、需明确执行的命令，正是为了让普通的 `catalog --query` 能够兑现不发送任何内容的承诺。**无论由哪个层级提供结果，都应进行报告**；只要结果无法实现所需效果就应报告，不要执意等待设备端层级，因为它需要经过用户同意下载 33 MB 内容，所以在大多数代理运行中都处于关闭状态——等待它意味着最终根本不会进行报告。报告中会附带层级，因此无需判断遇到的是哪一种问题，也能区分词汇匹配缺失与语义匹配缺失。返回的是目录尚未包含的动效列表，直接读取而不是根据安装次数猜测，因此真正重要的措辞是你想要的效果，而不是你设想的条目名称。报告不包含评分，也绝不会计入评分指标。
- **提供离线层级选项；绝不要在未告知的情况下启用它。** 首次需要下载约 33 MB 的内容（`bge-small-en-v1.5` 的量化 ONNX 构建及其分词器，固定到特定修订版本），以及来自注册表的目录向量；二者都会缓存在 `~/.hyperframes/` 下，既不会添加到项目中，也不会添加到任何软件包中。缓存完成后，它会完全在本地按语义排序，不会发送任何内容。明确告知下载大小并让用户决定；用户同意后，再传递 `--on-device`（同时使用 `-y` 可跳过提示）。交互式询问只会在 TTY 上触发，而使用 `--json` 时完全不会输出相关信息，因此在代理运行中，你必须主动向用户提出此选项。

- 对于智能体和 CI 调用，优先使用 `--json`。服务端模式下的 `render`、`preview` 和 `play` 不提供常规 JSON 输出；`preview --selection --json` 和 `preview --context --json` 是查询模式的例外。
- `doctor --json` 始终以零状态码退出。请根据其负载进行门禁判断：

  ```bash
  npx hyperframes doctor --json | jq -e '.ok' >/dev/null
  ```

- 非 TTY 模式会自动启用。在该模式下，`init` 要求提供 `--example`；在 TTY 上使用 `--non-interactive` 可强制实现确定性行为。
- 同一验证循环中的所有命令都应使用同一个 `HYPERFRAMES_RUN_ID`。
- 当对应的警告、变量或 CI 条件必须作为渲染门禁时，请使用 `--strict`、`--strict-all` 和 `--strict-variables`。
- JSON 路径会将主目录隐去为 `$HOME`；不要尝试逆向还原。
- 当托管的云项目接近或超过 200 MB 上传限制时，请使用 `cloud render --dry-run --json`，并按照 `references/cloud.md` 中的 `.hyperframesignore` 调查流程操作。绝不要仅仅因为某个资源体积较大就将其忽略。
- 绝不要仅仅因为检查通过就进行渲染。请在最终预览阶段暂停并等待批准。

## Studio 引导的编辑

当用户提到“此元素”或当前选区时，请查询 Studio，而不要猜测：

```bash
npx hyperframes preview --context --json --context-fields selection
```

如果存在 `selection.target.hfId`，请使用它；否则使用其选择器和源文件。如果结果报告 `no-selection`，请让用户点击该元素并重新运行。只请求所需的上下文片段；仅在需要计算样式或可编辑文本元数据时使用 `--context-detail full`。完整行为和失败代码详见 `references/preview-render.md`。

## 渲染选择

| 需求                                     | 命令                                                                          |
| ---------------------------------------- | ----------------------------------------------------------------------------- |
| 快速本地迭代                             | `npx hyperframes render --quality draft`                                      |
| 最终本地交付                             | `npx hyperframes render --quality high --output out.mp4`                      |
| 可复现的容器渲染                         | `npx hyperframes render --docker --strict --output out.mp4`                   |
| 本地变量驱动的批量渲染                   | `npx hyperframes render --batch rows.json --output "renders/{name}.mp4"`      |
| 由 HeyGen 托管的零基础设施渲染           | `npx hyperframes cloud render`                                                |
| 自行管理的 AWS 分布式渲染                | `npx hyperframes lambda render <project> --width 1920 --height 1080 --wait`   |
| 自行管理的 GCP 分布式渲染                | `npx hyperframes cloudrun render <project> --width 1920 --height 1080 --wait` |

技能归因是自动完成的——上述示例不需要 `--skill`。由工作流搭建的项目（`hyperframes init --skill=<workflow>`）会在 `hyperframes.json` 中记录其所属技能，之后的每次渲染都会在匿名遥测中继承该技能：无论是重新渲染、`npm run render`，还是 `--batch`，均是如此。仅当需要为并非通过工作流创建的项目加上标记时，才显式传递 `--skill=<slug>`（该项目首次渲染后会持久保存此标记）。

当用户希望使用托管渲染，而不想在本地使用 Chrome、FFmpeg 或 AWS 时，请使用云渲染。仅当必须由 AWS 托管时才使用 Lambda。仅当必须由 GCP 托管时才使用 Cloud Run。在运行任何云端路径之前，请阅读对应的参考文档。

确认渲染成功后，发送一份反馈报告，除非遥测功能已被禁用或用户已选择退出：

```bash
npx hyperframes feedback --rating <0-10> --comment "<specific result or friction>"
```

对于无异常运行，反馈应保持简洁。对于任何错误或阻碍，请在提交前收集一个**复现包**；不要只发送症状摘要。复现包应包括可重新运行的命令（使用相对于项目目录的路径——反馈会提交到公共渠道，因此**不要**粘贴绝对路径、主目录前缀或用户/机器标识符）、预期行为与实际行为、确切错误（同时从堆栈跟踪中移除绝对路径——保留基本文件名和行号，删除前面的目录）、输出是已完成、已回退还是已失败、解决方法，以及复现项目状态。对于评分 ≤ 7 且描述视觉缺陷（黑帧、闪烁、输出损坏、帧错误、空白输出或其他视觉异常）的反馈，还应包含一个 `COMPOSITION_STRUCTURE:` 块——一种保护隐私的结构剖析（元素清单 + 属性存在情况 + 时间线形态），以便维护者无需获取合成项目 ZIP 文件，即可与已知错误类型进行模式匹配。代理会通过 composition-census 辅助工具自动填写此内容；人类用户无需手动填写。如果问题未能再次复现，请说明这一点，并仍然包含上次失败的命令和日志。仅在获得同意后使用 `--file-issue`：它会将最小复现项目发布到公共 URL。所需的复现包格式和隐私警告位于 `references/preview-render.md` 中。

## 运行命令前阅读对应的参考文档

以下参考文档及其所属 Skill 是强制性的命令契约，而非可选的背景资料。在运行表格中的命令之前，请阅读对应行中的参考文档。

| 需求                                                                                   | 参考文档                              |
| -------------------------------------------------------------------------------------- | ------------------------------------- |
| `init`、`capture`、`skills`                                                            | `references/init-and-scaffold.md`     |
| `lint`、`check`、运动附属文件、`snapshot`                                              | `references/lint-validate-inspect.md` |
| `compare`、`grade-compare`、变量驱动的 `render --batch`                                | `references/compare-and-batch.md`     |
| 针对现有项目 Studio 节拍网格的 `beats`                                                 | `references/beats.md`                 |
| `preview`、`play`、`render`、`publish`、Studio 上下文、反馈                            | `references/preview-render.md`        |
| `doctor`、浏览器管理                                                                   | `references/doctor-browser.md`        |
| `auth`、HeyGen 托管的云渲染和模板变量                                                  | `references/cloud.md`                 |
| AWS Lambda 部署和渲染                                                                  | `references/lambda.md`                |
| Google Cloud Run 部署和渲染                                                            | `references/cloudrun.md`              |
| `info`、`upgrade`、`compositions`、`docs`、`benchmark`、遥测、媒体预处理                | `references/upgrade-info-misc.md`     |

对于合成变量，另请阅读 `/hyperframes-core` → `references/variables-and-media.md`。使用 `hyperframes add` 和 `hyperframes catalog` 时，请使用 `/hyperframes-registry`。在运行 `hyperframes present` 之前，请阅读 `/slideshow`；在运行 `hyperframes keyframes` 之前，请阅读 `/hyperframes-keyframes`。对于 TTS、转录、字幕或背景移除相关选择，请使用 `/media-use`。

这些专用命令特意由各自所属的工作流记录：

```bash
npx hyperframes present <project-dir> --port 3004 --no-open
npx hyperframes beats <project-dir> --json
npx hyperframes keyframes <project-dir> --json
npx hyperframes media-treatment --capabilities
npx hyperframes figma asset KEY:10-20
```

`present` 用于提供可导航的演示文稿，并支持演示者与观众同步。`beats` 是 `references/beats.md` 中定义的独立 Studio 节拍网格实用工具。`keyframes` 用于呈现可安全跳转的动画和运动路径诊断信息。`media-treatment` 用于发现、应用和清除本地素材上的确定性视觉效果——请先使用 `--capabilities` 查看概览，再使用 `--capability <name>` 查看某一类别；由 `/media-use` 负责确定需求所要求的处理方式。`figma` 通过 REST API，使用 `asset`、`tokens` 和 `component` 子命令进行导入，并且需要 `FIGMA_TOKEN`；运动和着色器导入没有 REST 端点，只能由智能体执行，因此由 `/figma` 负责。

## 不应运行的命令

`hyperframes --help` 中有两个条目不属于创作循环，尝试使用它们只会浪费一轮交互：

- `events` 是遥测端点，供技能报告其**自身**的调用情况，理想情况下应通过随附脚本使用。无论向它传递什么内容，它都会发送一个匿名事件并以 0 退出。它不能用于读回遥测数据，智能体也没有理由手动调用它。
- `validate`、`inspect` 和 `layout` 是为旧脚本保留的弃用别名。`check` 才是持续维护的命令，也是此技能中的所有参考资料所采用的命令。