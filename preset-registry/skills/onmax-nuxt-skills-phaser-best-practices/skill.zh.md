---
name: phaser-best-practices
description: Builds and refactors Phaser 3 browser games. Use for creating a new Phaser project, adding scenes, entities, physics, UI, tilemaps, animations, input, audio, camera, or for fixing Phaser-specific bugs and performance problems.
compatibility: Intended for Phaser 3 JavaScript or TypeScript projects. New-project scaffolding assumes Node.js/npm or an existing browser bundler.
metadata:
  phaser-major: "3"
  skill-type: "framework"
---
# 构建 Phaser 游戏

## 何时使用此技能

当用户希望执行以下操作时，请使用此技能：

- 创建新的 Phaser 3 游戏或原型
- 添加或重构场景、实体、UI、物理系统、瓦片地图、输入、音频或摄像机
- 调试 Phaser 特有的行为，例如场景重启、像素画模糊、碰撞器错误、资源加载问题或动画问题
- 改进 Phaser 项目的架构、可维护性或运行时性能

除非用户明确希望将 Phaser 风格的模式适配到其他地方，否则不要将此技能用于非 Phaser 引擎。

## 如何操作

### 1. 对请求进行分类

在编写代码之前，先对任务进行分类：

- **新项目**：脚手架、文件夹布局、游戏配置、初始场景
- **功能开发**：添加玩法、UI、音频、转场、瓦片地图、敌人、可拾取物
- **错误修复**：定位场景生命周期、资源、物理、输入、摄像机或渲染故障
- **优化**：分析性能瓶颈、对象池、剔除、节流、资源策略
- **美术 / 资源管线**：精灵图尺寸测量、动画设置、九切片 / 三切片 UI、瓦片地图集成

### 2. 先检查，再决定

如果代码仓库已经存在，请先进行检查，再提出结构变更建议：

- package.json、打包工具配置、tsconfig/jsconfig
- Phaser 版本，以及代码库使用的是 JS 还是 TS
- 游戏启动代码、场景列表、物理配置、缩放配置
- 资源文件夹和命名约定
- 当前的状态共享方式（场景数据、注册表、服务、全局变量）
- 项目使用的是像素画、高清美术、桌面端优先、移动端优先，还是混合输入

优先适配现有代码库，而不是用样板代码替换它。

### 3. 默认技术选型

除非任务明确要求其他方案，否则使用以下默认选项：

- 对于新项目，优先采用官方的 **Vite + TypeScript** 风格配置
- 对于平台游戏、射击游戏、俯视角动作游戏、简单的可拾取物和轻量级碰撞逻辑，优先使用 **Arcade Physics**
- 仅当游戏需要旋转驱动的碰撞、复合刚体、约束、稳定堆叠或更真实的模拟时，才使用 **Matter Physics**
- 首先围绕**场景**组织代码，然后在场景内部组织实体 / 系统
- 输入应**由场景负责**；实体应使用输入状态，而不是自行附加监听器
- 当多个精灵共享相同的动画数据时，使用**全局动画**
- 预先加载对**启动至关重要**的资源；如果有助于缩短启动时间，则稍后再加载关卡特定资源
- 当纹理布局支持时，对可缩放 UI 美术使用内置的 **NineSlice / ThreeSlice**；仅当透明边距或不连续的美术内容导致内置切片失效时，才回退到自定义合成
- 对大多数游戏使用 **FIT** 缩放，对类似编辑器或 UI 密集型布局使用 **RESIZE**，仅在手动控制画布尺寸时使用 **NONE**
- 对于像素画，请启用 **pixelArt** 模式，尽可能采用整数缩放，并避免摄像机进行亚像素移动

### 4. 输出要求

对于**新游戏**，请提供：

- 推荐的文件夹结构
- 游戏配置
- 场景列表及其职责
- 可运行的入门代码
- 关于每项架构选择为何适合所请求游戏类型的说明

对于**功能开发或错误修复**，请提供：

- 最小化的针对性修改
- 根本原因说明
- 补丁
- 用户可立即执行的验证步骤

对于**架构建议**，请提供：

- 能解决当前问题的最小结构
- 一条推荐路径，而不是一组权重相同的选项
- 当选择至关重要时，明确说明权衡取舍（例如 Arcade 与 Matter 的对比）

## 不可妥协的实现规则

- 尊重项目现有的 JS 或 TS 选择，除非用户要求迁移
- 集中管理场景键、资源键、碰撞类别和平衡性常量
- 让 `update()` 专注于流程协调；将具体逻辑放入实体或系统中
- 当你添加监听器、计时器、补间动画或长期引用时，为场景关闭 / 销毁注册清理逻辑
- 避免在高频 `update()` 循环中创建新对象，除非性能分析证明这样做没有影响
- 不要默认让每个对象都具备交互能力或启用物理系统
- 不要假设精灵图集的帧尺寸；应检查并验证
- 当 Arcade 已经可以简洁地解决问题时，不要让用户使用 Matter
- 不要仅仅因为方便，就把整个游戏的资源都放到一个 Boot 场景中预加载

