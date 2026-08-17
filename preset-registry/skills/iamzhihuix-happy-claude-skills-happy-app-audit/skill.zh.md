---
name: happy-app-audit
description: Audit a local macOS app's telemetry / reporting behavior using static analysis only. Reverse-engineers an .app bundle to identify embedded SDKs (AppLog/TEA, Parfait, TTNet, mars, MMKV, Sentry, Firebase, Bugly, Umeng, etc.), mapped upload endpoints, local on-disk queues, and privacy-relevant fields — without packet capture, network requests, debugger attach, or DRM bypass. Use when user asks to investigate, audit, or reverse-engineer a macOS app for telemetry, reporting, data upload, privacy, or SDK fingerprinting. Targets /Applications, ~/Applications, /Library/Input Methods, /Library/PrivilegedHelperTools, and similar local install paths.
metadata:
  author: iamzhihuix
  version: "0.1.0"
---
# Happy App 审计

仅通过静态分析进行 macOS 应用遥测审计。生成一份 Markdown 报告，说明已安装的 `.app` 包会上报哪些内容、向谁上报、上报频率（推断），以及会在磁盘上留下什么。

## 何时调用

当用户提到以下任一词语：“审计 / 调查 / 看看 / 拆 / 逆向 / 上报 / 埋点 / 隐私 / 抓 SDK”，并同时提供 `.app` 路径或应用名称时调用。当提供的路径位于 `/Applications`、`~/Applications`、`/Library/Input Methods` 或 `/Library/PrivilegedHelperTools` 下时，也应调用。

以下情况**不要**调用：源代码仓库、网站、移动端（iOS/Android）软件包——此技能专用于 macOS 应用包。

## 硬性规则（不可协商）

- **只读。** 不得对发现的端点使用 `curl/wget/nc/dig`。不得使用 `lldb attach`、`dtrace`、`fs_usage`、`tcpdump`、`mitmproxy`、`frida`。不得读取钥匙串。不得绕过 DRM。不得转储内存。
- **仅可使用允许的命令。** 参见 `references/safe_commands.md`。如果某个步骤似乎需要使用白名单之外的工具，应停止操作并告知用户，不得自行变通。
- **默认保护隐私。** 在每个输出文件中，将 `device_id`、`uid`、`session_id`、`email`、IDFV、IDFA、JWT 以及任何长度不小于 16 的十六进制数据块替换为 `<redacted:N>`（保留长度，删除内容）。
- **范围上限。** 如果单次调用的目标超过 5 个应用，则拒绝执行。拒绝处理 `/System/`、`/usr/libexec/`、`/private/var/db/com.apple.*` 下的路径。这些是操作系统组件，不是第三方遥测目标。

## 运行环境

`{baseDir}` = 此 SKILL.md 所在的目录。

所有脚本均使用 bun + TypeScript。按以下顺序确定运行时：优先使用 PATH 中的 `bun`，否则使用 `npx -y bun`。如果两者均不存在，则中止，并用一行文字提示如何安装。

```bash
# Smoke check
bun --version  ||  npx --version  ||  echo "Need bun (recommended) or npx"
```

## 工作流——按顺序执行 6 个阶段

每个阶段均包含：**目标 → 输入 → 命令 → 输出 → 停止条件**。不得跳过阶段。不得交错执行。

### 阶段 0——确认范围

**目标。** 将目标列表限定为不超过 5 个有效的 `.app` 路径。

**输入。** 用户提供的任何信息——可能是路径、名称，也可能是“我安装的输入法”。

**命令。**
- 如果用户提供了路径 → 验证路径存在且以 `.app` 结尾
- 如果用户提供了名称 → 搜索以下固定位置：
  ```bash
  /Applications         (depth 2)
  ~/Applications        (depth 2)
  /Library/Input Methods (depth 1)
  /Library/PrivilegedHelperTools  (depth 1)
  ```
- 拒绝处理 `/System/`、`/usr/libexec/`、`/private/var/db/com.apple.*` 下的任何内容

**输出。** 包含绝对路径的列表 `target_apps[]`。

**停止条件。** 如果列表为空，询问用户一次。如果超过 5 个，询问用户要保留哪些。

### 阶段 1——元数据快照

