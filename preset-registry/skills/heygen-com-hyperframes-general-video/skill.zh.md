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

- **媒体：** 对于任何音频、图像、图标、徽标、声音、调色、LUT、处理/效果、字幕或媒体操作需求，加载 `/media-use`，并遵循 `../media-use/references/resolve.md`（解析、采用、复用）以及 `../media-use/references/setup-providers.md`（提供商、身份验证）。模糊的素材反馈和指定的风格在编辑前使用 `../media-use/references/media-treatments.md`；不要使用 CSS/SVG/opacity 臆造受支持的媒体效果。在首次执行需要身份验证的提供商操作之前，运行 `npx hyperframes auth status` 并逐字转达其输出。如果已登出，则应用 `../hyperframes-core/references/brief-contract.md` 中的门控规则：协作模式下等待登录或明确选择离线方式；自主模式下说明当前状态，并通过可用的离线提供商继续执行。当没有离线提供商能够满足必需能力时，报告阻塞问题。仅采用本地资源不需要身份验证门控。
- **Figma：** 如果任何输入是 `figma.com` URL，先运行 `/figma`。使用其导出的资源、令牌、组件或分镜帧构建。不要使用原始 Figma 连接器调用，因为它们会跳过 SVG 清理、媒体来源追踪和品牌令牌绑定。

这些适配器不会改变 `/hyperframes` 选定的工作流。

## 2. 从项目状态开始

应用第一个匹配的行；不要评估更低的状态行：

| 状态                                                       | 操作                                                                                                          |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| 特定编辑                                                   | 执行编辑，保留现有项目决策，然后重新运行受影响的检查。不要重新开始探索。                                       |
| 存在 `BRIEF.md`                                            | 读取它。如果 `workflow` 指定了其他工作流且 `flow` 不是 `companion`，则交接。不要询问 brief 相关问题。         |
| 没有 brief，但存在 `hyperframes.json` 或 `STORYBOARD.md`   | 根据文件和记录的偏好继续执行。仅根据已知事实补充 `BRIEF.md`。                                                  |
| 全新创建                                                     | 运行 `/hyperframes` 及其意图层。仅当 `workflow: general-video` 或 `flow: companion` 时返回此处。              |

对于新项目，根据 brief 选择一个 kebab-case 目录名，并在编写 brief 之前完成脚手架：

```bash
npx hyperframes init "videos/<project>" --non-interactive --example=blank --skill=general-video
```

然后使用 `../hyperframes-core/references/brief-format.md` 在项目根目录写入 `BRIEF.md`。在现有项目中，根目录是包含 `hyperframes.json` 的目录。仅使用 brief 格式指定的、已确认且有偏好依据的字段进行记录，执行 `node <MEDIA_DIR>/scripts/prefs.mjs record --hyperframes <PROJECT_ROOT>`；绝不要记录推断出的默认值。这里的 `<MEDIA_DIR>` 是已安装的 `/media-use` 技能目录，`<PROJECT_ROOT>` 是包含 `hyperframes.json` 的目录。如果意图层采用了某个配方，现在使用 `node <MEDIA_DIR>/scripts/recipe.mjs use --hyperframes <PROJECT_ROOT> --name <name>` 应用它，不要再次询问。

## 3. 解读运行形态

仅使用 `../hyperframes-core/references/brief-contract.md` 中的规范术语：

| 字段           | 含义                                  | 影响                                                                                 |
| -------------- | ------------------------------------- | ------------------------------------------------------------------------------------ |
| `flow`         | 谁来驱动                              | `automation`：选择并执行路线。`companion`：在对话中共同创作。                       |
| `storyboard`   | 画板是否作为审阅界面                  | `yes`：审阅运行计划和草图。`no`：不使用画板直接构建。                                |
| 派生的 `mode`  | 检查点关卡如何运作                    | 遵循 brief contract。绝不要要求用户指定 mode。                                      |

不要为这些状态臆造同义词。持续的“直接构建”信号由意图层处理，并以 `flow: automation`、`storyboard: no` 的形式传入。

- 对于 `flow: automation`，选择路线，并在第一条进度更新中用一行说明。
- 对于具体编辑，直接执行编辑，不要臆造新的路线。