## 推荐的交付工作流

### 新建 Phaser 项目

1. 选择架构规模：
   - **小型 / Game Jam 游戏**：2-4 个场景，轻量级服务模块
   - **中型游戏**：场景 + 实体 + 系统 + 常量
   - **大型内容密集型游戏**：数据驱动的内容、场景服务、专用状态层
2. 定义基础配置：渲染器、缩放模式、物理系统、像素艺术设置
3. 先创建启动场景：Boot、Menu、Game、UI；仅在需要时添加 Pause / GameOver
4. 添加一个能够证明核心循环正常工作的垂直切片
5. 接着添加由需求驱动的系统：音频、可保存状态、敌人生成、瓦片地图、UI 优化

### 添加或重构功能

1. 找到负责该功能的场景和受影响的系统
2. 确定最小且正确的插入点
3. 复用现有的辅助工具、常量、管理器和对象池
4. 在修改中加入清理逻辑和验证步骤
5. 确保场景可安全重启

### 调试

1. 根据代码和配置复现问题
2. 确定问题是否属于：
   - 生命周期 / 重启
   - 资源尺寸或加载器配置
   - 物理体设置或碰撞器顺序
   - 缩放 / 摄像机 / 像素取整
   - 失效的监听器、计时器或对象池状态
3. 修复根本原因，而不仅仅是症状
4. 提供快速复现步骤或验证清单

## 参考资料索引

仅阅读与任务相关的文件：

- **设置 / 引导启动 / 配置**：[references/setup-and-build.md](references/setup-and-build.md)
- **场景 / 共享状态 / 架构**：[references/scenes-state-architecture.md](references/scenes-state-architecture.md)
- **物理系统 / 实体 / 对象池**：[references/physics-and-entities.md](references/physics-and-entities.md)
- **资源 / 动画 / UI 面板**：[references/assets-animation-ui.md](references/assets-animation-ui.md)
- **瓦片地图 / 摄像机 / 输入 / 音频**：[references/tilemaps-camera-input-audio.md](references/tilemaps-camera-input-audio.md)
- **性能 / 调试 / 清理**：[references/performance-debugging.md](references/performance-debugging.md)
- **代码审查 / 架构检查清单**：[references/review-checklist.md](references/review-checklist.md)

## 具体示例

### 示例：“创建一个 Phaser 俯视角射击游戏”

使用此技能。默认采用：

- Vite + TypeScript 结构
- Arcade Physics
- Boot、Menu、Game、UI 场景
- 由场景管理的输入映射
- 池化子弹
- 全局动画
- 摄像机跟随和世界边界
- 在常量中定义资源键 / 场景键

然后提供可运行的起始代码以及首个可玩的游戏循环。

### 示例：“我的像素画在移动端看起来很模糊”

使用此技能。检查：

- `pixelArt` 和 `roundPixels` 设置
- 摄像机跟随取整
- 缩放模式和缩放策略
- 画布容器周围的 CSS
- 美术资源是否进行了非整数倍缩放

然后仅修改必要的最少配置和摄像机设置。

### 示例：“纸张风格的 UI 面板出现了奇怪的侧边条”

使用此技能。先检查源纹理。然后：

- 如果美术资源确实采用三切片或九切片布局，尝试使用内置的 ThreeSlice / NineSlice
- 如果帧包含大量透明内边距或不连续的美术内容，则使用裁剪或合成的备用切片
- 记录测得的帧尺寸、间距、边距以及所使用的任何重叠值

## 常见陷阱

除非用户明确要求，否则请避免以下做法：

- 使用一个巨大的 `GameScene` 同时管理菜单、HUD、游戏玩法、暂停和转场
- 将状态存储在 `window`、随意的模块级全局变量或临时拼凑的单例集合中
- 由实体自行管理键盘监听器
- 因忘记在关闭时清理而导致的场景重启错误
- 在第一个场景中加载所有未来才会使用的资源
- 在内置 NineSlice 已适用于该资源时，仍手动组合九切片
- 对只需要少量实体类的小游戏过度设计并使用 ECS

## 回复前的最终检查

确保答案：

- 符合用户要求的游戏类型、平台和美术风格
- 使用 Phaser 3 API，而不是 Phaser 4 RC API
- 有意识地选择物理系统
- 保持 SKILL.md 层级的建议简洁，并将详细内容移至参考资料
- 在生成代码时包含验证步骤