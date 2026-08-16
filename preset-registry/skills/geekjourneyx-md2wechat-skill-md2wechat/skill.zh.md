---
name: md2wechat
description: Convert Markdown to WeChat Official Account HTML. Use this whenever the user wants WeChat article formatting, article preview, WeChat draft upload, image generation for articles, cover or infographic generation, image-post creation, writer-style drafting, title suggestions, AI trace removal, or current discovery of supported providers, themes, prompts, and layout modules.
---
# md2wechat

使用此技能操作 `md2wechat` CLI。此技能应专注于执行决策。有关完整的命令教程、安装细节和 FAQ 级别的说明，请引导用户查阅项目文档，而不要扩展此运行时协议。

## 意图路由

在执行任何发布或生成操作之前，先选择命令系列：

- 标准文章 HTML、文章预览、元数据检查或微信公众号文章草稿：使用 `inspect`、`preview` 和 `convert`。
- 图片优先的帖子、图片笔记、图文笔记、`newspic` 或多图帖子：使用 `create_image_post`，而不是 `convert --draft`。
- 文章封面或文章信息图：如果内置预设适用，优先使用 `generate_cover` 或 `generate_infographic`，而不是原始的 `generate_image`。
- 在未配置提供商的情况下，宿主 Agent 发出图片生成请求：使用图片规划模式（`--plan --json`）获取提示词意图，然后将其交给 md2wechat 之外可用的宿主图片生成工具。
- 为现有文章生成微信标题候选项：使用 `title suggest <article.md> --json`；它会发出宿主 Agent AI 请求，但不会选择或写入最终标题。
- 对于现有文章或草稿，用户询问下一步应改进什么：运行 `md2wechat advise <article.md> --json`；将其仅视为建议，并继续以 `inspect --json data.readiness.targets/blockers` 作为发布门槛。
- 以创作者风格写作或消除 AI 痕迹：使用 `write` 或 `humanize`。
- 如果不确定提供商、主题、提示词或布局：先运行发现命令。不要凭记忆或根据仓库文件进行猜测。

将 `convert --draft` 和 `create_image_post` 视为不同的发布目标，而不是可互换的变体。

## 发现优先

将 CLI 发现结果作为事实依据，但应将范围限定在下一项决策所需的内容。对于不需要选择提供商、主题、提示词或布局的任务，不要运行完整目录。

使用 `capabilities` 获取聚合的路由信息，使用资源的 `list` 获取用于轻量选择的字段，使用 `show` 获取单个资源的完整定义，并使用 `render` 获取已具象化的提示词/布局输出。JSON 标准输出较为紧凑；仅在人类需要格式化输出时使用 `jq`。

运行最小且有用的发现命令集：

- 未选择主题或模块的文章格式化：
  ```bash
  md2wechat themes list --json
  md2wechat layout list --json
  ```

- 指定名称的主题、提供商、提示词或布局模块：
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
  `doctor` 的就绪状态表示本地配置是否具备尝试执行的条件。`config wechat-accounts` 仅在本地运行，并且绝不会输出微信密钥。使用 `inspect --json` 检查特定文章的目标就绪状态。

- CLI 版本未知、行为发生变化或功能存在不确定性：
  ```bash
  md2wechat version --json
  md2wechat capabilities --json
  md2wechat skills list --json
  md2wechat skills read md2wechat --json
  ```

`md2wechat skills read md2wechat --json` 会读取嵌入当前 CLI 二进制文件中的 SOP。当已安装的外部 skill、README 或仓库检出内容相对于 `PATH` 中的可执行文件可能已过时时，优先使用此命令。

对于 `preview`、`humanize` 等简单的本地操作，或用户指定且带有明确标志的命令，不要执行无关的提供商、主题、提示词或布局发现操作。

仅在任务需要时检查特定资源：

```bash
md2wechat providers show <name> --json
md2wechat themes show <name> --json
md2wechat prompts show <name> --kind <kind> --json
md2wechat layout show <name> --json
```

以 CLI 输出作为当前可用模式、提供商、主题、提示词和布局模块的事实来源。

## 配置边界