**目标。** 针对每个应用，采集其不可变的表层信息：包标识符、版本、签名、权限、网络策略、嵌入式框架。

**输入。** 来自阶段 0 的 `target_apps[]`。

**命令。** 运行 `scripts/snapshot_app.ts`：
```bash
bun {baseDir}/scripts/snapshot_app.ts <app-path> --out <workdir>/meta.json
```

该脚本采集：
- `plutil -p <app>/Contents/Info.plist`
- `codesign -dv --entitlements - <app>`（标准错误输出）
- `find <app>/Contents/Frameworks -maxdepth 3 -name '*.dylib' -o -name '*.framework'`
- `otool -L <main-binary>`
- 使用 `file <main-binary>` 获取架构
- 使用 `du -sh` 获取大小

**输出。** 生成 `<workdir>/meta.json`，包含：`bundle_id`、`version`、`sandboxed`、`arbitrary_loads`、`ats_exceptions[]`、`entitlements_summary[]`、`frameworks[]`（每项包含：name、path、size_bytes、archs）。

**停止。** 如果无法读取 `bundle_id` → 中止，应用格式异常。

### 阶段 2 — 字符串预处理

**目标。** 将每个嵌入式二进制文件的原始 `strings` 转换为按类别归档、可容纳于上下文中的 Markdown。

**输入。** `meta.json::frameworks[]`。

**命令。**
```bash
bun {baseDir}/scripts/classify_strings.ts <workdir>/meta.json --out <workdir>/strings/
```

对于每个二进制文件，脚本运行 `strings -a -n 6`，并将每一行分类到以下类别之一：
- `urls` — 匹配 `https?://` 的任何内容
- `domains` — 裸主机名
- `paths` — `/Library/...`、`~/Library/...`、容器相对路径
- `sql` — `CREATE TABLE`、`INSERT INTO`、`SELECT ... FROM`
- `events` — 看起来像事件名称（`/^[a-z][a-z0-9_]{8,80}$/`，且至少包含一个下划线）
- `keys` — 长度 ≥ 24 个字符的 base64 / 十六进制数据块（仅保留数量和前 12 个字符，绝不保留完整内容）
- `noise` — 丢弃

**输出。** `<workdir>/strings/<binary-name>.{urls,domains,paths,sql,events}.md`（`keys` 类别仅包含数量和经过脱敏的预览）。

**停止。** 如果某个二进制文件大于 200 MB → 跳过该文件并输出一行警告，不要导致 OOM。

### 阶段 3 — SDK 指纹匹配

**目标。** 识别存在哪些第三方 SDK，并确定置信度。

**输入。** `<workdir>/strings/`，以及 `references/sdk_fingerprints.md`。

**命令。**
```bash
bun {baseDir}/scripts/match_fingerprints.ts <workdir>/strings/ \
  --fingerprints {baseDir}/references/sdk_fingerprints.md \
  --out <workdir>/matched.md
```

脚本将每个指纹的 `tell-tale strings` 正则表达式集合应用于分类后的字符串。当某个指纹达到其 `min_hits` 阈值（每个指纹单独定义）时，即视为**已确认**。

**输出。** `<workdir>/matched.md`，每个 SDK 占一行：名称、供应商、命中数、证据文件行、状态（已确认 / 部分匹配 / 不存在）。

**停止。** 如果确认的指纹数量为零，并且应用未嵌入任何第三方 `.framework` → 写入一行“未检测到遥测”的报告，并跳过阶段 4-5。

### 阶段 4 — 端点映射

**目标。** 构建用于回答“它与哪些位置通信、使用什么协议、出于什么目的、频率如何？”的表格。

**输入。** `<workdir>/strings/*.urls.md` + `<workdir>/strings/*.domains.md` + `<workdir>/matched.md` + `references/known_endpoints.md`。

**命令。** 此阶段主要由 Claude 读取文件。唯一的机械处理步骤是：
```bash
bun {baseDir}/scripts/match_fingerprints.ts <workdir>/strings/ \
  --fingerprints {baseDir}/references/known_endpoints.md \
  --out <workdir>/endpoints.md
```

然后由 **Claude** 写入 `<workdir>/endpoint_table.md`：
| 端点 | SDK | 协议 | 推断用途 | 频率来源 |
|----------|-----|----------|------------------|------------------|

