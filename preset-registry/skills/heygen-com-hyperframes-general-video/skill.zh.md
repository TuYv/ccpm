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

如果命令成功且未执行任何操作，则表示该技能已是最新版本。如果更新失败，请报告失败，而不是依靠记忆继续操作。

## 1. 应用跨领域源适配器

- **媒体：** 对于任何音频、图像、图标、徽标、声音、调色、LUT、处理方式/效果、字幕或媒体操作需求，请加载 `/media-use`，并遵循 `../media-use/references/resolve.md`（解析、采用、复用）和 `../media-use/references/setup-providers.md`（提供商、身份验证）。对于模糊的素材反馈和具名风格，请在编辑前使用 `../media-use/references/media-treatments.md`；不要使用 CSS/SVG/不透明度擅自实现受支持的媒体效果。在首次执行需要身份验证的提供商操作之前，请运行 `npx hyperframes auth status`，并逐字转达其输出。如果用户已退出登录，请应用 `../hyperframes-core/references/brief-contract.md` 中的门控规则：协作模式应等待用户登录或明确选择离线模式；自主模式应说明当前状态，并通过可用的离线提供商继续操作。如果没有任何离线提供商能够满足所需能力，请报告阻塞问题。仅采用本地资源不需要身份验证门控。
- **Figma：** 如果任何输入是 `figma.com` URL，请先运行 `/figma`。基于其导出的资源、令牌、组件或故事板帧进行构建。不要使用原始 Figma 连接器调用，因为它们会绕过 SVG 清理、媒体来源追踪和品牌令牌绑定。

这些适配器不会更改 `/hyperframes` 所选择的工作流。

## 2. 从项目状态开始

应用第一个匹配的行；不要再判断其下方的状态行：

| 状态                                                       | 操作                                                                                                           |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| 特定编辑                                                   | 执行编辑，保留项目现有决策，然后重新运行受影响的检查。不要重新开始需求探索。                                   |
| `BRIEF.md` 存在                                            | 读取它。如果 `workflow` 指定了其他工作流且 `flow` 不是 `companion`，则移交处理。不要询问简报问题。              |
| 没有简报，但 `hyperframes.json` 或 `STORYBOARD.md` 存在    | 根据文件和已记录的偏好继续。仅使用已知事实补充 `BRIEF.md`。                                                    |
| 全新创作                                                   | 运行 `/hyperframes` 及其意图层。仅在 `workflow: general-video` 或 `flow: companion` 时返回此处。                |

对于新项目，请根据简报选择一个 kebab-case 目录名称，并在编写简报之前搭建项目结构：

```bash
npx hyperframes init "videos/<project>" --non-interactive --example=blank --skill=general-video
```

然后使用 `../hyperframes-core/references/brief-format.md`，在项目根目录编写 `BRIEF.md`。对于现有项目，根目录是包含 `hyperframes.json` 的目录。仅记录简报格式中明确指定且已由偏好确认的字段，使用 `node <MEDIA_DIR>/scripts/prefs.mjs record --hyperframes <PROJECT_ROOT>`；绝不要记录推断出的默认值。此处，`<MEDIA_DIR>` 是已安装的 `/media-use` 技能目录，`<PROJECT_ROOT>` 是包含 `hyperframes.json` 的目录。如果意图层采用了某个配方，请立即使用 `node <MEDIA_DIR>/scripts/recipe.mjs use --hyperframes <PROJECT_ROOT> --name <name>` 应用它，不要再次询问。

## 3. 解读运行形态

仅使用 `../hyperframes-core/references/brief-contract.md` 中的规范术语：

| 字段           | 含义                                  | 作用                                                                                |
| -------------- | ------------------------------------- | ----------------------------------------------------------------------------------- |
| `flow`         | 由谁主导                              | `automation`：选择并执行路线。`companion`：通过对话共同创作。                       |
| `storyboard`   | 故事板是否作为评审界面                | `yes`：执行计划和草图评审。`no`：不使用故事板直接构建。                             |
| 派生的 `mode`  | 检查点关卡的行为方式                  | 遵循简报契约。绝不要让用户指定模式名称。                                            |

