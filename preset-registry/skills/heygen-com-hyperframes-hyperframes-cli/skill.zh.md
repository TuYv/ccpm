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

除非项目说明提供了封装命令，否则请以 `npx hyperframes ...` 的形式运行命令。如果存在封装命令，请遵循该封装命令。CLI 要求使用 Node.js 22 或更高版本以及 FFmpeg。

## 开发循环

1. **搭建项目：** 使用 `npx hyperframes init <project>` 或捕获一个站点。在非 TTY 模式下，传入 `--non-interactive --example=<name>`。
2. **查找合适的动效：** 在手动编写动效之前，先搜索是否已有能够实现该效果的原语：`npx hyperframes catalog --query "reveal a headline one line at a time"`。应描述你想要的效果，而不是你设想的实现机制。使用 `npx hyperframes add <name>` 安装（参见 `/hyperframes-registry`）。只有在没有合适选项时才手动编写。
3. **编写：** 使用 `/hyperframes-core` 编写合成内容。
4. **在编辑时快速获取反馈：** 完成第一版 HTML 后以及进行结构性更改后，运行 `npx hyperframes lint`。
5. **运行最终检查关卡：** 运行 `npx hyperframes check`；它会在打开浏览器之前重新运行 lint。不要在前面添加一次多余的独立 lint 调用。添加 `--snapshots` 可生成带注释的概览帧和问题区域裁剪图。
6. **检查子合成：** 当 `index.html` 挂载 `data-composition-src` 时，捕获中点快照并检查每个已挂载的场景。
7. **打开最终的 Studio 预览：** 运行 `npx hyperframes preview --background`，验证该 URL 返回 HTTP 200，将时间线项目 URL 交给用户，并询问是需要修改还是渲染。在审核结束之前保持其运行。
8. **仅在批准后渲染：** 迭代时使用草稿质量，交付时使用高质量。
9. **验证输出：** 确认文件存在、非空，并且时长合理。

## 强制性的创作编辑交叉引用

- 在编写或诊断缩放、推进/拉远、重新构图、摄像机
  移动或任何关键帧动效之前，请先阅读 `/hyperframes-keyframes`。
- 在使用 `hyperframes keyframes` 之前，请阅读 `/hyperframes-keyframes`；该命令
  用于呈现动画轨迹，不用于诊断剪辑切点。
- 对于切割、修剪、拼接、重新排序或源素材时间调整，请阅读
  `/hyperframes-core` 并使用其中的剪辑/时间线约定。
- 对于淡入/淡出、交叉淡化、轨道增益、音量自动化、闪避、
  旁白避让或已放置音频上的效果，请阅读 `/hyperframes-audio`。当剪辑放置或画面时序也发生变化时，
  应同时加载 core。
- 仅使用 `/media-use` 获取/生成媒体，或对派生资源进行预处理。
  从 `/hyperframes-core` → `references/creator-editing-recipes.md` 复制创作编辑标记。

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

`check` 会先运行 lint，然后使用单个浏览器会话和一次定位过程，检查运行时错误、失败的请求、布局、`*.motion.json` 断言以及 WCAG 对比度。持续存在的问题会影响退出代码；短暂出现的入场或退场问题仅供参考。使用 `--strict` 可让警告也影响检查结果。为保持兼容性，`validate`、`inspect` 和 `layout` 仍作为别名保留，但不得出现在新的说明或脚本中。

## 两种不同的预览界面

不要混淆以下状态：

| 界面 | 何时可以打开 | 用途 |
| ------------------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------- |
| 故事板面板 | 仅当 `storyboard: yes` 时，在构图检查之前 | 审查规划卡片和线框草图。打开 `?view=storyboard#project/<name>`。 |
| 最终构图预览 | 在 `check` 通过之后 | 在渲染前审查组装完成的时间线。打开 `#project/<name>`。 |

前期面板并不代表最终视频已获批准。渲染始终需要获得 `hyperframes-core/references/review-loop.md` 中定义的最终批准。

## 子构图冒烟测试

静态审计无法捕获所有挂载失败。当项目使用子构图时，请为每个宿主槽位至少截取一个可见的中间时刻：

```bash
npx hyperframes snapshot --at <t1>,<t2>,<t3>
```

应将微小且未设样式的内容、画布大小的图标、缺失的主视觉元素或时间线注册超时视为阻止渲染的挂载缺陷。有关相应修复方法，请参阅 `hyperframes-core/references/sub-compositions.md`。

