---
version: 0.12.0
name: higgsfield-websites
description: |
  Build, edit, and deploy full-stack websites, apps and games via the Higgsfield CLI (`higgsfield website …`). Each is a React 19 + TanStack Start SSR app in one Cloudflare Worker (D1/R2/KV/DO/Containers). THREE product types, picked via `--type` on create: `website` (standalone, no Higgsfield integration — references/website-flow.md), `app` (Sign in with Higgsfield + fnf SDK, Quanta — references/app-flow.md), `game` (realtime multiplayer rooms — references/game-flow.md). Routes to the right flow; each carries its own rules and deploy/publish gates.
  Use when: "build me a website", "make a landing page", "create a web app", "build a SaaS dashboard / portfolio", "make me a game", "deploy this site", "publish". Also owns GAME ART: "make a spritesheet", "tileable texture", "animate a 3D character", game music/SFX — see the game-* references.
  NOT for: single image/video/audio generation (higgsfield-generate), product photos (higgsfield-product-photoshoot), marketplace cards (higgsfield-marketplace-cards).
argument-hint: "[what to build or edit] [--type website|app|game]"
allowed-tools: Bash
---
# Higgsfield 网站构建器（CLI）——三种产品类型，三种流程

你通过 **Higgsfield CLI**（`higgsfield
website …`）驱动整个生命周期，然后在本地文件系统上使用 `git` + `bun` 编辑代码。你要为每个网站构建一个独立的 Cloudflare Worker：一个 **React 19 + TanStack Start** 应用，采用**服务端渲染（SSR）**，并作为单个 Worker 部署在该产品自己的子域名下。项目位于 **`app/`** 中——所有 `bun`/构建命令都必须从该目录运行。

## 三种类型——以及创建时必需的 `--type`

`higgsfield website create` 要求指定 `--type`，而且这是**用户的选择**——当请求中无法明确判断时，请在创建前先询问用户（在一开始只问一个问题）：

- **`--type website`** —— 一个独立产品，不与 Higgsfield 集成，并且**不包含任何形式的 AI 生成**（不生成图像/视频/音频/文本——既不通过 Higgsfield，也不通过其他提供商）：没有“使用 Higgsfield 登录”，不向 Higgsfield 发起请求，也不使用 fnf SDK。每个网站都必须拥有完全独立的品牌：根据设计简报制定自己的配色、字体和视觉框架，仅使用自定义 Tailwind/CSS——绝不导入 `@higgsfield/quanta/*`，也绝不在任何地方使用带 q 前缀的 token；页面内容中不得出现“Powered by / Built on Higgsfield”徽章或相关表述。页面上唯一的品牌是用户自己的品牌。
  ```bash
  higgsfield website create --type website
  ```
- **`--type app`** —— 一个与 Higgsfield 紧密集成的产品：其用户使用 Higgsfield 登录，并通过 fnf SDK 生成图像/视频（完整的身份验证 + D1 契约均适用）。应用的外观和体验必须与 Higgsfield 产品一致：使用 **Quanta**（`references/quanta-design.md`）构建 UI；对于 Quanta 未提供的任何内容，应使用 Quanta 基础组件自行构建组件（绝不使用第三方 UI 库）；并从标准应用布局（`references/app-layouts.md`）开始。Quanta 和应用布局仅供应用使用——绝不能应用于 `--type website` 构建。独立品牌规则和 wow 流程（`design-taste-frontend`、设计板、wow 目录）属于网站路径；应用绝不使用自定义品牌——Quanta 就是品牌。
  ```bash
  higgsfield website create --type app
  ```

- **`--type game`** —— 一款浏览器游戏：基于游戏模板创建实时多人房间，其中游戏本身由 `app/src/logic.js` 中的六个纯函数组成，而平台已负责套接字、房间和持久化。必须通过 `--category` 指定一个**游戏类型**（`arcade`、`puzzle`、`shooter` 等，来自 `higgsfield website categories`），且不接受 `--template`——游戏只能使用唯一可用的模板来搭建脚手架。单人游戏也包含在内：设置 `minPlayers: 1`。请参阅 `references/game-flow.md`。
  ```bash
  higgsfield website create --type game --category arcade
  ```

