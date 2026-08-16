---
name: animate
description: Review a feature and enhance it with purposeful animations, micro-interactions, and motion effects that improve usability and delight. Use when the user mentions adding animation, transitions, micro-interactions, motion design, hover effects, or making the UI feel more alive.
version: 2.1.1
user-invocable: false
argument-hint: "[target]"
---
分析某项功能，并有策略地添加动画和微交互，以增强理解、提供反馈并创造愉悦体验。

## 强制准备工作

调用 /impeccable——其中包含设计原则、反模式和 **Context Gathering Protocol**。在继续之前遵循该协议——如果尚不存在设计上下文，则必须先运行 /impeccable teach。此外，还需收集：性能约束。

---

## 评估动画机会

分析哪些地方可以通过动效改善体验：

1. **识别静态区域**：
   - **缺少反馈**：操作后没有视觉确认（按钮点击、表单提交等）
   - **突兀的过渡**：即时状态变化显得生硬（显示/隐藏、页面加载、路由切换）
   - **关系不明确**：空间关系或层级关系不直观
   - **缺乏愉悦感**：交互具备功能性，但缺少趣味
   - **错失引导机会**：本可用于引导注意力或解释行为的机会

2. **了解上下文**：
   - 产品是什么样的个性？（活泼还是严肃，充满活力还是沉稳）
   - 性能预算是多少？（移动端优先？复杂页面？）
   - 受众是谁？（对动效敏感的用户？追求速度的高级用户？）
   - 什么最重要？（一个主视觉动画，还是多个微交互？）

如果代码库中无法明确其中任何一点，请停止并调用 AskUserQuestion 工具进行确认。

**关键要求**：尊重 `prefers-reduced-motion`。始终为有需要的用户提供无动画替代方案。

## 规划动画策略

制定目标明确的动画计划：

- **主视觉时刻**：唯一的标志性动画是什么？（页面加载？主视觉区域？关键交互？）
- **反馈层**：哪些交互需要得到确认反馈？
- **过渡层**：哪些状态变化需要更平滑？
- **愉悦层**：可以在哪里带来惊喜和愉悦？

**重要提示**：一个精心编排的完整体验，胜过散布在各处的动画。专注于影响力较大的时刻。

## 实现动画

在以下类别中系统地添加动效：

### 入场动画
- **页面加载编排**：交错显示元素（延迟 100-150ms），结合淡入和滑入效果
- **主视觉区域**：为主要内容设计具有戏剧性的入场效果（缩放、视差或创意效果）
- **内容显示**：使用 intersection observer 实现滚动触发动画
- **模态框/抽屉入场**：平滑滑入并淡入、背景遮罩淡入、焦点管理

### 微交互
- **按钮反馈**：
  - 悬停：轻微缩放（1.02-1.05）、颜色变化、阴影增强
  - 点击：快速缩小后恢复（0.95 → 1）、涟漪效果
  - 加载：加载指示器或脉冲状态
- **表单交互**：
  - 输入框聚焦：边框颜色过渡、轻微缩放或发光
  - 验证：出错时抖动、成功时显示对勾、平滑的颜色过渡
- **切换开关**：平滑滑动并进行颜色过渡（200-300ms）
- **复选框/单选按钮**：对勾动画、涟漪效果
- **点赞/收藏**：缩放并旋转、粒子效果、颜色过渡

### 状态过渡
- **显示/隐藏**：淡入淡出 + 滑动（而非瞬间切换），时长适当（200-300ms）
- **展开/折叠**：高度过渡并处理溢出，图标旋转
- **加载状态**：骨架屏淡入淡出、加载指示器动画、进度条
- **成功/错误**：颜色过渡、图标动画、轻柔的缩放脉冲效果
- **启用/禁用**：不透明度过渡、光标变化

### 导航与流程
- **页面过渡**：路由之间交叉淡入淡出、共享元素过渡
- **标签页切换**：指示器滑动、内容淡入淡出/滑动
- **轮播图/滑块**：平滑变换、吸附点、惯性效果
- **滚动效果**：视差图层、状态随滚动变化的粘性页眉、滚动进度指示器

### 反馈与引导
- **悬停提示**：工具提示淡入、光标变化、元素高亮
- **拖放**：浮起效果（阴影 + 缩放）、放置区域高亮、平滑重新定位
- **复制/粘贴**：粘贴时短暂高亮闪烁、“已复制”确认
- **焦点流转**：高亮显示表单或工作流程中的操作路径

### 愉悦时刻
- **空状态**：插图上的细微漂浮动画
- **操作完成**：彩纸礼花、对勾花饰动画、成功庆祝效果
- **彩蛋**：供用户探索发现的隐藏交互
- **情境动画**：天气效果、时段主题、季节性点缀

## 技术实现

为每种动画使用适当的技术：

### 时长与缓动

**按用途划分的时长：**
- **100-150ms**：即时反馈（按钮按下、开关切换）
- **200-300ms**：状态变化（悬停、菜单打开）
- **300-500ms**：布局变化（手风琴、模态框）
- **500-800ms**：入场动画（页面加载）

**缓动曲线（使用以下曲线，而非 CSS 默认值）：**
```css
/* Recommended - natural deceleration */
--ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);    /* Smooth, refined */
--ease-out-quint: cubic-bezier(0.22, 1, 0.36, 1);   /* Slightly snappier */
--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);     /* Confident, decisive */

/* AVOID - feel dated and tacky */
/* bounce: cubic-bezier(0.34, 1.56, 0.64, 1); */
/* elastic: cubic-bezier(0.68, -0.6, 0.32, 1.6); */
```

**退出动画应快于进入动画。** 使用进入动画时长的约 75%。

### CSS 动画
```css
/* Prefer for simple, declarative animations */
- transitions for state changes
- @keyframes for complex sequences
- transform + opacity only (GPU-accelerated)
```

### JavaScript 动画
```javascript
/* Use for complex, interactive animations */
- Web Animations API for programmatic control
- Framer Motion for React
- GSAP for complex sequences
```

### 性能
- **GPU 加速**：使用 `transform` 和 `opacity`，避免使用布局属性
- **will-change**：仅为已知开销较大的动画谨慎添加
- **减少绘制**：尽量减少重绘，并在适当的位置使用 `contain`
- **监控 FPS**：确保在目标设备上达到 60fps

### 无障碍
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**绝不要**：
- 使用回弹或弹性缓动曲线——它们显得过时，还会让用户的注意力集中到动画本身
- 为布局属性（width、height、top、left）添加动画——应改用 transform
- 为反馈动画使用超过 500ms 的持续时间——这会让人感觉迟钝
- 使用没有目的的动画——每个动画都需要有明确的理由
- 忽略 `prefers-reduced-motion`——这违反无障碍要求
- 让所有元素都动起来——动画疲劳会使界面令人疲惫
- 在动画期间阻止交互，除非这是有意为之

## 验证质量

全面测试动画：

- **以 60fps 流畅运行**：在目标设备上没有卡顿
- **感觉自然**：缓动曲线自然流畅，而非机械生硬
- **时长恰当**：既不会太快（突兀），也不会太慢（迟钝）
- **减少动态效果正常生效**：动画被适当地禁用或简化
- **不会阻止交互**：用户可以在动画期间及动画结束后进行交互
- **带来价值**：使界面更清晰或更令人愉悦

请记住：动态效果应增强理解并提供反馈，而不只是添加装饰。应有目的地使用动画，尊重性能限制，并始终考虑无障碍需求。出色的动画是隐形的——它只会让一切感觉恰到好处。