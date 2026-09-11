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

在依赖此工作流之前，运行：

```bash
npx hyperframes skills update general-video
```

成功的无操作结果表示该技能已是最新版本。更新失败时应报告失败，而不是继续依赖记忆中的内容。

## 1. 应用跨领域源适配器

- **媒体：** 对于任何音频、图像、图标、徽标、语音、调色、LUT、处理/效果、字幕或媒体操作需求，加载 `/media-use`，并遵循 `../media-use/references/resolve.md`（解析、采用、复用）和 `../media-use/references/setup-providers.md`（提供商、身份验证）。模糊的素材反馈和指定的样式在编辑前使用 `../media-use/references/media-treatments.md`；不要使用 CSS/SVG/opacity 臆造受支持的媒体效果。在首次执行需要身份验证的提供商操作之前，运行 `npx hyperframes auth status` 并逐字转达其输出。如果已退出登录，应用 `../hyperframes-core/references/brief-contract.md` 中的门控规则：协作模式下等待用户登录或明确选择离线模式；自主模式下说明当前状态，并通过可用的离线提供商继续执行。如果没有离线提供商能够满足所需能力，则报告阻塞问题。仅采用本地资源不需要身份验证门控。
- **Figma：** 如果任何输入是 `figma.com` URL，先运行 `/figma`。使用其导出的资源、令牌、组件或故事板帧进行构建。不要使用原始 Figma 连接器调用，因为它们会跳过 SVG 清理、媒体来源记录和品牌令牌绑定。

这些适配器不会改变 `/hyperframes` 选择的工作流。

## 2. 从项目状态开始

应用第一个匹配的行；不要评估下面的状态行：

| 状态                                                         | 操作                                                                                                           |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| 特定编辑                                                     | 执行编辑，保留现有的项目决策，然后重新运行受影响的检查。不要重新开始发现阶段。                                  |
| `BRIEF.md` 存在                                              | 读取它。如果 `workflow` 指定了其他工作流且 `flow` 不是 `companion`，则进行交接。不要询问 brief 相关问题。     |
| 没有 brief，但存在 `hyperframes.json` 或 `STORYBOARD.md`      | 根据文件和记录的偏好恢复工作。仅根据已知事实补写 `BRIEF.md`。                                                  |
| 全新创建                                                       | 运行 `/hyperframes` 及其意图层。仅当 `workflow: general-video` 或 `flow: companion` 时返回此处。               |

对于新项目，根据 brief 选择一个 kebab-case 目录名，并在写入 brief 之前完成脚手架搭建：

```bash
npx hyperframes init "videos/<project>" --non-interactive --example=blank --skill=general-video
```

然后使用 `../hyperframes-core/references/brief-format.md` 在项目根目录写入 `BRIEF.md`。在现有项目中，根目录是包含 `hyperframes.json` 的目录。仅使用 brief 格式中指定、且由已确认偏好支持的字段进行记录，运行 `node <MEDIA_DIR>/scripts/prefs.mjs record --hyperframes <PROJECT_ROOT>`；绝不要记录推断出的默认值。这里的 `<MEDIA_DIR>` 是已安装的 `/media-use` 技能目录，而 `<PROJECT_ROOT>` 是包含 `hyperframes.json` 的目录。如果意图层采用了某个配方，则立即使用 `node <MEDIA_DIR>/scripts/recipe.mjs use --hyperframes <PROJECT_ROOT> --name <name>` 应用它，不要再次询问。

## 3. 解读运行形态

仅使用 `../hyperframes-core/references/brief-contract.md` 中的规范术语：

| 字段          | 含义                                  | 效果                                                                                |
| -------------- | ------------------------------------- | ----------------------------------------------------------------------------------- |
| `flow`         | 由谁驱动                              | `automation`：选择并执行路线。`companion`：在对话中共同创作。                       |
| `storyboard`   | 看板是否是审查界面                    | `yes`：运行计划和草图审查。`no`：不使用看板直接构建。                               |
| 派生的 `mode` | 检查点关卡的行为方式                  | 遵循 brief contract。绝不要求用户为某个模式命名。                                   |

不要为这些状态创造同义词。持续的“直接构建”信号由意图层处理，并以 `flow: automation`、`storyboard: no` 的形式传入。

- 对于 `flow: automation`，选择路线，并在第一条进度更新中用一行说明它。
- 对于特定编辑，直接进行编辑，不要创造新的路线。