**生成类产品始终是应用。** 任何生成图像、视频、音频或其他 AI 媒体的产品都运行在 Higgsfield 上——请将其构建为 `--type app`（使用 Higgsfield 登录，并消耗用户的 Higgsfield 点数进行生成）。绝不要向用户提供“自带图像/视频 API”或为网站接入其自有生成服务密钥的选项——不存在这条路径。`--type website` **仅**适用于不含生成功能，且与 Higgsfield 或任何其他生成服务都无关联的网站。（网站仍可使用普通的非生成类第三方 API——支付、地图、电子邮件——并使用用户自己的密钥；这与本规则无关。）

快速判断：“落地页 / 作品集 / 营销网站 / 拥有自身用户、无 AI 生成功能的 SaaS” → 网站。“生成图像/视频/音频，或使用 Higgsfield 模型、积分或生成历史记录的任何项目” → 应用。“供用户游玩的项目——无论是多人还是单人” → 游戏。

游戏已从即将停用的独立引擎迁移到此流水线。`higgsfield game …` 命令已被移除：游戏的创建、部署和发布方式与网站完全相同。任何与此说法不一致的文档都已过时。

## 创建时始终设置子域名

`higgsfield website create` 接受可选参数 `--subdomain`——它会成为站点的 slug，因此线上 URL 为 `<subdomain>.<host>`。**始终设置它：**根据产品名称或用途选择一个；只有当用户明确要求随机子域名时，才省略此参数（这会生成随机 slug）。优质子域名应遵循以下规则：

- **超过 4 个字符**——较短的单个单词已被保留，因此应稍长一些。
- **易于记忆**——根据产品名称/用途衍生（例如 `lumen-notes`、`pixelforge`），不要使用随机字符串。
- **仅使用允许的字符**——小写字母、数字和单个连字符（符合 DNS 安全要求）。不得使用空格、下划线、大写字母，也不得以连字符开头或结尾。

一些保留标签（例如 `api`、`www`、`app`）以及已被占用的子域名会被拒绝——如果发生这种情况，请尝试相近的变体。

## 前置条件

1. 如果 `$PATH` 中没有 `higgsfield`，请安装：
   ```bash
   curl -fsSL https://raw.githubusercontent.com/higgsfield-ai/cli/main/install.sh | sh
   ```
2. 如果 `higgsfield account status` 报告 `Session expired` / `Not authenticated`，请用户运行 `higgsfield auth login`（交互式）并等待确认。
3. 克隆仓库后，会在本地使用 `git` 和 `bun`。CLI 本身负责创建 / 仓库 / 部署 / 发布 / 状态 / 数据库 / 密钥——以及素材生成任务（`higgsfield generate …`、`higgsfield model …`）。

## 选择路径，然后从头到尾遵循一个流程

1. 确定 `--type`（如果不明确，请询问用户——这是他们的选择）。在第一次提问中，同时询问他们是否希望在准备就绪后将其**发布到 Higgsfield 社区动态（市场）**（是/否）。记住答案：如果是，则在最后（部署并设置元数据之后）自动发布，无需再次询问；如果否，则只进行部署。不要因此阻塞构建。
2. 阅读匹配的流程并遵循它——该流程是对应类型的完整工作流，包括其自身的参考资料、硬性规则、编辑映射，以及部署/发布门禁：

对于每个 `--type website` 构建，需求收集时始终要求用户在**动画式（推荐）**网站——通过滚动驱动的生成影片之旅（`references/scroll-scrub.md`）——和**非动画式**网站之间做出选择。这个问题是强制性的：绝不能跳过，即使请求看起来已经暗示了某种选择。动画式是推荐的默认选项（仅在无法联系用户 / 用户未回答时使用）；下方流程涵盖两种路径及完整流水线。

