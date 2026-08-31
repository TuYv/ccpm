---
name: new-app
description: Workflow for creating new applications from scratch. Covers requirements gathering, tech stack selection, scaffolding, implementation, and delivery of a functional prototype.
when_to_use: When the user asks to create a new application, project, website, game, mobile app, CLI tool, or library from scratch.
---
**目标：**自主实现并交付一个视觉上吸引人、基本完整且功能正常的原型。利用一切可用工具来实现应用程序。你可能会特别发现 `'write_file'`、`'edit'` 和 `'run_shell_command'` 等工具很有用。

1. **了解需求：**分析用户的请求，识别核心功能、期望的用户体验（UX）、视觉美学、应用程序类型/平台（Web、移动端、桌面端、CLI、库、2D 或 3D 游戏），以及明确的约束条件。如果初始规划所需的关键信息缺失或存在歧义，请提出简洁、针对性的澄清问题。根据需要使用 ask_user_question 工具提问、澄清并收集信息。
2. **提出计划：**制定内部开发计划。向用户提供清晰、简洁的高层次概述。该概述必须有效传达应用程序的类型和核心目的、要使用的关键技术、主要功能及用户与其交互的方式，以及视觉设计和用户体验（UX）的总体方案，目标是交付一个美观、现代且精致的产品，尤其适用于基于 UI 的应用程序。对于需要视觉素材的应用程序（例如游戏或丰富的 UI），请简要说明获取或生成占位素材的策略（例如简单的几何图形、程序化生成的图案，或在可行且许可允许的情况下使用开源素材），以确保初始原型在视觉上完整。确保以结构化且易于理解的方式呈现这些信息。
   - 当未指定关键技术时，优先采用以下方案：
   - **网站（前端）：**React（JavaScript/TypeScript）与 Bootstrap CSS，并融入 Material Design 的 UI/UX 原则。
   - **后端 API：**Node.js 与 Express.js（JavaScript/TypeScript），或 Python 与 FastAPI。
   - **全栈：**使用 Bootstrap CSS 和 Material Design 原则的 Next.js（React/Node.js）作为前端，或使用 Python（Django/Flask）作为后端，并搭配使用 Bootstrap CSS 和 Material Design 原则进行样式设计的 React/Vue.js 前端。
   - **CLI：**Python 或 Go。
   - **移动应用：**在需要共享 Android 和 iOS 代码时，使用 Compose Multiplatform（Kotlin Multiplatform）或 Flutter（Dart），并采用 Material Design 库和设计原则。针对单一 Android 或 iOS 平台的原生应用，分别使用遵循 Material Design 原则的 Jetpack Compose（Kotlin JVM）或 SwiftUI（Swift）。
   - **3D 游戏：**HTML/CSS/JavaScript 与 Three.js。
   - **2D 游戏：**HTML/CSS/JavaScript。
3. **用户批准：**获得用户对所提计划的批准。
4. **实现：**使用 `todo_write` 工具将已批准的计划转换为包含具体可执行任务的结构化待办事项列表，然后利用所有可用工具自主实现每项任务。开始时，使用 `run_shell_command` 执行诸如 `npm init`、`npx create-react-app` 等命令，为应用程序搭建基础结构。力求完成全部范围的工作。主动创建或获取必要的占位素材（例如图片、图标、游戏精灵，以及在复杂素材无法生成时使用基本图元创建的 3D 模型），确保应用程序在视觉上协调一致且功能正常，尽量减少对用户提供素材的依赖。如果模型能够生成简单素材（例如统一颜色的方形精灵、简单的 3D 立方体），就应当生成这些素材。否则，应明确说明使用了哪种占位素材，以及如确有必要，用户可以替换成什么。仅在推进工作不可或缺时使用占位素材，并计划在润色阶段将其替换为更精细的素材，或指导用户进行替换。
5. **验证：**根据原始请求和已批准的计划检查工作。修复错误、偏差，以及所有可行的占位素材；或者确保占位素材在原型中具有足够的视觉质量。确认样式和交互效果，打造高质量、功能正常且美观的原型，使其符合设计目标。最后，也是最重要的一点，构建应用程序并确保不存在编译错误。
6. **征求反馈：**如果仍然适用，请提供启动应用程序的说明，并征求用户对原型的反馈。