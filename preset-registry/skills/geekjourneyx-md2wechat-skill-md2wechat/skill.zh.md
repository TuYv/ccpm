---
name: md2wechat
description: Convert Markdown to WeChat Official Account HTML. Use this whenever the user wants WeChat article formatting, article preview, WeChat draft upload, image generation for articles, cover or infographic generation, image-post creation, writer-style drafting, title suggestions, AI trace removal, or current discovery of supported providers, themes, prompts, and layout modules. Also use for unpublished Zhihu, CSDN, or Toutiao drafts through a browser.
---
# md2wechat

使用此 skill 操作 `md2wechat` CLI。让 skill 专注于执行决策。完整的命令教程、安装详情和 FAQ 级别的说明请参考项目文档，不要扩展此运行时协议。

## 意图路由

在执行任何发布或生成操作前，先选择命令族：

- 标准文章 HTML、文章预览、元数据检查或微信公众号文章草稿：使用 `inspect`、`preview` 和 `convert`。
- 未发布的知乎、CSDN 或头条草稿：运行 `md2wechat skills read md2wechat references/sync/workflow.md --json` 获取当前 CLI 内嵌的工作流；CLI 负责准备内容，Agent 负责操作浏览器。
- 以图片为主的帖子、图片笔记、图文笔记、`newspic` 或多图帖子：使用 `create_image_post`，不要使用 `convert --draft`。
- 文章封面或文章信息图：如果有匹配的内置预设，优先使用 `generate_cover` 或 `generate_infographic`，而不是直接使用 `generate_image`。
- 主机 Agent 请求生成图片但未配置 provider：使用图片计划模式（`--plan --json`）获取提示词意图，然后交给 md2wechat 之外可用的主机图片生成工具。
- 为现有文章生成微信公众号标题候选：使用 `title suggest <article.md> --json`；它会发出主机 Agent AI 请求，但不会选择或写入最终标题。
- 对于现有文章或草稿，用户询问下一步应改进什么：运行 `md2wechat advise <article.md> --json`；将其视为仅供建议的结果，并继续使用 `inspect --json data.readiness.targets/blockers` 作为发布门禁。
- 以创作者风格写作或去除 AI 痕迹：使用 `write` 或 `humanize`。
- provider、theme、prompt 或 layout 不明确：先执行发现流程。不要根据记忆或仓库文件猜测。

将 `convert --draft` 和 `create_image_post` 视为不同的发布目标，而不是可以互换的变体。

## 先执行发现流程

以 CLI 发现结果作为事实来源，但将范围限定在下一步决策所需的内容。对于不需要选择 provider、theme、prompt 或 layout 的任务，不要运行完整目录。

使用 `capabilities` 获取聚合路由信息，使用资源 `list` 获取轻量选择字段，使用 `show` 获取单个完整资源定义，使用 `render` 获取物化后的提示词/布局输出。JSON 标准输出内容紧凑；仅在需要人工查看格式化输出时使用 `jq`。

运行最小化的有效发现集合：

- 未选择 theme 或模块的文章格式化：
  ```bash
  md2wechat themes list --json
  md2wechat layout list --json
  ```

- 指定名称的 theme、provider、prompt 或 layout 模块：
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

- 在使用 `--subject-reference` 前检查主体参考图（图生图）能力：
  ```bash
  md2wechat providers show minimax --json
  ```
  读取 provider 上的 `supports_subject_reference`，以及 `supported_models` 中每个条目上的该字段。只有 `minimax` provider 及其 `image-01` 模型接受 `--subject-reference`，并且参考图必须是公开可访问的 `http(s)` 人像图片 URL；内联 data URL 和本地路径会被拒绝。不支持的 provider/model 组合会立即失败并返回 `CONFIG_INVALID`，因此不要将其作为生成失败重试。

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
  `doctor` 的就绪状态表示本地配置是否具备执行条件。`config wechat-accounts` 仅访问本地，绝不会打印 WeChat 密钥。使用 `inspect --json` 检查文章特定的目标就绪状态。

- CLI 版本未知、行为发生变化或能力不确定：
  ```bash
  md2wechat version --json
  md2wechat capabilities --json
  md2wechat skills list --json
  md2wechat skills read md2wechat --json
  ```

`md2wechat skills read md2wechat --json` 会读取当前 CLI 二进制文件中嵌入的 SOP。当已安装的外部 skill、README 或仓库检出内容可能相对于 `PATH` 中的可执行文件过时时，优先使用它。

对于 `preview`、`humanize` 等简单本地操作，或用户指定且带有明确标志的命令，不要运行无关的 provider、theme、prompt 或 layout 发现命令。