`Frequency source` 必须引用以下内容之一：在 `<workdir>/strings/` 中找到的字面时间间隔、在阶段 5 中找到的配置文件，或“未知 — 静态证据中未说明”。**绝不猜测。**

**停止。** 如果 `endpoints.md` 为空，但阶段 3 确认存在 SDK → 在报告中标记（可能是运行时解析的主机）。

### 阶段 5 — 本地数据深度分析

**目标。** 清点应用写入磁盘的数据范围。

**输入。** `meta.json::bundle_id`，以及 `references/data_locations.md`。

**命令。**
```bash
bun {baseDir}/scripts/inventory_data.ts <bundle_id> --out <workdir>/local_data.md
```

该脚本使用 `find` 查找：
- `~/Library/Application Support/<bundle>/`
- `~/Library/Containers/<bundle>/Data/`
- `~/Library/Group Containers/group.<bundle-prefix>.*/`
- `~/Library/Caches/<bundle>/`
- `~/Library/Preferences/<bundle>.plist`
- `~/Library/Logs/<bundle>/`

对于每个 `.sqlite*` 文件：仅执行 `sqlite3 <file> '.schema'` 和 `.tables` — **绝不执行 SELECT**。对于每个 `.mmkv` / `.json` 配置文件：列出路径和大小，不要打开。

**输出。** `<workdir>/local_data.md`，其中包含：相关路径的目录树、大小以及 SQLite 模式。

**停止。** 如果用户不是文件所有者 → 跳过并添加说明（不要提示使用 sudo）。

### 阶段 6 — 报告渲染（+ 可选的 4:5 卡片）

**目标。** 汇总生成面向用户的报告。可选择渲染一张用于分享的 4:5 信息图卡片。

**输入。** 之前所有阶段的输出。

**命令。**
```bash
bun {baseDir}/scripts/render_report.ts <workdir> \
  --template {baseDir}/templates/report.md.tmpl \
  --out ~/Documents/app-telemetry-audit/<YYYY-MM-DD>_<bundle-id>/report.md
```

向 `scripts/run.ts` 传递 `--card` 时，编排器还会：

1. 调用 `lib/card.ts::renderCardPrompt()`，提取按大小排序的前 6 个 SDK（涉及隐私的 SDK 标为红色）、前 6 个端点（优先采用 `endpoints.md` 中已确认的匹配项，附带中文用途标签，并为 `quic`/`-ws.` 主机合成协议），以及前 5 个本地数据存储桶（按父目录和注释合并，并合并 `DoubaoIme`/`doubaoime` 的大小写变体）。
2. 将填充后的提示词写入 `<workdir>/card_prompt.md`。
3. 自动查找位于 `~/.claude/skills/baoyu-imagine/scripts/main.ts` 的 `baoyu-imagine`（也可通过 `BAOYU_IMAGINE_SCRIPT` 环境变量指定），使用默认参数 `--ar 4:5 --quality 2k` 调用它，并写入 `<workdir>/card.png`。

传递 `--no-image` 可仅写入提示词并跳过图像调用。传递任意 `--image-*` 标志（`--image-provider`、`--image-model`、`--image-imageSize` 等）可覆盖默认值 — 例如，使用 `--image-provider google --image-model gemini-3-pro-image-preview --image-imageSize 4K` 可获得原生 nano-banana-pro 4K 输出。

如果未安装 `baoyu-imagine`，阶段 6 仍会写入 `card_prompt.md` 并输出安装提示，但会跳过 PNG。即使没有它，该技能仍可完整运行。

**输出。** 最终 Markdown 报告。输出其绝对路径。如果使用 `--card`，还会输出 `card_prompt.md` 和 `card.png`。

## 输出布局（每个应用）

```
~/Documents/app-telemetry-audit/<YYYY-MM-DD>_<bundle-id>/
├── meta.json
├── matched.md
├── endpoints.md
├── endpoint_table.md
├── local_data.md
├── strings/
│   └── <binary>.{urls,domains,paths,sql,events}.md
├── card_prompt.md          # only if --card requested
└── report.md               # the deliverable
```

工作文件（`strings/`、中间生成的 `*.md`）默认会保留——它们构成审计追踪记录。传入 `--clean` 可在写入 `report.md` 后将其删除。