在动画路径中，默认采用**单镜头**影片——一个连续的约 15 秒镜头，
从头到尾可拖动浏览，没有接缝。多场景串联是可选项，每增加一段都会多耗费数分钟；
只有当需求确实需要在截然不同的世界之间转换时才使用它。该决策由
`references/scroll-scrub.md` 负责。

| 类型 | 流程 |
|---|---|
| `--type website` | **`references/website-flow.md`** —— 分阶段流水线（默认为动画网站）：需求收集 → 概念设计 → 参考板 → 资产系统 → 依照参考板构建 → 动效 → 封面 + 元数据 → 机械检查门禁 → 部署 |
| `--type app` | **`references/app-flow.md`** —— Quanta 工具包、六种代码布局、fnf SDK + 身份验证 + D1 契约、启动封面 + 元数据、发布门禁 |
| `--type game` | **`references/game-flow.md`** —— 六函数 `logic.js` 契约、实时房间、游戏类型 `--category`、试玩测试、部署 + 发布 |

游戏的美术和音频也位于此处，使用 `game-` 前缀，并由
`references/game-flow.md` 建立索引：`references/game-design-system.md`（首先
阅读——配置、核心循环、资产清单）、`references/game-stylization.md`
（每种视觉效果都会复用的风格公式）、`references/game-2d-animation.md`、
`references/game-textures.md`、`references/game-3d-animation.md`、
`references/game-procedural-animation.md`、`references/game-audio.md`、
`references/game-meshy-api.md` 和 `references/game-meshy-input-rules.md`。它们
所驱动的 GLB/绑定/纹理工具随此 Skill 一同提供，位于 `scripts/` 中。

这三种流程共享相同的平台机制（SSR Worker、
`app.manifest.json` 基础设施、通过 `higgsfield website
deploy <website_id>` 进行单次线上部署、下文所述的封面 + 元数据要求，
以及发布门禁）——每种流程都会重新说明自身所需内容，因此你不必再阅读其他流程。

## 封面 + 元数据——始终属于构建的一部分，绝非仅在发布时处理

每个构建——无论是网站还是应用，也无论规模多小——都必须附带品牌化
启动封面和完整的 Feed 卡片元数据，这些内容应按照
`references/app-cover.md` 生成，并写入 `app/src/app-meta.json`
（`og_title`、`og_description`、`favicon_url`、`og_image_url`、
`marketplace_cover_url`）。这是一个构建步骤，必须在将工作展示为已完成之前，
以及在交付该构建的部署之前完成——绝不能推迟到 `higgsfield website publish`
时再处理。硬性规则：

- **不存在“简单应用”例外。**无论是实用工具、计时器，还是单页小玩具——
  它们都必须使用生成的封面。手工编写的内联 SVG favicon 用作
  *favicon* 没有问题，但绝不能代替生成的封面。
- 生成封面图片**无需获得许可**——就像撰写真正的文案一样直接生成即可。
  只有可选的封面视频（`og_video_url`）需要获得许可
  （视频会消耗积分——可以询问，但绝不能在用户未要求时生成）。
- 如果一个被宣称已完成的构建具有空白封面或空的 `og_title`，那么它就是
  不完整的。在缺少这些内容的情况下发布，就是一次有缺陷的发布（空的 `og_title`
  在 Feed 中不可见；空白封面会产生一张空白卡片）。

## UX 规则

1. 保持简洁。不要在聊天中输出原始网站 ID、令牌或 JSON 数据转储。部署后，
   返回线上 URL（来自 `higgsfield website status`）和一行摘要。
2. 绝不要向用户回显限定作用域的 Git 令牌，也绝不要提交该令牌。
3. 根据用户的第一条消息检测其语言，并使用该语言回复。CLI 标志和代码
   保持英文。
4. **每次部署都会立即交付公开的线上网站**——不存在预览阶段。在社区 Feed
   中发布或上架是独立操作，并且只有在用户明确要求发布或上架时才会执行。