仅当任务需要时，检查具体资源：

```bash
md2wechat providers show <name> --json
md2wechat themes show <name> --json
md2wechat prompts show <name> --kind <kind> --json
md2wechat layout show <name> --json
```

以 CLI 输出作为当前可用模式、provider、theme、prompt 和 layout 模块的事实依据。

## 配置边界

- 假设 `md2wechat` 已经在 `PATH` 上可用。
- 除非用户明确要求使用 `--mode ai`，否则 `convert` 默认使用 API 模式。
- API 模式的预览和转换需要有效的 `MD2WECHAT_API_KEY`。
- 当用户明确请求这些副作用时，WeChat 上传、文章草稿创建和 `create_image_post` 需要 WeChat 凭据。
- 只读发现、`inspect`、`preview` 和普通转换不要求全局 WeChat 发布凭据；但 API 模式的预览和转换仍需要有效的 `MD2WECHAT_API_KEY`。
- 使用命名 WeChat 账户执行时需要有效的 `MD2WECHAT_API_KEY`；CLI 会在上传、草稿或 `create_image_post` 操作之前验证它。
- 直接生成图片需要 image-provider 凭据；图片计划模式（`--plan --json`）只向宿主 Agent 或外部工具输出提示词意图，不需要 image-provider 凭据。
- `title suggest --json` 只向宿主 Agent 或外部模型输出标题生成提示词请求。它不会调用模型、上传、创建草稿或回写 Markdown。
- 如需更强的事实性标题吸引点，请传递 --hook-level 2 或 3；不要将生成的标题视为已确认的发布意图。
- `doctor --json` 仅访问本地：它检查本地就绪状态，不执行实时身份验证、上传图片或创建草稿。
- 当用户询问当前生效的配置时，使用 `config show --format json`。
- 当用户询问配置了哪些本地 WeChat 账户时，使用 `config wechat-accounts --json`。

## 文章工作流

对于文章相关工作，优先采用先确认工作流：

1. `md2wechat inspect <article.md> --json`
2. `md2wechat preview <article.md>`
3. `md2wechat convert <article.md> ...`
4. 仅当用户明确要求上传或创建草稿时，才添加 `--upload`、`--draft`、`--cover` 或 `--cover-media-id`。

`inspect` 是结构化元数据、检查项、就绪目标和阻塞项的事实来源。在 `--json` 输出中，在决定 `convert`、`upload` 或 `draft` 是否被阻塞之前，读取 `data.readiness.targets` 和 `data.readiness.blockers`。如果请求的目标被阻塞，停止并报告匹配的阻塞项；不要仅根据旧版布尔值或 `checks` 猜测结果。不要臆造 `data.agent_readiness`、`data.target_readiness`、`ArticleState`、状态文件或第二个就绪/状态对象。`preview` 只会写入成功转换结果对应的、字节级完全一致的最终 API HTML；使用 `--json` 时，检查诊断信息会返回在 `data.inspect` 中，并且绝不会被包装进该文件。它不会上传图片、创建草稿或回写 Markdown。`convert` 执行转换，并且只执行明确请求的上传/创建草稿操作。`convert --preview` 是转换路径的预览标志，与独立的 `preview` 命令不同。在 `PREVIEW_ACTION_REQUIRED` 或 `PREVIEW_FAILED` 情况下，本次调用不会创建或覆盖预览 HTML。使用 `--json` 时，`PREVIEW_ACTION_REQUIRED` 会返回空的 `data.output_file`。任何预先存在的显式输出路径都是过时的，不得视为本次调用的结果；对于宿主 Agent 工作，应使用返回的提示，或报告失败。

当预期执行路径为 `convert --mode ai --custom-prompt ...` 时，在信任就绪状态之前，使用相同的 `--mode ai --custom-prompt ...` 运行 `inspect`。

## 格式化协议

当用户要求格式化文章，但尚未选择主题或模块时：

1. 阅读文章和可选的 Brand Profile。
2. 将发现结果作为事实依据。
3. 根据文章的内容目标选择兼容的主题和少量模块。
4. 保持源 Markdown 只读。
5. 创建临时的格式化 Markdown 构件，例如 `/tmp/md2wechat-format/<run-id>/article.formatted.md`。
6. 仅插入其必填字段能够被正确填写的布局模块。
7. 运行 `md2wechat layout validate --file <formatted.md> --json`。
8. 将格式化后的 Markdown 构件传递给 `convert`。

将生成的 Markdown 保存到源文件旁边需要用户明确确认，并且不得覆盖源文件。

## 主题选择

