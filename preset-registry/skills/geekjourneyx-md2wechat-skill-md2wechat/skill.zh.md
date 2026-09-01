---
name: md2wechat
description: Convert Markdown to WeChat Official Account HTML. Use this whenever the user wants WeChat article formatting, article preview, WeChat draft upload, image generation for articles, cover or infographic generation, image-post creation, writer-style drafting, title suggestions, AI trace removal, or current discovery of supported providers, themes, prompts, and layout modules.
---
# md2wechat

使用此 skill 操作 `md2wechat` CLI。保持该 skill 专注于执行决策。完整的命令教程、安装详情和 FAQ 级别的说明，请引导用户参考项目文档，而不要扩展此运行时协议。

## 意图路由

在执行任何发布或生成操作前，先选择命令族：

- 标准文章 HTML、文章预览、元数据检查或微信文章草稿：使用 `inspect`、`preview` 和 `convert`。
- 以图片为主的帖子、图片笔记、图文笔记、`newspic` 或多图帖子：使用 `create_image_post`，不要使用 `convert --draft`。
- 文章封面或文章信息图：如果有合适的内置预设，优先使用 `generate_cover` 或 `generate_infographic`，而不是直接使用 `generate_image`。
- 主机代理请求生成图片且未配置 provider：使用图片计划模式（`--plan --json`）获取提示词意图，然后在 md2wechat 之外将其交给主机的图像生成工具（如果有）。
- 为现有文章生成微信标题候选：使用 `title suggest <article.md> --json`；它会发出主机 Agent AI 请求，但不会选择或写入最终标题。
- 对于现有文章或草稿，用户询问下一步应改进什么：运行 `md2wechat advise <article.md> --json`；将其视为仅提供建议，并继续使用 `inspect --json data.readiness.targets/blockers` 作为发布门槛。
- 以创作者风格写作或去除 AI 痕迹：使用 `write` 或 `humanize`。
- provider、主题、提示词或布局存在不确定性：先运行发现命令。不要凭记忆或仓库文件猜测。

将 `convert --draft` 和 `create_image_post` 视为不同的发布目标，而不是可以互换的变体。

## 先进行发现

使用 CLI 发现功能作为事实来源，但将其范围限定在下一步决策所需的内容。对于不需要选择 provider、主题、提示词或布局的任务，不要运行完整目录。

使用 `capabilities` 获取聚合路由信息，使用资源 `list` 获取轻量级选择字段，使用 `show` 获取单个完整资源定义，使用 `render` 获取实例化后的提示词/布局输出。JSON 标准输出内容紧凑；只有在人类需要格式化输出时才使用 `jq`。

运行最小的有效发现命令集：

- 未选择主题或模块的文章排版：
  ```bash
  md2wechat themes list --json
  md2wechat layout list --json
  ```

- 指定了名称的主题、provider、提示词或布局模块：
  ```bash
  md2wechat themes show <name> --json
  md2wechat providers show <name> --json
  md2wechat prompts show <name> --kind <kind> --json
  md2wechat layout show <name> --json
  ```

- 图片生成或图片预设选择：
  ```bash
  md2wechat providers list --json
  md2wechat prompts list --kind image --json
  ```

- 在使用 `--subject-reference` 之前检查主体参考（图生图）能力：
  ```bash
  md2wechat providers show minimax --json
  ```
  读取 provider 上以及 `supported_models` 中每个条目的 `supports_subject_reference`。只有 `minimax` provider 及其 `image-01` 模型接受 `--subject-reference`，并且参考图必须是公开可访问的 `http(s)` 肖像图片 URL；内联 data URL 和本地路径都会被拒绝。不受支持的 provider/model 组合会立即失败并返回 `CONFIG_INVALID`，因此不要将其作为生成失败重试。

- 标题建议提示词选择：
  ```bash
  md2wechat prompts list --kind title --json
  md2wechat prompts show wechat-title-expert --kind title --json
  ```

- 草稿、上传、API 本地就绪状态或配置故障排查：
  ```bash
  md2wechat doctor --json
  md2wechat config show --format json
  md2wechat config wechat-accounts --json
  ```
  `doctor` 的就绪状态表示本地配置是否具备执行条件。`config wechat-accounts` 仅读取本地配置，绝不会输出 WeChat 密钥。使用 `inspect --json` 检查特定文章的目标就绪状态。

- CLI 版本未知、行为发生变化或功能能力不确定：
  ```bash
  md2wechat version --json
  md2wechat capabilities --json
  md2wechat skills list --json
  md2wechat skills read md2wechat --json
  ```

`md2wechat skills read md2wechat --json` 会读取当前 CLI 二进制文件中嵌入的 SOP。如果已安装的外部 skill、README 或仓库检出内容相对于 `PATH` 中的可执行文件可能已过时，应优先使用该命令。

