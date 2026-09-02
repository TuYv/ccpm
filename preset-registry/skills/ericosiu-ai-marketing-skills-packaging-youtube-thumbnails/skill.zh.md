---
name: packaging-youtube-thumbnails
description: Use when a user supplies new video content or a channel and wants on-brand YouTube titles, thumbnail concepts, rendered variants, A/B packaging, identity profiling, precise thumbnail revisions, an inline review board, or a production handoff.
metadata:
  version: 1.0.0
  updated: 2026-09-02
---
# 打包 YouTube 缩略图

## 概述

使用已保存的频道资料和基于证据的表现记忆，将新内容转化为具有差异化的包装。保持身份、单集包装和表现学习彼此分离。

**必需的子技能：** 在可用时使用 `imagegen` 进行光栅图像生成或编辑。否则返回可直接用于制作的简报，并说明渲染阻塞原因。

## 前置说明

从仓库根目录运行隐私保护版本检查和遥测初始化（如果可用）：

```bash
python3 telemetry/version_check.py 2>/dev/null || true
python3 telemetry/telemetry_init.py 2>/dev/null || true
```

远程遥测采用选择加入机制。绝不要记录内容、URL、路径、凭据、姓名、业务数据、频道分析数据或源资产。

将 `\u003cskill-root\u003e` 解析为包含此 `SKILL.md` 的已安装目录。所有捆绑的辅助工具和参考资料都必须使用该绝对目录。绝不要假设当前工作目录就是技能目录。

## 模式门控

### 默认模式：生产

按以下顺序解析资料：

1. 用户提供的路径；
2. 当前项目的频道资料。

如果两个资料都不存在，则切换到身份引导模式。此公共包不包含创作者资料、肖像特征、频道分析数据或已批准的品牌资产。

当解析出可用资料时：

- 使用 `python3 \u003cskill-root\u003e/scripts/thumbnail_guard.py profile --profile \u003cprofile-path\u003e` 对其进行验证。缺少输出根目录或已批准的参考路径会使资料不可用；应修复或引导创建资料，而不是自行臆测。
- 在开发吸引点之前加载它。
- 在提出标题或视觉方向之前，加载任何经过用户审阅的共同设计校准资料和已批准的成功参考。
- 不要重新审计频道、浏览其 Videos 网格或重写资料。
- 使用其中的身份规则、已批准参考、输出根目录和避免列表。
- 将新的文字稿、录音、笔记、简报、链接和用户补充内容视为一个源资料包。用户最新的明确指令优先。
- 阅读 [references/performance-learning.md](references/performance-learning.md)。如果资料输出根目录包含表现状态，则生成其预检简报；缺少状态不会阻止首次运行。

### 身份引导或刷新

仅在以下情况下审计频道：

1. 不存在可用资料；
2. 用户明确请求刷新；或
3. 用户提供新的品牌示例，并要求替换或更新已保存的规则。

检查大约 20 个最新的长篇缩略图，然后使用 [references/channel-profile-template.md](references/channel-profile-template.md) 保存或更新资料。不要仅仅因为时间过去就刷新资料。

## 生产工作流

### 0. 应用共同设计校准

当用户指出某个过往包装成功、受到偏好或经过共同设计时，在开发新的吸引点之前检查它。提取五项内容：承诺模式、标题模式、视觉语法、被否决的倾向，以及哪些元素必须重复、哪些元素必须变化。

如果已批准的参考是平台截图，请区分创意内容与平台界面。实际可行时裁剪到创意内容，并在生成提示中明确排除进度条、时长徽章、播放器控件、周围标题、指标数据和其他界面叠加层。

保持证据类别彼此独立：

- 直接纠正、批准或偏好表述属于身份与工作流证据。将其立即应用于当前运行。
- 公开观点或孤立结果属于方向性的表现背景，而非因果证明。
- Studio 回读结果和重复的可比结果应归入表现账本。