对于现有素材的硬切、裁剪、拼接或重新排序，将同一视频源复制到多个剪辑元素中。在每个副本上，使用 `data-media-start` 加上 `data-duration` 设置源范围，然后使用 `data-start` 设置创作的位置/顺序。单独创作的音频在匹配的 `<audio>` 元素上遵循完全相同的剪辑范围和时间安排。`/hyperframes-core` 负责这一时间编辑；仅将 `/hyperframes-keyframes` 用于内层包装器上的缩放、强调、平移、裁剪、遮罩或 `clip-path` 等视觉属性动画。
从 `../hyperframes-core/references/creator-editing-recipes.md` 复制完整契约。

### Companion 流程

当 `flow: companion` 时：

- 阅读 `BRIEF.md`，并将已接受的 `## Assets` 和 `## Customizations` 与项目产物进行核对。完成仍待处理的已接受工作；已完成的工作保持不动；不要将已接受的能力再次作为新内容提供。
- **以导演身份出现，而非承包商。** 选择 companion 的用户选择了参与和品质；诚实的回应是你能够设计出的最佳版本，而不是你能辩护的最小版本。第一份计划应是完整方案：故事弧线（借用最接近的类型视角——菜单 § Genre lenses）、设计规格、以名称引用的每个场景运动处理（§ 5 的计划纪律）、转场、音频识别——音乐和声音标记，或有意的静默——用户素材的放置方式，以及经过设计的开场与结尾。用一行说明每一层增加了什么；在提及昂贵的部分时标记出来（渲染时间、登录、计费）。用户应当精简方案；他们绝不应该必须逐项拼凑一份批准。
- **完整方案属于概念，而非工具箱。** 每一层都必须服务于 brief 的信息——一个会以同样方式装扮任何视频的方案只是装饰。工艺提升至完整方案；内容绝不超出所要求的范围（§ 6）。
- 在检查点之间，`../hyperframes/references/capability-menu.md` 有两种作用。作为触发列表：当用户提及其输入或构建到达其需求时，提供相关能力。作为每一轮的升级通道：计划、草图或构建检查点可以附带一两个针对用户正在查看素材的可追溯建议（“场景 3 的统计数据适合使用 count-up treatment”）。在提供前先阅读；绝不倾倒完整目录。
- 用户接受某项能力后，立即产出其工件，并将决定记录在匹配的 `BRIEF.md` 正文部分。仅当用户明确更改时，才重写 frontmatter 字段并记录确认的偏好。
- 保持相同的 storyboard、验证、最终预览和渲染批准关卡。Companion 改变的是由谁掌舵，而不是质量要求。

## 4. 在每个阶段开始前加载所需知识

当相应条件满足时，必须读取以下内容：

| 条件                                                                                                              | 执行操作前读取                                                                                                                                                                                                                         |
| ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 任何合成 HTML 或场景布局                                                                                          | `/hyperframes-core`；使用 `references/determinism-rules.md` 作为其布局约定                                                                                                                                                             |
| 任何非简单创作或视觉处理                                                                                          | `/hyperframes-creative` → `references/house-style.md` 和 `references/video-composition.md`                                                                                                                                             |
| 任何运动、动画或场景转场                                                                                          | `/hyperframes-animation`；按照其路由读取匹配的规则、适配器、蓝图或转场参考文档                                                                                                                                                         |
| `storyboard: yes`                                                                                                 | `../hyperframes-core/references/storyboard-format.md` 和 `../hyperframes-core/references/review-loop.md`                                                                                                                               |
| 任何媒体资产或操作，包括旁白、BGM、SFX、字幕、调色或变换                                                          | `/media-use`；如需框架播放和放置，还应读取 `/hyperframes-core` → `references/variables-and-media.md`                                                                                                                                   |
| 多场景组装                                                                                                        | `../hyperframes-core/references/production-loop.md`                                                                                                                                                                                    |
| `flow: companion`，在首次制定计划前                                                                               | `/hyperframes-creative` → `references/story-spine.md` 和 `references/house-style.md`；最接近的类型视角以及完整的 `../hyperframes/references/capability-menu.md`，上限方案应基于这些内容设计，而不是凭记忆复现 |
| 伴随式能力提议、捕获、节拍网格、生成式视频、地图、发布或跨工作流能力                                              | `../hyperframes/references/capability-menu.md`                                                                                                                                                                                         |
| 存在设计规范时，在最终批准前                                                                                      | `/hyperframes-creative` → `references/design-adherence.md`                                                                                                                                                                             |

不要用回忆替代这些读取操作。只有实际加载了匹配的参考资料，渐进式披露才能节省上下文。

## 5. 执行合成

请按以下依赖顺序执行。仅当某个阶段的输入不存在时，才跳过该阶段。

