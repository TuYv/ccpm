---
name: hns-oss-docs-readme-sync
description: >
  README 4-file synchronization procedure for the oss-docs harness: Korean
  README.ko.md as primary source, en/ja/zh derivation, the shared
  language-switcher header contract, section-order parity checklist, and the
  manual verification recipe (no linter exists for READMEs). Loaded by the
  content-author and locale-translator specialists for any README work.
allowed-tools: Read, Grep, Glob, Bash
user-invocable: false
metadata:
  version: "2.0.0"
  category: "harness"
  status: "active"
  updated: "2026-08-17"
  tags: "oss-docs,readme,4-locale,translation,parity"
---
# README 4 文件同步流程

面向 GitHub 的 README 集合由仓库根目录下的 4 个文件组成：

| 文件 | 语言区域 | 角色 |
|------|--------|------|
| `README.ko.md` | ko | **规范 / 主要** — 首先在此编写 |
| `README.md` | en | 派生 |
| `README.ja.md` | ja | 派生 |
| `README.zh.md` | zh | 派生 |

> **链路历史**：规范语言区域在 2026-08-17 之前一直是英语，之后
> t47 卡片根据操作者的决定，将 ko 新骨架（面向功能的章节结构）
> 提升为规范版本——使 README 链路与已经以 ko 为规范版本的
> 文档站点链路保持一致。之前的 en 骨架
> 重新设计参考（`.moai/reports/readme-docs-redesign-20260713.md`）已被
> ko 骨架取代，仅作为历史记录保留。

## 流程

1. 仅在 `README.ko.md`（韩语）中**编写**变更。遵循
   规范的 ko 章节骨架；确保文件长度处于当前集合的范围内。
2. **派生** en、ja、zh——在同一个 PR 中，每个派生文件由一名翻译工作进程负责。
   仅对变更的章节做最小限度的翻译；不要重写未变更的正文。
3. 在所有 4 个文件中**原样保留**：代码块、命令名称、
   徽章、版本字符串、文件路径、表格结构、Mermaid 方向
   以及语言切换器标题（见下文）。
4. 返回前**验证一致性**（见下方检查清单）。

## 语言切换器标题约定 [强制]

所有 4 个文件在靠近顶部的位置共享相同的语言切换器标题，指向同级
文件，并且标签集合必须完全如下：

```
English · 한국어 · 日本語 · 中文
```

- 当前文件自身的标签呈现为纯文本；其他 3 个标签是指向
  同级 README 文件的链接。
- 绝不要对这 4 个条目重新排序、删除或重新命名。

## 章节顺序一致性检查清单

- [ ] `grep -c '^## ' README.md README.ko.md README.ja.md README.zh.md` —
      4 个文件的 H2 数量相同。
- [ ] H2 章节顺序与 ko 一致（比较 `grep '^## '` 的输出顺序）。
- [ ] 所修改章节中的 H3 数量一致。
- [ ] 所修改章节中的表格行数一致。
- [ ] 代码块数量一致（` ```` grep -c '^```' ```` ` 为偶数且数量相同）。
- [ ] 所有 4 个文件中都存在正确的语言切换器标题。
- [ ] URL 黑名单检查无异常：`grep -n 'docs\.moai-ai\.dev\|adk\.moai\.com\|adk\.moai\.kr' README*.md` → 无匹配项。

## 手动验证方法

README 集合没有可用的 linter——验证方式是执行上述手动流程，
并进行渲染合理性检查：以 GitHub 风格预览所修改章节的 markdown，
确认 Mermaid 块仅声明 `TD`/`TB`。可执行的文档站点检查位于
Skill("hns-oss-docs-verify")；README 专用检查即上述 grep 命令。

## 反模式

| 反模式 | 正确做法 |
|--------------|------------------|
| 因为“GitHub 面向英语用户”而首先编辑 `README.md` | README 的规范版本是 ko——先编写 `README.ko.md`，再进行派生 |
| 因规范版本中 3 行内容的变更而重新编写整个派生文件 | 仅对变更的章节进行最小差异派生 |
| 在翻译期间“改进”事实或数字 | 报告差异；先修正规范版本 |
| 在重新设计时删除语言切换器标题 | 包含 4 个条目的标题是一项强制共享约定 |