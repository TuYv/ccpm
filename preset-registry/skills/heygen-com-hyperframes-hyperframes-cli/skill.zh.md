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

除非项目说明提供了封装命令，否则请以 `npx hyperframes ...` 的形式运行命令。如果存在封装命令，请遵循其要求。该 CLI 需要 Node.js 22 或更高版本以及 FFmpeg。

## 开发循环

1. **搭建：**运行 `npx hyperframes init <project>` 或捕获一个网站。在非 TTY 模式下，请传入 `--non-interactive --example=<name>`。
2. **寻找合适的动效：**在手动编写动效之前，先搜索是否已有可实现该效果的原语：`npx hyperframes catalog --query "reveal a headline one line at a time"`。应描述你想要的效果，而不是你心中设想的实现机制。使用 `npx hyperframes add <name>` 安装（参见 `/hyperframes-registry`）。只有在找不到合适的原语时，才手动编写。
3. **编写：**使用 `/hyperframes-core` 编写合成内容。
4. **在编辑时快速获取反馈：**完成第一版 HTML 后以及进行结构性更改后，运行 `npx hyperframes lint`。
5. **运行最终检查关卡：**运行 `npx hyperframes check`；它会在打开浏览器之前重新运行 lint。不要在前面额外添加一次多余的独立 lint 调用。添加 `--snapshots` 可生成带注释的概览帧和问题区域裁剪图。
6. **检查子合成：**当 `index.html` 挂载了 `data-composition-src` 时，捕获中点快照并检查每个已挂载的场景。
7. **打开最终 Studio 预览：**运行 `npx hyperframes preview`，将时间线项目 URL 提供给用户，并询问是需要修改还是渲染。
8. **仅在获得批准后渲染：**迭代时使用草稿质量，交付时使用高质量。
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

`check` 会先运行 lint，然后使用一个浏览器会话和一次定位流程来审查运行时错误、失败的请求、布局、`*.motion.json` 断言以及 WCAG 对比度。持续存在的问题会影响退出代码；入场或退场期间的瞬时问题仅作为信息提示。使用 `--strict` 可让警告也影响检查结果。为保持兼容性，`validate`、`inspect` 和 `layout` 仍作为别名保留，但不得出现在新的说明或脚本中。

## 两种不同的预览界面

不要混淆以下状态：

| 界面                      | 何时可以打开                                           | 用途                                                                              |
| ------------------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------- |
| 故事板面板                | 仅当 `storyboard: yes` 时，在合成检查之前              | 审查规划卡片和线框草图。打开 `?view=storyboard#project/<name>`。                  |
| 最终合成预览              | `check` 通过后                                         | 在渲染前审查组装完成的时间线。打开 `#project/<name>`。                            |

早期分镜板并不代表最终视频已获批准。渲染始终需要获得 `hyperframes-core/references/review-loop.md` 中定义的最终批准。

## 子合成冒烟测试

静态审查无法发现所有挂载失败问题。当项目使用子合成时，请为每个宿主插槽至少捕获一个可见的中间时刻：

```bash
npx hyperframes snapshot --at <t1>,<t2>,<t3>
```

应将微小且无样式的内容、画布大小的图标、缺失的主视觉元素或时间轴注册超时视为阻塞渲染的挂载缺陷。相应的修复方法请参阅 `hyperframes-core/references/sub-compositions.md`。

## Agent 约定

