---
name: general-video
description: >
  Author or edit a custom HyperFrames composition when no specialized workflow fits, or when
  BRIEF.md sets flow: companion. Use for longer or multi-scene pieces, brand and sizzle reels,
  montages, static loops, static title cards, footage remixes, and freeform builds. Use
  motion-graphics instead for a short unnarrated motion-first unit, including an animated title.
  Route fresh creation through hyperframes before using this skill.
---
# 通用视频

在依赖此工作流之前，请运行：

```bash
npx hyperframes skills update general-video
```

如果成功执行且未产生任何变更，则表示该技能为最新版本。若更新失败，应报告失败，而不是依赖记忆继续操作。

## 1. 应用横切源适配器

- **媒体：** 对于任何音频、图像、图标、徽标、语音、调色、LUT、字幕或媒体操作需求，请加载 `/media-use`，并遵循其中关于采用、解析、提供商、来源和复用的约定。在首次执行需要身份验证的提供商操作之前，运行 `npx hyperframes auth status`，并逐字转达其输出。如果处于未登录状态，请应用 `../hyperframes-core/references/brief-contract.md` 中的门控规则：协作模式下等待用户登录或明确选择离线方式；自主模式下说明当前状态，并通过可用的离线提供商继续操作。当没有离线提供商能够满足必需的能力时，报告阻塞问题。仅采用本地资源不需要身份验证门控。
- **Figma：** 如果任何输入是 `figma.com` URL，请先运行 `/figma`。使用其导出的资产、令牌、组件或故事板帧进行构建。不要使用原始 Figma MCP 调用，因为它们会绕过 SVG 清理、媒体来源追踪和品牌令牌绑定。

这些适配器不会更改 `/hyperframes` 所选择的工作流。

## 2. 从项目状态开始

应用第一个匹配的行；不要评估后续状态行：

| 状态                                                       | 操作                                                                                                              |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| 特定编辑                                                   | 进行编辑，保留现有项目决策，然后重新运行受影响的检查。不要重新开启需求探索。                                      |
| `BRIEF.md` 存在                                            | 读取该文件。如果 `workflow` 指定了其他工作流且 `flow` 不是 `companion`，则移交处理。不要询问任何简报问题。        |
| 没有简报，但 `hyperframes.json` 或 `STORYBOARD.md` 存在    | 根据文件和已记录的偏好恢复工作。仅根据已知事实补充 `BRIEF.md`。                                                   |
| 全新创建                                                   | 运行 `/hyperframes` 及其意图层。仅当 `workflow: general-video` 或 `flow: companion` 时才返回此处。                 |

对于新项目，根据简报选择一个 kebab-case 目录名称，并在编写简报之前搭建项目结构：

```bash
npx hyperframes init "videos/<project>" --non-interactive --example=blank
```

然后使用 `../hyperframes-core/references/brief-format.md`，在项目根目录中编写 `BRIEF.md`。在现有项目中，根目录是包含 `hyperframes.json` 的目录。仅记录简报格式中指定且已由确认偏好支持的字段，使用 `node <MEDIA_DIR>/scripts/prefs.mjs record --hyperframes <PROJECT_ROOT>`；绝不要记录推断得出的默认值。这里的 `<MEDIA_DIR>` 是已安装的 `/media-use` 技能目录，`<PROJECT_ROOT>` 是包含 `hyperframes.json` 的目录。如果意图层采用了某个配方，请立即使用 `node <MEDIA_DIR>/scripts/recipe.mjs use --hyperframes <PROJECT_ROOT> --name <name>` 应用该配方，并且不要再次询问。

## 3. 解读运行形态

仅使用 `../hyperframes-core/references/brief-contract.md` 中的规范术语：

| 字段           | 含义                           | 效果                                                                                |
| -------------- | ------------------------------ | ----------------------------------------------------------------------------------- |
| `flow`         | 由谁主导                       | `automation`：选择并执行路线。`companion`：在对话中共同创作。                       |
| `storyboard`   | 故事板是否作为评审界面         | `yes`：执行方案和草图评审。`no`：不使用故事板直接构建。                             |
| 派生的 `mode`  | 检查点门禁如何运作             | 遵循简报契约。绝不要让用户指定模式名称。                                            |

不要为这些状态杜撰同义词。持续的“直接构建就好”信号由意图层处理，并以 `flow: automation`、`storyboard: no` 的形式传入。

- 对于 `flow: automation`，选择路线，并在首次进度更新中用一行说明。
- 对于具体的编辑请求，直接进行编辑，不要杜撰新路线。

### 协作流程

当 `flow: companion` 时：