## 智能体约定

- **在手动编写动效之前先搜索目录。** `npx hyperframes catalog --query "<the beat, in plain English>"`。搜索完全在本地进行：没有托管层级，不需要账户，查询文本也绝不会发送到任何地方。默认情况下，它会根据与条目名称、标题和描述共有的词汇进行排序，因此任何未复用目录自身措辞的表达都可能无法匹配。添加 `--on-device` 可改为按语义排序（请参阅下方的离线层级）。
- **即使视频不是英文的，也要使用英文查询。** 两个层级都索引英文目录，因此使用其他文字体系进行查询不会产生可搜索词项，也不会返回任何结果。请用英文描述动效；屏幕文案仍使用视频所需的语言。`No searchable words in query` 的含义就是如此，并不表示缺少组件，因此不要将其报告为目录缺口。
- **读取实际应答的层级；绝不要根据是否出现结果来推断。** 使用 `--json` 时，封装对象包含 `query`、`tier`（`on-device` 或 `words`）、`tier_detail`、`dropped`、`unindexed`、`shown`、`total` 和 `results`；当应答层级会生成评分时，还包含 `top_score`；当请求的层级无法运行，或者搜索未返回结果且更好的层级仍在等待某人同意时，还包含 `warnings`。`words` 层级出现较弱的结果在预期之内；同样的结果出现在 `on-device` 层级则属于错误。`top_score` 仅适用于设备端，并且没有与之对应的阈值：对于每个查询，排序器都会按某种顺序返回整个目录，因此应将其视为证据，而不是通过或失败的判定。
- **`dropped` 和 `unindexed` 表示注册表与设备端索引之间方向相反的偏差，改写查询无法修复其中任何一个。** `dropped` 统计此注册表无法安装的已排序名称，因此丢失的正是匹配度最高的结果。`unindexed` 统计索引完全不可见的注册表动效，因此任何查询都不可能返回它们。刷新注册表并不能解决其中任何一个问题：其清单带有 24 小时 TTL 并会自行修复，而向量则是一个单独发布的构件，会提取到 `~/.hyperframes/catalog/`。当 `unindexed` 大于零时，使用 `--on-device` 重新运行会再次提取该索引，因此应将此作为提供给用户的解决方法。仅存在覆盖过度的偏差时，即 `dropped` 大于零而 `unindexed` 为零，不会触发重新提取；这种情况下，清除 `~/.hyperframes/catalog/` 是唯一的解决方法。这两个计数统计的是名称而不是结果，因此任意一个都可能超过 `total`。
- **当搜索未返回任何值得安装的内容时，要明确说明。** `npx hyperframes feedback --search-miss "<the query you ran>" --wanted "<the move you needed>" --tier <the tier that answered>`。你不必自行拼装这条命令：`catalog --query` 会输出预填充的命令，而每个 `--json` 搜索封装对象也会在 `report_gap` 中携带该命令，其中查询和层级均已正确填写，只需补充 `--wanted` 后发送即可。这是唯一会将查询发送到任何地方的路径，并且它被设计为单独的显式命令，正是为了让普通的 `catalog --query` 能够兑现不发送任何内容的承诺。**无论由哪个层级应答，都要报告**，只要结果无法实现所需效果；不要坚持等待设备端层级，因为该层级需要经同意后下载 33 MB 内容，所以在大多数智能体运行中处于关闭状态，等待它就意味着永远不会报告。报告中会附带层级，因此无需判断遇到的是哪一种情况，也能区分词汇匹配缺失与语义匹配缺失。返回的是目录中尚未提供的动效列表，它直接读取实际反馈，而不是根据安装数量猜测，因此重要的措辞是你想要的效果，而不是你设想的条目名称。它不包含评分，也绝不会计入评分指标。
- **提供离线层级选项；绝不要在未告知的情况下启用它。** 首次需要下载约 33 MB 内容，包括 `bge-small-en-v1.5` 的量化 ONNX 构建及其分词器（固定到特定修订版本），以及来自注册表的目录向量；两者都缓存在 `~/.hyperframes/` 下，既不会添加到项目中，也不会添加到任何软件包中。缓存完成后，它会在不发送任何内容的情况下按语义排序。明确告知用户下载大小并让其决定；在用户同意后，再传递 `--on-device`（同时使用 `-y` 可跳过提示）。交互式询问仅在 TTY 中触发。使用 `--json` 时不会出现提示，但未找到任何结果的搜索会将同样的询问放入 `warnings`，因此应读取该数组并自行将决定权交给用户。