对于现有素材的硬切、裁剪、拼接或重新排序，将同一个视频源复制到多个片段元素中。在每个副本上使用 `data-media-start` 加 `data-duration` 设置源范围，然后使用 `data-start` 设置编排后的位置/顺序。单独编排的音频应遵循相同的片段范围和时间安排，并应用于匹配的 `<audio>` 元素。`/hyperframes-core` 负责这一时间编辑；仅当需要对内层包装器应用缩放、强调、平移、裁剪、遮罩或 `clip-path` 等视觉属性动画时，才使用 `/hyperframes-keyframes`。从 `../hyperframes-core/references/creator-editing-recipes.md` 完整复制契约。

### Companion 流程

当 `flow: companion` 时：

- 阅读 `BRIEF.md`，并将已接受的 `## Assets` 和 `## Customizations` 与项目产物进行核对。完成仍处于待处理状态的已接受工作；对已完成的工作不做改动；不要再次把已接受的能力当作新能力提供。
- **以导演身份到场，而不是承包商。** 选择 companion 的用户选择了参与和质量；诚实的回应应是你能设计出的最佳版本，而不是你能辩护的最小版本。第一版计划就是上限方案：故事弧线（借用最接近的类型视角——菜单 § Genre lenses）、设计规格、每个场景的运动处理（按名称引用 § 5 的计划规范）、转场、音频特性——音乐和声音标记，或刻意的静默——用户素材的放置，以及经过设计的开场和收尾。用一行说明每一层增加的内容；提及昂贵项（渲染时间、登录、计费）时标记出来。用户可以将方案删减；他们不应该被迫逐项审批来组装方案。
- **上限属于概念，而不是工具箱。** 每一层都必须服务于 brief 的信息——一个可以用同样方式装饰任何视频的方案只是装饰。工艺应达到上限；内容绝不应超出用户的要求（§ 6）。
- 在检查点之间，`../hyperframes/references/capability-menu.md` 有两种作用。作为触发列表：当用户提到某项能力的输入，或构建过程达到其需求时，提供相关能力。作为每一轮的升级渠道：计划、草图或构建检查点可以携带一到两个有明确指向的提议，指向用户正在查看的素材（“场景 3 的统计数据需要使用递增计数处理”）。在提供之前先阅读；绝不要倾倒完整目录。
- 用户接受某项能力后，生成其产物，并立即在对应的 `BRIEF.md` 正文部分记录该决定。只有当用户明确更改某项偏好时，才重写 frontmatter 字段并记录已确认的偏好。
- 保持相同的 storyboard、验证、最终预览和渲染批准关卡。Companion 改变的是由谁来引导，而不是质量要求。

## 4. 在每个阶段之前加载所需知识

当条件匹配时，必须读取以下内容：

| 条件                                                                                                         | 执行前读取                                                                                                                                                                                                                     |
| ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 任何构图 HTML 或场景布局                                                                              | `/hyperframes-core`；使用其中的 `references/determinism-rules.md` 作为布局契约                                                                                                                                                     |
| 任何非简单的创建或视觉处理                                                                      | `/hyperframes-creative` → `references/house-style.md` 和 `references/video-composition.md`                                                                                                                                            |
| 任何运动、动画或场景转场                                                                        | `/hyperframes-animation`；遵循其路由，读取匹配的规则、适配器、蓝图或转场参考文档                                                                                                                     |
| `storyboard: yes`                                                                                                 | `../hyperframes-core/references/storyboard-format.md` 和 `../hyperframes-core/references/review-loop.md`                                                                                                                              |
| 任何媒体资产或操作，包括旁白、BGM、SFX、字幕、调色或变换                     | `/media-use`；对于框架播放和放置，还要读取 `/hyperframes-core` → `references/variables-and-media.md`                                                                                                                 |
| 多场景组装                                                                                              | `../hyperframes-core/references/production-loop.md`                                                                                                                                                                                    |
| `flow: companion`，在第一个计划之前                                                                          | `/hyperframes-creative` → `references/story-spine.md` 和 `references/house-style.md`；最近的类型视角以及完整的 `../hyperframes/references/capability-menu.md` —— 天花板处理应基于这些内容设计，而不是凭记忆                                                                                                                              |
| 伴生能力提案、采集、节拍网格、生成式视频、地图、发布或跨工作流能力                     | `../hyperframes/references/capability-menu.md`                                                                                                                                                                                         |
| 存在设计规范，在最终批准之前                                                                       | `/hyperframes-creative` → `references/design-adherence.md`                                                                                                                                                                             |

