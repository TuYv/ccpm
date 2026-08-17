---
name: bevy-help
display_name: Bevy Help
short_description: Bevy APIs, examples, and implementation patterns
default_prompt: "Use ${BEVY_HELP_COMMAND} for any Bevy-related question, including API lookup, feature design, architecture, or implementation patterns."
allow_implicit_invocation: false
description: |
  Look up current Bevy engine APIs, crates, examples, and patterns. Use for any Bevy-related question, including API lookup, feature design, architecture, and implementation patterns.
---
# Bevy 帮助

对于任何与 Bevy 相关的问题，都应使用此技能，而不只是精确的符号查询。对于 Bevy API 问题、功能设计、架构和实现模式类问题（例如“如何添加雪花粒子？”），它都应作为默认工具。本地文档缓存包含许多示例，这些示例通常能提供最值得借鉴的模式。回答应聚焦于调用者的问题。

单版本策略：

- 支持此技能本地文档缓存中安装的 Bevy 版本。
- 当仓库升级 Bevy 时，将此技能更新到新版本并重新发布。
- 除非调用者明确询问迁移问题，否则不要提供旧版本兼容性指导。
- 如果无法确定项目使用的某一个当前 Bevy 版本，或者项目明确以不同于已安装文档的版本为目标，请停止并询问，而不要混合使用多个版本的来源。

此技能假定本地文档缓存已经安装。不要尝试在此技能内部安装、刷新或重新指定其目标版本。

必需的本地路径：

- `${BEVY_HELP_SKILL_DIR}/docs/rustdoc/`
- `${BEVY_HELP_SKILL_DIR}/docs/bevy/`
- `${BEVY_HELP_SKILL_DIR}/docs/bevy-website/`

如果任何必需路径缺失或不可读，请停止并报错，同时说明本地 `bevy-help` 文档缓存不可用。

从 `${BEVY_HELP_SKILL_DIR}/docs/bevy/` 确定已安装文档的版本，然后将其与目标项目在 `Cargo.toml`、工作区清单以及存在时的 `Cargo.lock` 中声明的 Bevy 依赖项进行比较。

如果项目尚不是 Cargo 包或工作区，或者仍然无法精确确定 Bevy 版本，请停止并询问应以哪个版本为目标。

查找顺序：

1. `${BEVY_HELP_SKILL_DIR}/docs/rustdoc/`
2. `${BEVY_HELP_SKILL_DIR}/docs/bevy/`，以及已安装版本对应的 `examples/`
3. `${BEVY_HELP_SKILL_DIR}/docs/bevy-website/` 中针对当前版本的 Learn 内容
4. 此技能中的少量本地注释（如果有）
5. 仅当调用者明确要求或本地资料栈不可用时，才回退到 Web

仅使用所需的最少来源：

- 精确的 API 或符号名称：首先查阅 rustdoc；如果实现细节很重要，再查看源代码
- “如何实现 X？”：首先查看示例，然后通过 rustdoc 确认准确的名称和签名
- 功能设计或架构问题：首先查看示例，然后查看 Learn 内容，最后通过 rustdoc 确认所推荐的确切类型和签名
- 建议或最佳实践：先查看示例，再查看 rustdoc，最后查看 Learn 内容
- 行为、警告或“Bevy 为什么这样做？”：首先查看 crate 源代码；如果需要了解公开接口，再查看 rustdoc
- 迁移问题：仅当调用者请求迁移帮助时，才比较新旧 API

问题类型启发式规则：

- 模式或架构问题 -> 首先查看示例
- 警告、传播、自动插入的行为，或层级结构/调试问题 -> 首先查看 crate 源代码
- 精确的符号、trait 约束或签名问题 -> 首先查看 rustdoc

Bevy 特有的来源陷阱：

- 如果某种行为看起来是自动发生的，请在 crate 源代码中检查组件属性，例如 `#[require(...)]` 和 `#[component(on_insert = ...)]`。
- rustdoc 最适合查询公开名称和签名，但它通常不会展示某种行为发生的内部原因。
- Learn 内容仅供指导。如果它与当前检出版本的示例或 crate 源代码不一致，请以示例和源代码为准。

常见入口：

- 应用设置：`App`、`Plugin`、调度、状态、运行器、`DefaultPlugins`
- ECS：`Commands`、`Component`、`Bundle`、`Query`、资源、消息/事件/观察器、运行条件
- 资源和场景：`AssetServer`、句柄、`Assets<T>`、场景加载和生成类型
- 相机和渲染：相机设置、渲染层、清除颜色、光照示例
- UI：`bevy_ui` 节点、文本、按钮、图像、布局和交互类型
- 空间设置：`Transform`、`GlobalTransform`、层级辅助工具、2D 与 3D 相机模式

回答时：

- 直接从具体答案开始，不要先写版本相关的套话。
- 指明你查阅的确切文件或页面。
- 将文档事实与推断分开。
- 仅在功能门控或 crate 边界会影响答案时才提及它们。
- 如果提供代码，只使用你已在当前来源中验证过的符号。
- 如果编译器输出或运行时行为与本地文档不一致，应指出可能存在版本不匹配或本地缓存过期，而不是猜测。

每次成功查找后的强制操作：

- 返回前，向 `./.bevy-help.log` 追加一条简短记录。如果文件不存在，则创建该文件；始终追加，不要替换现有记录。
- 仅记录：
  - `requested`：调用方提出的请求
  - `comment`：关于模式、建议或解决方案的简短说明
  - `result_files`：所用文档/示例的链接或具体文件路径
- 不要将完整答案、长篇摘录或大型代码块粘贴到日志中。每条记录都应足够简短，以便之后汇编 FAQ 时快速浏览。

不要转储完整的 rustdoc 页面，也不要枚举大型目录。