- 对 agent 和 CI 调用优先使用 `--json`。服务器模式的 `render`、`preview` 和 `play` 不提供普通 JSON 输出；`preview --selection --json` 和 `preview --context --json` 是查询模式的例外。
- `doctor --json` 始终以零退出。根据其 payload 进行门控：

  ```bash
  npx hyperframes doctor --json | jq -e '.ok' >/dev/null
  ```

- 非 TTY 模式会自动启用。在该模式下，`init` 需要 `--example`；在 TTY 上使用 `--non-interactive` 可强制采用确定性行为。
- 同一验证循环中的所有命令使用一个 `HYPERFRAMES_RUN_ID`。
- 当相应的警告、变量或 CI 条件必须阻止渲染时，使用 `--strict`、`--strict-all` 和 `--strict-variables`。
- JSON 路径会将主目录替换为 `$HOME`；不要尝试还原该替换。
- 当托管云项目接近或超过 200 MB 上传限制时，使用 `cloud render --dry-run --json`，并按照 `references/cloud.md` 中关于 `.hyperframesignore` 的调查流程操作。切勿仅仅因为某个资源较大就忽略它。
- 检查通过后不要仅因为通过检查就进行渲染。在最终预览处暂停并等待批准。

## Studio 指定的编辑

当用户提到“此元素”或当前选择时，应查询 Studio，而不是猜测：

```bash
npx hyperframes preview --context --json --context-fields selection
```

如果可用，使用 `selection.target.hfId`，否则使用其选择器和源文件。如果结果报告 `no-selection`，请让用户点击该元素后重新运行。只请求所需的上下文切片；只有在需要计算样式或可编辑文本元数据时，才使用 `--context-detail full`。完整的行为和失败代码见 `references/preview-render.md`。

## 渲染选择

| 需求                                     | 命令                                                                       |
| ---------------------------------------- | ---------------------------------------------------------------------------- |
| 快速本地迭代                             | `npx hyperframes render --quality draft`                                      |
| 最终本地交付                             | `npx hyperframes render --quality high --output out.mp4`                   |
| 可复现的容器渲染                         | `npx hyperframes render --docker --strict --output out.mp4`                   |
| 本地变量驱动的批量渲染                   | `npx hyperframes render --batch rows.json --output "renders/{name}.mp4"`      |
| HeyGen 托管的零基础设施渲染              | `npx hyperframes cloud render`                                                |
| 自行管理的分布式 AWS 渲染                | `npx hyperframes lambda render <project> --width 1920 --height 1080 --wait`   |
| 自行管理的分布式 GCP 渲染                | `npx hyperframes cloudrun render <project> --width 1920 --height 1080 --wait` |

技能归属会自动处理，因此上面的示例无需使用 `--skill`。通过工作流生成的项目（`hyperframes init --skill=<workflow>`）会在 `hyperframes.json` 中记录其所属技能，之后的每次渲染都会在匿名遥测中继承该技能，包括重新渲染、`npm run render` 和 `--batch`。只有当项目不是通过工作流创建时，才需要显式传入 `--skill=<slug>` 来标记项目；首次渲染随后会持久化该标记。

当用户希望使用托管渲染，而不想在本地使用 Chrome、FFmpeg 或 AWS 时，请使用云渲染。仅当必须由 AWS 托管时才使用 Lambda。仅当必须由 GCP 托管时才使用 Cloud Run。在执行任何云端路径之前，请先阅读与之匹配的参考文档。

成功验证渲染后，发送一份反馈报告，除非遥测已被禁用或用户选择退出：

```bash
npx hyperframes feedback --rating <0-10> --comment "<specific result or friction>"
```