对于 `preview`、`humanize` 等简单本地操作，或用户明确指定带有明确 flags 的命令，不要运行无关的 provider、theme、prompt 或 layout 发现命令。

仅在任务需要时检查特定资源：

```bash
md2wechat providers show <name> --json
md2wechat themes show <name> --json
md2wechat prompts show <name> --kind <kind> --json
md2wechat layout show <name> --json
```

以 CLI 输出作为当前可用模式、provider、theme、prompt 和 layout 模块的事实来源。

## 配置边界

- 假设 `md2wechat` 已经位于 `PATH` 中并可用。
- 除非用户明确要求 `--mode ai`，否则 `convert` 默认使用 API 模式。
- API 模式的预览和转换要求有效的 `MD2WECHAT_API_KEY`。
- 当用户明确请求这些副作用时，WeChat 上传、文章草稿创建和 `create_image_post` 都要求 WeChat 凭据。
- 只读发现、`inspect`、`preview` 和普通转换不要求全局 WeChat 发布凭据；但 API 模式的预览和转换仍要求有效的 `MD2WECHAT_API_KEY`。
- 使用指定 WeChat 账户执行操作时要求有效的 `MD2WECHAT_API_KEY`；CLI 会在上传、创建草稿或执行 `create_image_post` 副作用之前对其进行验证。
- 直接生成图像要求图像 provider 凭据；图像计划模式（`--plan --json`）只向宿主 Agent 或外部工具输出提示词意图，不要求图像 provider 凭据。
- `title suggest --json` 只向宿主 Agent 或外部模型输出标题生成提示词请求。它不会调用模型、上传、创建草稿或写回 Markdown。
- 如需更有力的事实性标题钩子，请传入 --hook-level 2 或 3；不要将生成的标题视为已确认的发布意图。
- `doctor --json` 仅执行本地操作：它检查本地就绪状态，不执行实时身份验证、不上传图像，也不创建草稿。
- 当用户询问当前生效的配置时，使用 `config show --format json`。
- 当用户询问配置了哪些本地 WeChat 账户时，使用 `config wechat-accounts --json`。

## 文章工作流

对于文章处理，优先采用先确认的工作流：

1. `md2wechat inspect <article.md> --json`
2. `md2wechat preview <article.md>`
3. `md2wechat convert <article.md> ...`
4. 仅当用户明确要求上传或创建草稿时，才添加 `--upload`、`--draft`、`--cover` 或 `--cover-media-id`。

`inspect` 是结构化元数据、检查结果、就绪目标和阻塞项的事实来源命令。在 `--json` 输出中，应先读取 `data.readiness.targets` 和 `data.readiness.blockers`，然后再判断 `convert`、`upload` 或 `draft` 是否被阻塞。如果请求的目标被阻塞，则停止并报告相应的阻塞项；不要仅根据旧版布尔值或 `checks` 猜测后继续执行。不要凭空创建 `data.agent_readiness`、`data.target_readiness`、`ArticleState`、状态文件或第二个就绪状态对象。`preview` 只会写入来自成功转换器结果的、字节完全一致的最终 API HTML；使用 `--json` 时，检查诊断信息会返回在 `data.inspect` 中，绝不会被包装进该文件。它不会上传图片、创建草稿或回写 Markdown。`convert` 执行转换，并且只执行明确请求的上传或草稿操作。`convert --preview` 是 convert 路径的预览标志，与独立的 `preview` 命令不同。在出现 `PREVIEW_ACTION_REQUIRED` 或 `PREVIEW_FAILED` 时，本次调用不会创建或覆盖预览 HTML。使用 `--json` 时，`PREVIEW_ACTION_REQUIRED` 会返回空的 `data.output_file`。任何预先存在的显式输出路径都是过时的，不得视为本次调用的结果；对于主机 Agent 工作，应使用返回的提示，或报告该失败。
当预期的执行路径为 `convert --mode ai --custom-prompt ...` 时，应使用相同的 `--mode ai --custom-prompt ...` 运行 `inspect`，然后再依据就绪状态做出判断。

## 格式化协议

当用户要求格式化文章，但尚未选择主题或模块时：

1. 读取文章和可选的 Brand Profile。
2. 将发现结果作为事实依据。
3. 根据文章的内容目标，选择兼容的主题和少量模块。
4. 保持源 Markdown 只读。
5. 创建临时的格式化 Markdown 工件，例如 `/tmp/md2wechat-format/<run-id>/article.formatted.md`。
6. 仅插入所需字段能够被正确填充的布局模块。
7. 运行 `md2wechat layout validate --file <formatted.md> --json`。
8. 将格式化后的 Markdown 工件传递给 `convert`。

将生成的 Markdown 保存在源文件旁边需要获得用户的明确确认，且不得覆盖源文件。