1. **规划。** 明确观众体验弧线、结构、节奏和时长驱动因素。对于简短的单场景内容，使用一个文件；对于包含三个或更多明确场景切换的内容，或任何被复用的场景，使用子合成。叙事弧线请读取 `/hyperframes-creative` → `references/story-spine.md`，节奏请读取 `references/beat-direction.md`，结构请读取 `/hyperframes-core` → `references/composition-patterns.md`。对于开放式的多场景需求，通过 `/hyperframes-creative` → `references/prompt-expansion.md` 扩展提示词。多场景规划需要标注每个场景的形态：如果 `/hyperframes-animation` → `blueprints-index.md` 中存在适用的蓝图，则引用其蓝图 id；如果不存在，则引用由 `rules-index.md` 组合而成的具名规则。动作名称必须来自这些索引，绝不能自行杜撰。故事事实决定存在哪些场景，引用则负责为其赋予表现形式。**在计划自行构建任何具名视觉风格之前，先搜索实时目录**：对于需求中提到的每一种视觉风格、效果、处理方式或转场，例如 "CRT scanlines"、"glitch"、"film grain"、"shimmer sweep"、"confetti burst"，在规划说明如何构建该效果之前，运行 `npx hyperframes catalog --query "<the look, in plain English>" --json` 并阅读排名靠前的结果。该搜索**无须安装任何内容**：不需要项目，不需要预先执行 `add`，也不需要账户。它可以从任意目录对整个托管注册表中约 400 个块和组件进行排序，因此同样适用于用户在构建过程中临时提出的视觉风格。规划中提到的块将在第 3 阶段安装；只有在搜索后没有发现合适结果时，才可手动实现该视觉风格。多场景规划还应记录为分发工件：在 `STORYBOARD.md` 中为每个场景创建一个 `## Frame N` 块，其中包含 `status: outline`、已声明的 `src:`、蓝图或规则引用以及节拍文本，**即使 `storyboard: no` 也是如此**。该块是分发单元，分镜板仅作为评审界面。
2. **按要求评审规划。** 对于 `storyboard: yes`，针对这些块运行共享评审循环。对于 `storyboard: no`，不打开分镜板并继续执行。如果规划阶段无论如何都发生了暂停，请将子代理委派授权（Codex 在第 4 步进行分发时需要该授权）合并到此次暂停中，避免之后再次停止。
3. **解决依赖项。** 在并行工作开始之前安装注册表块。整理用户资产，采用现有媒体，并且仅解决需求所要求的依赖项。如果音频时间点决定时长，请尽早开始处理音频。
4. **构建场景。** 对于简短的单场景作品，请先实现该场景最具视觉表现力的时刻，再添加动作（如果存在已确认的线框图，它就是最终状态，不得重新绘制），然后依据引用的蓝图或规则制作动画。在编写动作之前，先完整读取配方正文（`/hyperframes-animation` → `blueprints/<id>.md`、`rules/<id>.md`）。

**只有达到一定规模，Dispatch 才能收回成本。** 编写数据包并为新的 worker 上下文预热会消耗实际的时间和 token：对于最多约 6 个短场景，直接在当前上下文中逐个场景构建会更快（实测：5 个短场景直接构建约需 9 分钟，而数据包化约需 21 分钟）。只有当计划超出这个规模时才进行扇出，也就是场景更多，或单个场景较重；此时应为每个 worker 分配 **2–3 个场景**，并在**同一波次**中启动所有 worker（第二波次几乎会使整体时间窗口翻倍）。进行 dispatch 时：

   `node <SKILL_DIR>/scripts/frame-packets.mjs --project "$PROJECT_DIR" --storyboard "$PROJECT_DIR/STORYBOARD.md"`

   构建器会在 `.hyperframes/frame-packets/` 下为每个场景写入一个有界数据包，其中包含该场景的完整 storyboard 区块 + blueprint 正文 + 所有引用的规则配方，并内联写入 `_role.md`（`../hyperframes-core/references/frame-worker-core.md` + 此 skill 的 `sub-agents/frame-worker.md`，逐字拼接 — 完整的 worker 角色定义）。按照 `../hyperframes-core/references/subagent-dispatch.md` 调度 worker — 每个 worker 分配 2–3 个场景数据包，并在同一波次中全部启动；每个 worker 的提示词都要携带 `_role.md` 及其数据包 — 可以完整粘贴，也可以先提供文件路径让 worker 读取（两者等价）— 另外还要提供包含 `PROJECT_DIR`、其 `frame_id` 以及画布尺寸的 dispatch 上下文。等待每个场景的 `compositions/<frame_id>.html` + `compositions/<frame_id>.motion.json` 都生成。Worker 只能读取自己的数据包和设计事实文件；绝不能打开 `STORYBOARD.md` 或 skill 文档。如果没有 delegation channel，则按串行方式回退：在当前上下文中一次处理一个数据包，但仍然只能依据数据包工作。