不要用回忆来替代这些读取操作。只有在实际加载了匹配的参考资料时，渐进式披露才能节省上下文。

## 5. 执行合成

使用以下依赖顺序。仅当某个阶段的输入不存在时，才跳过该阶段。

1. **规划。** 陈述观众弧线、结构、节奏和时长驱动因素。短小的单场景使用一个文件；包含三个或更多明确场景切换，或存在复用场景时，使用子合成。读取 `/hyperframes-creative` → `references/story-spine.md` 以了解叙事弧线，读取 `references/beat-direction.md` 以了解节奏，读取 `/hyperframes-core` → `references/composition-patterns.md` 以了解结构。对于开放式的多场景简报，通过 `/hyperframes-creative` → `references/prompt-expansion.md` 扩展提示词。多场景规划需注明每个场景的形态：适用时使用 `/hyperframes-animation` → `blueprints-index.md` 中的 blueprint id；不适用时，使用其从 `rules-index.md` 组合出的具名规则——动作名称必须来自这些索引，不得自行编造。故事事实决定哪些场景存在；引用用于装点这些场景。多场景规划还需记录为 dispatch artifact：在 `STORYBOARD.md` 中为每个场景设置一个 `## Frame N` 块——包含 `status: outline`、声明的 `src:`、blueprint/rules 引用以及节拍文本——**即使 `storyboard: no` 也是如此**。该块是 dispatch unit；board 只是 review surface。
2. **按要求审查规划。** 对于 `storyboard: yes`，针对这些块运行共享审查循环。对于 `storyboard: no`，无需打开 board，直接继续。当规划暂停无论如何发生时，将子代理委派授权（codex 为第 4 步的 dispatch 所需）纳入该暂停中，而不是稍后再次停止。
3. **解析依赖项。** 在并行工作前安装 registry blocks。准备用户资产，采用现有媒体，并仅解析简报所需的内容。当音频的时间安排决定时长时，尽早启动音频。
4. **构建场景。** 对于短小的单场景作品，先在其最具视觉表现力的时刻实现该场景，再添加运动（如果存在已确认的 wireframe，则它就是该最终状态，不得重新绘制），然后根据其引用的 blueprint 或规则进行动画处理——在编写运动之前，先读取完整的配方正文（`/hyperframes-animation` → `blueprints/<id>.md`、`rules/<id>.md`）。

   **只有达到一定规模时，Dispatch 才能体现价值。** 编写 authoring packets 和预热新的 worker contexts 都会实际消耗分钟数和 tokens：最多约 6 个短场景的影片，在当前上下文中逐个场景以内联方式构建会更快（实测：5 个短场景以内联方式约需 9 分钟，而 packetized 方式约需 21 分钟）。只有当规划超过这一规模时才进行 fan out——场景更多，或单个场景本身较重——并且让每个 worker 负责 **2–3 个场景**，而不是一个场景；同时在**单个 wave 中**启动**所有 workers**（第二个 wave 几乎会使时间窗口翻倍）。进行 dispatch 时：

   `node <SKILL_DIR>/scripts/frame-packets.mjs --project "$PROJECT_DIR" --storyboard "$PROJECT_DIR/STORYBOARD.md"`

   builder 会在 `.hyperframes/frame-packets/` 下为每个场景写入一个有界 packet，其中包含该场景的完整 storyboard block + blueprint body + 所有引用的 rule recipe，并写入 `_role.md`（将 `../hyperframes-core/references/frame-worker-core.md` 与本 skill 的 `sub-agents/frame-worker.md` 逐字拼接——即完整的 worker role）。Dispatch 这些 workers——每个 worker 负责 2–3 个 scene packets，并在单个 wave 中全部启动（`../hyperframes-core/references/subagent-dispatch.md`）；每个 worker 的 prompt 都包含 `_role.md` 及其 packets——可以完整粘贴，也可以先将文件路径交给 worker 读取（两种方式等价）——此外还要包含一个带有 `PROJECT_DIR`、其 `frame_id` 以及画布尺寸的 dispatch context。WAIT，直到每个场景的 `compositions/<frame_id>.html` + `compositions/<frame_id>.motion.json` 都生成。Workers 只能读取各自的 packets 和 design truth file；不得打开 `STORYBOARD.md` 或 skill documents。如果没有 delegation channel，则退回串行方式：在当前上下文中一次处理一个 packet，但仍然只能依据该 packet 工作。