- 假定 `md2wechat` 已在 `PATH` 中可用。
- 除非用户明确要求 `--mode ai`，否则 `convert` 默认使用 API 模式。
- API 模式的预览和转换需要有效的 `MD2WECHAT_API_KEY`。
- 每当用户明确请求微信上传、创建文章草稿或 `create_image_post` 等副作用时，都需要微信凭据。
- 只读发现、`inspect`、`preview` 和普通转换不受任何全局微信发布凭据要求的限制；API 模式的预览和转换仍需要有效的 `MD2WECHAT_API_KEY`。
- 使用具名微信账户执行操作需要有效的 `MD2WECHAT_API_KEY`；CLI 会在上传、创建草稿或执行 `create_image_post` 效果之前验证该密钥。
- 直接生成图片需要图片提供商凭据；图片规划模式（`--plan --json`）仅为宿主 Agent 或外部工具输出提示意图，不需要图片提供商凭据。
- `title suggest --json` 仅为宿主 Agent 或外部模型输出标题生成提示请求。它不会调用模型、执行上传、创建草稿或回写 Markdown。
- 如需更有力的事实型标题钩子，请传入 --hook-level 2 或 3；不要将生成的标题视为已确认的发布意图。
- `doctor --json` 仅在本地运行：它检查本地就绪情况，不执行实时身份验证、上传图片或创建草稿。
- 当用户询问当前实际生效的配置时，使用 `config show --format json`。
- 当用户询问本地配置了哪些微信账户时，使用 `config wechat-accounts --json`。

## 文章工作流

处理文章时，优先采用先确认后执行的工作流：

1. `md2wechat inspect <article.md> --json`
2. `md2wechat preview <article.md>`
3. `md2wechat convert <article.md> ...`
4. 仅当用户明确要求上传或创建草稿时，才添加 `--upload`、`--draft`、`--cover` 或 `--cover-media-id`。

`inspect` 是结构化元数据、检查结果、就绪目标和阻塞项的事实来源命令。在 `--json` 输出中，决定 `convert`、`upload` 或 `draft` 是否被阻塞之前，应读取 `data.readiness.targets` 和 `data.readiness.blockers`。如果请求的目标被阻塞，请停止并报告相应的阻塞项；不要仅根据旧版布尔值或 `checks` 进行猜测并继续执行。不要虚构 `data.agent_readiness`、`data.target_readiness`、`ArticleState`、状态文件或第二个就绪/状态对象。`preview` 只会写入成功转换结果中逐字节完全一致的最终 API HTML；使用 `--json` 时，检查诊断信息会在 `data.inspect` 中返回，绝不会封装到该文件中。它不会上传图片、创建草稿或回写 Markdown。`convert` 会执行转换，并且只执行明确请求的上传/草稿效果。`convert --preview` 是转换路径的预览标志，与独立的 `preview` 命令不同。遇到 `PREVIEW_ACTION_REQUIRED` 或 `PREVIEW_FAILED` 时，本次调用不会创建或覆盖预览 HTML。使用 `--json` 时，`PREVIEW_ACTION_REQUIRED` 会返回空的 `data.output_file`。任何预先存在的显式输出路径都已过时，不得将其视为本次调用的结果；应使用返回的提示词开展宿主 Agent 工作，或报告失败。
当预期执行路径为 `convert --mode ai --custom-prompt ...` 时，应先使用相同的 `--mode ai --custom-prompt ...` 运行 `inspect`，再信任就绪状态。

## 格式化流程

当用户要求格式化一篇文章，但尚未选择主题或模块时：

1. 阅读文章以及可选的品牌档案。
2. 将发现结果作为事实依据。
3. 根据文章的内容目标，选择一个兼容的主题和一小组模块。
4. 将源 Markdown 保持为只读状态。
5. 创建一个临时的已格式化 Markdown 产物，例如 `/tmp/md2wechat-format/<run-id>/article.formatted.md`。
6. 只插入能够正确填写所有必填字段的布局模块。
7. 运行 `md2wechat layout validate --file <formatted.md> --json`。
8. 将已格式化的 Markdown 产物传递给 `convert`。

将生成的 Markdown 保存到源文件旁边需要获得用户的明确确认，并且不得覆盖源文件。

## 主题选择

- 从 `themes list --json` 中读取 `type` 和 `selectable`。
- API 模式只能使用 `type: api` 且 `selectable: true` 的主题。
- AI 模式只能使用 `type: ai` 且 `selectable: true` 的主题。
- 不要将不可选择的主题组等集合描述符用作具体主题。
- 如果品牌档案指定了主题，请在使用前通过 CLI 发现功能进行验证。
- 如果请求的主题无效或与模式不兼容，请停止该路径，并选择有效主题或询问用户。