不要为这些状态创造同义词。持续发出的“直接构建就好”信号由意图层处理，并以 `flow: automation`、`storyboard: no` 的形式传入。

- 对于 `flow: automation`，选择路线，并在第一次进度更新中用一行说明。
- 对于具体编辑，直接执行编辑，不要凭空创造一条新路线。

### 伴随式流程

当 `flow: companion` 时：

- 阅读 `BRIEF.md`，并将已接受的 `## Assets` 和 `## Customizations` 与项目产物进行核对。完成已接受但仍待处理的工作；已经完成的工作保持不变；不要把已接受的能力当作新能力再次提供。
- **要以导演而非承包商的姿态出现。** 选择伴随式流程的用户，选择的是参与感和质量；诚实的回应应是你所能设计出的最佳版本，而不是你能为之辩护的最小版本。第一个计划就是上限方案：故事弧线（借用最接近的类型视角——菜单 § 类型视角）、设计规范、逐一明确各个场景的动态处理并引用其名称（§ 5 的计划纪律）、转场、音频标识——音乐和声音标记，或有意的静默——用户素材的放置，以及经过设计的开场和结尾。用一行说明每一层带来的价值；在提及成本高昂的项目（渲染时间、登录、计费）时立即予以标明。用户应当是在完整方案的基础上做删减；绝不应该让他们通过逐项审批来自行拼装一套方案。
- **上限由概念决定，而不是由工具箱决定。** 每一层都必须服务于简报所传达的信息——如果一套处理方式套在任何视频上都毫无区别，那就只是装饰。制作水准应提升至上限；内容绝不能超出用户所要求的范围（§ 6）。
- 在各检查点之间，`../hyperframes/references/capability-menu.md` 有两种用途。作为触发列表：当用户提到某项能力所需的输入，或构建过程进行到需要该能力的阶段时，提供相关能力。作为每轮工作的升级渠道：计划、草图或构建检查点可以附带一两项有明确依据的建议，并指向用户正在查看的素材（“场景 3 的统计数据适合使用数字递增处理”）。提供建议前先阅读该文件；绝不要一次性罗列完整目录。
- 用户接受某项能力后，生成相应产物，并立即将该决定记录到 `BRIEF.md` 中对应的正文部分。仅当用户明确更改某项偏好时，才重写 frontmatter 字段并记录已确认的偏好。
- 保持相同的故事板、验证、最终预览和渲染审批关卡。伴随式流程改变的是由谁掌舵，而不是质量要求。

## 4. 在每个阶段开始前加载所需知识

当符合相应条件时，必须读取以下内容：

| 条件                                                                                                              | 执行操作前读取                                                                                                                                                                                                                         |
| ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 任何合成 HTML 或场景布局                                                                                          | `/hyperframes-core`；使用 `references/determinism-rules.md` 作为其布局规范                                                                                                                                                             |
| 任何非简单的创作或视觉处理                                                                                        | `/hyperframes-creative` → `references/house-style.md` 和 `references/video-composition.md`                                                                                                                                             |
| 任何运动、动画或场景转场                                                                                          | `/hyperframes-animation`；按照其路由读取匹配的规则、适配器、蓝图或转场参考文档                                                                                                                                                         |
| `storyboard: yes`                                                                                                 | `../hyperframes-core/references/storyboard-format.md` 和 `../hyperframes-core/references/review-loop.md`                                                                                                                               |
| 任何媒体资产或操作，包括旁白、BGM、SFX、字幕、调色或变换                                                          | `/media-use`；对于框架内的播放和放置，还需读取 `/hyperframes-core` → `references/variables-and-media.md`                                                                                                                               |
| 多场景组装                                                                                                        | `../hyperframes-core/references/production-loop.md`                                                                                                                                                                                    |
| `flow: companion`，在首次规划之前                                                                                 | `/hyperframes-creative` → `references/story-spine.md` 和 `references/house-style.md`；最接近的类型视角以及完整的 `../hyperframes/references/capability-menu.md`——上限方案应基于这些内容设计，而不是凭记忆调用 |
| 伴侣能力提议、采集、节拍网格、生成式视频、地图、发布或跨工作流能力                                                | `../hyperframes/references/capability-menu.md`                                                                                                                                                                                         |
| 存在设计规范时，在最终批准之前                                                                                    | `/hyperframes-creative` → `references/design-adherence.md`                                                                                                                                                                             |