- 从 `themes list --json` 中读取 `type` 和 `selectable`。
- API 模式只能使用 `type: api` 且 `selectable: true` 的主题。
- AI 模式只能使用 `type: ai` 且 `selectable: true` 的主题。
- 不要将不可选择的主题集合描述符作为具体主题使用。
- 如果 Brand Profile 指定了主题，在使用之前通过 CLI 发现功能对其进行验证。
- 如果请求的主题无效或与模式不兼容，停止该路径，并选择有效主题或询问用户。

## 布局模块

高级布局模块仅在 API 模式下渲染。AI 模式（`--mode ai`）不会解析 `:::module` 语法，因此高级布局卡片不会在其中渲染。

使用以下决策框架：

- `attention`：帮助读者判断文章是否值得阅读。
- `readability`：让移动端阅读更加轻松。
- `memorability`：让某个判断、引述、指标或品牌锚点留下印象。
- `conversion`：帮助读者保存、关注、咨询、分享或购买。

使用 CLI 发现功能作为布局语法的事实来源，不要靠记忆或猜测 `body_format` 的值：

- 使用 `layout show <name> --json` 检查开场模块、正文 schema、规范的可执行示例以及结构上有区别的变体。复用规范示例。
- 对结构化字段使用 `layout render`，对复杂正文使用 `--body-file`（或使用 `--body-file -` 从 stdin 读取），然后验证生成的 Markdown。
- 默认发现功能返回推荐模块。只有在进行旧内容迁移时，才使用 `layout list --lifecycle compatibility --json`。本地验证只能证明语法可接受；生产环境是否支持取决于版本发布符合性。

默认模块使用原则：

- 不要堆叠模块。
- 最多使用一个 hero、一个 verdict 和一个 cta，除非用户明确要求更多。
- 如果文章没有足够的内容来诚实填充模块，则跳过这些模块。

## API 和 AI 模式

- API 模式是默认模式，也是使用高级布局模块的必要条件。
- AI 模式是更轻量的路径，不会渲染高级布局模块。
- API 调用失败后，不要静默切换到 AI 模式。这会改变输出能力。
- 只有在用户要求使用 AI 模式，或接受失去高级布局渲染能力时，才使用 AI 模式。
- 如果 AI 模式转换完成，可以简要说明 API 模式支持高级布局模块和更强的视觉结构。

## 品牌配置

品牌配置位于 `~/.config/md2wechat/brand.md`。

- 它是自由格式的 Markdown，不是 YAML，也不是固定 schema。
- CLI 不会解析它。
- 将其作为语气、主题偏好、模块偏好、CTA 偏好以及禁用表达的上下文来阅读。
- 将数量偏好视为软约束。
- 通过 CLI 发现功能验证任何指定的主题或模块。
- 如果品牌配置不存在，不要阻塞任务。可以提及一次将使用系统默认设置。
- 只有在用户明确要求时，才创建或编辑品牌配置。

## 发布副作用

除非用户要求，否则不要创建草稿、上传图片、发布内容或调用远程图像生成。

每次执行明确的微信公众号副作用操作（图片上传、文章草稿创建或 `create_image_post`）之前，都必须要求已配置微信公众号凭据，并使用与目标匹配的就绪检查/预检路径。发现和检查仍属于非发布路径；预览和普通转换不要求全局微信公众号发布凭据，但 API 模式仍要求有效的 `MD2WECHAT_API_KEY`。

通过 `convert` 创建微信公众号文章草稿之前：

- 使用 `inspect --json` 并检查 `data.readiness.targets.draft`；被阻止时，读取匹配的 `data.readiness.blockers`。
- 创建草稿需要封面，可通过 `--cover` 或 `--cover-media-id` 指定。
- 不要假设微信 URL 或 `mmbiz.qpic.cn` URL 可以作为 `thumb_media_id` 重用。
- 如果草稿创建返回 `45004`，请先检查摘要、简介和描述，再判断正文是否过长。

在微信 `convert` 流程中，Markdown 图片仅在 `--upload` 或 `--draft` 期间上传或替换，普通转换或预览期间不会处理。

## 失败处理

- 配置缺失或无效：运行 `doctor --json` 和 `config show --format json`；报告 `data.overall` 以及阻塞性的 `data.readiness.*` 项。
- 布局语法无效：运行 `layout validate`，使用 `layout show` 检查失败的模块，修复生成的产物，然后再次验证。
- 未知布局模块会发出警告，以保持向前兼容；使用 `layout list --json` 核对拼写错误。
- 主题被拒绝：检查 `type` 和 `selectable`，然后选择兼容的主题或询问用户。
- AI 请求或样式编写流程可能返回提示词/请求，而不是最终的 prose 或 HTML，除非完成外部模型步骤。