- **手动编写动效之前，先搜索目录。** `npx hyperframes catalog --query "<the beat, in plain language>"`。搜索完全在本地进行：没有托管层级，无需账户，查询文本也绝不会发送到任何地方。默认情况下，它会根据与条目的名称、标题和描述共享的词汇进行排序，因此任何未复用目录自身措辞的表达都可能无法匹配。添加 `--on-device` 可改为按语义排序（参见下文的离线层级）。
- **确认由哪个层级返回结果；绝不要根据是否出现结果来推断。** 使用 `--json` 时，封装对象会包含 `query`、`tier`（`on-device` 或 `words`）、`tier_detail`、`dropped`、`unindexed`、`shown`、`total` 和 `results`；此外，当响应层级会生成分数时，还会包含 `top_score`，而当请求的层级无法运行时，则会包含 `warnings`。在 `words` 层级出现较弱的结果属于预期行为；若同样的结果出现在 `on-device` 层级，则属于 bug。`top_score` 仅适用于设备端层级，并且不存在与之对应的阈值：对于每次查询，排序器都会按某种顺序返回整个目录，因此应将其视为证据，而不是通过或失败的判定。
- **`dropped` 和 `unindexed` 表示注册表与设备端索引之间方向相反的偏差，改写查询无法修复任何一种偏差。** `dropped` 统计已参与排序但当前注册表无法安装的名称，因此丢失的恰恰是最强的匹配项。`unindexed` 统计索引完全无法看到的注册表动效，无论如何查询都不可能返回它们。刷新注册表并不能解决其中任何一种问题：其清单带有 24 小时 TTL，能够自行修复；而向量则是单独发布的制品，会提取到 `~/.hyperframes/catalog/` 中。当 `unindexed` 大于零时，使用 `--on-device` 重新运行会重新提取该索引，因此应将此解决方法告知用户。仅存在覆盖过度的偏差（`dropped` 大于零而 `unindexed` 为零）不会触发重新提取；清除 `~/.hyperframes/catalog/` 是摆脱该问题的唯一方法。这两个计数统计的都是名称而非结果，因此任一计数都可能超过 `total`。
- **当语义搜索未返回任何值得安装的内容时，应明确说明。** `npx hyperframes feedback --search-miss "<the query you ran>" --wanted "<the move you needed>" --tier on-device`。这是唯一会将查询发送到其他地方的路径，而且它被设计为一个独立的显式命令，正是为了让普通的 `catalog --query` 能够信守“不发送任何内容”的承诺。当设备端层级已返回结果，但排名最靠前的命中项仍无法实现所需效果时，请报告此次未命中；`words` 层级返回较弱结果属于预期行为，不值得报告。返回的是目录尚未包含的动效列表，这些信息会被直接读取，而不是根据安装次数猜测得出，因此真正重要的措辞是你想要的效果，而不是你设想的条目名称。它不包含评分，也绝不会计入评分指标。
- **提供离线层级选项；绝不要静默启用。** 首次使用需要下载约 33 MB 的内容（`bge-small-en-v1.5` 的量化 ONNX 构建及其分词器，固定到特定修订版本）以及注册表中的目录向量；两者都会缓存在 `~/.hyperframes/` 下，不会添加到项目或任何软件包中。缓存完成后，它可以按语义排序，且不会发送任何内容。明确告知下载大小并让用户自行决定；用户同意后，再传入 `--on-device`（同时使用 `-y` 可跳过提示）。交互式选项仅会在 TTY 中触发，而使用 `--json` 时完全不会输出相关信息，因此在 Agent 运行过程中，你必须主动向用户提出该选项。

- 对于智能体和 CI 调用，优先使用 `--json`。服务器模式下的 `render`、`preview` 和 `play` 不提供常规 JSON 输出；`preview --selection --json` 和 `preview --context --json` 是查询模式下的例外。
- `doctor --json` 始终以零状态码退出。请根据其载荷进行门禁判断：

  ```bash
  npx hyperframes doctor --json | jq -e '.ok' >/dev/null
  ```

- 非 TTY 模式会自动启用。在该模式下，`init` 要求提供 `--example`；在 TTY 上使用 `--non-interactive` 可强制实现确定性行为。
- 对同一验证循环中的所有命令使用同一个 `HYPERFRAMES_RUN_ID`。
- 当相应的警告、变量或 CI 条件必须作为渲染门禁时，请使用 `--strict`、`--strict-all` 和 `--strict-variables`。
- JSON 路径会将主目录脱敏为 `$HOME`；不要尝试逆向还原脱敏内容。
- 当托管的云项目接近或超过 200 MB 上传限制时，请使用 `cloud render --dry-run --json`，并按照 `references/cloud.md` 中的 `.hyperframesignore` 排查流程操作。绝不要仅仅因为某个资源文件很大就忽略它。
- 绝不要仅仅因为检查通过就执行渲染。请停在最终预览阶段并等待批准。

## Studio 引导的编辑

当用户提到“此元素”或当前选区时，请查询 Studio，而不要猜测：

```bash
npx hyperframes preview --context --json --context-fields selection
```

如果可用，请使用 `selection.target.hfId`，否则使用其选择器和源文件。如果结果报告 `no-selection`，请让用户点击该元素并重新运行。仅请求所需的上下文切片；只有在需要计算样式或可编辑文本元数据时才使用 `--context-detail full`。完整行为和失败代码请参阅 `references/preview-render.md`。

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