不要用记忆替代这些读取操作。渐进式披露只有在实际加载匹配的参考资料时才能节省上下文。

## 5. 执行合成

请遵循以下依赖顺序。仅当某个阶段的输入不存在时，才跳过该阶段。

1. **规划。** 明确观众体验弧线、结构、节奏和时长驱动因素。对于简短的单场景，使用一个文件；对于包含三个或更多明确场景切换，或存在复用场景的情况，使用子合成。对于叙事弧线，阅读 `/hyperframes-creative` → `references/story-spine.md`；对于节奏，阅读 `references/beat-direction.md`；对于结构，阅读 `/hyperframes-core` → `references/composition-patterns.md`。对于开放式多场景简述，通过 `/hyperframes-creative` → `references/prompt-expansion.md` 扩展提示词。多场景计划需要标明每个场景的形式：如果有合适的蓝图，则引用 `/hyperframes-animation` → `blueprints-index.md` 中的蓝图 id；如果没有，则引用由 `rules-index.md` 中哪些具名规则组合而成——动作名称必须来自这些索引，绝不能自行杜撰。故事事实决定存在哪些场景；引用则为这些场景赋予表现形式。多场景计划还要记录为分发产物：在 `STORYBOARD.md` 中为每个场景建立一个 `## Frame N` 块——包含 `status: outline`、声明的 `src:`、蓝图/规则引用以及节拍文本——**即使 `storyboard: no` 也是如此**。该块是分发单元；故事板只是审查界面。
2. **按要求审查计划。** 对于 `storyboard: yes`，针对这些块运行共享审查循环。对于 `storyboard: no`，无需打开故事板，直接继续。如果无论如何都需要在规划阶段暂停，请将子代理委派授权（codex 在第 4 步进行分发时需要）合并到该暂停中，而不是稍后再次停止。
3. **解析依赖项。** 在并行工作之前安装注册表块。暂存用户资源，采用现有媒体，并且只解析简述所要求的内容。如果音频时间点会驱动时长，请尽早开始处理音频。
4. **构建场景。** 对于简短的单场景作品，先实现该场景最直观可见的时刻，再添加动作（如果存在已确认的线框图，它就是最终状态，不得重新绘制），然后根据其引用的蓝图或规则制作动画——在编写动作之前，先阅读完整的配方正文（`/hyperframes-animation` → `blueprints/<id>.md`、`rules/<id>.md`）。

   **只有达到一定规模，分发才划算。** 编写数据包并预热全新的工作器上下文会消耗切实的时间和 token：最多约 6 个短场景的影片，在当前上下文中依次内联构建场景会更快（实测：5 个短场景，内联构建约 9 分钟，数据包化约 21 分钟）。只有当计划超出该规模——场景更多，或单个场景工作量较大——才进行扇出；此时应为每个工作器分配 **2–3 个场景**，而不是一个，并且在**单个批次中生成所有工作器**（第二个批次几乎会使时间窗口翻倍）。分发时：

   `node <SKILL_DIR>/scripts/frame-packets.mjs --project "$PROJECT_DIR" --storyboard "$PROJECT_DIR/STORYBOARD.md"`

   构建器会在 `.hyperframes/frame-packets/` 下为每个场景写入一个有边界的数据包（内联包含该场景完整的故事板块、蓝图正文以及每个被引用规则的配方），以及 `_role.md`（将 `../hyperframes-core/references/frame-worker-core.md` 与此技能的 `sub-agents/frame-worker.md` 逐字串联——即完整的工作器角色）。分发工作器——每个工作器分配 2–3 个场景数据包，全部在同一批次中分发（`../hyperframes-core/references/subagent-dispatch.md`）；每个工作器的提示词都携带 `_role.md` 及其数据包——可以完整粘贴其内容，也可以提供文件路径，让工作器先读取文件（二者等效）——再加上包含 `PROJECT_DIR`、其 `frame_id` 和画布尺寸的分发上下文。等待每个场景的 `compositions/<frame_id>.html` + `compositions/<frame_id>.motion.json`。工作器只读取其数据包和设计事实文件；绝不打开 `STORYBOARD.md` 或技能文档。如果没有委派通道，则退回串行处理：在当前上下文中一次处理一个数据包，并且仍然只根据该数据包开展工作。

