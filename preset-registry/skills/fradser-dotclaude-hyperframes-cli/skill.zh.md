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

除非项目说明提供了封装命令，否则请以 `npx hyperframes ...` 的形式运行命令。如果存在封装命令，请遵循其要求。CLI 需要 Node.js 22 或更高版本以及 FFmpeg。

## 开发循环

1. **搭建：**运行 `npx hyperframes init <project>` 或捕获一个网站。在非 TTY 模式下，传入 `--non-interactive --example=<name>`。
2. **创作：**使用 `/hyperframes-core` 编写合成内容。
3. **在编辑时快速获取反馈：**完成第一版 HTML 后以及进行结构性更改后，运行 `npx hyperframes lint`。
4. **运行最终门禁：**运行 `npx hyperframes check`；它会在打开浏览器之前重新运行 lint。不要在前面添加多余的独立 lint 调用。添加 `--snapshots` 可生成带标注的概览帧和问题截图。
5. **检查子合成：**当 `index.html` 挂载了 `data-composition-src` 时，捕获中点快照并检查每个已挂载的场景。
6. **打开最终 Studio 预览：**运行 `npx hyperframes preview`，将时间线项目 URL 交给用户，并询问是需要修改还是渲染。
7. **仅在获得批准后渲染：**迭代时使用草稿质量，交付时使用高质量。
8. **验证输出：**确认文件存在、非空，并且时长合理。

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

`check` 会先运行 lint，然后使用单个浏览器会话和一次定位过程来审查运行时错误、失败的请求、布局、`*.motion.json` 断言以及 WCAG 对比度。持续存在的问题会影响退出代码；仅在进入或退出期间短暂出现的问题只作为信息提示。使用 `--strict` 可将警告纳入门禁。`validate`、`inspect` 和 `layout` 仍作为兼容性别名保留，但不得出现在新的说明或脚本中。

## 两种不同的预览界面

不要混淆以下状态：

| 界面                      | 何时可以打开                                             | 用途                                                                      |
| ------------------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------- |
| 故事板面板                | 在合成检查之前，仅当 `storyboard: yes` 时               | 审查规划卡片和线框草图。打开 `?view=storyboard#project/<name>`。             |
| 最终合成预览              | `check` 通过后                                          | 在渲染前审查组装好的时间线。打开 `#project/<name>`。                         |

前期面板并不代表最终视频已获批准。渲染始终需要获得 `hyperframes-core/references/review-loop.md` 中定义的最终批准。

## 子合成冒烟测试

静态审查无法捕获每一种挂载失败。当项目使用子合成时，请为每个宿主插槽至少捕获一个可见的中点画面：

```bash
npx hyperframes snapshot --at <t1>,<t2>,<t3>
```

将微小的无样式内容、画布大小的图标、缺失的主视觉元素或时间线注册超时视为会阻塞渲染的挂载缺陷。相应的修复方法请参阅 `hyperframes-core/references/sub-compositions.md`。

## Agent 约定

- Agent 和 CI 调用应优先使用 `--json`。服务器模式下的 `render`、`preview` 和 `play` 不提供常规 JSON 输出；`preview --selection --json` 和 `preview --context --json` 是查询模式的例外。
- `doctor --json` 始终以零状态码退出。应根据其有效载荷进行门禁判断：

  ```bash
  npx hyperframes doctor --json | jq -e '.ok' >/dev/null
  ```

- 非 TTY 模式会自动启用。在该模式下，`init` 需要 `--example`；在 TTY 上使用 `--non-interactive` 可强制实现确定性行为。
- 同一验证循环中的所有命令应使用同一个 `HYPERFRAMES_RUN_ID`。
- 当相应的警告、变量或 CI 条件必须作为渲染门禁时，请使用 `--strict`、`--strict-all` 和 `--strict-variables`。
- JSON 路径会将主目录隐去为 `$HOME`；不要尝试逆向还原。
- 绝不能仅仅因为检查通过就执行渲染。应停留在最终预览阶段并等待批准。

## Studio 引导的编辑

当用户提到“此元素”或当前选区时，应查询 Studio，而不是进行猜测：

```bash
npx hyperframes preview --context --json --context-fields selection
```

如果可用，请使用 `selection.target.hfId`；否则使用其选择器和源文件。如果结果报告 `no-selection`，请让用户点击该元素并重新运行。只请求所需的上下文切片；仅在需要计算样式或可编辑文本元数据时使用 `--context-detail full`。完整行为和失败代码请参阅 `references/preview-render.md`。

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

当用户希望使用无需本地 Chrome、FFmpeg 或 AWS 的托管渲染时，请使用云渲染。仅当必须由用户拥有 AWS 资源时才使用 Lambda。仅当必须由用户拥有 GCP 资源时才使用 Cloud Run。在运行任何云端路径之前，请阅读对应的参考文档。

确认渲染成功后，发送一份反馈报告，除非遥测已被禁用或用户选择退出：

```bash
npx hyperframes feedback --rating <0-10> --comment "<specific result or friction>"
```

仅在获得同意后使用 `--file-issue`：它会将最小复现发布到公共 URL。错误报告格式和隐私警告位于 `references/preview-render.md`。

## 运行命令前阅读对应的参考文档

以下参考文档及其所属 Skill 是必须遵守的命令约定，而非可选的背景阅读材料。运行表中命令前，请阅读对应行中的参考文档。

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
| `info`、`upgrade`、`compositions`、`docs`、`benchmark`、遥测、媒体预处理                | `references/upgrade-info-misc.md`     |

对于合成变量，还需阅读 `/hyperframes-core` → `references/variables-and-media.md`。对于 `hyperframes add` 和 `hyperframes catalog`，请使用 `/hyperframes-registry`。在使用 `hyperframes present` 前，请阅读 `/slideshow`；在使用 `hyperframes keyframes` 前，请阅读 `/hyperframes-keyframes`。对于 TTS、转录、字幕或背景移除选项，请使用 `/media-use`。

这些专用命令特意由其所属工作流进行说明：

```bash
npx hyperframes present <project-dir> --port 3004 --no-open
npx hyperframes beats <project-dir> --json
npx hyperframes keyframes <project-dir> --json
```

`present` 提供支持演示者与观众同步的可导航幻灯片。`beats` 是在 `references/beats.md` 中定义的独立 Studio 节拍网格工具。`keyframes` 用于呈现可安全跳转的动画和运动路径诊断信息。