- 阅读 `BRIEF.md`，并将已接受的 `## Assets` 和 `## Customizations` 与项目制品进行核对。完成已接受但仍待处理的工作；已经完成的工作保持不变；不要把已接受的能力当作新能力再次提供。
- **以导演而非承包商的姿态出现。** 选择协作模式的用户选择的是参与度和品质；坦诚的回应应该是你所能设计出的最佳版本，而不是你能为之辩护的最小版本。第一份方案应是顶配处理方案：故事弧线（借鉴最接近的类型视角——菜单中的 § 类型视角）、设计规范、按名称标明的每个场景的动效处理（§ 5 的方案纪律）、转场、音频特征——音乐和声音标识，或刻意的静默——用户素材的排布，以及经过设计的开场和收尾。用一行说明每一层带来的价值；在提及高成本项目时标明其成本（渲染时间、登录、计费）。用户应该做的是精简处理方案，而绝不应该被迫通过逐项批准来拼装方案。
- **上限由概念决定，而非由工具箱决定。** 每一层都必须服务于简报传达的信息——若一种处理方案能以同样方式装饰任何视频，那它就只是装饰。制作水准可以达到上限；内容绝不能超出用户的要求（§ 6）。
- 在各检查点之间，`../hyperframes/references/capability-menu.md` 有两种用途。作为触发清单：当用户提及某项能力的输入，或构建过程到达需要该能力的阶段时，提供相关能力。作为每轮处理的升级通道：方案、草图或构建检查点可以附带一到两个可追溯的建议，并指向用户正在查看的素材（“场景 3 的统计数据适合使用数字递增处理”）。提供建议前先阅读该文件；绝不要一次性罗列完整目录。
- 用户接受某项能力后，立即生成其制品，并将决定记录到 `BRIEF.md` 中对应的正文部分。仅当用户明确更改某项偏好时，才重写 frontmatter 字段并记录已确认的偏好。
- 保持相同的故事板、验证、最终预览和渲染审批门禁。协作模式改变的是由谁掌舵，而不是品质要求。

## 4. 在每个阶段开始前加载必需知识

当满足相应条件时，必须读取以下内容：

| 条件                                                                                                              | 执行前读取                                                                                                                                                                                                                             |
| ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 任何合成 HTML 或场景布局                                                                                          | `/hyperframes-core`；使用 `references/determinism-rules.md` 作为其布局约定                                                                                                                                                              |
| 任何非简单创作或视觉处理                                                                                          | `/hyperframes-creative` → `references/house-style.md` 和 `references/video-composition.md`                                                                                                                                             |
| 任何运动、动画或场景转场                                                                                          | `/hyperframes-animation`；按照其中的路由指引，查阅匹配的规则、适配器、蓝图或转场参考文档                                                                                                                                                |
| `storyboard: yes`                                                                                                 | `../hyperframes-core/references/storyboard-format.md` 和 `../hyperframes-core/references/review-loop.md`                                                                                                                               |
| 任何媒体资产或操作，包括旁白、BGM、SFX、字幕、调色或变换                                                         | `/media-use`；对于框架中的播放和放置，还需读取 `/hyperframes-core` → `references/variables-and-media.md`                                                                                                                               |
| 多场景组装                                                                                                        | `../hyperframes-core/references/production-loop.md`                                                                                                                                                                                     |
| `flow: companion`，在首次规划之前                                                                                 | `/hyperframes-creative` → `references/story-spine.md` 和 `references/house-style.md`；最贴近的类型视角以及完整的 `../hyperframes/references/capability-menu.md` —— 上限方案应基于这些内容设计，而不是凭记忆调用 |
| 伴侣式能力提议、采集、节拍网格、生成式视频、地图、发布或跨工作流能力                                              | `../hyperframes/references/capability-menu.md`                                                                                                                                                                                          |
| 已有设计规范时，在最终批准之前                                                                                    | `/hyperframes-creative` → `references/design-adherence.md`                                                                                                                                                                              |

不要用回忆取代这些读取操作。只有实际加载了匹配的参考资料，渐进式披露才能节省上下文。

## 5. 执行合成

请遵循以下依赖顺序。仅当某个阶段的输入不存在时，才跳过该阶段。