5. **合并运动附属文件。** 收集各工作器的 `compositions/<frame_id>.motion.json` 文件，并将其中的持续时间和退出/进入向量带入组装流程；如果已安装规范链（`/motion-doctrine`），请先将它们转换到项目账本中，再标记接缝。
6. **组装。** 使用制作循环装配场景、媒体、转场、字幕和音频。真实语音时长优先于估算值。
7. **验证。** 完成第一版 HTML 以及结构性变更后，使用 `npx hyperframes lint` 获取快速反馈。对于最终关卡，运行 `npx hyperframes check`；它会在内部重新运行 lint，因此不要在它之前立即重复运行一次独立的 lint。对于子合成，请检查中点快照。对于多场景作品，请审查动画映射。
8. **最终批准。** 仅在检查通过后打开最终的 Studio 预览。询问是渲染还是修改。仅在获得批准后进行渲染。

## 6. 始终适用的关卡

### 严格遵守范围

构建用户所要求的内容。标题卡就是标题卡，而不是标题卡再加三个场景、音乐和字幕。添加额外内容前，先提出建议。

### 在编写 HTML 之前确立设计

按以下顺序确定设计来源：`frame.md` → `design.md` → `DESIGN.md`。将找到的第一个文件视为品牌准则。

如果不存在设计规范，请在编写合成 HTML 之前完成以下四项：

1. 以 `house-style.md` 和 `video-composition.md` 为基础确立视觉识别。
2. 对每个非简单创作，用一句话说明其概念切入角度。
3. 从 `/hyperframes-creative` → `references/typography.md` 中选择一组可嵌入的字体搭配；不要假定云端渲染环境中存在未随项目打包的展示字体。
4. 定义焦点元素、边缘锚点、辅助细节和背景处理方式。

使信息密度与所请求的格式和信息相匹配。密度示例是对成品画面的指导，并不意味着可以虚构论断、场景或固定数量的元素。

对于指定的风格或氛围，请阅读 `/hyperframes-creative` → `references/visual-styles.md`。当用户需要通过视觉方式进行选择，且随附的预设均不适用时，请阅读 `/hyperframes-creative` → `references/design-picker.md`，并运行其中的交互式设计选择流程。

### 保持合成契约

定时元素使用 `class="clip"`；根元素和相关祖先元素已设置尺寸；每个合成都在 `window.__timelines` 上注册一个暂停且可安全定位的时间线；渲染必须具有确定性。不要使用渲染时网络请求、时钟或未设种子的随机性。

### 安全地借鉴工作流

当作品与某个随附工作流相似时，可借鉴其类型参考作为示例。首先运行 `npx hyperframes skills update <workflow-name>`。借鉴其叙事结构和审美品位，而不是其私有脚本、流水线状态或目录契约。通用构建仍由此技能负责。

## 7. 完成标准

仅当满足以下条件时，一次运行才算完成：

- 已实现所请求的范围；
- 对于 `flow: companion`，交付的是完整处理方案，而不仅仅是范围：每个场景所引用的蓝图或规则均已实现，音频特征已呈现（或者已选择并明确说明使用静音），开场和结尾经过设计而非采用默认方案；
- `npx hyperframes check` 通过，包括其内置的 lint 阶段；
- 如果存在设计规范，已依据 `/hyperframes-creative` → `references/design-adherence.md` 审查设计遵循情况；
- 对比度问题已解决；
- 在适用时已检查子合成快照；
- 自主交接包含经过检查的联系表或快照表；多场景表使用各场景的中点；
- 交接材料根据实际情况指明最终预览或渲染产物，并报告时基交付物的实际时长；
- 对于多场景作品，已审查 `hyperframes-animation/scripts/animation-map.mjs`；
- 用户在渲染前已批准最终的 Studio 预览；
- 如果请求了渲染，已验证渲染后的文件。

最终批准后，按照 `../hyperframes-core/references/review-loop.md` § 4，仅提议一次将此次运行固化为配方。