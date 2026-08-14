---
name: dogfood
description: 'Systematically explore and test a mobile app on iOS/Android with agent-device to find bugs, UX issues, and other problems. Use when asked to "dogfood", "QA", "exploratory test", "find issues", "bug hunt", or "test this app" on mobile. Produces a structured report with reproducible evidence: screenshots, optional repro videos, and detailed steps for every issue.'
allowed-tools: Bash(agent-device:*), Bash(npx agent-device:*)
---
# 自用测试（agent-device）

系统性地探索移动应用、发现问题，并为每个发现生成包含完整复现证据的报告。

## 设置

只需提供**目标应用**。其他所有参数均有合理的默认值。

| 参数               | 默认值                                                      | 覆盖示例                                     |
| -------------------- | ----------------------------------------------------------- | -------------------------------------------- |
| **目标应用**         | _（必填）_                                                  | `Settings`、`com.example.app`、深度链接 URL |
| **平台**             | 根据用户上下文推断；否则询问（`ios` 或 `android`）          | `--platform ios`                             |
| **会话名称**         | 应用/平台的 slug 化形式（例如 `settings-ios`）              | `--session my-session`                       |
| **输出目录**         | `./dogfood-output/`                                         | `Output directory: /tmp/mobile-qa`           |
| **范围**             | 完整应用                                                    | `Focus on onboarding and profile`            |
| **身份验证**         | 无                                                          | `Sign in to user@example.com`                |

如果用户提供的上下文足以开始，则立即使用默认值执行。仅当缺少必要信息（例如平台或凭据）时才进行后续询问。

如果可以使用，请优先直接使用 `agent-device` 二进制文件。

## 工作流程

```
1. Initialize    Set up session, output dirs, report file
2. Launch/Auth   Open app and sign in if needed
3. Orient        Capture initial snapshot and map navigation
4. Explore       Systematically test flows and states
5. Document      Record reproducible evidence per issue
6. Wrap up       Reconcile summary, close session
```

### 1. 初始化

```bash
mkdir -p {OUTPUT_DIR}/screenshots {OUTPUT_DIR}/videos
cp {SKILL_DIR}/templates/dogfood-report-template.md {OUTPUT_DIR}/report.md
```

### 2. 启动/身份验证

启动命名会话并打开目标应用：

```bash
agent-device --session {SESSION} open {TARGET_APP} --platform {PLATFORM}
agent-device --session {SESSION} snapshot -i
```

如果需要登录：

```bash
agent-device --session {SESSION} snapshot -i
agent-device --session {SESSION} fill @e1 "{EMAIL}"
agent-device --session {SESSION} fill @e2 "{PASSWORD}"
agent-device --session {SESSION} press @e3
agent-device --session {SESSION} wait 1000
agent-device --session {SESSION} snapshot -i
```

对于 OTP/电子邮件验证码：向用户询问，等待输入，然后继续。

### 3. 熟悉应用

捕获初始证据和导航定位点：

```bash
agent-device --session {SESSION} screenshot {OUTPUT_DIR}/screenshots/initial.png
agent-device --session {SESSION} snapshot -i
```

在进行深入测试之前，先梳理顶层导航、标签页和关键工作流。

### 4. 探索

阅读 [references/issue-taxonomy.md](references/issue-taxonomy.md)，以校准严重程度和类别。

策略：

- 依次检查应用的每个主要区域（标签页、抽屉、设置页面）。
- 端到端测试核心流程（创建、编辑、删除、提交、恢复）。
- 验证边缘状态（空状态/错误/加载中/离线/权限被拒绝）。
- 在 UI 转换后使用 `diff snapshot -i`，避免引用过期。
- 定期获取 `logs path`；当行为看起来可疑时，检查应用日志。

每个界面的常用命令：

```bash
agent-device --session {SESSION} snapshot -i
agent-device --session {SESSION} screenshot {OUTPUT_DIR}/screenshots/{screen-name}.png
agent-device --session {SESSION} appstate
agent-device --session {SESSION} logs path
```

### 5. 记录问题（复现优先）

在一次流程中完成探索和记录。发现问题时，先停下来完整收集证据，再继续探索。

#### 交互/行为问题

使用视频和分步骤截图：

1. 开始录制：

```bash
agent-device --session {SESSION} record start {OUTPUT_DIR}/videos/issue-{NNN}-repro.mp4
```

2. 以清晰可见的节奏复现。捕获每个步骤：

```bash
agent-device --session {SESSION} screenshot {OUTPUT_DIR}/screenshots/issue-{NNN}-step-1.png
sleep 1
# perform action
sleep 1
agent-device --session {SESSION} screenshot {OUTPUT_DIR}/screenshots/issue-{NNN}-step-2.png
```

3. 捕获最终的异常状态：

```bash
sleep 2
agent-device --session {SESSION} screenshot {OUTPUT_DIR}/screenshots/issue-{NNN}-result.png
```

4. 停止录制：

```bash
agent-device --session {SESSION} record stop
```

5. 立即将问题追加到报告中，并包含带编号的步骤和截图引用。

#### 静态/加载时问题

单张截图即可，无需视频：

```bash
agent-device --session {SESSION} screenshot {OUTPUT_DIR}/screenshots/issue-{NNN}.png
```

在报告中将 **复现视频** 设置为 `N/A`。

### 6. 收尾

以收集 5-10 个证据充分的问题为目标，然后完成以下工作：

1. 核对 `report.md` 中摘要部分的各严重程度问题数量。
2. 关闭会话：

```bash
agent-device --session {SESSION} close
```

3. 报告问题总数、严重程度分布以及风险最高的发现。

## 指导原则

- 复现质量比问题数量更重要。
- 使用引用（`@eN`）进行快速探索；需要确定性重放断言时，使用选择器。
- 每次状态变更后都重新获取快照（导航、模态框、列表更新、表单提交）。
- 使用 `fill` 实现先清除后输入；使用 `type` 检查增量输入行为。
- 日志应按需使用并聚焦目标：仅在有助于诊断时启用/读取应用日志。
- 切勿读取受测应用的源代码；所有发现都必须来自对运行时行为的观察。
- 立即记录每个问题，以免丢失证据。
- 会话期间切勿删除截图、视频或报告产物。

## 参考资料

| 参考资料                                                     | 阅读时机                          |
| ------------------------------------------------------------ | --------------------------------- |
| [references/issue-taxonomy.md](references/issue-taxonomy.md) | 会话开始时；严重程度/类别/检查表 |

## 模板

| 模板                                                                         | 用途                         |
| ---------------------------------------------------------------------------- | ---------------------------- |
| [templates/dogfood-report-template.md](templates/dogfood-report-template.md) | 复制到输出目录作为报告文件   |