5. **合并 motion sidecar。** 收集 worker 生成的 `compositions/<frame_id>.motion.json` 文件，并在装配时带入其中的时长和退出/进入向量；如果安装了 doctrine chain（`/motion-doctrine`），则在固定接缝前将其转换到项目 ledger 中。
6. **装配。** 使用 production loop 挂载场景、媒体、转场、字幕和音频。真实语音时长会覆盖估算值。当任意语音轨道下方播放音乐 bed 时，在验证混音前先处理该 bed：`/hyperframes-audio` → `scripts/carve.mjs --comp index.html`。仅降低音量并不能完成混音。
7. **验证。** 在首次 HTML 通过以及进行结构性修改后，使用 `npx hyperframes lint` 快速获取反馈。最终 gate 使用 `npx hyperframes check`；它会在内部重新运行 lint，因此不要在它之前立即重复运行独立的 lint。对于子组合，检查中点快照。对于多场景工作，审阅动画映射。
8. **最终批准。** 只有在检查通过后，才打开最终的 Studio 预览。询问用户是要渲染还是修改。只有获得批准后才进行渲染。

## 6. 始终适用的 Gate

### 保持范围准确

构建用户要求的内容。标题卡不等于标题卡加三个场景、音乐和字幕。添加内容前先提出。

### 在编写 HTML 前确定设计

按以下顺序解析设计来源：`frame.md` → `design.md` → `DESIGN.md`。将找到的第一个文件视为品牌设计的权威依据。

如果不存在设计规范，请在编写构图 HTML 之前完成以下四项：

1. 以 `house-style.md` 和 `video-composition.md` 为基础确立视觉识别。
2. 对每个非简单创作，用一句话说明其概念角度。
3. 从 `/hyperframes-creative` → `references/typography.md` 中选择一组可嵌入的字体搭配；不要假设云端渲染环境中存在未打包的展示字体。
4. 定义焦点元素、边缘锚点、辅助细节和背景处理方式。

使信息密度与所请求的格式和信息相匹配。密度示例是对成品画面的指导，并不意味着可以编造声明、场景或固定数量的元素。

对于指定的风格或氛围，请阅读 `/hyperframes-creative` → `references/visual-styles.md`。当用户需要通过视觉方式进行选择，且已有预设均不合适时，请阅读 `/hyperframes-creative` → `references/design-picker.md`，并运行其中的交互式设计选择流程。

### 保持构图契约

定时元素使用 `class="clip"`；根元素和相关祖先元素均已设置尺寸；每个构图在 `window.__timelines` 上注册一个处于暂停状态且可安全跳转的时间线；渲染必须具有确定性。不要使用渲染时网络请求、时钟或未设种子的随机性。

### 安全借鉴工作流

当作品类似于某个已发布的工作流时，可以将其类型参考作为示例借鉴。首先运行 `npx hyperframes skills update <workflow-name>`。借鉴其叙事结构和审美取向，而不是其私有脚本、流水线状态或目录契约。通用构建仍由此技能负责。

## 7. 完成

仅当满足以下条件时，一次运行才算完成：

- 已实现请求的范围；
- 对于 `flow: companion`，交付的是完整处理方案，而不仅仅是范围：每个场景所引用的蓝图或规则均已实现，音频识别已呈现（或已选择静音并明确说明），开场和结尾均经过设计，而不是使用默认设置；
- `npx hyperframes check` 通过，包括其内置的 lint 阶段；
- 如果存在设计规范，已根据 `/hyperframes-creative` → `references/design-adherence.md` 审查设计遵循情况；
- 对比度问题已解决；
- 在适用时，已检查子构图快照；
- 自主交接中包含一份已检查的联系表或快照表；多场景表使用各场景的中点；
- 交接中根据实际情况指明最终预览或渲染产物，并报告基于时间的交付物的实际时长；
- 对于多场景工作，已审查 `hyperframes-animation/scripts/animation-map.mjs`；
- 用户在渲染前已批准最终的 Studio 预览；
- 如果请求了渲染，已验证渲染后的文件。

最终批准后，按照 `../hyperframes-core/references/review-loop.md` § 4，仅询问一次是否要将本次运行固化为配方。