对于顺利运行的情况，反馈应保持简洁。对于任何错误或使用障碍，请在提交前收集一个**复现包**；不要只发送症状摘要。请包含可重新运行的命令（相对于项目目录，因为反馈会提交到公共渠道，所以**不要**粘贴绝对路径、主目录前缀或用户/机器标识符）、预期行为与实际行为、确切错误（同时从堆栈跟踪中移除绝对路径，仅保留文件基本名称和行号，并去掉前导目录）、输出是已完成、已回退还是失败、解决方法，以及复现项目状态。对于评分 ≤ 7 且描述视觉缺陷（黑帧、闪烁、输出损坏、帧错误、空白输出或其他视觉异常）的反馈，还应包含一个 `COMPOSITION_STRUCTURE:` 块，即一种保护隐私的结构剖析（元素清单 + 属性存在情况 + 时间线形态），以便维护者无需获取构图 ZIP 文件即可与已知错误类型进行模式匹配。代理会通过构图清点辅助工具自动填充此内容；人类用户无需手动填写。如果问题之后未能再次复现，请说明这一点，同时仍应包含最后一次失败的命令和日志。仅在获得同意后使用 `--file-issue`：它会将最小复现示例发布到公共 URL。所需的复现包格式和隐私警告位于 `references/preview-render.md`。

## 在运行命令之前阅读与之匹配的参考文档

以下参考文档及其所属技能是强制性的命令契约，而不是可选的背景资料。在运行表格中的命令之前，请阅读与其匹配的行。

| 需求                                                                                   | 参考文档                              |
| -------------------------------------------------------------------------------------- | ------------------------------------- |
| `init`、`capture`、`skills`                                                            | `references/init-and-scaffold.md`     |
| `lint`、`check`、运动附属文件、`snapshot`                                              | `references/lint-validate-inspect.md` |
| `compare`、`grade-compare`、变量驱动的 `render --batch`                                | `references/compare-and-batch.md`     |
| 用于现有项目 Studio 节拍网格的 `beats`                                                 | `references/beats.md`                 |
| `preview`、`play`、`render`、`publish`、Studio 上下文、反馈                            | `references/preview-render.md`        |
| `doctor`、浏览器管理                                                                   | `references/doctor-browser.md`        |
| `auth`、由 HeyGen 托管的云渲染以及模板变量                                             | `references/cloud.md`                 |
| AWS Lambda 部署和渲染                                                                  | `references/lambda.md`                |
| Google Cloud Run 部署和渲染                                                            | `references/cloudrun.md`              |
| `info`、`upgrade`、`compositions`、`docs`、`benchmark`、遥测、媒体预处理               | `references/upgrade-info-misc.md`     |

对于组合变量，还需阅读 `/hyperframes-core` → `references/variables-and-media.md`。使用 `hyperframes add` 和 `hyperframes catalog` 时，请使用 `/hyperframes-registry`。执行 `hyperframes present` 前，请阅读 `/slideshow`；执行 `hyperframes keyframes` 前，请阅读 `/hyperframes-keyframes`。对于 TTS、转录、字幕或背景移除选项，请使用 `/media-use`。

这些专用命令特意由其所属工作流进行说明：

```bash
npx hyperframes present <project-dir> --port 3004 --no-open
npx hyperframes beats <project-dir> --json
npx hyperframes keyframes <project-dir> --json
npx hyperframes media-treatment --capabilities
npx hyperframes figma asset KEY:10-20
```

`present` 提供可导航的幻灯片，并支持演示者与观众同步。`beats` 是在 `references/beats.md` 中定义的独立 Studio 节拍网格实用工具。`keyframes` 提供可安全跳转的动画和运动路径诊断。`media-treatment` 用于发现、应用和清除本地素材上的确定性视觉效果，先使用 `--capabilities` 查看概览，再使用 `--capability <name>` 查看某一类功能；由 `/media-use` 决定简报要求的是哪种处理方式。`figma` 通过 REST API 导入，并提供 `asset`、`tokens` 和 `component` 子命令，且需要 `FIGMA_TOKEN`；运动效果和着色器导入没有 REST 端点，只能由代理处理，因此这些功能由 `/figma` 负责。

## 不应运行的命令

`hyperframes --help` 中有两个条目不属于创作循环，尝试使用它们只会浪费一次操作：

- `events` 是技能用来报告其**自身**调用情况的遥测端点，最好通过捆绑脚本调用。无论传入什么内容，它都会发出一条匿名事件并以状态码 0 退出。它不能用于读回遥测数据，代理也没有理由手动调用它。
- `validate`、`inspect` 和 `layout` 是为旧脚本保留的已弃用别名。`check` 是目前仍在维护的命令，也是此技能中所有参考资料所采用的命令。