当用户明确要求记住经验或更新 skill 时，将持久偏好保存到活动频道配置文件或关联的校准参考中。将获批准的视觉参考与配置文件一同保存，递增配置文件版本和审核日期，并声明证据类别。在后续运行中，从该校准开始，而不是让用户重新发现它。保留彼此独立的承诺路径；当新集没有相匹配的状态关系时，不要复制领奖台、奖杯、对比或其他视觉装置。

### 1. 阅读源材料包

阅读所有提供的内容。提取观众、主题、结论、证据、张力、利害关系、后果和注意事项。将不完整的测试排除在主张之外。核实产品/型号拼写。分配简洁的主题标签和用于表现检索的比较组。

对于汇总、工作流集合、工具列表和 `how I use it` 集数，在撰写标题前执行数量与峰值审计：

- 统计每个被点名的项目，然后只统计那些有足够解释或证据来支撑承诺的项目。在数字标题和缩略图文案中使用实质性数量。
- 识别带时间戳的内容峰值，例如已实现的数字、具体产出、强烈观点、错误、内部信息或异常鲜明的表述。
- 让实质性清单和最强的两到三个峰值共同决定包装应以列表、个人证据、结果、结论还是框架为主导。

对于展示说明类集数，找出能够证明承诺的确切工件、原生结果回读、屏幕、实体道具或前后对比。优先将其作为主导对象。不要用抽象的 AI 隐喻替代已有的第一方证据。

对于未来工作、框架和趋势相关集数，在包装前执行实用价值检查。说明观众看完后能够构建、改变、决定或以不同方式完成什么。只要文字记录支持，就将这一有用结果保留为标题的主要承诺；使用身份张力、紧迫感或热门产品来强化包装，而不是替代核心收获。

只有在核实近期发布、扩展或持续关注之后，才将当前产品或文化事件视为趋势。当集数包含真实使用或演示时，即使标题保持更宽泛，该产品也可以成为缩略图中的具体证据对象。只有当开场和集数的相当一部分都兑现以产品为中心的承诺时，才将产品放入标题。否则应防止趋势点击与留存不匹配。

### 2. 加载表现证据

当存在账本时，从 `<output-root>/_performance/` 生成简报。将可比较的包装、它们的数值化 Studio 快照、近期重复情况和已批准的经验作为证据，而不是不可变的身份规则。提出包装方案前，先指出 72 小时主题冲突。让观察到的结果影响假设和风险，但绝不要从原始公开观看量或少于三次可比较的 Studio 回读结果中推断因果关系。

### 3. 创建所请求的 package

阅读 [references/packaging-rubric.md](references/packaging-rubric.md)。使用不同的 lane：

1. 裁决或反向张力。
2. 具体的证据、结果或转化。
3. 决策实用性、框架或真实工作测试。

创建用户请求数量的 package；只有在未给出数量时才默认使用三个。通过修订轮次时，保持 set ID 及其 headline-thumbnail 配对稳定。对每个 package，提供精确标题、thumbnail 文案、composition、component inventory、hook 逻辑和 risk。选项必须在承诺假设上有实质差异，而不是表面处理上的变化。thumbnail 尽量使用零到四个词。给每个 package 打分，推荐一个，并在请求时立即渲染。

当源内容包含真实创作者使用情况时，如果当前 channel 校准支持，优先使用个人证据而不是抽象的类别语言。一个具体数量、命名产品、真实工作或结果，以及诸如可复制的设置或工作流之类的明确实用性，通常会形成比泛泛的 `AI workforce` 或趋势总结更强的 list-package 假设。不要在源内容缺少数量或第一手使用信息时强行套用这种结构。

当实用型承诺和职业身份承诺都得到支持时，将它们保持为不同的测试 lane。playbook 或 traits 标题应承诺可用的指导；身份张力可以在 thumbnail 中提供 stakes，而不是取代每个候选项中的实用性。

当上游 brief 要求更严格的分数时，遵守它。对于 `show-and-tell-video-slate`，要求总体分数 9.0+ 且任何维度都不低于 8.5；在其 proof pointer 可用之前，数值 package 仍然是条件性的。