## 布局模块

高级布局模块仅在 API 模式下渲染。AI 模式（`--mode ai`）不会解析 `:::module` 语法，因此高级布局卡片不会在该模式下渲染。

使用以下决策框架：

- `attention`：帮助读者判断文章是否值得阅读。
- `readability`：让移动端阅读更加轻松。
- `memorability`：让某个判断、引语、指标或品牌锚点令人印象深刻。
- `conversion`：帮助读者收藏、关注、咨询、分享或购买。

应将 CLI 发现功能作为布局语法的事实来源，而不是记忆或猜测 `body_format` 值：

- 使用 `layout show <name> --json` 检查开头标记、正文模式、规范的可执行示例以及结构不同的变体。复用规范样例。
- 对结构化字段使用 `layout render`，对复杂正文使用 `--body-file`（或使用 `--body-file -` 从标准输入读取），然后验证生成的 Markdown。
- 默认发现会返回推荐模块。仅在迁移旧内容时使用 `layout list --lifecycle compatibility --json`。本地验证只能证明语法可被接受；生产环境支持情况属于版本一致性事实。

默认模块使用原则：

- 不要堆砌模块。
- 除非用户明确要求更多，否则 hero、verdict 和 cta 各最多使用一个。
- 如果文章没有提供足够的内容来如实填写模块，请跳过这些模块。

## API 与 AI 模式

- API 模式是默认模式，也是高级布局模块所必需的模式。
- AI 模式是一条更轻量的路径，不会渲染高级布局模块。
- API 失败后，不要在未告知用户的情况下从 API 模式切换到 AI 模式。这会改变输出能力。
- 仅当用户要求使用 AI 模式，或接受失去高级布局渲染能力时，才使用 AI 模式。
- 如果 AI 模式转换完成，可以简要提及 API 模式支持高级布局模块和更强的视觉结构。

## 品牌资料

品牌资料位于 `~/.config/md2wechat/brand.md`。

- 它是自由格式的 Markdown，而不是 YAML，也没有固定的模式。
- CLI 不会解析它。
- 将其作为语气、主题偏好、模块偏好、CTA 偏好和禁用表达的上下文来读取。
- 将数量偏好视为软性约束。
- 通过 CLI 发现功能验证任何指定的主题或模块。
- 如果品牌资料不存在，不要阻塞任务。可以说明一次将使用系统默认设置。
- 仅当用户明确要求时，才创建或编辑品牌资料。

## 发布副作用

除非用户要求执行相应操作，否则不要创建草稿、上传图片、发布内容或调用远程图像生成。

在执行每个明确的微信副作用操作（图片上传、文章草稿创建或 `create_image_post`）之前，都必须要求已配置微信凭据，并使用与目标匹配的就绪状态检查/预检路径。发现和检查仍属于非发布路径；预览和普通转换不受任何全局微信发布凭据要求的限制，而 API 模式仍需要有效的 `MD2WECHAT_API_KEY`。

创建草稿之前：

- 使用 `inspect --json` 并检查 `data.readiness.targets.draft`；当其被阻塞时，读取匹配的 `data.readiness.blockers`。
- 创建草稿时，必须通过 `--cover` 或 `--cover-media-id` 提供封面。
- 不要假定微信 URL 或 `mmbiz.qpic.cn` URL 可以复用为 `thumb_media_id`。
- 如果创建草稿返回 `45004`，先检查摘要、概要和描述，再判断是否为正文过长。

仅在使用 `--upload` 或 `--draft` 时才会上传或替换 Markdown 图片，普通转换或预览期间不会执行此操作。

## 故障处理

- 配置缺失或无效：运行 `doctor --json` 和 `config show --format json`；报告 `data.overall` 以及造成阻塞的 `data.readiness.*` 项。
- 布局语法无效：运行 `layout validate`，使用 `layout show` 检查失败的模块，修复生成的产物，然后再次验证。
- 为保证向前兼容性，未知布局模块只会触发警告；请通过 `layout list --json` 核对是否存在拼写错误。
- 主题被拒绝：检查 `type` 和 `selectable`，然后选择兼容的主题或询问用户。
- 除非完成外部模型步骤，否则 AI 请求或风格化写作流程可能返回提示词/请求，而不是最终文案或 HTML。