## 快速开始

```bash
# Single app, full audit (markdown report only)
bun {baseDir}/scripts/run.ts /Library/Input\ Methods/DoubaoIme.app

# Add a 4:5 share card (prompt + PNG via baoyu-imagine)
bun {baseDir}/scripts/run.ts /Library/Input\ Methods/DoubaoIme.app --card

# Card prompt only — skip image generation
bun {baseDir}/scripts/run.ts /Library/Input\ Methods/DoubaoIme.app --card --no-image

# Card with Google nano-banana-pro at 4K
bun {baseDir}/scripts/run.ts /Library/Input\ Methods/DoubaoIme.app --card \
  --image-provider google \
  --image-model gemini-3-pro-image-preview \
  --image-imageSize 4K

# Multiple apps in one go (capped at 5)
bun {baseDir}/scripts/run.ts /Library/Input\ Methods/DoubaoIme.app /Applications/Foo.app
```

`scripts/run.ts` 是一个轻量级编排器，会依次调用阶段 1→6。常规场景下请使用它。仅在迭代时使用各阶段的独立脚本。

### `--card` 标志参数

| 标志 | 用途 | 默认值 |
|------|---------|---------|
| `--card` | 渲染 `card_prompt.md` 和 `card.png` | 关闭 |
| `--no-image` | 与 `--card` 搭配使用：写入提示词，跳过 PNG | 关闭 |
| `--image-provider` | baoyu-imagine 提供商（`google`、`openai`、`replicate`、`dashscope` 等） | 自动选择提供商 |
| `--image-model` | 提供商内的模型 ID | 提供商默认值 |
| `--image-ar` | 宽高比 | `4:5` |
| `--image-size` | 显式指定 `WxH` | 取自 `--image-quality` / 提供商 |
| `--image-quality` | `normal` 或 `2k` | `2k` |
| `--image-imageSize` | Google/OpenRouter 的 `1K`/`2K`/`4K` | 取自 `--image-quality` |
| `--out` | 覆盖输出根目录 | `~/Documents/app-telemetry-audit/` |

任何 `--image-*` 标志都会隐式启用 `--card`。

## 相关参考资料

- `references/safe_commands.md` — 命令白名单及其依据
- `references/sdk_fingerprints.md` — SDK 检测规则（MVP 支持 12 个以上的 SDK）
- `references/known_endpoints.md` — 域名 → 产品反向查询
- `references/data_locations.md` — 各供应商典型的磁盘存储布局
- `references/methodology_examples.md` — 两个完整示例（WeType、DoubaoIme）
- `templates/report.md.tmpl` — 最终报告框架
- `templates/card_prompt.md.tmpl` — 4:5 可视化卡片提示词框架

## Claude 不应采取的失败做法

- 不要在未引用字面证据行及文件路径的情况下，将字符串转述为“看起来像 X”
- 不要根据 SDK 名称推断频率——只能依据字符串或配置文件中的字面数值
- 不要运行目标应用内的任何二进制文件
- 不要打开 `.sqlite` 内容——只能查看其架构
- 当阶段 3 未发现任何内容时，不要编写报告——应改为写入简短的“未检测到遥测”说明
- 不要根据训练记忆编造端点；如果 URL 不在 `<workdir>/strings/` 中，就不得将其加入表格

## 验证（开发此 Skill 时）

对 `/Library/Input Methods/DoubaoIme.app` 运行冒烟测试，并确认报告涵盖：
- 框架：`applogrs`、`Parfait`、`bytenn`、`onnxruntime`、`sscronet`、`TTNet`、`ime_net_sdk`、`sami`
- 端点：至少包含以下 3 个：`ime.doubao.com/obric/ime/cloud/convert`、`log-klink.zijieapi.com`、`ime-gw.oceancloudapi.com`、`frontier-audio`
- 本地数据：`~/Library/Application Support/DoubaoIme/Parfait/ready/685343/0/`

回归测试：在微信输入法（WeType IME）应用包上运行，并确认出现 `wetype.weixin.qq.com` + `CACHE_LOG_TBL` schema。

负向测试：在一个不含第三方遥测的小型应用上运行——必须输出简短的“未检测到遥测”结果，不得虚构 SDK。