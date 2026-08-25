---
name: deliver-release-notes
description: Creates user-facing release notes that communicate new features, improvements, and fixes in clear, benefit-focused language. Use when shipping updates to communicate changes to users, customers, or stakeholders.
license: Apache-2.0
metadata:
  phase: deliver
  version: "2.1.0"
  updated: 2026-06-10
  category: coordination
  frameworks: [triple-diamond, lean-startup, design-thinking]
  author: product-on-purpose
---
<!-- PM-Skills | https://github.com/product-on-purpose/pm-skills | Apache 2.0 -->
# 发布说明

发布说明以突出价值并激发期待的方式，向用户传达产品变更。与变更日志（记录技术层面的变更）不同，发布说明会将变更转化为用户收益。优秀的发布说明能帮助用户发现新功能、了解改进之处，并相信问题正在得到解决。

## 适用场景

- 向客户发布产品更新
- 向内部利益相关者传达变更
- 准备应用商店更新描述
- 撰写面向客户的电子邮件公告
- 为支持和销售团队记录变更

## 不适用场景

- 你是在向内部利益相关者同步进展，而不是宣布已发布的变更 -> 使用 `foundation-stakeholder-update`
- 你需要面向开发者的技术变更记录 -> 保留工程变更日志；此技能用于将变更转化为用户收益
- 你是在协调发布准备工作，而不是传达已发布的内容 -> 使用 `deliver-launch-checklist`
- 没有任何对用户可见的内容发布（纯内部重构）：勉强寻找收益的发布说明会损害信任；跳过本次发布周期，或将其纳入下一次发布

## Instructions

当被要求创建发布说明时，请遵循以下步骤：

1. **Gather the Changelog**
   收集本次发布包含的所有变更：功能、改进和错误修复。参考工程变更日志、已完成的工单或拉取请求描述。

2. **Identify the Highlights**
   选出 1-3 项最值得重点介绍的变更。这些应该是用户最容易注意到、也最关心的变更。优先介绍影响最大的变更。

3. **Translate to Benefits**
   用用户价值的方式改写每项变更。不要写“为搜索结果添加分页”，而应写成“改进后的搜索支持处理大量结果集，让你更快找到所需内容”。重点说明用户现在可以做什么，或哪些方面变得更好了。

4. **Categorize Changes**
   将其余变更归入清晰的类别：新功能、改进和错误修复。在每个类别中，按影响程度排序（最有价值的排在前面）。

5. **Write Scannable Descriptions**
   每项应包含 1-2 句话。先说明收益，可选择随后补充“实现方式”。用户会快速浏览发布说明——让每一行都具有价值。

6. **Acknowledge Known Issues**
   如果存在已知限制或问题，请保持透明。用户会欣赏坦诚，这也能减少支持负担。

7. **Tease Coming Soon (Optional)**
   如适用，可以暗示即将推出的内容。这能营造期待并展现持续推进的势头，但不要过度承诺。

## Output Format

使用 `references/TEMPLATE.md` 中的模板来组织输出。完整的发布说明应填写模板中的各个部分：重点内容；新功能；改进；错误修复；已知问题；即将推出（可选）；以及反馈。

## Quality Checklist

完成前，请确认：

- [ ] 重点内容突出介绍了 1-3 项影响最大的变更
- [ ] 每项内容都以用户收益开头，而不是技术描述
- [ ] 语言不含专业术语，所有用户都能理解
- [ ] 内容简洁（每项 1-2 句话）
- [ ] 错误修复说明了所解决的问题
- [ ] 没有泄露任何内部术语、工单 ID 或代码名称；每一行读起来都像是面向客户的内容

## 示例

请参阅 `references/EXAMPLE.md` 以查看完整示例。