---
name: vc-problem-solving
description: Apply systematic problem-solving techniques when stuck. Use for complexity spirals, innovation blocks, recurring patterns, assumption constraints, simplification cascades, scale uncertainty.
argument-hint: "[problem description]"
trigger_keywords: stuck, can't figure out, complex, spiral
layer: helper
metadata:
  author: claudekit
  version: "2.0.0"
---
# 问题解决技巧

> **输出风格：** 遵循 `process/development-protocols/communication-standards.md` —— 答案先行、语言平实、不使用未经解释的术语、长回复附 TL;DR。

针对不同类型“卡壳”的系统性方法。每种技巧针对特定的问题模式。

## 何时使用

在遇到以下情况时应用：
- **复杂度失控** - 多种实现并存、特殊情况不断增加、分支过多
- **创新受阻** - 常规方案不够用，需要突破性思维
- **反复出现的模式** - 同一问题在不同领域出现，重复造轮子
- **假设受限** - 被迫认定“只有这一种办法”，无法质疑前提
- **规模不确定** - 生产可用性不明确，边界情况未知
- **一般性卡壳** - 不确定适用哪种技巧

## 快速分派

**根据症状匹配技巧：**

| 卡壳症状 | 技巧 | 参考资料 |
|---------------|-----------|-----------|
| 同一功能已有 5 种以上实现，特殊情况不断增加 | **简化级联** | `references/simplification-cascades.md` |
| 常规方案不够用，需要突破 | **碰撞区思维** | `references/collision-zone-thinking.md` |
| 同一问题出现在不同地方，重复造轮子 | **元模式识别** | `references/meta-pattern-recognition.md` |
| 方案感觉勉强，“必须这么做” | **逆向练习** | `references/inversion-exercise.md` |
| 这在生产环境能行吗？边界情况不清晰？ | **规模游戏** | `references/scale-game.md` |
| 不确定该用哪种技巧 | **卡壳时** | `references/when-stuck.md` |

## 核心技巧

### 1. 简化级联
找到一个能消除多个组件的洞见。“如果这一点成立，我们就不需要 X、Y、Z 了。”

**关键洞见：** 万物都是某个通用模式的特例。

**危险信号：** “只需再加一种情况……”（永远加不完）

### 2. 碰撞区思维
把不相关的概念强行组合在一起，发现涌现属性。“如果我们像对待 Y 那样对待 X 会怎样？”

**关键洞见：** 革命性的想法来自有意的隐喻混搭。

**危险信号：** “这个领域的方法我都试过了”

### 3. 元模式识别
识别出现在 3 个及以上领域中的模式，找出普适原则。

**关键洞见：** 模式产生方式的规律揭示了可复用的抽象。

**危险信号：** “这个问题是独一无二的”（多半不是）

### 4. 逆向练习
翻转核心假设以揭示隐藏的约束。“如果反过来才是真的呢？”

**关键洞见：** 有效的逆向翻转能揭示“规则”对上下文的依赖。

**危险信号：** “只有一种做法”

### 5. 规模游戏
在极端条件下测试（放大/缩小 1000 倍、瞬时/耗时一年），以暴露根本性事实。

**关键洞见：** 在一种规模下有效的东西，在另一种规模下会失效。

**危险信号：** “扩展性应该没问题”（未经测试）

## 应用流程

1. **确定卡壳类型** - 将症状与上述技巧匹配
2. **加载详细参考** - 阅读 `references/` 中的具体技巧
3. **系统化应用** - 遵循该技巧的流程
4. **记录洞见** - 记录哪些有效、哪些无效
5. **必要时组合** - 有些问题需要多种技巧结合

## 技巧组合

强力组合：
- **简化 + 元模式** - 先找到模式，再简化所有实例
- **碰撞 + 逆向** - 强行隐喻混搭，再翻转其假设
- **规模 + 简化** - 极端条件揭示该消除什么
- **元模式 + 规模** - 在极端条件下测试普适模式

## 参考资料

按需加载详细指南：
- `references/when-stuck.md` - 分派流程图与决策树
- `references/simplification-cascades.md` - 级联检测与提取
- `references/collision-zone-thinking.md` - 隐喻碰撞流程
- `references/meta-pattern-recognition.md` - 模式抽象技巧
- `references/inversion-exercise.md` - 假设翻转方法论
- `references/scale-game.md` - 极端测试流程
- `references/attribution.md` - 来源与改编说明