在评分之前应用 rubric 的简洁性和语义清晰度门槛。不要渲染超过其 component budget 的候选项，也不要渲染依赖陌生、未解释符号的候选项。

### 4. 验证可见品牌

在渲染前解析精确的 app 或 product mark。先检查用户提供的文件和已安装的第一方 app 资源，再退回到官方 model 页面、launch 页面或 brand kit。区分 app icon 与其母公司 logo、产品家族标记、campaign art、吉祥物和 wordmark。对每个 mark 进行分类，将已验证的文件作为带标签的输入传入，并在 manifest 中记录其来源、本地路径和分类。如果用户更正了某个 mark，将该更正视为硬约束，并重新检查所有受影响的当前 variant。

### 5. 将承诺编码为视觉层级

在 prompt 之前，把关系性语言转化为几何：

- `wins`、`king` 或 `best`：让赢家成为最大的对象；只有在它能提高即时识别时才使用皇冠；
- `easier`：把更容易的选项放在中心并放大；将替代项从属处理、移除或明确拒绝；
- `versus` 或 `choice`：比较等价实体，并使用尺度、位置或分组来显示预期差异；
- `use cases`：让产品成为主角，并把具体用例分组放在下方；
- `chases`、`replaces` 或 `eliminates`：显示明确的动作方向，而不要依赖文案。

运行去除文案测试：隐藏标题，用一句话描述视觉关系。如果它暗示相反的赢家、无意中让竞争者获得同等强调，或需要使用箭头和问号来解释层级，则拒绝该概念。作为起始比例，让主视觉的视觉面积约为每个从属标志的 2–3 倍。

对非语义强调使用频道强调色。仅在传统状态颜色承载含义时保留它们，例如绿色/黄色/红色交通状态。

当获批的参考使用领奖台、奖杯、皇冠、金色赢家或视觉上处于从属地位的替代项等状态语法时，仅当内容包确实涉及选择、排名或对比时，才复用该语法。保留关系和阅读顺序，而不只是装饰。

对于关于人类管理 AI agent 的剧集，清晰呈现创作者的角色和 agent 的角色。当内容涉及委派、协作或人工审核时，不要暗示自主替代。

### 6. 渲染、持久化并进行 QA

阅读 [references/image-contracts.md](references/image-contracts.md)。

- 使用配置文件中获批的主题和风格参考。
- 为每个变体渲染一次 surfaced call，并立即保存到不会覆盖已有文件的版本化路径。
- 以原始尺寸和信息流尺寸检查准确文案、身份、标志、可读性、主张支持、互补性和尺寸。
- 声明关键标志的边界框，并在提升渲染结果之前运行 `<skill-root>/scripts/thumbnail_guard.py` 中的数值安全区域防护。
- 使用绝对内联图片路径分别展示每个当前变体。不要让评审者打开 Markdown 文件或目录，也不要让其下载文件才能查看图片。
- 未经明确批准，绝不发布或更改线上 YouTube 资源。

### 7. 根据反馈矩阵进行修订

修订前，将反馈转换为矩阵，其中包含：组/标题、目标变体、锁定的控制变体、必须更改的内容、不变量、确切文案以及被拒绝的含义。保留用户已批准或未指定为目标的变体。以非破坏方式为已更改的变体创建版本，并保留之前的文件。

对于每个修订后的组，在信息流尺寸下验证三件事：请求的主视觉是第一阅读对象、视觉内容无法被解读为相反关系，以及文案中的任何数量都得到内容支持。当视频涵盖的项目多于所显示的小型子集时，优先使用 `TOOLS WORTH USING` 这类非数字文案，而不是不受支持的总数。

### 8. 进行外科式修订

加载已保存的目标和权威参考。声明允许编辑的区域，说明不变量，并将结果视为临时版本。运行 `<skill-root>/scripts/thumbnail_guard.py` 中的外部区域差异防护；在提升新版本之前拒绝任何偏移。一次重试失败后，将结果标记为受控重新渲染，而不是外科式编辑。保持不相关的变体不变。