Skill 归因是自动完成的——上述示例无需使用 `--skill`。由工作流搭建的项目（`hyperframes init --skill=<workflow>`）会在 `hyperframes.json` 中记录其所属 Skill，之后的每次渲染都会在匿名遥测中继承该信息，包括重新渲染、`npm run render` 和 `--batch`。只有在需要为并非通过工作流创建的项目标记 Skill 时，才显式传入 `--skill=<slug>`（该项目首次渲染后会持久化此设置）。

当用户希望使用托管渲染，而无需本地安装 Chrome、FFmpeg 或使用 AWS 时，请使用云渲染。仅当要求由 AWS 托管时才使用 Lambda。仅当要求由 GCP 托管时才使用 Cloud Run。在运行任何云端路径之前，请先阅读对应的参考文档。

验证渲染成功后，发送一份反馈报告，除非遥测已被禁用或用户选择退出：

```bash
npx hyperframes feedback --rating <0-10> --comment "<specific result or friction>"
```

对于顺利运行的情况，反馈应保持简洁。对于任何错误或使用障碍，请在提交前收集一份**复现资料包**；不要只发送症状摘要。应包含可重新运行的命令（相对于项目目录——反馈会提交到公共渠道，因此**不要**粘贴绝对路径、主目录前缀或用户/机器标识符）、预期行为与实际行为、确切错误（同时移除堆栈跟踪中的绝对路径——保留文件基本名称和行号，删除前导目录）、输出是已完成、已回退还是失败、解决方法，以及复现项目状态。对于评分 ≤ 7 且描述视觉缺陷（黑帧、闪烁、输出损坏、帧错误、空白输出或其他视觉异常）的反馈，还应包含一个 `COMPOSITION_STRUCTURE:` 块——这是一份保护隐私的结构剖析（元素清单 + 属性存在情况 + 时间线形态），以便维护者无需获取合成项目 ZIP 即可与已知错误类别进行模式匹配。代理会通过合成清点辅助工具自动填充此内容；人类用户无需手动填写。如果问题未能再次复现，请予以说明，但仍需包含最后一次失败的命令和日志。仅在获得同意后使用 `--file-issue`：它会将最小复现项目发布到公共 URL。所需的资料包格式和隐私警告位于 `references/preview-render.md` 中。

## 运行命令前阅读对应的参考文档

以下参考文档及其所属技能是强制性的命令契约，而非可选的背景资料。在运行表中的命令之前，请阅读对应行中的参考文档。

| 需求                                                                                   | 参考文档                              |
| -------------------------------------------------------------------------------------- | ------------------------------------- |
| `init`、`capture`、`skills`                                                            | `references/init-and-scaffold.md`     |
| `lint`、`check`、运动附属文件、`snapshot`                                              | `references/lint-validate-inspect.md` |
| `compare`、`grade-compare`、变量驱动的 `render --batch`                                | `references/compare-and-batch.md`     |
| 用于现有项目 Studio 节拍网格的 `beats`                                                 | `references/beats.md`                 |
| `preview`、`play`、`render`、`publish`、Studio 上下文、反馈                            | `references/preview-render.md`        |
| `doctor`、浏览器管理                                                                   | `references/doctor-browser.md`        |
| `auth`、HeyGen 托管的云渲染和模板变量                                                  | `references/cloud.md`                 |
| AWS Lambda 部署和渲染                                                                  | `references/lambda.md`                |
| Google Cloud Run 部署和渲染                                                            | `references/cloudrun.md`              |
| `info`、`upgrade`、`compositions`、`docs`、`benchmark`、遥测、媒体预处理               | `references/upgrade-info-misc.md`     |

对于合成变量，还应阅读 `/hyperframes-core` → `references/variables-and-media.md`。对于 `hyperframes add` 和 `hyperframes catalog`，请使用 `/hyperframes-registry`。在运行 `hyperframes present` 之前，请阅读 `/slideshow`；在运行 `hyperframes keyframes` 之前，请阅读 `/hyperframes-keyframes`。对于 TTS、转录、字幕或背景移除选项，请使用 `/media-use`。

这些专用命令特意由其所属的工作流进行说明：

```bash
npx hyperframes present <project-dir> --port 3004 --no-open
npx hyperframes beats <project-dir> --json
npx hyperframes keyframes <project-dir> --json
```

`present` 提供可导航的幻灯片，并支持演讲者与观众同步。`beats` 是在 `references/beats.md` 中定义的独立 Studio 节拍网格实用工具。`keyframes` 用于呈现可安全跳转的动画和运动路径诊断信息。