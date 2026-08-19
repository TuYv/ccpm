---
name: hyperflow-design
description: Hyperflow design phase. Use when designing a UI / visual system or making a screen look good — verbs like "design the UI", "make it look good", "design the screen", "visual design", "design system". Establishes or extends a domain-grounded design system, researches real-world prior art, and renders it slop-free. Thinking and taste, not building.
---
# hyperflow-design — 设计阶段（Antigravity 单代理）

设计系统与品味，而非生产代码。遵循 `hyperflow` 理念。

## 步骤

1. **先设计系统。** 确保 `.hyperflow/design/system.md` 存在——如果缺失则创建；如果已存在则扩展（绝不重新生成）：令牌、字号比例、动效语言、文案语调、组件清单、参考资料、反模式。
2. **基于研究，而非凭空臆造。** 研究项目所属领域中 **≥2** 个真实世界的参考案例，将它们结合起来，然后加入一个经过刻意设计的标志性手法——绝不照搬单一来源。
3. **应用品味。** 找出并应用匹配的本地品味技能；通过反糊弄底线（不使用默认 AI 渐变、不默认使用衬线字体、仅使用一个强调色、锁定圆角比例、克制使用眉题、不使用意图重复的 CTA、首屏适配视口、每个动效都传达状态）。
4. **记录** 绑定的设计系统令牌和命名后的标志性手法到规格说明中。当动效界面属于范围时，应用动效语言标准（仅使用合成器属性、弹簧参数、减少动效回退方案）；当移动端界面属于范围时，应用移动平台/设备/无障碍矩阵。

## 规则

- 不得编写生产代码——只能编写设计系统和规格说明。
- 任何无障碍冲突均服从无障碍要求（以 WCAG 底线为准）；任何安全冲突均服从安全要求。
- 关于某种模式的每一项最佳实践声明都必须引用当前来源。