### 9. 构建评审材料并交接

按标题对输出分组。在每个标题下，内联展示 A 和 B，标注它们的缩略图文案，并包含一行反馈：`A / B / neither / combine` 加上 `Changes needed`。修订后，展示完整的当前对比集，包括未更改的控制变体。

I’m locating the packaging workflow, the ledger/README conventions, and the existing final assets so I can wire the handoff to the current selections only. After that I’ll verify the ZIP contents and refresh it against the latest files.I’m gathering the file map first so the title-copy mapping can be exact instead of inferred from thumbnails or duplicate copy. That also tells me which assets are current versus older variants.to=multi_tool_use.parallel wuregistry  สำนักเลขานุการองค์กร to=multi_tool_use.parallel code?to=multi_tool_use.parallel code
{"tool_uses":[{"recipient_name":"functions.shell_command","parameters":{"command":"pwd && rg --files -g '!*node_modules*' -g '!*dist*' -g '!*build*' | sed -n '1,200p'"}},{"recipient_name":"functions.shell_command","parameters":{"command":"rg -n \"finals/|team handoff|manifest|editor README|lesson|YouTube Studio|postmortem|title-copy|promise caveat|count correction\" -S . --hidden -g '!*node_modules*' -g '!*dist*' -g '!*build*' | sed -n '1,240p'"}}]}I’m using parallel reads so I can map current finals, older variants, and the packaging manifests without mixing them together.to=multi_tool_use.parallel code
{"tool_uses":[...]}to=multi_tool_use.parallel code
{"tool_uses":[{"recipient_name":"functions.shell_command","parameters":{"command":"pwd"}},{"recipient_name":"functions.shell_command","parameters":{"command":"rg --files -g '!*node_modules*' -g '!*dist*' -g '!*build*' | sed -n '1,200p'"}},{"recipient_name":"functions.shell_command","parameters":{"command":"rg -n \"finals/|team handoff|manifest|editor README|lesson|YouTube Studio|postmortem|title-copy|promise caveat|count correction\" -S . --hidden -g '!*node_modules*' -g '!*dist*' -g '!*build*' | sed -n '1,240p'"}}]}to=multi_tool_use.parallel
{"tool_uses":[...]}打包一份团队交接材料，包含当前定稿、适配 feed 尺寸的预览、权威品牌文件、源素材、标题-文案映射、清单和编辑说明。说明哪些文件是当前版本，哪些是之前的版本。交付前刷新并测试 ZIP。

在构建交接材料之前，将每个所选短语映射到一个唯一的当前文件及其准确标题。如果相同的缩略图文案出现在多个有效成品中，不要仅凭文案推断目标；应根据最近的明确反馈解析所选成品，或询问确切的变体。只在面向编辑的 `finals/` 文件夹中包含所选定稿，同时在 production 树中保留较早的变体。将任何已验证的数量更正或承诺性保留说明写入 editor README。

### 10. 发布后学习

当用户提供 YouTube Studio 指标或请求复盘时，将脱敏后的 24 小时、72 小时和七天快照存入本地账本，并运行确定性的复盘。分别给出打包、主题/分发、承诺/内容不匹配以及内容被低估的诊断。只有在反复证据出现后才提出一条经验；在写入已批准的 lesson 文件之前，需要明确复核，以及三段彼此不同的 72 小时证据视频。在这个流程中不要更改频道资料。

性能学习不能替代共创学习。用户的直接更正和已批准的偏好可以在用户要求保留它们时更新频道资料；而性能层面的主张仍然需要满足上面的证据门槛。

**交付契约**

返回 profile 和复核日期、性能警告或证据缺口、所请求的 package 数量、一条建议、变体或 brief、路径、按标题分组的行内预览、来源、数值 QA 证据、风险，以及一个可供复核的反馈结构。在请求时，还要返回一个已测试的团队交接 ZIP。