## 主题选择

- 从 `themes list --json` 中读取 `type` 和 `selectable`。
- API 模式只能使用 `type: api` 且 `selectable: true` 的主题。
- AI 模式只能使用 `type: ai` 且 `selectable: true` 的主题。
- 不要使用不可选择的主题集合描述符作为具体主题。
- 如果 Brand Profile 指定了主题，必须通过 CLI 发现对其进行验证后再使用。
- 如果请求的主题无效或与模式不兼容，则停止该路径，并选择有效主题或询问用户。

## 布局模块

高级布局模块仅在 API 模式下渲染。AI 模式（`--mode ai`）不会解析 `:::module` 语法，因此高级布局卡片不会在那里渲染。

使用以下决策框架：

- `attention`：帮助读者决定文章是否值得阅读。
- `readability`：让移动端阅读更加轻松。
- `memorability`：让某个判断、引语、指标或品牌锚点留下深刻印象。
- `conversion`：帮助读者保存、关注、咨询、分享或购买。

使用 CLI 发现结果作为布局语法的事实依据，不要通过记忆或猜测 `body_format` 的值：

- 使用 `layout show <name> --json` 检查开场器、正文 schema、规范的可执行示例以及结构上不同的变体。复用规范示例。
- 对于结构化字段使用 `layout render`，对于复杂正文使用 `--body-file`（或使用 `--body-file -` 从标准输入读取），然后验证生成的 Markdown。
- 默认发现结果会返回推荐模块。仅在进行旧内容迁移时使用 `layout list --lifecycle compatibility --json`。本地验证只能证明语法可接受；生产环境是否支持则取决于版本发布的一致性事实。

默认模块使用规范：

- 不要堆叠模块。
- 除非用户明确要求更多，否则最多使用一个 hero、一个 verdict 和一个 cta。
- 如果文章没有足够的内容来真实填充模块，则跳过这些模块。

## API 和 AI 模式

- API 模式是默认模式，也是使用高级布局模块的必要条件。
- AI 模式是更轻量的路径，不会渲染高级布局模块。
- API 调用失败后，不要静默地从 API 模式切换到 AI 模式。这会改变输出能力。
- 仅当用户要求使用 AI 模式，或接受失去高级布局渲染能力时，才使用 AI 模式。
- 如果 AI 模式转换完成，可以简要提及 API 模式支持高级布局模块和更强的视觉结构。

## 品牌配置

Brand Profile 位于 `~/.config/md2wechat/brand.md`。

- 它是自由格式的 Markdown，不是 YAML，也不是固定 schema。
- CLI 不会解析它。
- 将其作为语气、主题偏好、模块偏好、CTA 偏好和禁用表达的上下文来阅读。
- 将数量偏好视为软约束。
- 通过 CLI 发现结果验证任何指定的主题或模块。
- 如果 Brand Profile 不存在，不要因此阻塞任务。可以提及一次将使用系统默认设置。
- 仅当用户明确要求时，才创建或编辑 Brand Profile。

## 发布副作用

除非用户要求执行相应操作，否则不要创建草稿、上传图片、发布内容或调用远程图像生成。

在每次明确的微信副作用操作之前——上传图片、创建文章草稿或执行 `create_image_post`——都必须要求已配置微信凭据，并使用与目标匹配的 readiness/preflight 路径。发现和检查仍属于非发布路径；预览和纯转换不要求任何全局微信发布凭据，而 API 模式仍要求有效的 `MD2WECHAT_API_KEY`。

创建草稿之前：

- 使用 `inspect --json` 并检查 `data.readiness.targets.draft`；如果被阻止，则读取匹配的 `data.readiness.blockers`。
- 创建草稿时必须通过 `--cover` 或 `--cover-media-id` 提供封面。
- 不要假设某个微信 URL 或 `mmbiz.qpic.cn` URL 可以作为 `thumb_media_id` 重用。
- 如果创建草稿返回 `45004`，请先检查摘要、概述和描述，再判断正文是否过长。

Markdown 图片仅在 `--upload` 或 `--draft` 期间上传或替换，不会在普通转换或预览期间处理。

## 失败处理

- 配置缺失或无效：运行 `doctor --json` 和 `config show --format json`；报告 `data.overall` 以及阻塞性的 `data.readiness.*` 项。
- 布局语法无效：运行 `layout validate`，使用 `layout show` 检查失败的模块，修复生成的产物，然后再次验证。
- 未知的布局模块会发出警告，以实现向前兼容；请通过 `layout list --json` 核对是否存在拼写错误。
- 主题被拒绝：检查 `type` 和 `selectable`，然后选择兼容的主题或询问用户。
- AI 请求或样式编写流程可能会返回提示词/请求，而不是最终的文案或 HTML，除非已完成外部模型步骤。