5. **合并运动 sidecar。** 收集各 worker 的 `compositions/<frame_id>.motion.json` 文件，并将其中的时长以及退出/进入向量带入组装流程；如果已安装 doctrine chain（`/motion-doctrine`），则在盖印接缝之前将它们转换到项目账本中。
6. **组装。** 使用制作循环挂载场景、媒体、转场、字幕和音频。真实语音时长优先于估算值。
7. **验证。** 在首次 HTML 处理和结构变更之后，使用 `npx hyperframes lint` 快速获取反馈。最终检查时，运行 `npx hyperframes check`；它会在内部重新运行 lint，因此不要紧接着在它之前重复运行独立的 lint。对于子合成，检查中点快照。对于多场景工作，审阅动画映射。
8. **最终批准。** 仅在检查通过后打开最终 Studio 预览。询问是要渲染还是修改。只有获得批准后才进行渲染。

## 6. 始终适用的关卡

### 保持范围准确

构建用户所要求的内容。标题卡不是标题卡加上三个场景、音乐和字幕。在添加额外内容之前，先提出这些选项。

### 在编写 HTML 之前确定设计

按以下顺序解析设计来源：`frame.md` → `design.md` → `DESIGN.md`。将找到的第一个文件视为品牌事实依据。

当不存在设计规范时，在编写合成 HTML 之前完成以下四项：

1. 以 `house-style.md` 和 `video-composition.md` 为依据确定视觉识别。
2. 为每个非平凡创作写出一句话，说明其概念切入角度。
3. 从 `/hyperframes-creative` → `references/typography.md` 中选择一组可嵌入的字体搭配；不要假定云端渲染中存在未打包的展示字体。
4. 定义焦点元素、边缘锚点、辅助细节和背景处理方式。

让密度匹配所请求的格式和信息。密度示例是对产出画面的指导，不代表可以臆造主张、场景或固定数量的元素。

对于指定的风格或情绪，阅读 `/hyperframes-creative` → `references/visual-styles.md`。当用户需要进行视觉选择且没有合适的已发布预设时，阅读 `/hyperframes-creative` → `references/design-picker.md`，并在那里运行交互式设计选择。

### 保留合成契约

计时元素使用 `class="clip"`；根元素及相关祖先元素都已设置尺寸；每个合成都在 `window.__timelines` 上注册一个暂停且可安全 seek 的时间线；渲染具有确定性。不要使用渲染时网络获取、时钟或未设定种子的随机性。

### 安全地借用工作流

当作品与已发布的工作流相似时，可以将其类型参考作为示例借用。首先运行 `npx hyperframes skills update <workflow-name>`。借用其故事结构和审美取向，而不是其私有脚本、流水线状态或目录契约。通用构建仍由此 skill 负责。

## 7. 完成标准

只有满足以下条件，一次运行才算完成：

- 已实现所请求的范围；
- 对于 `flow: companion`，已交付完整处理方案，而不只是完成范围：每个场景中引用的蓝图或规则都已实现，音频识别已呈现（或已选择静音并明确说明），开场和收尾都经过设计而非使用默认设置；
- `npx hyperframes check` 通过，包括其内置的 lint 阶段；
- 当存在设计规范时，已根据 `/hyperframes-creative` → `references/design-adherence.md` 审查设计遵循情况；
- 对比度问题已解决；
- 在适用时，已检查子合成快照；
- 自主交接中包含已检查的联系表或快照表；多场景表格使用各场景的中点；
- 交接内容在适用时注明最终预览或渲染产物，并报告基于时间的交付物的实际时长；
- 对于多场景工作，已审阅 `hyperframes-animation/scripts/animation-map.mjs`；
- 用户已在渲染前批准最终 Studio 预览；
- 当请求了渲染时，已验证渲染文件。

最终批准后，按照 `../hyperframes-core/references/review-loop.md` § 4，提供一次将此次运行冻结为配方的选项。