1. **规划。** 明确观众体验弧线、结构、节奏和时长驱动因素。对于简短的单一场景，使用一个文件；对于包含三个或更多明确场景切换，或存在任何复用场景的情况，使用子合成。对于叙事弧线，读取 `/hyperframes-creative` → `references/story-spine.md`；对于节奏，读取 `references/beat-direction.md`；对于结构，读取 `/hyperframes-core` → `references/composition-patterns.md`。对于开放式的多场景需求，通过 `/hyperframes-creative` → `references/prompt-expansion.md` 扩展提示词。多场景规划需要注明每个场景的构成方式：如果有合适的蓝图，则引用 `/hyperframes-animation` → `blueprints-index.md` 中的蓝图 id；如果没有，则引用该场景组合使用的 `rules-index.md` 中具名规则——动作名称必须来自这些索引，绝不能自行创造。故事事实决定存在哪些场景；引用负责对其进行包装。
2. **按要求审核规划。** 对于 `storyboard: yes`，为每个场景编写一个 `## Frame N`，设置 `status: outline` 并声明 `src`，然后运行共享审核循环。对于 `storyboard: no`，无需打开故事板，直接继续。
3. **解析依赖项。** 在并行工作前安装注册表块。暂存用户资产、采用现有媒体，并且只解析需求所必需的内容。当音频时间点决定时长时，应尽早开始处理音频。
4. **构建静态主视觉布局。** 在添加动作之前，先实现每个场景最具代表性的可见时刻。如果存在已确认的线框图，它就是这一最终状态，不得重新绘制。遵循 `/hyperframes-core` 中的布局约定。
5. **制作动画。** 根据每个场景引用的蓝图或规则进行构建：在编写动作前，先读取完整的配方正文（`/hyperframes-animation` → `blueprints/<id>.md`、`rules/<id>.md`），并严格遵循。运行时适配器和场景转场使用 `/hyperframes-animation`。动画细节应保留在负责它们的技能中，不要在此处重新定义。
6. **组装。** 使用制作循环装载场景、媒体、转场、字幕和音频。真实语音时长优先于估算值。
7. **验证。** 在首次完成 HTML 以及进行结构性更改后，使用 `npx hyperframes lint` 获取快速反馈。最终门禁使用 `npx hyperframes check`；它会在内部重新运行 lint，因此不要在它之前立即重复运行一次独立的 lint。对于子合成，检查中点快照。对于多场景作品，审核动画映射。
8. **最终批准。** 仅在检查通过后打开最终的 Studio 预览。询问是进行渲染还是修改。只有在获得批准后才能渲染。

## 6. 始终适用的门禁

### 严格控制范围

只构建用户要求的内容。标题卡就是标题卡，而不是标题卡外加三个场景、音乐和字幕。添加额外内容前，应先提出建议。

### 在编写 HTML 前确定设计

按以下顺序解析设计来源：`frame.md` → `design.md` → `DESIGN.md`。将找到的第一个文件视为品牌事实依据。

当不存在设计规范时，在编写构图 HTML 之前完成以下四项：

1. 以 `house-style.md` 和 `video-composition.md` 为视觉识别基础。
2. 为每个非简单创作写一句话，说明其概念切入角度。
3. 从 `/hyperframes-creative` → `references/typography.md` 中选择一组可嵌入的字体搭配；不要假定云端渲染环境中存在未打包的展示字体。
4. 明确定义焦点元素、边缘锚点、辅助细节和背景处理方式。

使信息密度与所请求的格式和信息相匹配。密度示例仅用于指导所产出的画面，并不表示可以虚构主张、场景或固定数量的元素。

对于指定的风格或氛围，请阅读 `/hyperframes-creative` → `references/visual-styles.md`。当用户需要通过视觉方式进行选择，且现有预设均不适用时，请阅读 `/hyperframes-creative` → `references/design-picker.md`，并运行其中的交互式设计选择流程。

### 保持构图契约

定时元素使用 `class="clip"`；根元素和相关祖先元素均已设置尺寸；每个构图在 `window.__timelines` 上注册一条暂停且可安全定位的时间线；渲染必须是确定性的。不要使用渲染时网络请求、时钟或未设种子的随机性。

### 安全借鉴工作流

当作品类似某个随附的工作流时，可将其类型参考作为示例借鉴。首先运行 `npx hyperframes skills update <workflow-name>`。借鉴其叙事结构和审美取向，而不是其私有脚本、管线状态或目录契约。通用构建仍由本技能负责。

## 7. 完成

仅当满足以下条件时，一次运行才算完成：

- 已实现所请求的范围；
- 对于 `flow: companion`，交付的是完整处理方案，而不仅仅是范围：每个场景所引用的蓝图或规则均已落实，音频特征已具备（或已选择并说明使用静音），开场和收尾均经过设计，而非使用默认方案；
- `npx hyperframes check` 通过，包括其内置的 lint 阶段；
- 存在设计规范时，已依据 `/hyperframes-creative` → `references/design-adherence.md` 审查设计遵循情况；
- 对比度问题已解决；
- 适用时，已检查子构图快照；
- 自主交接中包含一份经过检查的接触表或快照表；多场景表使用各场景的中点；
- 交接中根据实际情况注明最终预览或渲染产物，并报告时基交付物的实际时长；
- 对于多场景作品，已审查 `hyperframes-animation/scripts/animation-map.mjs`；
- 用户在渲染前已批准最终的 Studio 预览；
- 请求渲染时，已验证渲染后的文件。

最终批准后，按照 `../hyperframes-core/references/review-loop.md` § 4，询问一次是否将本次运行固化为配方。