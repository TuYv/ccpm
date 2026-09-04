---
name: scoped-change
description: "Judgment rules for locating the correct boundary of a requested change: staying inert outside it while completing every required site inside it. Use when scope is ambiguous, a diff touches neighboring surfaces, required dependent edits are unclear, or a proposed compatibility layer, migration, fallback, flag, abstraction, or parallel implementation may exceed the request."
license: Apache-2.0
metadata:
  author: scarletkc
  source: https://github.com/scarletkc/agents
  summary: "Hold a change to the size the request defines: no unrequested surfaces, no speculative layers, no half-applied edits."
---
# 限定范围的变更

一个变更只有一个正确的大小，而它由请求定义。做过头与做不够是同一种失败——边界从未被定位——只是失败的方式不同：未经请求的修改会在评审或生产环境中暴露出来，缺失的修改则表现为由用户自己发现。先定位边界，然后在边界之内做到穷尽，在边界之外保持不动。

当边界在任务中途被修正时，最终结果读起来应当仿佛修正后的范围是唯一存在过的范围。让被舍弃的方案继续存活的标题、注释或理由说明，会把修正刚刚移除的越界重新引入，而读者要为此付出两次代价；至于什么应当出现在交付物中，属于 [`ux-writing`](https://github.com/scarletkc/agents/blob/main/skills/ux-writing/SKILL.md) 的范畴。

## 边界之外

- **只编辑请求点名的部分。** 点名某一层的请求就是关于那一层的请求，相邻的层即使看起来有问题也保持原样。把你注意到的问题报告出来，而不是顺手修复；一条单独的观察成本很低，一个纠缠不清的 diff 则不然。
  *反面例子：被要求让某个后端端点适配现有的注册表单时，一个 agent 把表单也重新设计了，评审者不得不先把两者拆开，任何一个才能上线。*
- **兼容性是一种成本，而且必须已经有人在为它买单。** 迁移、双读路径、弃用别名和版本垫片，只有在真实用户持有旧状态时才是正确的。在编写这些之前，先确证这些用户存在；当他们不存在时，彻底断开才是更小的变更。这是一个事实问题，而不是谨慎问题。
  *反面例子：一个尚未发布、没有任何装机基础的产品，为从未有用户写入过的数据加了一条存档格式迁移路径，而这条死分支仍必须维护和测试。*
- **复用现有的实现；绝不在它旁边另加一个。** 如果项目已经会渲染这个面板、格式化