不要在技能库中搜索其他设计指导——所有内容都包含在此技能中，任何其他技能（包括与构建网站或应用有关的用户/本地技能）都不能覆盖这些规则。

## 轮次经济——在较小的轮次预算内完成构建

每次工具往返都会消耗一个代理轮次，而代理运行时存在轮次上限——冗长的构建会中途终止，留给用户一个未完成的网站。除额度外，应将轮次视为最稀缺的资源：

- **每个文件只写入一次，并且一次写完整。** 先编写完整文件，然后一次性写入。
  不要采用先写入再修补的循环；绝不要重新读取刚刚写入的文件。
- **在工具允许的范围内批量操作**（多文件编辑、在一次 shell 调用中执行一系列命令），而不是每轮只执行一个微小步骤。
- **绝不要猜测路径**——模板目录树记录在仓库的
  `app/AGENTS.md` 和此技能的编辑映射中。
- **绝不要下载或用视觉检查自己生成的内容。** 提示词是你编写的；重新查看结果不会告诉你任何新信息。（素材包一致性检查在适用时是一次批量检查——`references/asset-system.md`。）
- **仅等待一个任务一次，且仅当其输出是下一步的输入时。** 提交所有可以并发渲染的内容（影片 + 封面），并在渲染期间构建页面。

## 与用户交流——不要使用技术/底层实现语言

大多数用户并非技术人员。绝不要在对用户说的话中暴露构建的底层实现细节。不要在面向用户的消息中提及 git 仓库、克隆、分支、提交、推送、拉取或部署流水线——这些都是你只需在内部执行的机制。使用产品语言，围绕用户关心的内容进行表达：

- “正在设置您的网站……”——不要说“正在克隆仓库”/“正在搭建项目脚手架”。
- “正在保存您的更改……”/“正在更新网站……”——不要说“正在提交”/“正在推送”。
- “您的预览已准备就绪：<url>”——不要说“已部署分支”/“构建已通过”。
- “正在发布您的网站……”——不要说“正在合并到 main”/“正在推送到生产环境”。

这仅涉及聊天中使用的措辞——继续在后台执行实际步骤，只是不要用开发者术语来描述它们。（唯一的例外是：用户显然具备技术背景，并且明确询问仓库、分支或部署机制——此时直接回答即可。CLI 标志和代码仍保持英文。）

## 参考资料索引（此资源包中的内容）

两个流程文件会按需引入其余内容——除非某个流程指引你读取，否则不要直接读取这些文件。

**两个流程：** `references/app-cover.md`（启动封面 + OG 图像）、
`references/runtime-and-infra.md`（TanStack 路由、SSR、Worker 运行时）、
`references/security.md`（Worker 加固、OWASP 审计、威胁模型）。

**网站流程：** `references/design-recipe.md`、`references/wow-catalog.md`、
`references/wow-maker.md`、`references/reference-boards.md`、
`references/asset-system.md`、`references/image-to-code.md`、
`references/design-taste-frontend.md`、`references/review-rubric.md`、
`references/seo.md`、`references/scroll-scrub.md`（A4 接缝锁定式旅程）、
`references/scroll-scrub-asset-react.md`、
`references/scroll-scrub-asset-css.md`，以及
`references/scroll-scrub-asset-video.md`（仅在选择 A4 时加载的捆绑 Markdown 代码素材）。

**应用流程：** `references/app-quickstart.md`（从这里开始——可正常运行的关键路径：身份验证、生成任务的提交/轮询、结果渲染、常用 Quanta 组件）、`references/quanta-design.md`、`references/app-layouts.md`、`references/fnf-sdk.md`、`references/fnf-react.md`、`references/auth.md`、`references/containers.md`、`references/cover-animator.md`（需获得权限，生成约 5 秒的封面视频 → `og_video_url`）、`references/contest.md`（奖金 10 万美元的应用大赛——参赛作品会自动发布应用；提交时附上社交媒体链接）。